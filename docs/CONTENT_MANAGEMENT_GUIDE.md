# 📚 KidsZone - Content Management & Creation Guide (કન્ટેન્ટ ગાઈડ)

Welcome to the **KidsZone Educational Content Management Guide**!  
This guide is designed for developers, teachers, curriculum designers, and team members to easily add, edit, and manage educational content (Games, Questions, Stories, Rhymes, Lessons, and Rewards) across **Gujarati**, **Hindi**, and **English**.

---

## 🎯 Quick Links & Access

* **Django Admin Portal (GUI):** [http://localhost:8000/admin/](http://localhost:8000/admin/)  
  *(For local mobile/Wi-Fi: `http://<YOUR-LAN-IP>:8000/admin/`)*
* **Superuser Access:** Use your configured administrative account.  
  *(To create one locally: `python backend/manage.py createsuperuser`)*
* **CLI Content Management Tool:** `python backend/add_content_tool.py`

---

## 🕹️ 1. Games & Questions (ગેમ્સ અને પ્રશ્નો)

KidsZone features interactive educational game types dynamically driven from the database.

### 📌 Supported Active Client Game Types (`question_type`)
| Game Code (`question_type`) | Display Name | Typical Category | Required Fields |
| :--- | :--- | :--- | :--- |
| `missing-letter` | ખૂટતો અક્ષર (Missing Letter) | `spelling`, `alphabet` | `question_text`, `display_visual`, `options`, `correct_answer` |
| `find-letter` | અક્ષર શોધો (Find Letter) | `alphabet` | `question_text`, `options`, `correct_answer` |
| `picture-matching` | ચિત્ર મેળવો (Picture Matching) | `vocabulary`, `animals` | `question_text`, `display_visual`, `options` |
| `counting` | ગણતરી રમત (Counting Game) | `numbers`, `math` | `question_text`, `count_target`, `display_visual`, `options` |
| `odd-one-out` | અલગ પડતી વસ્તુ (Odd One Out) | `logic`, `general` | `question_text`, `options`, `correct_answer` |
| `colors-shapes` | રંગો અને આકારો (Colors & Shapes) | `shapes`, `colors` | `question_text`, `display_visual`, `options` |
| `math-quiz` | ગણિત ક્વિઝ (Math Quiz) | `math`, `numbers` | `question_text`, `options`, `correct_answer` |
| `logic-reasoning` | તર્ક અને વિચાર (Logic Reasoning) | `logic` | `question_text`, `options`, `correct_answer` |
| `shadow-match` | પડછાયો શોધો (Shadow Match) | `logic`, `visual` | `question_text`, `display_visual`, `options` |
| `memory-match` | મેમરી મેચ (Card Flip Memory) | `memory`, `animals` | `question_text`, `options` |
| `listen-choose` | સાંભળો અને પસંદ કરો (Audio Quiz) | `listening` | `question_text`, `audio_text`, `options` |
| `balloon-pop` | ફુગ્ગા ફોડો (Balloon Pop) | `numbers`, `letters` | `question_text`, `options` |
| `find-object` | વસ્તુ શોધો (Find Object) | `vocabulary` | `question_text`, `display_visual`, `options` |
| `duel` | ક્વિઝ મુકાબલો (2-Player Duel) | `all` | `question_text`, `options`, `correct_answer` |
| `daily-challenge` | દૈનિક પડકાર (Daily Challenge) | `general` | `question_text`, `options`, `correct_answer` |

---

### 📝 Question Fields Breakdown (ફોર્મમાં શું ભરવું?)

1. **`question_type`**: Dropdown from the table above (e.g. `missing-letter`, `find-letter`).
2. **`language`**:
   * `gu` -> Gujarati (ગુજરાતી)
   * `hi` -> Hindi (हिन्दी)
   * `en` -> English
   * `all` -> Universal (Visual only / Numbers)
3. **`category`**: Topic category, e.g. `alphabet`, `numbers`, `animals`, `spelling`, `math`, `general`.
4. **`age_group`**:
   * `2-4` -> Ages 2 to 4 (Preschool)
   * `4-6` -> Ages 4 to 6 (Kindergarten)
   * `6-8` -> Ages 6 to 8 (Early Primary)
   * `all` -> All Age Groups
5. **`question_text`**: The main prompt displayed to the child.
   * *Example (Missing Letter):* `ખૂટતો અક્ષર મૂકો: પ _ ંગ`
   * *Example (Find Letter):* `આમાંથી 'ખ' (ખલ નો ખ) શોધો:`
   * *Example (Counting):* `કેટલા સફરજન દેખાય છે?`
6. **`audio_text`**: Text-To-Speech (TTS) spoken instruction for the child.
   * *Example:* `પતંગ શબ્દ પૂરો કરો`
7. **`display_visual`**: Visual icon, emoji, or character code shown in the center.
   * *Examples:* `🪁`, `🍎🍎🍎`, `🌸`, `🐶`, `🚗`
8. **`count_target`**: *(Only for Counting games)* The integer target number (e.g. `3`).
9. **`options` (JSON Field)**: Exactly 4 choices formatted as a JSON list of objects:
   ```json
   [
     {"id": "1", "label": "ત"},
     {"id": "2", "label": "દ"},
     {"id": "3", "label": "ન"},
     {"id": "4", "label": "ગ"}
   ]
   ```
   > 💡 **Tip:** Each option must have `"id"` (string) and `"label"` (display text or emoji).
10. **`correct_answer`**: Value matching the correct option's `"id"` (usually `"1"`).
11. **`correct_option_id`**: Option ID matching the correct answer (`"1"`).
12. **`is_active`**: Set to `True` (Checked ✅) to activate immediately in the app.

---

## 📖 2. Moral Stories (વાર્તાઓ)

KidsZone supports multilingual, illustrated moral storybooks with page-by-page scenes.

### 📌 Models Involved:
1. **`Story` (વાર્તાની વિગત):**
   * **`slug`**: Unique slug identifier (e.g. `thirsty-crow`, `lion-and-mouse`).
   * **`title`**: English Title (e.g. `The Thirsty Crow`).
   * **`title_gujarati`**: Gujarati Title (e.g. `તરસ્યો કાગડો`).
   * **`title_hindi`**: Hindi Title (e.g. `प्यासा कौआ`).
   * **`moral`**: English moral lesson.
   * **`moral_gujarati`**: Gujarati moral lesson (e.g. `જ્યાં બુદ્ધિ છે ત્યાં રસ્તો છે.`).
   * **`moral_hindi`**: Hindi moral lesson.
   * **`reading_time_mins`**: Estimated reading time (e.g. `3`).
   * **`cover_image`**: URL or local asset path.

2. **`StoryScene` (વાર્તાના પાનાં/સીન):**
   * **`story`**: Link to the parent Story.
   * **`scene_number`**: Page number (`1`, `2`, `3`...).
   * **`text_english`**: English narration text for this page.
   * **`text_gujarati`**: Gujarati narration text for this page.
   * **`text_hindi`**: Hindi narration text for this page.
   * **`illustration`**: Illustration image URL or asset link.
   * **`audio_prompt`**: Spoken voiceover prompt.

---

## 🎵 3. Rhymes & Nursery Songs (બાળગીતો / જોડકણાં)

Rhymes include synchronized audio streaming, lyrics in 3 languages, and artwork.

### 📌 Fields in `Rhyme`:
* **`slug`**: Unique identifier (e.g. `row-row-boat`, `ek-mota-hathi`, `chanda-mama`).
* **`title`**: English Title.
* **`title_gujarati`**: Gujarati Title.
* **`title_hindi`**: Hindi Title.
* **`audio_url`**: Audio file path (e.g. `/media/rhymes/ek_mota_hathi.mp3` or direct URL).
* **`lyrics_english`**: English lyrics lines.
* **`lyrics_gujarati`**: Gujarati lyrics lines.
* **`lyrics_hindi`**: Hindi lyrics lines.
* **`duration_seconds`**: Song duration in seconds (e.g. `90`).
* **`is_active`**: Set to `True` (Checked ✅).

---

## 🏆 4. Gamification, Badges & Stickers (ઈનામો)

* **`Badge` (`rewards.Badge`)**:
  * Awarded when milestones are reached (e.g., completing 10 lessons, perfect quiz score).
  * Fields: `slug`, `title`, `name_gu`, `name_hi`, `name_en`, `icon` (e.g. `🌟`, `🏆`), `reward_coins` (e.g. `50`).
* **`Sticker` (`rewards.Sticker`)**:
  * Collectible stickers for the child's Sticker Album (`app/stickers.tsx`).
  * Fields: `slug`, `emoji` (e.g. `🦁`, `🚀`, `🦖`), `name_gu`, `name_hi`, `name_en`, `category`.

---

## ⚡ 5. Best Practices for Content Quality

1. **Age-Appropriate Language:**
   * For age `2-4`: Single-syllable words, large bright emojis, cheerful praise.
   * For age `5-8`: Simple full sentences, basic phonetics, numbers up to 100.
2. **Audio/TTS Clarity:**
   * Always fill in `audio_text` in Gujarati and Hindi so non-reading toddlers can hear the question spoken clearly.
3. **Four Options Standard:**
   * All multiple-choice games require exactly **4 options**.
   * Keep one option as the correct answer and three plausible, fun distractors.
