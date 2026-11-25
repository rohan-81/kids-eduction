# 🛠️ KidsZone Database & Content Import Guide

This document explains how team members can add, manage, and bulk-import content (Questions, Stories, Rhymes, Lessons) into the KidsZone database using commands and scripts.

---

## 🚀 1. Prerequisites & Starting the Backend

Make sure the Python virtual environment is activated and the Django server is running:

### Windows (PowerShell / Command Prompt):
```powershell
# 1. Activate virtual environment
.\backend\venv\Scripts\Activate.ps1

# 2. Run the Django server (bound to 0.0.0.0 so mobile Wi-Fi also connects)
python backend\manage.py runserver 0.0.0.0:8000
```

### macOS / Linux:
```bash
# 1. Activate virtual environment
source backend/venv/bin/activate

# 2. Run the Django server
python backend/manage.py runserver 0.0.0.0:8000
```

---

## 🧰 2. Using the CLI Content Management Tool

We have provided a dedicated CLI tool: `backend/add_content_tool.py`.

### A. Check Current Database Content Status
Check how many questions, rhymes, lessons, and stories are live in the database:
```bash
python backend/add_content_tool.py status
```
*(This will print the total counts and a breakdown by game type and language: GU, HI, EN).*

---

### B. List Supported Game Types
See the list of all 20 game types you can add questions for:
```bash
python backend/add_content_tool.py list-types
```

---

### C. Export Ready-to-Fill JSON Templates
Generate pre-formatted JSON templates for your team:
```bash
python backend/add_content_tool.py export-samples
```
This generates two files in `sample_templates/`:
1. `sample_templates/sample_questions.json` (Template for questions)
2. `sample_templates/sample_stories.json` (Template for multilingual stories & scenes)

---

### D. Bulk Import Questions / Stories from a JSON File
Once you or your content team fills in `my_new_questions.json`, import all of them in one second:
```bash
python backend/add_content_tool.py import-json sample_templates/sample_questions.json
```
> **Output:**
> ```
>   [Created] Question ID 1295: ખૂટતો અક્ષર મૂકો: પ _ ંગ
>   [Created] Question ID 1296: આમાંથી 'ખ' (ખલ નો ખ) શોધો:
> Successfully processed 2 questions!
> ```

---

### E. Add a Single Question via Command Line
You can also add a question directly via flags:

#### Example: Gujarati Missing Letter
```bash
python backend/add_content_tool.py add-question \
  --type missing-letter \
  --lang gu \
  --text "ખૂટતો અક્ષર મૂકો: દ _ ડો" \
  --audio "દડો શબ્દ પૂરો કરો" \
  --visual "⚽" \
  --options "ડો,તો,નો,મો" \
  --correct "1" \
  --category spelling
```

#### Example: Gujarati Find Letter
```bash
python backend/add_content_tool.py add-question \
  --type find-letter \
  --lang gu \
  --text "આમાંથી 'ગ' (ગણપતિ નો ગ) શોધો:" \
  --audio "ગણપતિ નો ગ શોધો" \
  --visual "🐘" \
  --options "ગ,ઘ,ચ,છ" \
  --correct "1" \
  --category alphabet
```

---

## 🌐 3. Using the Web GUI (Django Admin)

If you prefer a graphical user interface (no terminal needed):

1. Open your browser: **[http://localhost:8000/admin/](http://localhost:8000/admin/)**
2. Login with your administrator account (or create one locally via `python backend/manage.py createsuperuser`).
3. Click on:
   * **`Questions`** -> Click **`+ Add`** to create game questions.
   * **`Stories`** -> Click **`+ Add`** to create a story book with pages.
   * **`Rhymes`** -> Click **`+ Add`** to create nursery rhymes.
   * **`Lessons`** -> Click **`+ Add`** to create alphabet/number lessons.
4. Fill in the fields and click **SAVE**.

---

## 📱 4. How to Verify Changes in the App

1. **Web Browser Test:**
   * Open `http://localhost:8081/games/missing-letter` or `http://localhost:8081/games/find-letter`.
   * Press **F5 (Reload)** to fetch fresh questions from the backend API.
   * You will see the total count updated (e.g. `૧ / ૧૨`) and your new questions appearing in the game round.

2. **Mobile Device Test:**
   * Ensure mobile phone is on the same Wi-Fi as your development machine.
   * The app automatically connects to `http://<YOUR-LAN-IP>:8000/api`.
   * Any questions added in DB are immediately fetched by mobile devices!

---

## ❓ 5. Troubleshooting & FAQ

* **Q: I added a question, but the app shows old questions.**
  * *A:* Refresh the web page (`F5`) or back out to the main menu and re-enter the game. In web/mobile, questions are fetched when the game component mounts.
* **Q: Does this require publishing a new version to the Google Play Store?**
  * *A:* **NO!** All backend questions, stories, and rhymes are dynamic. When you add or edit them in the database, children see the new content immediately without any Play Store app update.
