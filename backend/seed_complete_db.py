import os
import sys
import json
import subprocess
from pathlib import Path

# Setup Django environment
BACKEND_DIR = Path(__file__).resolve().parent
sys.path.append(str(BACKEND_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Auto-detect venv if running with global python without django
try:
    import django
except ImportError:
    win_venv = BACKEND_DIR / 'venv' / 'Scripts' / 'python.exe'
    unix_venv = BACKEND_DIR / 'venv' / 'bin' / 'python'
    target_py = win_venv if win_venv.exists() else unix_venv if unix_venv.exists() else None
    if target_py and sys.executable.lower() != str(target_py).lower():
        res = subprocess.run([str(target_py)] + sys.argv, cwd=str(BACKEND_DIR))
        sys.exit(res.returncode)
    raise

django.setup()

from django.core.management import call_command
from django.contrib.auth import get_user_model
from lessons.models import Category, Lesson
from questions.models import Question
from rewards.models import Badge, Sticker
from rewards.importing import load_sticker_records, upsert_sticker
from stories.models import Story, StoryScene
from gamification.models import AdventureLevel
from creative.models import ColoringTemplate
from rhymes.models import Rhyme
from rhymes.importing import upsert_rhyme
from personalization.models import AvatarItem

def run_seed():
    print("==================================================")
    print("   🚀 KIDSZONE DATABASE AUTOMATED SEED ENGINE     ")
    print("==================================================")

    # 1. Run migrations automatically first
    print("\n[1/10] Applying Database Migrations...")
    call_command('migrate', interactive=False, verbosity=0)
    print("  ✅ Migrations applied successfully.")

    # 2. Locate exported data JSON
    json_path = BACKEND_DIR / 'data_exports' / 'kidszone_data.json'
    if not json_path.exists():
        print(f"  ❌ Error: Data file not found at {json_path}")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 3. Seed Categories
    print("\n[2/10] Seeding Categories...")
    cats = data.get('categories', [])
    for idx, c in enumerate(cats):
        slug = c.get('id') or c.get('slug')
        Category.objects.update_or_create(
            slug=slug,
            defaults={
                'title': c.get('title') or c.get('name') or slug,
                'title_gujarati': c.get('titleGujarati') or c.get('title_gujarati', ''),
                'title_hindi': c.get('titleHindi') or c.get('title_hindi', ''),
                'icon': c.get('icon', 'star'),
                'color': c.get('color', '#4F46E5'),
                'order': c.get('order', idx),
                'is_active': True,
            }
        )
    print(f"  ✅ {Category.objects.count()} Categories ready in DB.")

    # 4. Seed Lessons
    print("\n[3/10] Seeding Lessons across Gujarati, English, GK, Math, Science...")
    lessons_data = data.get('lessons', {})
    all_lessons = []
    if isinstance(lessons_data, dict):
        for subject, list_items in lessons_data.items():
            if isinstance(list_items, list):
                all_lessons.extend(list_items)
    elif isinstance(lessons_data, list):
        all_lessons = lessons_data

    # Animal sound effect mapping for real audio recording playback via backend streaming endpoint
    animal_sound_map = {
        'lion': ('lion', '/api/lessons/animal-audio/lion/'),
        'tiger': ('tiger', '/api/lessons/animal-audio/tiger/'),
        'cat': ('cat', '/api/lessons/animal-audio/cat/'),
        'dog': ('dog', '/api/lessons/animal-audio/dog/'),
        'cow': ('cow', '/api/lessons/animal-audio/cow/'),
        'peacock': ('peacock', '/api/lessons/animal-audio/peacock/'),
        'bird': ('sparrow', '/api/lessons/animal-audio/sparrow/'),
        'sparrow': ('sparrow', '/api/lessons/animal-audio/sparrow/'),
        'elephant': ('elephant', '/api/lessons/animal-audio/elephant/'),
        'horse': ('horse', '/api/lessons/animal-audio/horse/'),
        'parrot': ('parrot', '/api/lessons/animal-audio/parrot/'),
        'rabbit': ('rabbit', '/api/lessons/animal-audio/rabbit/'),
        'monkey': ('monkey', '/api/lessons/animal-audio/monkey/'),
        'duck': ('duck', '/api/lessons/animal-audio/duck/'),
        'camel': ('camel', '/api/lessons/animal-audio/camel/'),
        'deer': ('deer', '/api/lessons/animal-audio/deer/'),
        'giraffe': ('giraffe', '/api/lessons/animal-audio/giraffe/'),
        'zebra': ('zebra', '/api/lessons/animal-audio/zebra/'),
        'bear': ('bear', '/api/lessons/animal-audio/bear/'),
        'pigeon': ('pigeon', '/api/lessons/animal-audio/pigeon/'),
        'rooster': ('rooster', '/api/lessons/animal-audio/rooster/'),
        'sheep': ('sheep', '/api/lessons/animal-audio/sheep/'),
        'goat': ('goat', '/api/lessons/animal-audio/goat/'),
        'frog': ('frog', '/api/lessons/animal-audio/frog/'),
        'donkey': ('donkey', '/api/lessons/animal-audio/donkey/'),
        'crow': ('crow', '/api/lessons/animal-audio/crow/'),
        'owl': ('owl', '/api/lessons/animal-audio/owl/'),
        'bee': ('bee', '/api/lessons/animal-audio/bee/'),
    }

    for idx, l in enumerate(all_lessons):
        stable_id = str(l.get('id') or f"les-{idx+1}")
        cat_id = l.get('categoryId') or l.get('category') or 'gu-varnamala'

        # Enrich lesson_data with multilingual audio prompts, sound recordings, and subTypes
        extra_data = dict(l.get('lessonData') or l.get('lesson_data', {}) or {})
        for key in [
            'audioPromptGu', 'audioPromptHi', 'audioPromptEn',
            'exampleMeaningGu', 'exampleMeaningHi',
            'subType', 'imageUrl', 'illustrationType', 'soundKey', 'audioUrl'
        ]:
            if key in l and key not in extra_data:
                extra_data[key] = l[key]

        # Attach authentic animal voice recordings for animals & birds
        if cat_id == 'animals':
            clean_id = stable_id.replace('an-', '').lower()
            if clean_id in animal_sound_map:
                sk, aurl = animal_sound_map[clean_id]
                extra_data['soundKey'] = sk
                extra_data['audioUrl'] = aurl

        example_img = l.get('exampleImage') or l.get('example_image') or l.get('imageUrl') or ''

        # Foundational literacy and full-alphabet collections should be accessible across all age brackets
        base_all_cats = {'hi-varnamala', 'gu-varnamala', 'gu-barakhadi', 'en-alphabet', 'en-phonics', 'animals', 'numbers'}
        target_age = 'all' if cat_id in base_all_cats else (l.get('ageGroup') or l.get('age_group', 'all'))

        Lesson.objects.update_or_create(
            stable_id=stable_id,
            defaults={
                'category': str(cat_id),
                'language': l.get('language', 'gu'),
                'age_group': target_age,
                'title': l.get('title', stable_id),
                'subtitle': l.get('subtitle', ''),
                'symbol': l.get('symbol') or l.get('title', '★')[:2],
                'phonetic': l.get('phonetic', ''),
                'example_word': l.get('exampleWord') or l.get('example_word', ''),
                'example_meaning': l.get('exampleMeaning') or l.get('example_meaning', ''),
                'example_image': example_img,
                'audio_prompt': l.get('audioPrompt') or l.get('audio_prompt', ''),
                'visual_color': l.get('visualColor') or l.get('visual_color', '#3B82F6'),
                'tracing_path': l.get('tracingPath') or l.get('tracing_path', ''),
                'words': l.get('words', []),
                'rhyme_text': l.get('rhyme') or l.get('rhyme_text', ''),
                'lesson_data': extra_data,
                'order': idx,
                'is_active': True,
            }
        )
    print(f"  ✅ {Lesson.objects.count()} Lessons ready in DB.")

    # 5. Seed Game Questions
    print("\n[4/10] Seeding Game & Challenge Questions (All 16 Game Types)...")
    questions = data.get('questions', [])
    for idx, q in enumerate(questions):
        stable_id = str(q.get('stable_id') or f"q-{idx+1}")
        Question.objects.update_or_create(
            stable_id=stable_id,
            defaults={
                'category': q.get('category', 'general'),
                'language': q.get('language', 'gu'),
                'age_group': q.get('age_group', 'all'),
                'question_type': q.get('game_type', 'find-letter'),
                'question_text': q.get('question_text', 'Identify the correct answer'),
                'audio_text': q.get('audio_text', ''),
                'display_visual': q.get('display_visual', ''),
                'count_target': q.get('count_target'),
                'options': q.get('options', []),
                'correct_answer': str(q.get('correct_answer', '')),
                'correct_option_id': str(q.get('correct_option_id', '')),
                'explanation': q.get('explanation', ''),
                'hint': q.get('hint', ''),
                'image': q.get('image', ''),
                'audio': q.get('audio', ''),
                'difficulty': q.get('difficulty', 1),
                'points': q.get('points', 10),
                'is_active': True,
            }
        )
    print(f"  ✅ {Question.objects.count()} Game Questions ready in DB.")

    # 6. Seed Achievement Badges
    print("\n[5/10] Seeding Achievement Badges (Multilingual)...")
    badges = [
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
            'req_hi': '૮ पाठ पूरे',
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
            'req_hi': 'પશુ-પક્ષી પાઠ પૂર્ણ',
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
            'req_hi': '૧૫ पाठ पूरे',
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
            'req_hi': 'आर्ट गतिविधि પૂર્ણ',
            'req_en': 'Art activity completed',
            'icon': '🎨',
            'reward_coins': 25,
            'order': 8,
        },
    ]
    for b in badges:
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
    print(f"  ✅ {Badge.objects.count()} Badges ready in DB.")

    # 6b. Seed Sticker Album catalog (mirrors src/data/stickersData.ts)
    for idx, stk in enumerate(load_sticker_records()):
        upsert_sticker(stk, idx)
    print(f"  ✅ {Sticker.objects.count()} Stickers ready in DB.")

    # 7. Seed Moral Stories & Story Scenes
    print("\n[6/10] Seeding Moral Stories & Interactive Scenes...")
    stories = data.get('stories', [])
    for idx, s in enumerate(stories):
        slug = str(s.get('id') or f"story-{idx+1}")
        story_obj, _ = Story.objects.update_or_create(
            slug=slug,
            defaults={
                'title': s.get('titleEn', s.get('titleGu', slug)),
                'title_gujarati': s.get('titleGu', ''),
                'title_hindi': s.get('titleHi', ''),
                'moral': s.get('moralEn', ''),
                'moral_gujarati': s.get('moralGu', ''),
                'moral_hindi': s.get('moralHi', ''),
                'cover_image': s.get('coverEmoji', '📖'),
                'order': idx,
                'is_active': True,
            }
        )
        for sc in s.get('scenes', []):
            page_num = sc.get('page', 1)
            StoryScene.objects.update_or_create(
                story=story_obj,
                scene_number=page_num,
                defaults={
                    'text_english': sc.get('textEn', ''),
                    'text_gujarati': sc.get('textGu', ''),
                    'text_hindi': sc.get('textHi', ''),
                    'illustration': sc.get('illustration', '📖'),
                    'choices': [sc.get('choice')] if sc.get('choice') else [],
                }
            )
    print(f"  ✅ {Story.objects.count()} Stories & {StoryScene.objects.count()} Scenes ready in DB.")

    # 8. Seed Adventure Levels
    print("\n[7/10] Seeding Adventure Island Levels...")
    adv_levels = data.get('adventure_levels', [])
    for idx, adv in enumerate(adv_levels):
        lvl_num = adv.get('levelNumber') or adv.get('id') or (idx + 1)
        AdventureLevel.objects.update_or_create(
            level_number=lvl_num,
            defaults={
                'world_name': adv.get('world') or adv.get('world_name', f"World {((lvl_num - 1) // 10) + 1}"),
                'title': adv.get('title', f"Island Stage {lvl_num}"),
                'required_stars': adv.get('requiredStars', 0),
                'reward_coins': adv.get('rewardCoins', 10),
                'reward_stars': adv.get('rewardStars', 3),
                'questions_data': adv.get('questions', []),
                'is_active': True,
            }
        )
    print(f"  ✅ {AdventureLevel.objects.count()} Adventure Levels ready in DB.")

    # 9. Seed Coloring Templates & Rhymes
    print("\n[8/10] Seeding Coloring Templates & Rhymes...")
    for idx, col in enumerate(data.get('coloring_templates', [])):
        c_slug = str(col.get('id') or f"color-{idx+1}")
        ColoringTemplate.objects.update_or_create(
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

    for idx, r in enumerate(data.get('rhymes', [])):
        upsert_rhyme(r, idx)
    print(f"  ✅ {ColoringTemplate.objects.count()} Coloring & {Rhyme.objects.count()} Rhymes ready in DB.")

    # 10. Seed Avatar Items
    print("\n[9/10] Seeding Avatar Items...")
    for idx, av in enumerate(data.get('avatar_items', [])):
        av_id = str(av.get('item_id') or f"avatar-{idx+1}")
        AvatarItem.objects.update_or_create(
            item_id=av_id,
            defaults={
                'name': av.get('name', av_id),
                'item_type': av.get('item_type', 'hat'),
                'icon': av.get('icon', '🧢'),
                'price_coins': av.get('price_coins', 0),
                'is_premium': av.get('is_premium', False),
                'is_active': True,
            }
        )
    print(f"  ✅ {AvatarItem.objects.count()} Avatar Items ready in DB.")

    # 11. Create Superuser if not exists
    print("\n[10/10] Verifying Admin Account...")
    User = get_user_model()
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@kidszone.local', 'admin123')
        print("  ✅ Superuser created: Username='admin', Password='admin123'")
    else:
        print("  ✅ Superuser 'admin' already exists.")

    print("\n==================================================")
    print("   🎉 ALL DATABASE DATA LOADED SUCCESSFULLY!      ")
    print("==================================================")
    print("તમારો આખો ડેટાબેઝ હવે સંપૂર્ણપણે તૈયાર છે!")
    print("Runserver કમાન્ડ: python manage.py runserver")
    print("Admin URL: http://localhost:8000/admin/")
    print("Admin Login: admin / admin123")
    print("==================================================\n")

if __name__ == '__main__':
    run_seed()
