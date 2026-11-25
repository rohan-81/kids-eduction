import os
import sys
import django
import json

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from lessons.models import Category, Lesson
from questions.models import Question
from rewards.models import Badge
from stories.models import Story, StoryScene
from creative.models import ColoringTemplate
from gamification.models import AdventureLevel

def seed_categories():
    print("Seeding Categories...")
    cats = [
        {"slug": "gu-varnamala", "title": "Gujarati Varnamala", "title_gujarati": "ગુજરાતી મૂળાક્ષરો", "title_hindi": "गुजराती वर्णमाला", "icon": "book-open-variant", "color": "#10B981", "order": 1},
        {"slug": "gu-barakhadi", "title": "Gujarati Barakhadi", "title_gujarati": "ગુજરાતી બારાખડી", "title_hindi": "गुजराती बारहखड़ी", "icon": "format-letter-case", "color": "#3B82F6", "order": 2},
        {"slug": "en-alphabet", "title": "English Alphabet", "title_gujarati": "અંગ્રેજી એબીસીડી", "title_hindi": "अंग्रेजी वर्णमाला", "icon": "alphabetical", "color": "#F97316", "order": 3},
        {"slug": "en-phonics", "title": "English Phonics", "title_gujarati": "ફોનિક્સ સાઉન્ડ્સ", "title_hindi": "फोनिक्स ध्वनि", "icon": "volume-high", "color": "#8B5CF6", "order": 4},
        {"slug": "hi-varnamala", "title": "Hindi Varnamala", "title_gujarati": "હિન્દી મૂળાક્ષરો", "title_hindi": "हिन्दी वर्णमाला", "icon": "om", "color": "#EAB308", "order": 5},
        {"slug": "numbers", "title": "Numbers & Counting", "title_gujarati": "એકડા અને ગણતરી", "title_hindi": "गिनती और अंक", "icon": "numeric", "color": "#06B6D4", "order": 6},
        {"slug": "math", "title": "Elementary Math", "title_gujarati": "સરવાળા અને બાદબાકી", "title_hindi": "जोड़ और घटाव", "icon": "calculator", "color": "#EC4899", "order": 7},
        {"slug": "ghadiya", "title": "Multiplication Tables", "title_gujarati": "ગુણાકાર ઘડિયા", "title_hindi": "पहाड़े", "icon": "table", "color": "#F59E0B", "order": 8},
        {"slug": "colors-shapes", "title": "Colors & Shapes", "title_gujarati": "રંગો અને આકારો", "title_hindi": "रंग और आकार", "icon": "palette", "color": "#EF4444", "order": 9},
        {"slug": "animals", "title": "Animals & Birds", "title_gujarati": "પ્રાણીઓ અને પક્ષીઓ", "title_hindi": "जानवर और पक्षी", "icon": "paw", "color": "#14B8A6", "order": 10},
        {"slug": "fruits", "title": "Fruits & Veggies", "title_gujarati": "ફળો અને શાકભાજી", "title_hindi": "फल और सब्जियां", "icon": "food-apple", "color": "#84CC16", "order": 11},
        {"slug": "gk", "title": "General Knowledge", "title_gujarati": "સામાન્ય જ્ઞાન", "title_hindi": "सामान्य ज्ञान", "icon": "earth", "color": "#6366F1", "order": 12},
    ]
    for c in cats:
        Category.objects.update_or_create(
            slug=c["slug"],
            defaults={
                "title": c["title"],
                "title_gujarati": c.get("title_gujarati", ""),
                "title_hindi": c.get("title_hindi", ""),
                "icon": c.get("icon", "star"),
                "color": c.get("color", "#4F46E5"),
                "order": c.get("order", 0),
                "is_active": True,
            }
        )
    print(f"  Categories seeded: {Category.objects.count()}")

