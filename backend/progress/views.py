from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db import transaction, models
from rest_framework import viewsets, status, permissions
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response

from child_profiles.utils import resolve_child_profile, safe_int
from lessons.models import Lesson
from .models import LessonProgress, GameResult, DailyActivity
from .serializers import LessonProgressSerializer, GameResultSerializer, DailyActivitySerializer

from gamification.models import ChildWallet, CoinTransaction, DailyStreak, AdventureLevel, ChildAdventureProgress, LuckySpinHistory
from gamification.serializers import ChildWalletSerializer, DailyStreakSerializer
from personalization.models import ChildAvatar, GardenPlant
from personalization.serializers import ChildAvatarSerializer, GardenPlantSerializer
from parent_controls.models import ScreenTimeLog

# Upper bounds for untrusted client input (audit P0-3).
MAX_LESSONS_PER_SYNC = 500
MAX_STARS = 3
MAX_SCORE = 100_000
MAX_COINS = 10_000_000
MAX_STREAK_DAYS = 3650
MAX_SCREEN_MINUTES_PER_SYNC = 24 * 60
MAX_SLUG_LENGTH = 120
MAX_UNLOCKED_ITEMS = 500
AVATAR_TEXT_FIELDS = ('base_avatar', 'equipped_hat', 'equipped_glasses', 'equipped_outfit', 'equipped_backpack')

# Progress endpoints are only for signed-in parents: guest progress stays on the device.
AUTH_CLASSES = [TokenAuthentication, SessionAuthentication]
PARENT_ONLY = [permissions.IsAuthenticated]


def _flag(value, default=True):
    """Lenient boolean for per-item flags: only explicit false-y values switch it off."""
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() not in ('false', '0', 'no', 'off', '')


DEVICE_SPEND = 'device_spend'


def _recorded_device_spend(child):
    """Coins the server has already deducted for this child's in-app spending (lifetime)."""
    total = CoinTransaction.objects.filter(child_profile=child, transaction_type=DEVICE_SPEND).aggregate(
        s=models.Sum('amount')
    )['s']
    return -(total or 0)


def _profile_not_found():
    return Response({'error': 'Child profile not found for this account.'}, status=status.HTTP_404_NOT_FOUND)


class _ParentScopedQuerysetMixin:
    """Read access limited to the requesting parent's children; writes only via create()."""
    authentication_classes = AUTH_CLASSES
    permission_classes = PARENT_ONLY
    http_method_names = ['get', 'post', 'head', 'options']
    model = None
    order_by = '-id'

    def get_queryset(self):
        queryset = self.model.objects.filter(child_profile__parent=self.request.user).order_by(self.order_by)
        profile_id = self.request.query_params.get('profile_id') or self.request.query_params.get('child_id')
        if profile_id:
            queryset = queryset.filter(child_profile_id=safe_int(profile_id, default=-1, lo=-1, hi=2**62))
        return queryset


