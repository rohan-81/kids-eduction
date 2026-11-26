from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from .models import AvatarItem, ChildAvatar, GardenPlant
from .serializers import AvatarItemSerializer, ChildAvatarSerializer, GardenPlantSerializer
from child_profiles.models import ChildProfile
from rest_framework.exceptions import NotFound
from child_profiles.utils import resolve_child_profile, safe_int
from gamification.models import ChildWallet, CoinTransaction

AVATAR_TEXT_FIELDS = ('base_avatar', 'equipped_hat', 'equipped_glasses', 'equipped_outfit', 'equipped_backpack')
MAX_UNLOCKED_ITEMS = 500


def _field_max_length(field):
    return ChildAvatar._meta.get_field(field).max_length or 60


class AvatarItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AvatarItem.objects.filter(is_active=True).order_by('item_type', 'price_coins')
    serializer_class = AvatarItemSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'item_id'


class ChildAvatarView(APIView):
    """
    Get or update the avatar configuration for a child profile. Signed-in parents only; guests keep this on-device.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        avatar, _ = ChildAvatar.objects.get_or_create(child_profile=child)
        return Response(ChildAvatarSerializer(avatar).data)

    def put(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        avatar, _ = ChildAvatar.objects.get_or_create(child_profile=child)
        
        # Untrusted input: strings only, clipped to the column size (an over-long value was a 500 on Postgres).
        for field in AVATAR_TEXT_FIELDS:
            if field in request.data:
                value = request.data[field]
                if value is not None and not isinstance(value, (str, int)):
                    return Response({'detail': f'{field} must be a string.'}, status=status.HTTP_400_BAD_REQUEST)
                setattr(avatar, field, str(value or '')[:_field_max_length(field)])

        if 'unlocked_items' in request.data and isinstance(request.data['unlocked_items'], list):
            current = set(avatar.unlocked_items or [])
            current.update(str(i)[:60] for i in request.data['unlocked_items'][:MAX_UNLOCKED_ITEMS] if isinstance(i, (str, int)))
            avatar.unlocked_items = sorted(current)[:MAX_UNLOCKED_ITEMS]

        avatar.save()
        return Response(ChildAvatarSerializer(avatar).data)


class PurchaseAvatarItemView(APIView):
    """
    Safe purchase of avatar items using coins in ChildWallet. Signed-in parents only; guests keep this on-device.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, child_id):
        item_id = request.data.get('item_id')
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        item = AvatarItem.objects.filter(item_id=item_id, is_active=True).first()
        if not item:
            return Response({'detail': 'Avatar item not found.'}, status=status.HTTP_404_NOT_FOUND)

        ChildAvatar.objects.get_or_create(child_profile=child)
        ChildWallet.objects.get_or_create(child_profile=child)
        # Lock both rows so a double tap (or two devices) cannot pass the checks twice and charge twice.
        with transaction.atomic():
            wallet = ChildWallet.objects.select_for_update().get(child_profile=child)
            avatar = ChildAvatar.objects.select_for_update().get(child_profile=child)
            if item_id in (avatar.unlocked_items or []):
                return Response({'message': 'Item already unlocked!', 'avatar': ChildAvatarSerializer(avatar).data})

            if wallet.total_coins < item.price_coins:
                return Response({
                    'detail': f"Not enough coins. Need {item.price_coins}, have {wallet.total_coins}."
                }, status=status.HTTP_400_BAD_REQUEST)

            wallet.total_coins -= item.price_coins
            wallet.save()

            CoinTransaction.objects.create(
                child_profile=child,
                amount=-item.price_coins,
                transaction_type='shop_purchase',
                description=f"Purchased avatar item: {item.name}",
            )

            avatar.unlocked_items = [*(avatar.unlocked_items or []), item.item_id]
            avatar.save()

        return Response({
            'message': f"Successfully unlocked {item.name}!",
            'wallet': {'total_coins': wallet.total_coins, 'total_stars': wallet.total_stars},
            'avatar': ChildAvatarSerializer(avatar).data,
        })


class GardenPlantViewSet(viewsets.ModelViewSet):
    serializer_class = GardenPlantSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        child_id = self.request.query_params.get('child_id')
        queryset = GardenPlant.objects.filter(child_profile__parent=self.request.user).order_by('slot_index')
        if child_id:
            queryset = queryset.filter(child_profile_id=safe_int(child_id, default=-1, lo=-1, hi=2**62))
        return queryset

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child_profile')
        child = resolve_child_profile(self.request, child.id if child else None)
        if not child:
            raise NotFound('Child profile not found.')
        serializer.save(child_profile=child)

    def perform_update(self, serializer):
        # Objects come from the parent-scoped queryset; never let an update move a plant to another child.
        serializer.save(child_profile=serializer.instance.child_profile)
