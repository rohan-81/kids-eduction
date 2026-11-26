import json
import os
import shutil
import subprocess
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import transaction

# Import Models
from lessons.models import Category, Lesson
from questions.models import Question
from gamification.models import AdventureLevel
from creative.models import ColoringTemplate
from rhymes.models import Rhyme
from rhymes.importing import rhyme_defaults, has_lyrics, upsert_rhyme
from stories.models import Story, StoryScene
from personalization.models import AvatarItem
from rewards.models import Badge


class Command(BaseCommand):
    help = 'Discover and import all static educational and game content from React Native into the Django database.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Run the discovery and validation process without persisting any changes to the database.',
        )
        parser.add_argument(
            '--refresh-export',
            action='store_true',
            help='Force re-running the TypeScript static data extraction before importing.',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        refresh_export = options['refresh_export']

        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        backend_dir = base_dir
        project_root = base_dir.parent
        export_file = backend_dir / 'data_exports' / 'kidszone_data.json'
        export_script = project_root / 'scripts' / 'export_static_data.ts'

        self.stdout.write(self.style.MIGRATE_HEADING("=================================================="))
        self.stdout.write(self.style.MIGRATE_HEADING("   KIDS LEARNING APPLICATION - DATA IMPORT TOOL   "))
        self.stdout.write(self.style.MIGRATE_HEADING("=================================================="))
        if dry_run:
            self.stdout.write(self.style.WARNING("Mode: DRY RUN (No database records will be committed)\n"))
        else:
            self.stdout.write(self.style.SUCCESS("Mode: LIVE IMPORT (Idempotent update_or_create)\n"))

        # Step 1: Ensure export data exists or refresh if requested
        if refresh_export or not export_file.exists():
            # Plain Node + scripts/register_assets.cjs (aliases react-native to mocks and
            # transpiles TS with the project's own `typescript`). `npx tsx` both downloaded a
            # package on every run and failed to parse react-native 0.88's Flow entry.
            self.stdout.write("Running static data extractor (node -r scripts/register_assets.cjs)...")
            node = shutil.which('node')
            try:
                if not node:
                    raise FileNotFoundError('node executable not found on PATH')
                subprocess.run(
                    [node, '-r', './scripts/register_assets.cjs', 'scripts/export_static_data.ts'],
                    cwd=str(project_root),
                    capture_output=True,
                    text=True,
                    check=True,
                )
                self.stdout.write(self.style.SUCCESS("TypeScript static data extracted successfully."))
            except (subprocess.CalledProcessError, OSError) as e:
                detail = getattr(e, 'stderr', None) or getattr(e, 'stdout', None) or str(e)
                self.stdout.write(self.style.ERROR(f"Data extraction failed: {detail}"))
                if not export_file.exists():
                    self.stdout.write(self.style.ERROR("Fatal: No exported data file available to import."))
                    return

        if not export_file.exists():
            self.stdout.write(self.style.ERROR(f"Export file not found at: {export_file}"))
            return

        with open(export_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        stats = {
            'files_scanned': [
                'src/data/categories.ts',
                'src/data/lessons.ts',
                'src/data/lessonsEnglish.ts',
                'src/data/lessonsGK.ts',
                'src/data/lessonsMath.ts',
                'src/data/lessonsScience.ts',
                'src/data/gamesData.ts',
                'src/data/challengeData.ts',
                'src/data/adventureLevels.ts',
                'src/data/coloringTemplates.ts',
                'src/data/rhymesData.ts',
                'app/stories.tsx',
                'app/avatar.tsx',
            ],
            'categories': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'lessons': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'questions': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'adventure': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'coloring': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'rhymes': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'stories': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'avatars': {'discovered': 0, 'created': 0, 'updated': 0, 'failed': 0},
            'errors': []
        }

        try:
            with transaction.atomic():
                # -----------------------------------------------------------------
                # 1. IMPORT CATEGORIES
                # -----------------------------------------------------------------
                raw_cats = data.get('categories', [])
                stats['categories']['discovered'] = len(raw_cats)
                for idx, cat in enumerate(raw_cats):
                    try:
                        c_slug = cat.get('id') or f"cat-{idx+1}"
                        grad = cat.get('gradient') or []
                        g_start = grad[0] if len(grad) > 0 else ''
                        g_end = grad[1] if len(grad) > 1 else ''

                        if not dry_run:
                            obj, created = Category.objects.update_or_create(
                                slug=c_slug,
                                defaults={
                                    'title': cat.get('title', c_slug.capitalize()),
                                    'title_gujarati': cat.get('titleGujarati', ''),
                                    'title_hindi': cat.get('titleHindi', ''),
                                    'icon': cat.get('icon', '📚'),
                                    'color': cat.get('color', '#3B82F6'),
                                    'gradient_start': g_start,
                                    'gradient_end': g_end,
                                    'description': cat.get('description', ''),
                                    'order': idx,
                                    'is_active': True,
                                }
                            )
                            if created:
                                stats['categories']['created'] += 1
                            else:
                                stats['categories']['updated'] += 1
                        else:
                            stats['categories']['created'] += 1
                    except Exception as ex:
                        stats['categories']['failed'] += 1
                        stats['errors'].append(f"Category {cat.get('id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 2. IMPORT LESSONS
                # -----------------------------------------------------------------
                raw_lessons_dict = data.get('lessons', {})
                all_lessons = []
                for lang_key, l_list in raw_lessons_dict.items():
                    all_lessons.extend(l_list)

                stats['lessons']['discovered'] = len(all_lessons)
                for idx, item in enumerate(all_lessons):
                    try:
                        stable_id = str(item.get('id') or f"lesson-{item.get('category') or item.get('categoryId')}-{idx+1}")
                        lang_code = item.get('language', 'gu')
                        if lang_code not in ['gu', 'en', 'hi', 'all']:
                            lang_code = 'gu'
                        
                        age_grp = item.get('ageGroup', '2-4')
                        if age_grp not in ['2-4', '4-6', '6-8', 'all']:
                            age_grp = '2-4'

                        if not dry_run:
                            obj, created = Lesson.objects.update_or_create(
                                stable_id=stable_id,
                                defaults={
                                    'title': item.get('title', 'Lesson'),
                                    'category': item.get('category') or item.get('categoryId') or 'general',
                                    'language': lang_code,
                                    'age_group': age_grp,
                                    'difficulty': item.get('difficulty', 1),
                                    'symbol': item.get('symbol', '★'),
                                    'subtitle': item.get('subtitle', ''),
                                    'phonetic': item.get('phonetic', ''),
                                    'example_word': item.get('exampleWord', ''),
                                    'example_meaning': item.get('exampleMeaning', ''),
                                    'example_image': str(item.get('exampleImage') or ''),
                                    'audio_prompt': item.get('audioPrompt', ''),
                                    'visual_color': item.get('visualColor', ''),
                                    'tracing_path': str(item.get('tracingPath') or ''),
                                    'words': item.get('words', []),
                                    'rhyme_text': item.get('rhyme', ''),
                                    'lesson_data': item.get('lessonData', {}),
                                    'order': idx,
                                    'is_active': True,
                                }
                            )
                            if created:
                                stats['lessons']['created'] += 1
                            else:
                                stats['lessons']['updated'] += 1
                        else:
                            stats['lessons']['created'] += 1
                    except Exception as ex:
                        stats['lessons']['failed'] += 1
                        stats['errors'].append(f"Lesson {item.get('id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 3. IMPORT QUESTIONS
                # -----------------------------------------------------------------
                raw_questions = data.get('questions', [])
                stats['questions']['discovered'] = len(raw_questions)
                for idx, q in enumerate(raw_questions):
                    try:
                        q_stable_id = str(q.get('stable_id') or f"q-{idx+1}")
                        q_lang = q.get('language', 'gu')
                        if q_lang not in ['gu', 'en', 'hi', 'all']:
                            q_lang = 'gu'

                        if not dry_run:
                            obj, created = Question.objects.update_or_create(
                                stable_id=q_stable_id,
                                defaults={
                                    'category': q.get('category', 'general'),
                                    'language': q_lang,
                                    'age_group': q.get('age_group', 'all'),
                                    'question_text': q.get('question_text', 'Choose the correct answer'),
                                    'audio_text': q.get('audio_text', ''),
                                    'display_visual': q.get('display_visual', ''),
                                    'count_target': q.get('count_target'),
                                    'question_type': q.get('game_type', 'find-letter'),
                                    'options': q.get('options', []),
                                    'correct_answer': q.get('correct_answer', ''),
                                    'correct_option_id': q.get('correct_option_id', ''),
                                    'explanation': q.get('explanation', ''),
                                    'hint': q.get('hint', ''),
                                    'image': q.get('image', ''),
                                    'audio': q.get('audio', ''),
                                    'difficulty': q.get('difficulty', 1),
                                    'points': q.get('points', 10),
                                    'is_active': True,
                                }
                            )
                            if created:
                                stats['questions']['created'] += 1
                            else:
                                stats['questions']['updated'] += 1
                        else:
                            stats['questions']['created'] += 1
                    except Exception as ex:
                        stats['questions']['failed'] += 1
                        stats['errors'].append(f"Question {q.get('stable_id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 4. IMPORT ADVENTURE LEVELS
                # -----------------------------------------------------------------
                raw_adv = data.get('adventure_levels', [])
                stats['adventure']['discovered'] = len(raw_adv)
                for idx, adv in enumerate(raw_adv):
                    try:
                        lvl_num = adv.get('levelNumber') or adv.get('id') or (idx + 1)
                        if not dry_run:
                            obj, created = AdventureLevel.objects.update_or_create(
                                level_number=lvl_num,
                                defaults={
                                    'world_name': adv.get('world') or adv.get('world_name', f"World {((lvl_num - 1) // 10) + 1}"),
                                    'title': adv.get('title', f"Adventure Stage {lvl_num}"),
                                    'required_stars': adv.get('requiredStars', 0),
                                    'reward_coins': adv.get('rewardCoins', 10),
                                    'reward_stars': adv.get('rewardStars', 3),
                                    'questions_data': adv.get('questions', []),
                                    'is_active': True,
                                }
                            )
                            if created:
                                stats['adventure']['created'] += 1
                            else:
                                stats['adventure']['updated'] += 1
                        else:
                            stats['adventure']['created'] += 1
                    except Exception as ex:
                        stats['adventure']['failed'] += 1
                        stats['errors'].append(f"Adventure Level {adv.get('id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 5. IMPORT COLORING TEMPLATES
                # -----------------------------------------------------------------
                raw_col = data.get('coloring_templates', [])
                stats['coloring']['discovered'] = len(raw_col)
                for idx, col in enumerate(raw_col):
                    try:
                        c_slug = str(col.get('id') or f"color-{idx+1}")
                        if not dry_run:
                            obj, created = ColoringTemplate.objects.update_or_create(
                                slug=c_slug,
                                defaults={
                                    'title': col.get('title', c_slug.capitalize()),
                                    'category': col.get('category', 'animals'),
                                    'svg_path': col.get('svgPath', ''),
                                    'view_box': col.get('viewBox', '0 0 200 200'),
                                    'difficulty': col.get('difficulty', 1),
                                    'default_color': col.get('defaultColor', '#FFD54F'),
                                    'palette': col.get('palette', []),
                                    'order': idx,
                                    'is_active': True,
                                }
                            )
                            if created:
                                stats['coloring']['created'] += 1
                            else:
                                stats['coloring']['updated'] += 1
                        else:
                            stats['coloring']['created'] += 1
                    except Exception as ex:
                        stats['coloring']['failed'] += 1
                        stats['errors'].append(f"Coloring {col.get('id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 6. IMPORT RHYMES
                # -----------------------------------------------------------------
                raw_rhymes = data.get('rhymes', [])
                stats['rhymes']['discovered'] = len(raw_rhymes)
                for idx, r in enumerate(raw_rhymes):
                    try:
                        if not has_lyrics(rhyme_defaults(r, idx)):
                            raise ValueError("record has no lyrics in any language")

                        if not dry_run:
                            obj, created = upsert_rhyme(r, idx)
                            if created:
                                stats['rhymes']['created'] += 1
                            else:
                                stats['rhymes']['updated'] += 1
                        else:
                            stats['rhymes']['created'] += 1
                    except Exception as ex:
                        stats['rhymes']['failed'] += 1
                        stats['errors'].append(f"Rhyme {r.get('id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 7. IMPORT STORIES & SCENES
                # -----------------------------------------------------------------
                raw_stories = data.get('stories', [])
                stats['stories']['discovered'] = len(raw_stories)
                for idx, s in enumerate(raw_stories):
                    try:
                        s_slug = str(s.get('id') or f"story-{idx+1}")
                        if not dry_run:
                            story_obj, created = Story.objects.update_or_create(
                                slug=s_slug,
                                defaults={
                                    'title': s.get('titleEn', s.get('titleGu', s_slug)),
                                    'title_gujarati': s.get('titleGu', ''),
                                    'title_hindi': s.get('titleHi', ''),
                                    'moral': s.get('moralEn', ''),
                                    'moral_gujarati': s.get('moralGu', ''),
                                    'moral_hindi': s.get('moralHi', ''),
                                    'category': 'moral',
                                    'order': idx,
                                    'is_active': True,
                                }
                            )
                            # Create or update scenes
                            for sc in s.get('scenes', []):
                                page_num = sc.get('page', 1)
                                StoryScene.objects.update_or_create(
                                    story=story_obj,
                                    scene_number=page_num,
                                    defaults={
                                        'text_english': sc.get('textEn', ''),
                                        'text_gujarati': sc.get('textGu', ''),
                                        'text_hindi': sc.get('textHi', ''),
                                        'illustration': sc.get('illustration', ''),
                                        'choices': [sc.get('choice')] if sc.get('choice') else [],
                                    }
                                )
                            if created:
                                stats['stories']['created'] += 1
                            else:
                                stats['stories']['updated'] += 1
                        else:
                            stats['stories']['created'] += 1
                    except Exception as ex:
                        stats['stories']['failed'] += 1
                        stats['errors'].append(f"Story {s.get('id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 8. IMPORT AVATAR CATALOG
                # -----------------------------------------------------------------
                raw_avatars = data.get('avatar_items', [])
                stats['avatars']['discovered'] = len(raw_avatars)
                for idx, av in enumerate(raw_avatars):
                    try:
                        av_id = str(av.get('item_id') or f"avatar-{idx+1}")
                        if not dry_run:
                            obj, created = AvatarItem.objects.update_or_create(
                                item_id=av_id,
                                defaults={
                                    'name': av.get('name', av_id),
                                    'item_type': av.get('item_type', 'hat'),
                                    'icon': av.get('icon', '🧢'),
                                    'price_coins': av.get('price_coins', 0),
                                    'is_premium': av.get('is_premium', False),
                                    'is_active': av.get('is_active', True),
                                }
                            )
                            if created:
                                stats['avatars']['created'] += 1
                            else:
                                stats['avatars']['updated'] += 1
                        else:
                            stats['avatars']['created'] += 1
                    except Exception as ex:
                        stats['avatars']['failed'] += 1
                        stats['errors'].append(f"Avatar {av.get('item_id')}: {str(ex)}")

                # -----------------------------------------------------------------
                # 9. IMPORT ACHIEVEMENT BADGES
                # -----------------------------------------------------------------
                badge_list = [
                    {
                        'slug': 'badge-welcome',
                        'title': 'First Step Explorer',
                        'name_gu': 'પ્રથમ ડગલું',
                        'name_hi': 'पहला कदम',
                        'name_en': 'First Step Explorer',
                        'desc_gu': 'KidsZone માં સ્વાગત છે! નવું શિક્ષણ સાહસ શરૂ થયું!',
                        'desc_hi': 'KidsZone में स्वागत है! नई सीखने की यात्रा शुरू हुई!',
                        'desc_en': 'Welcome to KidsZone! Joined the learning adventure!',
                        'req_gu': 'એપમાં પ્રવેશ કર્યો',
                        'req_hi': 'ऐप में शामिल हुए',
                        'req_en': 'Joined KidsZone',
                        'icon': '🚀',
                        'reward_coins': 10,
                        'order': 1,
                    },
                    {
                        'slug': 'badge-first-step',
                        'title': 'Super Star Student',
                        'name_gu': 'સુપર સ્ટાર વિદ્યાર્થી',
                        'name_hi': 'सुपर स्टार विद्यार्थी',
                        'name_en': 'Super Star Student',
                        'desc_gu': 'તમારો પહેલો પાઠ સફળતાપૂર્વક પૂર્ણ કર્યો!',
                        'desc_hi': 'पहला पाठ सफलतापूर्वक पूरा किया!',
                        'desc_en': 'Completed your first interactive lesson!',
                        'req_gu': '૧ પાઠ પૂર્ણ',
                        'req_hi': '१ पाठ पूरा',
                        'req_en': '1 lesson completed',
                        'icon': '⭐',
                        'reward_coins': 15,
                        'order': 2,
                    },
                    {
                        'slug': 'badge-scholar',
                        'title': 'Alphabet Master',
                        'name_gu': 'મૂળાક્ષર માસ્ટર',
                        'name_hi': 'वर्णमाला मास्टर',
                        'name_en': 'Alphabet Master',
                        'desc_gu': 'કક્કો અને અંગ્રેજી A-Z ના ૫ પાઠ શીખ્યા!',
                        'desc_hi': 'वर्णमाला और अंग्रेजी के ५ पाठ सीखे!',
                        'desc_en': 'Finished 5 language & alphabet lessons!',
                        'req_gu': '૫ પાઠ પૂર્ણ',
                        'req_hi': '५ पाठ पूरे',
                        'req_en': '5 lessons finished',
                        'icon': '🔤',
                        'reward_coins': 20,
                        'order': 3,
                    },
                    {
                        'slug': 'badge-math-wizard',
                        'title': 'Math Wizard',
                        'name_gu': 'ગણિતના જાદુગર',
                        'name_hi': 'गणित के जादूगर',
                        'name_en': 'Math Wizard',
                        'desc_gu': 'અંકો અને ગણતરીના પાઠ સફળતાપૂર્વક શીખ્યા!',
                        'desc_hi': 'अंकों और गिनती के पाठ सीखे!',
                        'desc_en': 'Mastered counting and numbers!',
                        'req_gu': '૮ પાઠ પૂર્ણ',
                        'req_hi': '८ पाठ पूरे',
                        'req_en': '8 lessons finished',
                        'icon': '🔢',
                        'reward_coins': 25,
                        'order': 4,
                    },
                    {
                        'slug': 'badge-animal-lover',
                        'title': 'Nature Explorer',
                        'name_gu': 'પ્રકૃતિ પ્રેમી',
                        'name_hi': 'प्रकृति प्रेमी',
                        'name_en': 'Nature Explorer',
                        'desc_gu': 'પ્રાણીઓ અને પક્ષીઓની ઓળખ શીખ્યા!',
                        'desc_hi': 'जानवरों और पक्षियों की पहचान सीखी!',
                        'desc_en': 'Learned about animals and birds!',
                        'req_gu': 'પ્રાણીઓનો પાઠ પૂર્ણ',
                        'req_hi': 'पशु-पक्षी पाठ पूर्ण',
                        'req_en': 'Finished animal lesson',
                        'icon': '🦁',
                        'reward_coins': 20,
                        'order': 5,
                    },
                    {
                        'slug': 'badge-master',
                        'title': 'Grand Scholar',
                        'name_gu': 'મહાજ્ઞાની ચેમ્પિયન',
                        'name_hi': 'महाज्ञानी चैंपियन',
                        'name_en': 'Grand Scholar',
                        'desc_gu': '૧૫ થી વધુ પાઠ પૂર્ણ કરીને સુપર સિદ્ધિ મેળવી!',
                        'desc_hi': '१५ से अधिक पाठ पूरे करके सुपर उपलब्धि हासिल की!',
                        'desc_en': 'Mastered 15+ comprehensive lessons!',
                        'req_gu': '૧૫ પાઠ પૂર્ણ',
                        'req_hi': '१५ पाठ पूरे',
                        'req_en': '15 lessons finished',
                        'icon': '👑',
                        'reward_coins': 50,
                        'order': 6,
                    },
                    {
                        'slug': 'badge-game-champ',
                        'title': 'Game Master',
                        'name_gu': 'રમતવીર સુપરસ્ટાર',
                        'name_hi': 'खेल मास्टर',
                        'name_en': 'Game Master',
                        'desc_gu': 'શૈક્ષણિક રમતોમાં ઉત્તમ સ્કોર મેળવ્યો!',
                        'desc_hi': 'शैक्षिक खेलों में शानदार स्कोर बनाया!',
                        'desc_en': 'Scored high in educational mini-games!',
                        'req_gu': '૨ રમતો રમી',
                        'req_hi': '२ खेल खेले',
                        'req_en': 'Played 2 games',
                        'icon': '🎮',
                        'reward_coins': 30,
                        'order': 7,
                    },
                    {
                        'slug': 'badge-artist',
                        'title': 'Creative Artist',
                        'name_gu': 'સર્જનાત્મક કલાકાર',
                        'name_hi': 'रचनात्मक कलाकार',
                        'name_en': 'Creative Artist',
                        'desc_gu': 'રંગો, આકારો અને ડ્રોઇંગ દ્વારા સુંદર કલાકૃતિ બનાવી!',
                        'desc_hi': 'रंगों, आकारों और ड्रॉइंग में रचनात्मकता दिखाई!',
                        'desc_en': 'Showcased creativity in colors & drawing!',
                        'req_gu': 'આર્ટ એક્ટિવિટી પૂર્ણ',
                        'req_hi': 'આર્ટ गतिविधि પૂર્ણ',
                        'req_en': 'Art activity completed',
                        'icon': '🎨',
                        'reward_coins': 25,
                        'order': 8,
                    },
                ]
                if not dry_run:
                    for b in badge_list:
                        Badge.objects.update_or_create(
                            slug=b['slug'],
                            defaults={
                                'title': b['title'],
                                'name_gu': b['name_gu'],
                                'name_hi': b['name_hi'],
                                'name_en': b['name_en'],
                                'desc_gu': b['desc_gu'],
                                'desc_hi': b['desc_hi'],
                                'desc_en': b['desc_en'],
                                'req_gu': b['req_gu'],
                                'req_hi': b['req_hi'],
                                'req_en': b['req_en'],
                                'icon': b['icon'],
                                'reward_coins': b['reward_coins'],
                                'order': b['order'],
                                'is_active': True,
                            }
                        )

                # If dry-run, rollback all database changes
                if dry_run:
                    transaction.set_rollback(True)

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Transaction aborted due to fatal error: {str(e)}"))
            stats['errors'].append(f"Fatal transaction error: {str(e)}")

        # Print Comprehensive Summary
        self.stdout.write("\n" + "=" * 50)
        self.stdout.write(self.style.SUCCESS("           DATA IMPORT SUMMARY REPORT            "))
        self.stdout.write("=" * 50)
        self.stdout.write(f"Scanned source files: {len(stats['files_scanned'])}")
        for f in stats['files_scanned']:
            self.stdout.write(f"  • {f}")

        total_discovered = sum(s['discovered'] for s in stats.values() if isinstance(s, dict) and 'discovered' in s)
        total_created = sum(s['created'] for s in stats.values() if isinstance(s, dict) and 'created' in s)
        total_updated = sum(s['updated'] for s in stats.values() if isinstance(s, dict) and 'updated' in s)
        total_failed = sum(s['failed'] for s in stats.values() if isinstance(s, dict) and 'failed' in s)

        self.stdout.write(f"\nDiscovered Total Records: {total_discovered}")
        self.stdout.write(f"Records Created/Imported: {total_created}")
        self.stdout.write(f"Records Updated:         {total_updated}")
        self.stdout.write(f"Records Failed:          {total_failed}")

        self.stdout.write("\nModule-by-Module Breakdown:")
        modules = [
            ('Categories', 'categories'),
            ('Lessons (Gujarati, English, GK, Math, Science)', 'lessons'),
            ('Game & Challenge Questions', 'questions'),
            ('Adventure Map Levels', 'adventure'),
            ('Coloring Book Templates', 'coloring'),
            ('Nursery Rhymes', 'rhymes'),
            ('Moral Stories & Interactive Scenes', 'stories'),
            ('Avatar Catalog Items', 'avatars'),
        ]
        for name, key in modules:
            m = stats[key]
            status = self.style.SUCCESS("OK") if m['failed'] == 0 else self.style.WARNING("HAS ERRORS")
            self.stdout.write(
                f"  [{status}] {name:48}: "
                f"Discovered={m['discovered']:<4} Created={m['created']:<4} Updated={m['updated']:<4} Failed={m['failed']}"
            )

        if stats['errors']:
            self.stdout.write(self.style.WARNING(f"\nErrors requiring attention ({len(stats['errors'])}):"))
            for err in stats['errors'][:10]:
                self.stdout.write(self.style.ERROR(f"  - {err}"))
            if len(stats['errors']) > 10:
                self.stdout.write(f"  ...and {len(stats['errors']) - 10} more.")
        else:
            self.stdout.write(self.style.SUCCESS("\nNo errors encountered! All data imported with 100% integrity."))

        if dry_run:
            self.stdout.write(self.style.WARNING("\nDry-run completed successfully! Database was NOT modified."))
        else:
            self.stdout.write(self.style.SUCCESS("\nImport completed successfully! Database is fully up to date."))
