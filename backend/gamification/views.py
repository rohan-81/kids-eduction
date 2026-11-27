import random
from datetime import date
from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import AdventureLevel, ChildAdventureProgress, ChildWallet, CoinTransaction, DailyStreak, LuckySpinHistory
from .serializers import (
    AdventureLevelSerializer,
    ChildAdventureProgressSerializer,
    ChildWalletSerializer,
    CoinTransactionSerializer,
    DailyStreakSerializer,
    LuckySpinHistorySerializer,
)
from child_profiles.models import ChildProfile
from child_profiles.utils import resolve_child_profile


class AdventureLevelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AdventureLevel.objects.filter(is_active=True).order_by('level_number')
    serializer_class = AdventureLevelSerializer
    pagination_class = None
    permission_classes = [permissions.AllowAny]
    lookup_field = 'level_number'


class WalletView(APIView):
    """
    Returns wallet for a given child profile. Signed-in parents only; guests keep this on-device.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        wallet, _ = ChildWallet.objects.get_or_create(child_profile=child)
        return Response(ChildWalletSerializer(wallet).data)


class DailyStreakView(APIView):
    """
    Get or update daily streak for child. Signed-in parents only; guests keep this on-device.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        streak, _ = DailyStreak.objects.get_or_create(child_profile=child)
        return Response(DailyStreakSerializer(streak).data)

    def post(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        today = timezone.localdate()
        with transaction.atomic():
            DailyStreak.objects.get_or_create(child_profile=child)
            streak = DailyStreak.objects.select_for_update().get(child_profile=child)

            if streak.last_active_date == today:
                # Already checked in today
                pass
            elif streak.last_active_date and (today - streak.last_active_date).days == 1:
                streak.current_streak += 1
                if streak.current_streak > streak.longest_streak:
                    streak.longest_streak = streak.current_streak
                streak.last_active_date = today
                streak.save()
            else:
                streak.current_streak = 1
                if streak.longest_streak < 1:
                    streak.longest_streak = 1
                streak.last_active_date = today
                streak.save()

        return Response(DailyStreakSerializer(streak).data)


class LuckySpinView(APIView):
    """
    Executes a lucky wheel spin for the child.
    Awards coins or stars server-side and logs transaction.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, child_id):
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'detail': 'Child profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        prizes = [
            {'type': 'coins', 'value': 10, 'label': '10 Coins'},
            {'type': 'coins', 'value': 25, 'label': '25 Coins'},
            {'type': 'coins', 'value': 50, 'label': '50 Super Coins!'},
            {'type': 'stars', 'value': 3, 'label': '3 Golden Stars!'},
            {'type': 'coins', 'value': 15, 'label': '15 Coins'},
        ]
        won_prize = random.choice(prizes)

        with transaction.atomic():
            # Lock the child's wallet row first, then check the daily limit inside the same
            # transaction: two concurrent requests can no longer both pass the check (double
            # spin) or overwrite each other's `+=` (lost update). PostgreSQL honours the row
            # lock; SQLite serialises writers, which gives the same outcome.
            ChildWallet.objects.get_or_create(child_profile=child)
            wallet = ChildWallet.objects.select_for_update().get(child_profile=child)
            today = timezone.localdate()
            if LuckySpinHistory.objects.filter(child_profile=child, spun_at__date=today).exists():
                return Response(
                    {
                        'detail': 'Daily lucky spin already used today. Come back tomorrow!',
                        'already_claimed': True,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            LuckySpinHistory.objects.create(
                child_profile=child,
                prize_type=won_prize['type'],
                prize_value=won_prize['value'],
            )

            if won_prize['type'] == 'coins':
                wallet.total_coins += won_prize['value']
                CoinTransaction.objects.create(
                    child_profile=child,
                    amount=won_prize['value'],
                    transaction_type='lucky_spin',
                    description=f"Lucky spin win: {won_prize['label']}",
                )
            elif won_prize['type'] == 'stars':
                wallet.total_stars += won_prize['value']
            wallet.save()

        return Response({
            'prize': won_prize,
            'wallet': ChildWalletSerializer(wallet).data,
        })
