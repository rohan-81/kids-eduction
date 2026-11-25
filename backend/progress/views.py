from datetime import date
from django.utils import timezone
from django.db import transaction, models
from rest_framework import viewsets, status, permissions
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response

from child_profiles.models import ChildProfile
from child_profiles.utils import resolve_child_profile
from lessons.models import Lesson
from .models import LessonProgress, GameResult, DailyActivity
from .serializers import LessonProgressSerializer, GameResultSerializer, DailyActivitySerializer

from gamification.models import ChildWallet, DailyStreak, CoinTransaction, AdventureLevel, ChildAdventureProgress
from gamification.serializers import ChildWalletSerializer, DailyStreakSerializer
from personalization.models import ChildAvatar, GardenPlant
from personalization.serializers import ChildAvatarSerializer, GardenPlantSerializer
from parent_controls.models import ScreenTimeLog


class LessonProgressViewSet(viewsets.ModelViewSet):
    serializer_class = LessonProgressSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        profile_id = self.request.query_params.get('profile_id') or self.request.query_params.get('child_id')
        queryset = LessonProgress.objects.all().order_by('-updated_at')
        if user.is_authenticated:
            queryset = queryset.filter(child_profile__parent=user)
        else:
            queryset = queryset.filter(child_profile__parent__isnull=True)
        if profile_id:
            queryset = queryset.filter(child_profile_id=profile_id)
        return queryset

    def create(self, request, *args, **kwargs):
        profile_id = request.data.get('child_profile') or request.data.get('child_profile_id')
        lesson_slug = str(request.data.get('lesson_slug') or request.data.get('lesson') or request.data.get('lesson_id') or '')

        if not lesson_slug:
            return Response({'error': 'lesson or lesson_slug field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        child = resolve_child_profile(request, profile_id)

        lesson_obj = Lesson.objects.filter(id=lesson_slug).first() if lesson_slug.isdigit() else None
        if not lesson_obj:
            lesson_obj = Lesson.objects.filter(stable_id=lesson_slug).first()

        completed = bool(request.data.get('completed', True))
        stars = int(request.data.get('stars', 3))
        best_score = int(request.data.get('best_score', 1))

        # Atomic update or create
        progress, created = LessonProgress.objects.get_or_create(
            child_profile=child,
            lesson_slug=lesson_slug,
            defaults={
                'lesson': lesson_obj,
                'completed': completed,
                'stars': stars,
                'best_score': best_score,
                'times_played': 1,
            }
        )
        if not created:
            progress.completed = progress.completed or completed
            progress.stars = max(progress.stars, stars)
            progress.best_score = max(progress.best_score, best_score)
            progress.times_played += 1
            if lesson_obj and not progress.lesson:
                progress.lesson = lesson_obj
            progress.save()

        # Update DailyActivity
        if child:
            today = date.today()
            activity, _ = DailyActivity.objects.get_or_create(child_profile=child, date=today)
            activity.lessons_completed += 1
            activity.stars_earned += stars
            activity.save()

        return Response(LessonProgressSerializer(progress).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class GameResultViewSet(viewsets.ModelViewSet):
    serializer_class = GameResultSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        profile_id = self.request.query_params.get('profile_id') or self.request.query_params.get('child_id')
        queryset = GameResult.objects.all().order_by('-played_at')
        if user.is_authenticated:
            queryset = queryset.filter(child_profile__parent=user)
        else:
            queryset = queryset.filter(child_profile__parent__isnull=True)
        if profile_id:
            queryset = queryset.filter(child_profile_id=profile_id)
        return queryset

    def create(self, request, *args, **kwargs):
        profile_id = request.data.get('child_profile') or request.data.get('child_profile_id')
        child = resolve_child_profile(request, profile_id)

        game_type = request.data.get('game_type', 'quiz')
        score = int(request.data.get('score', 0))
        total_questions = int(request.data.get('total_questions', 5))
        time_spent = int(request.data.get('time_spent_seconds', 0))

        result = GameResult.objects.create(
            child_profile=child,
            game_type=game_type,
            score=score,
            total_questions=total_questions,
            time_spent_seconds=time_spent,
        )

        if child:
            today = date.today()
            activity, _ = DailyActivity.objects.get_or_create(child_profile=child, date=today)
            activity.games_played += 1
            activity.save()

        return Response(GameResultSerializer(result).data, status=status.HTTP_201_CREATED)


class DailyActivityViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = DailyActivitySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        profile_id = self.request.query_params.get('profile_id') or self.request.query_params.get('child_id')
        queryset = DailyActivity.objects.all().order_by('-date')
        if user.is_authenticated:
            queryset = queryset.filter(child_profile__parent=user)
        else:
            queryset = queryset.filter(child_profile__parent__isnull=True)
        if profile_id:
            queryset = queryset.filter(child_profile_id=profile_id)
        return queryset


class CloudSyncView(APIView):
    """
    Multi-Device Cloud Synchronization endpoint.
    Accepts full offline batched progress, merges conflicts deterministically using max values,
    supports explicit progress reset, and returns authoritative server state.
    """
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        child_id = request.data.get('child_profile_id')
        child = resolve_child_profile(request, child_id)
        if not child:
            return Response({'error': 'Child profile could not be resolved.'}, status=status.HTTP_400_BAD_REQUEST)

        is_reset = bool(request.data.get('is_reset', False))

        with transaction.atomic():
            # If reset was requested, clear previous progress logs for this child
            if is_reset:
                LessonProgress.objects.filter(child_profile=child).delete()
                GameResult.objects.filter(child_profile=child).delete()
                DailyActivity.objects.filter(child_profile=child).delete()

            # 1. Sync Lessons Progress
            lessons_batch = request.data.get('lessons', [])
            for item in lessons_batch:
                slug = str(item.get('lesson_id') or item.get('lesson_slug') or '')
                if not slug:
                    continue
                completed = bool(item.get('completed', True))
                stars = int(item.get('stars', 3))
                best_score = int(item.get('best_score', 1))

                rec, created = LessonProgress.objects.get_or_create(
                    child_profile=child,
                    lesson_slug=slug,
                    defaults={'completed': completed, 'stars': stars, 'best_score': best_score}
                )
                if not created:
                    rec.completed = rec.completed or completed
                    rec.stars = max(rec.stars, stars)
                    rec.best_score = max(rec.best_score, best_score)
                    rec.save()

            # 2. Sync Wallet
            wallet_data = request.data.get('wallet')
            wallet, _ = ChildWallet.objects.get_or_create(child_profile=child)
            if wallet_data and isinstance(wallet_data, dict):
                local_coins = int(wallet_data.get('coins', 0))
                local_stars = int(wallet_data.get('stars', 0))
                if is_reset:
                    wallet.total_coins = local_coins
                    wallet.total_stars = local_stars
                else:
                    wallet.total_coins = max(wallet.total_coins, local_coins)
                    wallet.total_stars = max(wallet.total_stars, local_stars)
                wallet.save()

            # 3. Sync Daily Streak
            streak_data = request.data.get('streak')
            streak, _ = DailyStreak.objects.get_or_create(child_profile=child)
            if streak_data and isinstance(streak_data, dict):
                local_curr = int(streak_data.get('current_streak', 0))
                local_long = int(streak_data.get('longest_streak', 0))
                if is_reset:
                    streak.current_streak = max(local_curr, 1)
                    streak.longest_streak = max(local_long, 1)
                else:
                    streak.current_streak = max(streak.current_streak, local_curr)
                    streak.longest_streak = max(streak.longest_streak, local_long)
                streak.save()

            # 4. Sync Avatar
            avatar_data = request.data.get('avatar')
            avatar, _ = ChildAvatar.objects.get_or_create(child_profile=child)
            if avatar_data and isinstance(avatar_data, dict):
                if 'base_avatar' in avatar_data:
                    avatar.base_avatar = avatar_data['base_avatar']
                if 'equipped_hat' in avatar_data:
                    avatar.equipped_hat = avatar_data['equipped_hat']
                if 'equipped_glasses' in avatar_data:
                    avatar.equipped_glasses = avatar_data['equipped_glasses']
                if 'equipped_outfit' in avatar_data:
                    avatar.equipped_outfit = avatar_data['equipped_outfit']
                if 'equipped_backpack' in avatar_data:
                    avatar.equipped_backpack = avatar_data['equipped_backpack']
                
                incoming_unlocked = avatar_data.get('unlocked_items', [])
                if incoming_unlocked:
                    current_items = set(avatar.unlocked_items or [])
                    current_items.update(incoming_unlocked)
                    avatar.unlocked_items = list(current_items)
                avatar.save()

            # 5. Sync Screen Time
            screen_time_data = request.data.get('screen_time')
            if screen_time_data and isinstance(screen_time_data, dict):
                mins = int(screen_time_data.get('minutes_used', 0))
                if mins > 0:
                    today = date.today()
                    log, _ = ScreenTimeLog.objects.get_or_create(child_profile=child, date=today)
                    log.minutes_used += mins
                    log.save()

            # 6. Sync Adventure Progress
            adv_level_in = int(request.data.get('adventure_level', 1))
            if adv_level_in > 1:
                for lvl_num in range(1, adv_level_in):
                    lvl_obj = AdventureLevel.objects.filter(level_number=lvl_num).first()
                    if lvl_obj:
                        cap, created = ChildAdventureProgress.objects.get_or_create(
                            child_profile=child,
                            level=lvl_obj,
                            defaults={'completed': True, 'unlocked': True, 'stars_earned': 3}
                        )
                        if not created:
                            cap.completed = True
                            cap.unlocked = True
                            cap.save()
                curr_lvl = AdventureLevel.objects.filter(level_number=adv_level_in).first()
                if curr_lvl:
                    p_curr, _ = ChildAdventureProgress.objects.get_or_create(child_profile=child, level=curr_lvl)
                    p_curr.unlocked = True
                    p_curr.save()

        # Query and return authoritative server state
        all_progress = LessonProgress.objects.filter(child_profile=child)
        all_plants = GardenPlant.objects.filter(child_profile=child)
        max_adv = ChildAdventureProgress.objects.filter(child_profile=child, completed=True).aggregate(models.Max('level__level_number'))['level__level_number__max'] or 0
        server_adv_level = max(max_adv + 1, int(request.data.get('adventure_level', 1)))

        return Response({
            'status': 'synchronized',
            'server_time': timezone.now().isoformat(),
            'child_profile_id': child.id,
            'adventure_level': server_adv_level,
            'lessons': LessonProgressSerializer(all_progress, many=True).data,
            'wallet': ChildWalletSerializer(wallet).data,
            'streak': DailyStreakSerializer(streak).data,
            'avatar': ChildAvatarSerializer(avatar).data,
            'garden': GardenPlantSerializer(all_plants, many=True).data,
        }, status=status.HTTP_200_OK)
