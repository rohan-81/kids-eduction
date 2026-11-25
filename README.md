# KidsZone — Learn, Play & Grow 🌟

[![React Native](https://img.shields.io/badge/React_Native-0.88.0-61DAFB?style=flat-square&logo=react&logoColor=white)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo_SDK-58.0.0-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Django](https://img.shields.io/badge/Django-5.x-092E20?style=flat-square&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Django REST Framework](https://img.shields.io/badge/DRF-3.14+-red?style=flat-square)](https://www.django-rest-framework.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-16%20Passed-brightgreen?style=flat-square)](tests/)

A calm, joyful, offline-first educational platform for children aged **2 to 8 years**, meticulously crafted to teach **Gujarati (ગુજરાતી)**, **Hindi (हिन्दी)**, and **English** through interactive lessons, mathematical handwriting stroke validation, sing-along rhymes, moral stories, creative coloring, 7 educational games, and a comprehensive parent dashboard.

---

## 📑 Table of Contents

- [🌟 Core Highlights & Design Philosophy](#-core-highlights--design-philosophy)
- [🎯 Age-Appropriate Learning Tiers](#-age-appropriate-learning-tiers)
- [✍️ Advanced Handwriting Tracing Engine](#️-advanced-handwriting-tracing-engine)
- [🎮 7 Educational Games](#-7-educational-games)
- [🎨 Creative & Gamification Modules](#-creative--gamification-modules)
- [👨‍👩‍👧 Comprehensive Parent Dashboard](#-comprehensive-parent-dashboard)
- [🛠️ Technology Stack](#️-technology-stack)
- [📁 Project Architecture](#-project-architecture)
- [🚀 Quick Start Guide](#-quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Frontend Setup (React Native / Expo)](#1-frontend-setup-react-native--expo)
  - [Backend Setup (Django REST Framework)](#2-backend-setup-django-rest-framework)
- [🧪 Running Automated Tests & Quality Checks](#-running-automated-tests--quality-checks)
- [📡 Backend API Reference](#-backend-api-reference)
- [🔒 Child Privacy & Safety by Design](#-child-privacy--safety-by-design)
- [📦 Production Build & Deployment](#-production-build--deployment)

---

## 🌟 Core Highlights & Design Philosophy

- **App Name**: KidsZone (કિડ્સઝોન / किड्सज़ोन)
- **Tagline**: Learn, Play & Grow
- **Android Package**: `com.kidszone.learning`
- **Curated Soft Pastel Palette**: Specially calibrated to prevent sensory overload and eye strain (Mint `#DDEFE5`, Pale Sky `#DFEAF8`, Light Peach `#F9E5D8`, Muted Lavender `#EAE3F5`, Warm Butter `#F6EDC9`, Forest Accent `#729A85`).
- **100% Offline-First Architecture**: Over 300+ lessons, phonetic audio synthesizers, interactive quizzes, worksheets, and games operate entirely offline without requiring an active internet connection.
- **Multilingual Immersion**: Seamlessly switch between Gujarati, Hindi, and English across the entire UI, including authentic typography (`Baloo 2`, `Noto Sans Gujarati`, `Noto Sans Devanagari`), number formats, audio narration, and phonics prompts.
- **Micro-Interactions & Audio**: Multi-layer sound effects (bubble pops, celebration chimes, realistic animal voices, rewarding star fanfares) designed to motivate young learners.

---

## 🎯 Age-Appropriate Learning Tiers

| Age Tier | Focus Areas | Key Activities |
|---|---|---|
| **Ages 2–4: Explore** | Visual and auditory sensory discovery | Letter & sound recognition, colors, basic shapes, numbers 1–10 with visual star counters, animals with real vocalizations, fruits & birds. |
| **Ages 4–6: Learn** | Structured literacy and foundational numeracy | Gujarati Swar & Vyanjan, Gujarati Barakhadi (ક, કા, કિ, કી...), English A–Z phonics, Hindi Varnamala, finger stroke tracing, counting 1–20, simple addition. |
| **Ages 6–8: Practice** | Logic, vocabulary, and arithmetic | Word spelling & formation (C-A-T, ક-મ-ળ), Gujarati Ghadiya (tables 1–10), math addition/subtraction, memory matching, missing letter challenges. |

---

## ✍️ Advanced Handwriting Tracing Engine

KidsZone features a custom-built, high-precision geometric handwriting recognition and stroke-validation engine ([`src/utils/tracingEngine.ts`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/src/utils/tracingEngine.ts)):

- **Deterministic Mathematical Scoring**: Directly evaluates actual user touch/mouse/stylus coordinates against reference glyph trajectories. No artificial percentage jumps (e.g. 85% or 94% suddenly becoming 100%).
- **Stroke Densification**: High-frequency path interpolation (`~3.5px` steps) fills gaps from rapid finger gestures, preventing dropped coordinates on touch devices.
- **Topological Segment Decomposition**: Characters (including Gujarati vowels, consonants, conjuncts, and matras) are partitioned into mandatory structural segments (stems, loops, curves, crossbars). Omitting a required stem strictly caps the score at $\le 82\%$ and prevents premature completion.
- **Strict 100% Certification**: 100% accuracy and 3 stars are awarded **ONLY** when all mandatory segments are visited, precision remains high ($\ge 55\%$), and reference path coverage reaches $\ge 97\%$.
- **Off-Track Margin Filtering**: Drawing outside the glyph boundary in blank margins produces 0% score and provides gentle feedback (`"હજી થોડું ઘૂંટો! (૬૦% જરૂરી છે ✏️)"`).
- **Dynamic Glyph Fitting**: Text auto-scales via `calculateOptimalFontSize` so multi-character words (`કમળ`, `અનાનસ`) and conjuncts never clip outside canvas boundaries.

---

## 🎮 7 Educational Games

Every game card in the app opens a fully interactive, state-managed educational mini-game:

1. **Find the Correct Letter (અક્ષર શોધો)**: Match spoken phonics and visual letter prompts with the correct choice.
2. **Picture Matching (ચિત્ર જોડો)**: Connect vivid illustrations of fruits, animals, and objects to their respective names.
3. **Counting Game (ગણતરી રમત)**: Interactive counting of smiling stars, apples, and flowers with touch highlights.
4. **Memory Match (મેમરી ગેમ)**: 3D card-flip memory game matching pairs of letters, numbers, and illustrations.
5. **Missing Letter (ખૂટતો અક્ષર)**: Complete vocabulary words by identifying and filling in the missing character.
6. **Colors & Shapes (રંગ અને આકાર)**: Identify primary and secondary pastel colors, geometric shapes, and real-world silhouettes.
7. **Listen & Choose (સાંભળો અને પસંદ કરો)**: Audio-first challenge listening to spoken pronunciation and tapping the matching card.

*Child-Safe Game Logic*: Double-tap protection prevents duplicate point awards. Friendly, encouraging feedback ("શાનદાર! ઉત્તમ કામ! 🎉") rewards effort with zero penalty shaming.

---

## 🎨 Creative & Gamification Modules

- **Creative Coloring Book ([`app/coloring.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/coloring.tsx))**: 15+ vector line-art templates with brush, bucket fill, stroke sizing, and rich pastel color palettes.
- **Freehand Drawing Pad ([`app/drawing.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/drawing.tsx))**: Freeform canvas with guided shape tracing templates (Star, Sun, Apple, Balloon, Flower, Car, House, Butterfly, Fish).
- **Rhymes & Music Player ([`app/rhymes.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/rhymes.tsx))**: Illustrated sing-along nursery rhymes in Gujarati, Hindi, and English with live playback and animated mascots.
- **Moral Stories ([`app/stories.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/stories.tsx))**: Illustrated bedtime and moral stories with read-along text and soothing narration.
- **Word Builder ([`app/wordbuilder.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/wordbuilder.tsx))**: Drag-and-drop letter blocks to construct full words in Gujarati, Hindi, and English.
- **Knowledge Garden ([`app/garden.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/garden.tsx))**: Gamified virtual plant growth driven by daily learning progress and lesson completions.
- **Adventure World Map ([`app/adventure.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/adventure.tsx))**: Journey map guiding children across themed learning islands and levels.
- **Custom Avatar Studio ([`app/avatar.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/avatar.tsx))**: Customizable kid avatars with unlockable expressions, hairstyles, outfits, and accessories.
- **Lucky Spin Wheel & Toy Shop ([`app/shopgame.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/shopgame.tsx))**: Daily spin wheel rewarding bonus stars and coins to redeem virtual stickers and toys.
- **Printable Certificates & Worksheets ([`app/certificate.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/certificate.tsx), [`app/worksheets.tsx`](file:///c:/Users/Ravi%20Senjaliya/Documents/GitHub/kids-education/app/worksheets.tsx))**: Printable and exportable achievement certificates and offline tracing sheets.

---

## 👨‍👩‍👧 Comprehensive Parent Dashboard

Protected by an algorithmic verification gate (dynamic arithmetic multiplication challenge) to prevent accidental child access:

- **Usage Analytics**: Daily and weekly screen-time tracking with visual bar charts.
- **Screen-Time Limits**: Configurable session timers with automatic friendly break reminders.
- **Category Controls**: Enable or disable specific learning modules based on the child's curriculum.
- **Learning Progress & Mastery**: Detailed mastery breakdown per script (Gujarati, Hindi, English, Math).
- **Data Management**: Clean privacy controls to reset progress or export learning summaries.

---

## 🛠️ Technology Stack

### Frontend Mobile & Web App
- **Core Framework**: [React Native 0.88.0](https://reactnative.dev/) & [Expo SDK 58](https://expo.dev/)
- **Programming Language**: [TypeScript ~6.0](https://www.typescriptlang.org/) (Strict type checking)
- **Routing**: [Expo Router ~58.0](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Vector Graphics**: `react-native-svg 15.16.0` (SVG rendering for tracing and coloring)
- **Audio & Speech**: `expo-speech ~58.0.3` & `expo-audio ~58.0.10`
- **Offline Storage**: `@react-native-async-storage/async-storage 2.2.0`
- **Unit Testing**: [Jest 29.7](https://jestjs.io/) with `ts-jest 29.4`

### Backend REST API
- **Framework**: [Django 5.x](https://www.djangoproject.com/) & [Django REST Framework 3.14+](https://www.django-rest-framework.org/)
- **Runtime**: Python 3.10+ / 3.11 / 3.12
- **CORS Handling**: `django-cors-headers`
- **Database**: SQLite (Zero-config local run) / PostgreSQL-ready for cloud deployments

---

## 📁 Project Architecture

```text
kids-education/
├── app/                          # Expo Router Navigation Pages
│   ├── _layout.tsx               # Root application layout & providers
│   ├── index.tsx                 # Splash screen & KidsZone branding
│   ├── home.tsx                  # Dashboard with streak banner & categories
│   ├── onboarding.tsx            # Multi-script language & age selector
│   ├── adventure.tsx             # Gamified learning adventure island map
│   ├── avatar.tsx                # Custom avatar studio & wardrobe
│   ├── calendar_habits.tsx       # Daily habits tracker & streak calendar
│   ├── certificate.tsx           # Printable achievement certificates
│   ├── challenge.tsx             # Daily learning challenge
│   ├── classes.tsx               # Interactive virtual classrooms
│   ├── coloring.tsx              # Interactive SVG coloring book
│   ├── drawing.tsx               # Freehand drawing & shape tracing
│   ├── garden.tsx                # Knowledge Garden gamification
│   ├── missions.tsx              # Daily learning missions & quests
│   ├── parents.tsx               # Parents dashboard & screen-time controls
│   ├── profile.tsx               # Child profile switcher
│   ├── progress.tsx              # Comprehensive learning analytics
│   ├── rewards.tsx               # Trophies, star counters & badges
│   ├── rhymes.tsx                # Sing-along nursery rhymes player
│   ├── settings.tsx              # Sound, language, & app settings
│   ├── shopgame.tsx              # Coin reward shop & toy store
│   ├── stories.tsx               # Illustrated moral stories with narration
│   ├── subjects.tsx              # All curriculum subjects directory
│   ├── wordbuilder.tsx           # Interactive spelling & word construction
│   ├── worksheets.tsx            # Printable educational worksheets
│   ├── games/
│   │   ├── index.tsx             # Educational games directory
│   │   └── [type].tsx            # Unified 7-game interactive engine
│   └── lessons/
│       ├── index.tsx             # Lessons grid with mastery indicators
│       └── [id].tsx              # Interactive lesson & tracing screen
│
├── src/                          # Shared Source Code
│   ├── components/               # UI Design System
│   │   ├── home/                 # Home header, banners, subject grids
│   │   ├── TracingCanvas.tsx     # High-precision finger tracing canvas
│   │   ├── GhadiyaTableView.tsx  # Gujarati multiplication tables (1–10)
│   │   ├── LuckySpinWheelModal.tsx # Daily reward spin wheel modal
│   │   ├── MascotGuide.tsx       # Friendly animated guide mascot
│   │   ├── PastelButton.tsx      # Calibrated touch button component
│   │   └── PastelCard.tsx        # Pastel elevation card container
│   ├── context/                  # AppContext & persistent state
│   ├── data/                     # Offline datasets (300+ lessons & games)
│   ├── localization/             # Translation files (en.json, gu.json, hi.json)
│   ├── services/                 # Audio, sound effects, storage, backend API
│   ├── theme/                    # Color palette, spacing, typography tokens
│   ├── types/                    # Strict TypeScript interfaces
│   └── utils/
│       ├── tracingEngine.ts      # Deterministic stroke & trajectory engine
│       ├── languageData.ts       # Script digits & transliteration
│       ├── phonicsData.ts        # Phonics audio cues & prompts
│       └── imageHelper.ts        # Dynamic asset resolvers
│
├── backend/                      # Django REST Framework Backend
│   ├── manage.py
│   ├── requirements.txt
│   ├── config/                   # settings.py, urls.py, wsgi.py
│   ├── lessons/                  # Lessons model, serializer, views, seed_data
│   ├── questions/                # Quiz question models & endpoints
│   ├── child_profiles/           # Multi-child profile models & views
│   ├── progress/                 # Learning progress sync endpoints
│   └── rewards/                  # Virtual coin & badge models
│
├── tests/                        # Automated Unit Test Suites
│   ├── tracingEngine.test.ts     # 10 comprehensive tracing engine tests
│   └── categories.test.ts        # 6 curriculum category integrity tests
│
├── assets/                       # App icons, splash images, and audio assets
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20+ or v25+ (LTS recommended)
- **Python**: 3.10+ (for backend)
- **Git**

---

### 1. Frontend Setup (React Native / Expo)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ravisenjaliya06/kids-education.git
   cd kids-education
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start the Expo development server:**
   ```bash
   npm run start
   ```

4. **Run the App:**
   - **In Web Browser**: Press `w` in the terminal (opens `http://localhost:8081`).
   - **On Real Android Device**: Install **Expo Go** from Google Play Store and scan the terminal QR code.
   - **On Android Emulator**: Press `a` (requires Android Studio SDK configured).
   - **On iOS Simulator**: Press `i` (macOS with Xcode).

---

### 2. Backend Setup (Django REST Framework)

1. **Open a new terminal and navigate to the backend directory:**
   ```bash
   cd kids-education/backend
   ```

2. **Create and activate a virtual environment (optional but recommended):**
   ```bash
   # Windows (PowerShell)
   python -m venv venv
   .\venv\Scripts\Activate.ps1

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations:**
   ```bash
   python manage.py migrate
   ```

5. **Seed initial educational lessons & quiz questions:**
   ```bash
   python manage.py seed_data
   ```

6. **Start the Django development server:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```
   The REST API will be active at: `http://127.0.0.1:8000/api/`

---

## 🧪 Running Automated Tests & Quality Checks

### 1. Frontend Unit Tests (Jest)
Runs all unit tests, including curriculum validation and handwriting geometric trajectory validation:
```bash
npm test
```
*Expected Result:*
```text
PASS tests/tracingEngine.test.ts
PASS tests/categories.test.ts
Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
```

### 2. TypeScript Compilation Check
Ensures zero type errors across the entire codebase:
```bash
npx tsc --noEmit
```

### 3. Backend Unit Tests
Runs Django test suites verifying models, serializers, and endpoints:
```bash
cd backend
python manage.py test
```

---

## 📡 Backend API Reference

Base URL: `http://127.0.0.1:8000/api/`

| Method | Endpoint | Query Parameters | Description |
|---|---|---|---|
| `GET` | `/api/lessons/` | `language`, `category`, `age_group` | List educational lessons with filters |
| `GET` | `/api/lessons/<id>/` | — | Retrieve full lesson details & phonetics |
| `GET` | `/api/questions/` | `lesson_id=<id>` | Retrieve quiz questions for a lesson |
| `GET` | `/api/progress/` | `profile_id=<id>` | Fetch child progress and stars |
| `POST` | `/api/progress/` | Body: `{ lesson_id, score, stars }` | Sync lesson completion and score |
| `POST` | `/api/game-results/` | Body: `{ game_type, score, accuracy }` | Record educational game session result |
| `GET` | `/api/rewards/` | `profile_id=<id>` | List earned coins, trophies, and badges |
| `GET` / `POST` | `/api/profiles/` | — | List or create local child profiles |

---

## 🔒 Child Privacy & Safety by Design

KidsZone is engineered strictly for early-childhood safety:
- **Zero Third-Party Advertising**: Completely free of pop-up ads, banners, and analytics trackers.
- **Zero Personal Data Harvesting**: No email addresses, phone numbers, or social media logins are requested.
- **No Microphone or Camera Permissions Required**: Audio feedback utilizes client-side Text-to-Speech (TTS) and bundled recordings without capturing children's voices.
- **Parental Security Gate**: Sensitive settings, screen-time locks, sound toggles, and data deletion are safeguarded behind a mathematical challenge.
- **Local Data Erasure**: Complete control to reset or clear local learning history from the Parent Dashboard at any time.

---

## 📦 Production Build & Deployment

### Generating Android APK (via Expo EAS Build)

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```
2. **Log in to your Expo account:**
   ```bash
   eas login
   ```
3. **Configure build profile:**
   ```bash
   eas build:configure
   ```
4. **Build standalone APK:**
   ```bash
   eas build -p android --profile preview
   ```

---

## 📄 License

This project is licensed under the **MIT License**. Free and open-source for parents, educators, and children worldwide.
#   k i d s - e d u c t i o n  
 