def seed_badges():
    print("Seeding Badges...")
    badges = [
        {
            "slug": "badge-welcome",
            "title": "First Step Explorer",
            "name_gu": "પ્રથમ ડગલું",
            "name_hi": "पहला कदम",
            "name_en": "First Step Explorer",
            "desc_gu": "KidsZone માં સ્વાગત છે! નવું શિક્ષણ સાહસ શરૂ થયું!",
            "desc_hi": "KidsZone में स्वागत है! नई सीखने की यात्रा शुरू हुई!",
            "desc_en": "Welcome to KidsZone! Joined the learning adventure!",
            "req_gu": "એપમાં પ્રવેશ કર્યો",
            "req_hi": "ऐप में शामिल हुए",
            "req_en": "Joined KidsZone",
            "icon": "🚀",
            "reward_coins": 10,
            "order": 1,
        },
        {
            "slug": "badge-first-step",
            "title": "Super Star Student",
            "name_gu": "સુપર સ્ટાર વિદ્યાર્થી",
            "name_hi": "सुपर स्टार विद्यार्थी",
            "name_en": "Super Star Student",
            "desc_gu": "તમારો પહેલો પાઠ સફળતાપૂર્વક પૂર્ણ કર્યો!",
            "desc_hi": "पहला पाठ सफलतापूर्वक पूरा किया!",
            "desc_en": "Completed your first interactive lesson!",
            "req_gu": "૧ પાઠ પૂર્ણ",
            "req_hi": "१ पाठ पूरा",
            "req_en": "1 lesson completed",
            "icon": "⭐",
            "reward_coins": 15,
            "order": 2,
        },
        {
            "slug": "badge-scholar",
            "title": "Alphabet Master",
            "name_gu": "મૂળાક્ષર માસ્ટર",
            "name_hi": "वर्णमाला मास्टर",
            "name_en": "Alphabet Master",
            "desc_gu": "કક્કો અને અંગ્રેજી A-Z ના ૫ પાઠ શીખ્યા!",
            "desc_hi": "वर्णमाला और अंग्रेजी के ५ पाठ सीखे!",
            "desc_en": "Finished 5 language & alphabet lessons!",
            "req_gu": "૫ પાઠ પૂર્ણ",
            "req_hi": "५ पाठ पूरे",
            "req_en": "5 lessons finished",
            "icon": "🔤",
            "reward_coins": 20,
            "order": 3,
        },
        {
            "slug": "badge-math-wizard",
            "title": "Math Wizard",
            "name_gu": "ગણિતના જાદુગર",
            "name_hi": "गणित के जादूगर",
            "name_en": "Math Wizard",
            "desc_gu": "અંકો અને ગણતરીના પાઠ સફળતાપૂર્વક શીખ્યા!",
            "desc_hi": "अंकों और गिनती के पाठ सीखे!",
            "desc_en": "Mastered counting and numbers!",
            "req_gu": "૮ પાઠ પૂર્ણ",
            "req_hi": "८ पाठ पूरे",
            "req_en": "8 lessons finished",
            "icon": "🔢",
            "reward_coins": 25,
            "order": 4,
        },
        {
            "slug": "badge-animal-lover",
            "title": "Nature Explorer",
            "name_gu": "પ્રકૃતિ પ્રેમી",
            "name_hi": "प्रकृति प्रेमी",
            "name_en": "Nature Explorer",
            "desc_gu": "પ્રાણીઓ અને પક્ષીઓની ઓળખ શીખ્યા!",
            "desc_hi": "जानवरों और पक्षियों की पहचान सीखी!",
            "desc_en": "Learned about animals and birds!",
            "req_gu": "પ્રાણીઓનો પાઠ પૂર્ણ",
            "req_hi": "पशु-पक्षी पाठ पूर्ण",
            "req_en": "Finished animal lesson",
            "icon": "🦁",
            "reward_coins": 20,
            "order": 5,
        },
        {
            "slug": "badge-master",
            "title": "Grand Scholar",
            "name_gu": "મહાજ્ઞાની ચેમ્પિયન",
            "name_hi": "महाज्ञानी चैंपियन",
            "name_en": "Grand Scholar",
            "desc_gu": "૧૫ થી વધુ પાઠ પૂર્ણ કરીને સુપર સિદ્ધિ મેળવી!",
            "desc_hi": "१५ से अधिक पाठ पूरे करके सुपर उपलब्धि हासिल की!",
            "desc_en": "Mastered 15+ comprehensive lessons!",
            "req_gu": "૧૫ પાઠ પૂર્ણ",
            "req_hi": "१५ पाठ पूरे",
            "req_en": "15 lessons finished",
            "icon": "👑",
            "reward_coins": 50,
            "order": 6,
        },
        {
            "slug": "badge-game-champ",
            "title": "Game Master",
            "name_gu": "રમતવીર સુપરસ્ટાર",
            "name_hi": "खेल मास्टर",
            "name_en": "Game Master",
            "desc_gu": "શૈક્ષણિક રમતોમાં ઉત્તમ સ્કોર મેળવ્યો!",
            "desc_hi": "शैक्षिक खेलों में शानदार स्कोर बनाया!",
            "desc_en": "Scored high in educational mini-games!",
            "req_gu": "૨ રમતો રમી",
            "req_hi": "२ खेल खेले",
            "req_en": "Played 2 games",
            "icon": "🎮",
            "reward_coins": 30,
            "order": 7,
        },
        {
            "slug": "badge-artist",
            "title": "Creative Artist",
            "name_gu": "સર્જનાત્મક કલાકાર",
            "name_hi": "रचनात्मक कलाकार",
            "name_en": "Creative Artist",
            "desc_gu": "રંગો, આકારો અને ડ્રોઇંગ દ્વારા સુંદર કલાકૃતિ બનાવી!",
            "desc_hi": "रंगों, आकारों और ड्रॉइंग में रचनात्मकता दिखाई!",
            "desc_en": "Showcased creativity in colors & drawing!",
            "req_gu": "આર્ટ એક્ટિવિટી પૂર્ણ",
            "req_hi": "आर्ट गतिविधि पूर्ण",
            "req_en": "Art activity completed",
            "icon": "🎨",
            "reward_coins": 25,
            "order": 8,
        },
    ]
    for b in badges:
        Badge.objects.update_or_create(
            slug=b["slug"],
            defaults={
                "title": b["title"],
                "name_gu": b["name_gu"],
                "name_hi": b["name_hi"],
                "name_en": b["name_en"],
                "desc_gu": b["desc_gu"],
                "desc_hi": b["desc_hi"],
                "desc_en": b["desc_en"],
                "req_gu": b["req_gu"],
                "req_hi": b["req_hi"],
                "req_en": b["req_en"],
                "icon": b["icon"],
                "reward_coins": b["reward_coins"],
                "order": b["order"],
                "is_active": True,
            }
        )
    print(f"  Badges seeded: {Badge.objects.count()}")

