from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import transaction
from .models import AvatarItem, ChildAvatar, GardenPlant
from .serializers import AvatarItemSerializer, ChildAvatarSerializer, GardenPlantSerializer
from child_profiles.models import ChildProfile
from child_profiles.utils import resolve_child_profile
from gamification.models import ChildWallet, CoinTransaction

class AvatarItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AvatarItem.objects.filter(is_active=True).order_by('item_type', 'price_coins')
    serializer_class = AvatarItemSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'item_id'


class ChildAvatarView(APIView):
    """
    Get or update the avatar configuration for a child profile. Resolves safely for guest or parent.
    """
    permission_classes = [permissions.AllowAny]

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
        
        for field in ['base_avatar', 'equipped_hat', 'equipped_glasses', 'equipped_outfit', 'equipped_backpack']:
            if field in request.data:
                setattr(avatar, field, request.data[field])

        if 'unlocked_items' in request.data and isinstance(request.data['unlocked_items'], list):
            # Merge unlocked items cleanly
            current = set(avatar.unlocked_items or [])
            current.update(request.data['unlocked_items'])
            avatar.unlocked_items = list(current)

        avatar.save()
        return Response(ChildAvatarSerializer(avatar).data)


class PurchaseAvatarItemView(APIView):
    """
    Safe purchase of avatar items using coins in ChildWallet. Resolves safely for guest or parent.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, child_id):
        item_id = request.data.get('item_id')
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        item = AvatarItem.objects.filter(item_id=item_id, is_active=True).first()
        if not item:
            return Response({'detail': 'Avatar item not found.'}, status=status.HTTP_404_NOT_FOUND)

        avatar, _ = ChildAvatar.objects.get_or_create(child_profile=child)
        if item_id in (avatar.unlocked_items or []):
            return Response({'message': 'Item already unlocked!', 'avatar': ChildAvatarSerializer(avatar).data})

        wallet, _ = ChildWallet.objects.get_or_create(child_profile=child)
        if wallet.total_coins < item.price_coins:
            return Response({
                'detail': f"Not enough coins. Need {item.price_coins}, have {wallet.total_coins}."
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            wallet.total_coins -= item.price_coins
            wallet.save()

            CoinTransaction.objects.create(
                child_profile=child,
                amount=-item.price_coins,
                transaction_type='shop_purchase',
                description=f"Purchased avatar item: {item.name}",
            )

            current_unlocked = avatar.unlocked_items or []
            current_unlocked.append(item.item_id)
            avatar.unlocked_items = current_unlocked
            avatar.save()

        return Response({
            'message': f"Successfully unlocked {item.name}!",
            'wallet': {'total_coins': wallet.total_coins, 'total_stars': wallet.total_stars},
            'avatar': ChildAvatarSerializer(avatar).data,
        })


class GardenPlantViewSet(viewsets.ModelViewSet):
    serializer_class = GardenPlantSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        child_id = self.request.query_params.get('child_id')
        queryset = GardenPlant.objects.all().order_by('slot_index')
        if user.is_authenticated:
            queryset = queryset.filter(child_profile__parent=user)
        else:
            queryset = queryset.filter(child_profile__parent__isnull=True)
        if child_id:
            queryset = queryset.filter(child_profile_id=child_id)
        return queryset

    def perform_create(self, serializer):
        child = serializer.validated_data.get('child_profile')
        child = resolve_child_profile(self.request, child.id if child else None)
        serializer.save(child_profile=child)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.child_profile and instance.child_profile.parent:
            if not request.user.is_authenticated or instance.child_profile.parent != request.user:
                return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