class LessonProgressViewSet(_ParentScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = LessonProgressSerializer
    model = LessonProgress
    order_by = '-updated_at'

    def create(self, request, *args, **kwargs):
        profile_id = request.data.get('child_profile') or request.data.get('child_profile_id')
        lesson_slug = str(request.data.get('lesson_slug') or request.data.get('lesson') or request.data.get('lesson_id') or '')[:MAX_SLUG_LENGTH]

        if not lesson_slug:
            return Response({'error': 'lesson or lesson_slug field is required.'}, status=status.HTTP_400_BAD_REQUEST)

        child = resolve_child_profile(request, profile_id)
        if not child:
            return _profile_not_found()

        lesson_obj = (
            Lesson.objects.filter(id=int(lesson_slug)).first()
            if lesson_slug.isdigit() and 0 < int(lesson_slug) <= 2**62
            else None
        )
        if not lesson_obj:
            lesson_obj = Lesson.objects.filter(stable_id=lesson_slug).first()

        completed = _flag(request.data.get('completed'), True)
        stars = safe_int(request.data.get('stars'), default=MAX_STARS if completed else 0, lo=0, hi=MAX_STARS)
        best_score = safe_int(request.data.get('best_score'), default=1, lo=0, hi=MAX_SCORE)

        with transaction.atomic():
            progress, created = LessonProgress.objects.select_for_update().get_or_create(
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
            was_completed_before = not created and progress.completed
            if not created:
                progress.completed = progress.completed or completed
                progress.stars = max(progress.stars, stars)
                progress.best_score = max(progress.best_score, best_score)
                progress.times_played += 1
                if lesson_obj and not progress.lesson:
                    progress.lesson = lesson_obj
                progress.save()

            if completed and not was_completed_before:
                activity, _ = DailyActivity.objects.select_for_update().get_or_create(
                    child_profile=child, date=timezone.localdate()
                )
                activity.lessons_completed += 1
                activity.stars_earned += stars
                activity.save()

        return Response(LessonProgressSerializer(progress).data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)


class GameResultViewSet(_ParentScopedQuerysetMixin, viewsets.ModelViewSet):
    serializer_class = GameResultSerializer
    model = GameResult
    order_by = '-played_at'

    def create(self, request, *args, **kwargs):
        profile_id = request.data.get('child_profile') or request.data.get('child_profile_id')
        child = resolve_child_profile(request, profile_id)
        if not child:
            return _profile_not_found()

        game_type = str(request.data.get('game_type') or 'quiz')[:60]
        total_questions = safe_int(request.data.get('total_questions'), default=5, lo=0, hi=1000)
        score = safe_int(request.data.get('score'), default=0, lo=0, hi=max(total_questions, 0) or 1000)
        time_spent = safe_int(request.data.get('time_spent_seconds'), default=0, lo=0, hi=24 * 3600)

        with transaction.atomic():
            result = GameResult.objects.create(
                child_profile=child,
                game_type=game_type,
                score=score,
                total_questions=total_questions,
                time_spent_seconds=time_spent,
            )
            activity, _ = DailyActivity.objects.select_for_update().get_or_create(
                child_profile=child, date=timezone.localdate()
            )
            activity.games_played += 1
            activity.save()

        return Response(GameResultSerializer(result).data, status=status.HTTP_201_CREATED)


class DailyActivityViewSet(_ParentScopedQuerysetMixin, viewsets.ReadOnlyModelViewSet):
    serializer_class = DailyActivitySerializer
    model = DailyActivity
    order_by = '-date'


class CloudSyncView(APIView):
    """
    Multi-Device Cloud Synchronization endpoint (signed-in parents only).
    Accepts batched offline progress, merges conflicts deterministically using max values,
    supports explicit progress reset, and returns the authoritative server state.
    """
    authentication_classes = AUTH_CLASSES
    permission_classes = PARENT_ONLY

    def post(self, request):
        child = resolve_child_profile(request, request.data.get('child_profile_id'))
        if not child:
            return _profile_not_found()

        # Destructive: only an explicit JSON `true` resets (form "false" used to be truthy).
        is_reset = request.data.get('is_reset') is True

        lessons_batch = request.data.get('lessons') or []
        if not isinstance(lessons_batch, list):
            return Response({'error': 'lessons must be a list.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(lessons_batch) > MAX_LESSONS_PER_SYNC:
            return Response(
                {'error': f'At most {MAX_LESSONS_PER_SYNC} lessons per sync.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        max_level = AdventureLevel.objects.aggregate(m=models.Max('level_number'))['m'] or 1
        adv_level_in = safe_int(request.data.get('adventure_level'), default=1, lo=1, hi=max_level)

        with transaction.atomic():
            if is_reset:
                LessonProgress.objects.filter(child_profile=child).delete()
                GameResult.objects.filter(child_profile=child).delete()
                DailyActivity.objects.filter(child_profile=child).delete()
                ChildAdventureProgress.objects.filter(child_profile=child).delete()
                GardenPlant.objects.filter(child_profile=child).delete()
                LuckySpinHistory.objects.filter(child_profile=child).delete()
                CoinTransaction.objects.filter(child_profile=child).delete()

            # 1. Lessons: one read + bulk writes instead of 1-2 queries per lesson (500-lesson syncs).
            incoming = {}
            for item in lessons_batch:
                if not isinstance(item, dict):
                    continue
                slug = str(item.get('lesson_id') or item.get('lesson_slug') or '')[:MAX_SLUG_LENGTH]
                if not slug:
                    continue
                completed = _flag(item.get('completed'), True)
                stars = safe_int(item.get('stars'), default=MAX_STARS, lo=0, hi=MAX_STARS)
                best_score = safe_int(item.get('best_score'), default=1, lo=0, hi=MAX_SCORE)
                prev = incoming.get(slug)
                if prev:
                    completed, stars, best_score = (
                        prev[0] or completed, max(prev[1], stars), max(prev[2], best_score)
                    )
                incoming[slug] = (completed, stars, best_score)

            if incoming:
                existing = {
                    rec.lesson_slug: rec
                    for rec in LessonProgress.objects.filter(child_profile=child, lesson_slug__in=list(incoming))
                }
                to_update = []
                now = timezone.now()
                for slug, (completed, stars, best_score) in incoming.items():
                    rec = existing.get(slug)
                    if rec is None:
                        continue
                    merged = (rec.completed or completed, max(rec.stars, stars), max(rec.best_score, best_score))
                    if merged != (rec.completed, rec.stars, rec.best_score):
                        rec.completed, rec.stars, rec.best_score = merged
                        rec.updated_at = now  # bulk_update skips auto_now
                        to_update.append(rec)
                if to_update:
                    LessonProgress.objects.bulk_update(to_update, ['completed', 'stars', 'best_score', 'updated_at'])
                LessonProgress.objects.bulk_create(
                    [
                        LessonProgress(child_profile=child, lesson_slug=slug, completed=c, stars=st, best_score=b)
                        for slug, (c, st, b) in incoming.items()
                        if slug not in existing
                    ],
                    ignore_conflicts=True,
                )

            # 2. Wallet
            wallet_data = request.data.get('wallet')
            wallet, _ = ChildWallet.objects.select_for_update().get_or_create(child_profile=child)
            recorded_spent = 0 if is_reset else _recorded_device_spend(child)
            if is_reset:
                CoinTransaction.objects.filter(child_profile=child, transaction_type=DEVICE_SPEND).delete()
            if isinstance(wallet_data, dict):
                local_coins = safe_int(wallet_data.get('coins'), default=0, lo=0, hi=MAX_COINS)
                local_stars = safe_int(wallet_data.get('stars'), default=0, lo=0, hi=MAX_COINS)
                if is_reset:
                    wallet.total_coins = local_coins
                    wallet.total_stars = local_stars
                else:
                    # Coins spent on the device. `spent_total` is the device's lifetime counter, so the
                    # ledger only applies the part not seen before: resending is a no-op. Without this,
                    # max(server, local) refunded every purchase on the next sync.
                    spent_total = safe_int(wallet_data.get('spent_total'), default=0, lo=0, hi=MAX_COINS)
                    newly_spent = max(0, spent_total - recorded_spent)
                    if newly_spent:
                        CoinTransaction.objects.create(
                            child_profile=child,
                            amount=-newly_spent,
                            transaction_type=DEVICE_SPEND,
                            description='Coins spent in the app (synced)',
                        )
                        recorded_spent += newly_spent
                        wallet.total_coins = max(0, wallet.total_coins - newly_spent)
                    wallet.total_coins = max(wallet.total_coins, local_coins)
                    wallet.total_stars = max(wallet.total_stars, local_stars)
                wallet.save()

            # 3. Daily streak
            streak_data = request.data.get('streak')
            DailyStreak.objects.get_or_create(child_profile=child)
            streak = DailyStreak.objects.select_for_update().get(child_profile=child)
            if isinstance(streak_data, dict):
                local_curr = safe_int(streak_data.get('current_streak'), default=0, lo=0, hi=MAX_STREAK_DAYS)
                local_long = safe_int(streak_data.get('longest_streak'), default=local_curr, lo=0, hi=MAX_STREAK_DAYS)
                local_long = max(local_long, local_curr)
                raw_last_date = streak_data.get('last_active_date')
                parsed_last_date = parse_date(str(raw_last_date)) if raw_last_date else None
                if is_reset:
                    streak.current_streak = max(local_curr, 1)
                    streak.longest_streak = max(local_long, 1)
                    streak.last_active_date = parsed_last_date or timezone.localdate()
                else:
                    streak.current_streak = max(streak.current_streak, local_curr)
                    streak.longest_streak = max(streak.longest_streak, local_long, streak.current_streak)
                    if parsed_last_date and (not streak.last_active_date or parsed_last_date > streak.last_active_date):
                        streak.last_active_date = parsed_last_date
                streak.save()
            elif is_reset:
                streak.current_streak = 1
                streak.longest_streak = 1
                streak.last_active_date = timezone.localdate()
                streak.save()

            # 4. Avatar
            avatar_data = request.data.get('avatar')
            ChildAvatar.objects.get_or_create(child_profile=child)
            avatar = ChildAvatar.objects.select_for_update().get(child_profile=child)
            if isinstance(avatar_data, dict):
                for field in AVATAR_TEXT_FIELDS:
                    if field in avatar_data:
                        setattr(avatar, field, str(avatar_data[field] or '')[:ChildAvatar._meta.get_field(field).max_length])
                incoming_unlocked = avatar_data.get('unlocked_items')
                if is_reset:
                    clean_items = sorted({str(i)[:60] for i in (incoming_unlocked or [])[:MAX_UNLOCKED_ITEMS]}) if isinstance(incoming_unlocked, list) else []
                    avatar.unlocked_items = clean_items
                elif isinstance(incoming_unlocked, list) and incoming_unlocked:
                    current_items = set(avatar.unlocked_items or [])
                    current_items.update(str(i)[:60] for i in incoming_unlocked[:MAX_UNLOCKED_ITEMS])
                    avatar.unlocked_items = sorted(current_items)[:MAX_UNLOCKED_ITEMS]
                avatar.save()
            elif is_reset:
                avatar.unlocked_items = []
                avatar.save()

            # 5. Screen time
            screen_time_data = request.data.get('screen_time')
            if isinstance(screen_time_data, dict):
                mins = safe_int(screen_time_data.get('minutes_used'), default=0, lo=0, hi=MAX_SCREEN_MINUTES_PER_SYNC)
                if mins > 0:
                    log, _ = ScreenTimeLog.objects.select_for_update().get_or_create(
                        child_profile=child, date=timezone.localdate()
                    )
                    log.minutes_used += mins
                    log.save()

            # 5b. Offline game stats sync (ensures offline games aren't lost)
            game_stats_data = request.data.get('game_stats')
            if isinstance(game_stats_data, dict):
                for raw_game_type, st in list(game_stats_data.items())[:50]:
                    if not isinstance(st, dict):
                        continue
                    gtype = str(raw_game_type or '')[:60]
                    if not gtype:
                        continue
                    device_played = safe_int(st.get('timesPlayed'), default=0, lo=0, hi=10_000)
                    device_high = safe_int(st.get('highScore'), default=0, lo=0, hi=MAX_SCORE)
                    server_played = GameResult.objects.filter(child_profile=child, game_type=gtype).count()
                    if device_played > server_played:
                        GameResult.objects.create(
                            child_profile=child,
                            game_type=gtype,
                            score=device_high,
                            total_questions=max(device_high, 10),
                        )
                        act, _ = DailyActivity.objects.select_for_update().get_or_create(
                            child_profile=child, date=timezone.localdate()
                        )
                        act.games_played += (device_played - server_played)
                        act.save()

            # 6. Adventure progress: bounded set-based writes (no per-level loop driven by client input)
            if adv_level_in > 1:
                completed_levels = list(AdventureLevel.objects.filter(level_number__lt=adv_level_in))
                ChildAdventureProgress.objects.filter(child_profile=child, level__in=completed_levels).update(
                    completed=True, unlocked=True
                )
                existing_ids = set(
                    ChildAdventureProgress.objects.filter(child_profile=child).values_list('level_id', flat=True)
                )
                ChildAdventureProgress.objects.bulk_create(
                    [
                        ChildAdventureProgress(
                            child_profile=child, level=lvl, completed=True, unlocked=True, stars_earned=3
                        )
                        for lvl in completed_levels
                        if lvl.pk not in existing_ids
                    ],
                    ignore_conflicts=True,
                )
                curr_lvl = AdventureLevel.objects.filter(level_number=adv_level_in).first()
                if curr_lvl:
                    p_curr, _ = ChildAdventureProgress.objects.get_or_create(child_profile=child, level=curr_lvl)
                    if not p_curr.unlocked:
                        p_curr.unlocked = True
                        p_curr.save(update_fields=['unlocked', 'updated_at'])

        all_progress = LessonProgress.objects.filter(child_profile=child)
        all_plants = GardenPlant.objects.filter(child_profile=child)
        max_adv = ChildAdventureProgress.objects.filter(child_profile=child, completed=True).aggregate(
            models.Max('level__level_number')
        )['level__level_number__max'] or 0
        server_adv_level = max(max_adv + 1, adv_level_in)

        return Response({
            'status': 'synchronized',
            'is_reset': is_reset,
            'server_time': timezone.now().isoformat(),
            'child_profile_id': child.id,
            'adventure_level': server_adv_level,
            'lessons': LessonProgressSerializer(all_progress, many=True).data,
            'wallet': ChildWalletSerializer(wallet).data,
            'coins_spent_total': recorded_spent,
            'streak': DailyStreakSerializer(streak).data,
            'avatar': ChildAvatarSerializer(avatar).data,
            'garden': GardenPlantSerializer(all_plants, many=True).data,
        }, status=status.HTTP_200_OK)