def seed_stories():
    print("Seeding Stories...")
    stories = [
        {
            "slug": "story-crow",
            "title": "The Clever Crow",
            "title_gujarati": "ચતુર કાગડો",
            "title_hindi": "चतुर कौआ",
            "cover_image": "🦅",
            "moral": "Where there is a will and patience, there is always a way.",
            "moral_gujarati": "જ્યાં બુદ્ધિ અને ધીરજ છે, ત્યાં મુશ્કેલીનો ઉકેલ મળે છે.",
            "moral_hindi": "जहाँ बुद्धि और धैर्य है, वहाँ हर मुश्किल का हल मिल जाता है।",
            "scenes": [
                {
                    "scene_number": 1,
                    "illustration": "☀️ 🦅 🏜️",
                    "text_english": "On a hot summer afternoon, a thirsty crow flew across the fields looking for water.",
                    "text_gujarati": "ઉનાળાના ધોમધખતા બપોરે એક તરસ્યો કાગડો પાણીની શોધમાં આમતેમ ઊડી રહ્યો હતો.",
                    "text_hindi": "गर्मियों की एक तपती दोपहर में एक प्यासा कौआ पानी की तलाश में इधर-उधर भटक रहा था।"
                },
                {
                    "scene_number": 2,
                    "illustration": "🏺 💧 🦅",
                    "text_english": "He spotted a pitcher in a garden. But there was very little water at the very bottom!",
                    "text_gujarati": "એકાએક તેને બગીચામાં એક કૂંજો દેખાયો. પણ કૂંજાના તળિયે ખૂબ જ ઓછું પાણી હતું!",
                    "text_hindi": "अचानक उसे एक बगीचे में एक घड़ा दिखाई दिया। लेकिन घड़े के तलवे में बहुत कम पानी था!"
                },
                {
                    "scene_number": 3,
                    "illustration": "💡 🪨 🏺",
                    "text_english": "The clever crow picked up small pebbles one by one and dropped them into the pitcher.",
                    "text_gujarati": "ચતુર કાગડાને એક સરસ વિચાર આવ્યો! તેણે એક-એક કરીને કાંકરા કૂંજામાં નાખવાનું શરૂ કર્યું.",
                    "text_hindi": "चतुर कौए को एक बढ़िया विचार आया! उसने एक-एक करके कंकड़ घड़े में डालना शुरू किया।"
                },
                {
                    "scene_number": 4,
                    "illustration": "🌊 🦅 🎉",
                    "text_english": "Slowly the water rose to the top. The crow drank happily and flew away feeling refreshed!",
                    "text_gujarati": "ધીમે ધીમે પાણી ઉપર આવ્યું. કાગડાએ ધરાઈને મીઠું પાણી પીધું અને ખુશીથી ઉડી ગયો!",
                    "text_hindi": "धीरे-धीरे पानी ऊपर आ गया। कौए ने जी भरकर ठंडा पानी पिया और खुशी से उड़ गया!"
                }
            ]
        },
        {
            "slug": "story-lion-mouse",
            "title": "The Lion and the Mouse",
            "title_gujarati": "સિંહ અને ઉંદર",
            "title_hindi": "शेर और चूहा",
            "cover_image": "🦁",
            "moral": "Even the smallest friend can be of great help.",
            "moral_gujarati": "નાનામાં નાનો દોસ્ત પણ મુશ્કેલીના સમયે ખૂબ મોટો સાથીદાર બની શકે છે.",
            "moral_hindi": "छोटे से छोटा दोस्त भी वक्त आने पर बहुत बड़ा मददगार साबित हो सकता है।",
            "scenes": [
                {
                    "scene_number": 1,
                    "illustration": "🦁 💤 🌳 🐭",
                    "text_english": "A mighty lion was sleeping peacefully under the cool shade of a banyan tree. A playful little mouse ran over his nose.",
                    "text_gujarati": "એક ગાઢ જંગલમાં સિંહ ઝાડની છાયામાં શાંતિથી ઊંઘી રહ્યો હતો. ત્યાં એક નાનો ઉંદર રમતો રમતો તેના પર દોડવા લાગ્યો.",
                    "text_hindi": "एक घने जंगल में एक शेर पेड़ की छाया में गहरी नींद सो रहा था। तभी एक नन्हा चूहा खेलते-खेलते शेर के शरीर पर दौड़ने लगा।"
                },
                {
                    "scene_number": 2,
                    "illustration": "🦁 😠 🐭 🙏",
                    "text_english": "The angry lion woke up and trapped the mouse in his paw. The tiny mouse begged for mercy, promising to help one day.",
                    "text_gujarati": "સિંહે ગુસ્સે થઈને ઉંદરને પોતાના પંજામાં પકડી લીધો! ઉંદરે હાથ જોડીને વિનંતી કરી કે કોઈ દિવસ તે પણ સિંહની મદદ કરશે.",
                    "text_hindi": "शेर गुस्से में जाग गया और उसने चूहे को अपने पंजे में दबोच लिया। चूहे ने विनती की कि वह भी कभी शेर की मदद करेगा।"
                },
                {
                    "scene_number": 3,
                    "illustration": "🕸️ 🦁 🪢 🐭",
                    "text_english": "Days later, hunters trapped the lion in a strong net. The mouse heard his roar and rushed to help, chewing the ropes.",
                    "text_gujarati": "થોડા દિવસો પછી શિકારીઓની જાળમાં સિંહ ફસાઈ ગયો. સિંહની ગર્જના સાંભળી ઉંદર દોડી આવ્યો અને દોરડા કાપવા લાગ્યો.",
                    "text_hindi": "कुछ दिनों बाद शिकारियों ने शेर को मजबूत जाल में बांध दिया। दहाड़ सुनकर नन्हा चूहा तुरंत दौड़कर आया और जाल कुतरने लगा।"
                },
                {
                    "scene_number": 4,
                    "illustration": "🦁 🤝 🐭 ✨",
                    "text_english": "The lion was freed! From that day on, the king of the jungle and the tiny mouse became best friends forever.",
                    "text_gujarati": "સિંહ મુક્ત થઈ ગયો! તે દિવસથી જંગલનો રાજા સિંહ અને નાનકડો ઉંદર પાકા દોસ્ત બની ગયા.",
                    "text_hindi": "शेर जाल से आजाद हो गया! उस दिन से जंगल का राजा और वह नन्हा चूहा पक्के दोस्त बन गए।"
                }
            ]
        }
    ]
    for s in stories:
        story_obj, _ = Story.objects.update_or_create(
            slug=s["slug"],
            defaults={
                "title": s["title"],
                "title_gujarati": s["title_gujarati"],
                "title_hindi": s["title_hindi"],
                "cover_image": s["cover_image"],
                "moral": s["moral"],
                "moral_gujarati": s["moral_gujarati"],
                "moral_hindi": s["moral_hindi"],
                "is_active": True,
            }
        )
        for sc in s["scenes"]:
            StoryScene.objects.update_or_create(
                story=story_obj,
                scene_number=sc["scene_number"],
                defaults={
                    "illustration": sc["illustration"],
                    "text_english": sc["text_english"],
                    "text_gujarati": sc["text_gujarati"],
                    "text_hindi": sc["text_hindi"],
                }
            )
    print(f"  Stories seeded: {Story.objects.count()}, Scenes: {StoryScene.objects.count()}")

def seed_coloring():
    print("Seeding Coloring Templates...")
    templates = [
        {"slug": "col-butterfly", "title": "Cheerful Butterfly", "category": "animals", "thumbnail": "🦋", "order": 1},
        {"slug": "col-flower", "title": "Blooming Lotus", "category": "nature", "thumbnail": "🌸", "order": 2},
        {"slug": "col-rocket", "title": "Space Rocket", "category": "vehicles", "thumbnail": "🚀", "order": 3},
        {"slug": "col-lion", "title": "Brave Lion", "category": "animals", "thumbnail": "🦁", "order": 4},
        {"slug": "col-apple", "title": "Sweet Apple", "category": "fruits", "thumbnail": "🍎", "order": 5},
    ]
    for t in templates:
        ColoringTemplate.objects.update_or_create(
            slug=t["slug"],
            defaults={
                "title": t["title"],
                "category": t["category"],
                "thumbnail": t["thumbnail"],
                "svg_path": "M 50 50 L 150 50 L 100 150 Z",
                "order": t["order"],
                "is_active": True,
            }
        )
    print(f"  Coloring templates seeded: {ColoringTemplate.objects.count()}")

def seed_adventure_levels():
    print("Seeding Adventure Levels...")
    for lvl in range(1, 21):
        AdventureLevel.objects.update_or_create(
            level_number=lvl,
            defaults={
                "world_name": f"World {((lvl - 1) // 5) + 1}",
                "title": f"Quest Island {lvl}",
                "required_stars": (lvl - 1) * 3,
                "reward_coins": 10 + lvl * 2,
                "reward_stars": 3,
                "is_active": True,
            }
        )
    print(f"  Adventure levels seeded: {AdventureLevel.objects.count()}")

if __name__ == '__main__':
    seed_categories()
    seed_badges()
    seed_stories()
    seed_coloring()
    seed_adventure_levels()
    print("ALL CORE DATA SEEDED SUCCESSFULLY!")
