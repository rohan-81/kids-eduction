#!/usr/bin/env python
"""
KidsZone Content Management CLI Tool
====================================
A command-line tool for developers and team members to inspect, validate,
and bulk-import educational content (Questions, Stories, Rhymes, Lessons)
into the KidsZone SQLite/PostgreSQL database.

Features:
  - Atomic batch transactions (all-or-nothing rollback on failure)
  - Dry-run validation mode (--dry-run)
  - CSV & JSON import support for non-technical editors
  - Automatic validation via questions.validation.validate_question_data
  - Content health audit command ('check-content')
"""

import sys
import os
import csv
import json
import argparse
from pathlib import Path

# Setup Django environment
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from django.db import transaction
from questions.models import Question
from questions.validation import validate_question_data, VALID_GAME_TYPES
from stories.models import Story, StoryScene
from rhymes.models import Rhyme
from lessons.models import Lesson, Category
from gamification.models import AdventureLevel
from rewards.models import Badge, Sticker
from creative.models import ColoringTemplate


def show_status():
    """Prints live counts of all educational content in the database."""
    print("=" * 65)
    print("  KIDSZONE DATABASE CONTENT STATUS (LIVE DB)")
    print("=" * 65)
    print(f"  * Questions (All Games):    {Question.objects.count():>5} items")
    print(f"  * Lessons:                  {Lesson.objects.count():>5} items")
    print(f"  * Categories:               {Category.objects.count():>5} items")
    print(f"  * Rhymes (Nursery Rhymes):  {Rhyme.objects.count():>5} items")
    print(f"  * Stories:                  {Story.objects.count():>5} books")
    print(f"  * Story Scenes:             {StoryScene.objects.count():>5} scenes")
    print(f"  * Adventure Levels:         {AdventureLevel.objects.count():>5} levels")
    print(f"  * Badges:                   {Badge.objects.count():>5} items")
    print(f"  * Stickers:                 {Sticker.objects.count():>5} items")
    print(f"  * Coloring Templates:       {ColoringTemplate.objects.count():>5} items")
    print("=" * 65)
    print("\nBreakdown of Questions by Game Type:")
    types = Question.objects.values_list('question_type', flat=True).distinct().order_by('question_type')
    for qt in types:
        count = Question.objects.filter(question_type=qt).count()
        gu = Question.objects.filter(question_type=qt, language='gu').count()
        hi = Question.objects.filter(question_type=qt, language='hi').count()
        en = Question.objects.filter(question_type=qt, language='en').count()
        print(f"  - {qt:<22} : Total {count:>3} (GU: {gu:>2}, HI: {hi:>2}, EN: {en:>2})")
    print("=" * 65)


def list_game_types():
    """Prints all supported game question types and their descriptions."""
    print("=" * 70)
    print("  SUPPORTED GAME TYPES IN KIDSZONE")
    print("=" * 70)
    for code, name in Question.QUESTION_TYPES:
        print(f"  * {code:<20} -> {name}")
    print("=" * 70)


def audit_existing_content():
    """Audits all rows in the database using validate_question_data."""
    print("=" * 70)
    print("  AUDITING DATABASE QUESTIONS FOR DATA INTEGRITY")
    print("=" * 70)
    all_qs = Question.objects.all().order_by('id')
    total = all_qs.count()
    invalid_rows = []

    for q in all_qs:
        raw = {
            'question_type': q.question_type,
            'language': q.language,
            'age_group': q.age_group,
            'question_text': q.question_text,
            'options': q.options,
            'correct_answer': q.correct_answer,
            'correct_option_id': q.correct_option_id,
            'display_visual': q.display_visual,
            'audio_text': q.audio_text,
            'difficulty': q.difficulty,
            'points': q.points,
        }
        is_valid, errors, sanitized = validate_question_data(raw)
        if not is_valid:
            invalid_rows.append((q.id, q.question_type, errors))

    print(f"Scanned {total} questions. Found {len(invalid_rows)} with validation warnings.")
    if invalid_rows:
        print("\nSummary of Problematic Rows:")
        for q_id, q_type, errs in invalid_rows[:15]:
            print(f"  - ID {q_id} ({q_type}): {'; '.join(errs)}")
        if len(invalid_rows) > 15:
            print(f"  ... and {len(invalid_rows) - 15} more rows.")
    else:
        print("All database questions are valid!")
    print("=" * 70)


def export_samples(output_dir="sample_templates", force=False):
    """Generates ready-to-fill JSON & CSV templates for team members."""
    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    q_file = out_path / "sample_questions.json"
    csv_file = out_path / "sample_questions.csv"
    s_file = out_path / "sample_stories.json"

    if not force and (q_file.exists() or csv_file.exists() or s_file.exists()):
        print("Notice: Sample files already exist. Use --force to overwrite them.")
        return

    sample_questions = {
        "questions": [
            {
                "stable_id": "sample-ml-gu-patang",
                "question_type": "missing-letter",
                "language": "gu",
                "category": "spelling",
                "age_group": "all",
                "difficulty": 1,
                "points": 10,
                "question_text": "ખૂટતો અક્ષર મૂકો: પ _ ંગ",
                "audio_text": "પતંગ શબ્દ પૂરો કરો",
                "display_visual": "🪁",
                "options": [
                    {"id": "1", "label": "ત"},
                    {"id": "2", "label": "દ"},
                    {"id": "3", "label": "ન"},
                    {"id": "4", "label": "ગ"}
                ],
                "correct_answer": "1",
                "correct_option_id": "1",
                "explanation": "પતંગ શબ્દમાં 'ત' ખૂટે છે."
            },
            {
                "stable_id": "sample-fl-gu-khal",
                "question_type": "find-letter",
                "language": "gu",
                "category": "alphabet",
                "age_group": "all",
                "difficulty": 1,
                "points": 10,
                "question_text": "આમાંથી 'ખ' (ખલ નો ખ) શોધો:",
                "audio_text": "ખલ નો ખ શોધો",
                "display_visual": "🥣",
                "options": [
                    {"id": "1", "label": "ખ"},
                    {"id": "2", "label": "ક"},
                    {"id": "3", "label": "ગ"},
                    {"id": "4", "label": "ઘ"}
                ],
                "correct_answer": "1",
                "correct_option_id": "1",
                "explanation": "આ ખલ નો ખ છે."
            }
        ]
    }

    sample_stories = {
        "stories": [
            {
                "slug": "sample-lion-mouse",
                "title": "The Lion and the Mouse",
                "title_gujarati": "સિંહ અને ઉંદર",
                "title_hindi": "शेर और चूहा",
                "category": "moral",
                "moral": "Even the smallest friend can be of great help.",
                "moral_gujarati": "કોઈ પણ નાનો મિત્ર પણ મોટી મદદ કરી શકે છે.",
                "moral_hindi": "छोटा मित्र भी बहुत बड़ा काम कर सकता है।",
                "reading_time_mins": 3,
                "age_group": "all",
                "scenes": [
                    {
                        "scene_number": 1,
                        "text_english": "Once upon a time, a lion was sleeping peacefully in the forest.",
                        "text_gujarati": "એક વખત જંગલમાં એક સિંહ શાંતિથી ઊંઘતો હતો.",
                        "text_hindi": "एक बार जंगल में एक शेर शांति से सो रहा था।",
                        "illustration": "",
                        "audio_prompt": "A lion was sleeping."
                    }
                ]
            }
        ]
    }

    # CSV Template for Excel / Google Sheets
    csv_rows = [
        ["type", "language", "age_group", "question_text", "audio_text", "display_visual", "option_1", "option_2", "option_3", "option_4", "correct_option", "category"],
        ["missing-letter", "gu", "all", "ખૂટતો અક્ષર મૂકો: પ _ ંગ", "પતંગ શબ્દ પૂરો કરો", "🪁", "ત", "દ", "ન", "ગ", "1", "spelling"],
        ["find-letter", "gu", "all", "આમાંથી 'ખ' (ખલ નો ખ) શોધો:", "ખલ નો ખ શોધો", "🥣", "ખ", "ક", "ગ", "ઘ", "1", "alphabet"],
        ["counting", "en", "2-4", "How many apples do you see?", "Count the apples", "🍎🍎🍎", "3", "2", "4", "1", "1", "numbers"]
    ]

    with open(q_file, "w", encoding="utf-8") as f:
        json.dump(sample_questions, f, ensure_ascii=False, indent=2)

    with open(s_file, "w", encoding="utf-8") as f:
        json.dump(sample_stories, f, ensure_ascii=False, indent=2)

    with open(csv_file, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerows(csv_rows)

    print(f"Exported templates successfully:")
    print(f"  1. Questions JSON: {q_file.resolve()}")
    print(f"  2. Questions CSV:  {csv_file.resolve()} (Open with Excel or Google Sheets!)")
    print(f"  3. Stories JSON:   {s_file.resolve()}")


def import_csv_file(filepath, dry_run=False, publish=True):
    """Imports questions from a CSV file with validation and atomic rollback."""
    path = Path(filepath)
    if not path.exists():
        print(f"Error: CSV file '{filepath}' not found!")
        return

    rows_to_import = []
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for idx, row in enumerate(reader, start=2):
            q_type = row.get("type", "").strip()
            lang = row.get("language", "gu").strip()
            age = row.get("age_group", "all").strip()
            q_text = row.get("question_text", "").strip()
            audio = row.get("audio_text", "").strip()
            visual = row.get("display_visual", "").strip()
            cat = row.get("category", "general").strip()
            corr = row.get("correct_option", "1").strip()

            options = []
            for i in range(1, 5):
                lbl = row.get(f"option_{i}", "").strip()
                if lbl:
                    options.append({"id": str(i), "label": lbl})

            data = {
                "question_type": q_type,
                "language": lang,
                "age_group": age,
                "question_text": q_text,
                "audio_text": audio or q_text,
                "display_visual": visual,
                "options": options,
                "correct_answer": corr,
                "correct_option_id": corr,
                "category": cat,
                "is_active": publish,
            }
            rows_to_import.append((idx, data))

    _execute_batch_import(rows_to_import, dry_run=dry_run)


def import_json_file(filepath, dry_run=False, publish=True):
    """Imports questions and stories from a JSON file with validation and atomic rollback."""
    path = Path(filepath)
    if not path.exists():
        print(f"Error: JSON file '{filepath}' not found!")
        return

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict):
        print(f"Error: JSON root must be an object containing 'questions' or 'stories'.")
        return

    if "questions" in data:
        items = data["questions"]
        rows_to_import = []
        for idx, item in enumerate(items, start=1):
            item_copy = dict(item)
            item_copy.setdefault("is_active", publish)
            rows_to_import.append((idx, item_copy))
        _execute_batch_import(rows_to_import, dry_run=dry_run)

    if "stories" in data:
        stories = data["stories"]
        print(f"Processing {len(stories)} stories (Dry Run: {dry_run})...")
        for s in stories:
            slug = s.get("slug")
            if not slug:
                print(f"  [Skipped] Story missing required 'slug'.")
                continue
            if not dry_run:
                story, _ = Story.objects.update_or_create(
                    slug=slug,
                    defaults={
                        "title": s.get("title", ""),
                        "title_gujarati": s.get("title_gujarati", ""),
                        "title_hindi": s.get("title_hindi", ""),
                        "category": s.get("category", "moral"),
                        "moral": s.get("moral", ""),
                        "moral_gujarati": s.get("moral_gujarati", ""),
                        "moral_hindi": s.get("moral_hindi", ""),
                        "reading_time_mins": s.get("reading_time_mins", 3),
                        "age_group": s.get("age_group", "all"),
                        "is_active": publish,
                    }
                )
                for sc in s.get("scenes", []):
                    StoryScene.objects.update_or_create(
                        story=story,
                        scene_number=sc.get("scene_number", 1),
                        defaults={
                            "text_english": sc.get("text_english", ""),
                            "text_gujarati": sc.get("text_gujarati", ""),
                            "text_hindi": sc.get("text_hindi", ""),
                            "illustration": sc.get("illustration", ""),
                            "audio_prompt": sc.get("audio_prompt", ""),
                            "choices": sc.get("choices", []),
                        }
                    )
            print(f"  [Validated] Story '{slug}' ({len(s.get('scenes', []))} scenes)")


def _execute_batch_import(rows_to_import, dry_run=False):
    """Validates and atomically inserts or updates a list of question rows."""
    print(f"\nValidating {len(rows_to_import)} question rows (Dry Run: {dry_run})...")
    validation_failures = []
    validated_rows = []

    for row_num, raw_data in rows_to_import:
        is_valid, errors, sanitized = validate_question_data(raw_data)
        if not is_valid:
            validation_failures.append((row_num, errors, raw_data.get('question_text', '')))
        else:
            validated_rows.append((row_num, sanitized, raw_data.get('stable_id')))

    if validation_failures:
        print("\n❌ IMPORT ABORTED: Validation failed on the following rows:")
        for r_num, errs, txt in validation_failures:
            print(f"  Row {r_num} ('{txt[:30]}'): {'; '.join(errs)}")
        print("\nNo rows were imported. Please correct the errors above and re-run.")
        return

    print("✅ All rows passed schema and option validation!")

    if dry_run:
        print("Dry run completed successfully. No changes were committed to the database.")
        return

    # Atomic database transaction: all or nothing
    with transaction.atomic():
        imported_count = 0
        for r_num, sanitized, stable_id in validated_rows:
            # Auto-generate a stable_id if missing to prevent duplicate on re-imports
            if not stable_id:
                # generate deterministic key
                stable_id = f"auto-{sanitized['question_type']}-{sanitized['language']}-{sanitized['category']}-{sanitized['question_text'][:20].strip()}"

            q, created = Question.objects.update_or_create(
                stable_id=stable_id,
                defaults=sanitized
            )
            action = "Created" if created else "Updated"
            imported_count += 1
            print(f"  [{action}] ID {q.id} ({q.question_type}): {q.question_text[:40]}")

    print(f"\n🎉 Successfully committed {imported_count} questions to the database!")


def add_single_question(args):
    """Adds a single question from command line flags with validation."""
    options = []
    if args.options:
        try:
            options = json.loads(args.options)
        except Exception:
            labels = [x.strip() for x in args.options.split(",")]
            options = [{"id": str(i + 1), "label": lbl} for i, lbl in enumerate(labels)]

    raw_data = {
        "question_type": args.type,
        "language": args.lang,
        "question_text": args.text,
        "audio_text": args.audio or args.text,
        "display_visual": args.visual or "",
        "category": args.category,
        "age_group": args.age,
        "difficulty": args.difficulty,
        "points": args.points,
        "options": options,
        "correct_answer": args.correct,
        "correct_option_id": args.correct,
        "is_active": not args.draft,
    }

    is_valid, errors, sanitized = validate_question_data(raw_data)
    if not is_valid:
        print("❌ Error: Question validation failed:")
        for err in errors:
            print(f"  - {err}")
        return

    stable_id = args.stable_id or f"cli-{sanitized['question_type']}-{sanitized['language']}-{sanitized['question_text'][:20].strip()}"
    q, created = Question.objects.update_or_create(stable_id=stable_id, defaults=sanitized)
    action = "Created" if created else "Updated"
    print(f"✅ SUCCESS! {action} Question ID {q.id}:")
    print(f"  Type:       {q.question_type}")
    print(f"  Language:   {q.language}")
    print(f"  Text:       {q.question_text}")
    print(f"  Options:    {q.options}")
    print(f"  Correct ID: {q.correct_option_id}")
    print(f"  Active:     {q.is_active}")


def main():
    parser = argparse.ArgumentParser(description="KidsZone Content Management CLI Tool")
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: status
    subparsers.add_parser("status", help="Show live count of questions and items in the database")

    # Command: list-types
    subparsers.add_parser("list-types", help="List all supported game question types")

    # Command: check-content
    subparsers.add_parser("check-content", help="Audit database content for validation issues")

    # Command: export-samples
    sample_parser = subparsers.add_parser("export-samples", help="Export sample JSON & CSV templates to fill")
    sample_parser.add_argument("--dir", default="sample_templates", help="Directory to save templates")
    sample_parser.add_argument("--force", action="store_true", help="Overwrite existing template files")

    # Command: import-json
    import_parser = subparsers.add_parser("import-json", help="Bulk import content from a JSON file")
    import_parser.add_argument("filepath", help="Path to the JSON file to import")
    import_parser.add_argument("--dry-run", action="store_true", help="Validate without committing to DB")
    import_parser.add_argument("--draft", action="store_true", help="Import as inactive draft content")

    # Command: import-csv
    csv_parser = subparsers.add_parser("import-csv", help="Bulk import questions from a CSV file")
    csv_parser.add_argument("filepath", help="Path to the CSV file to import")
    csv_parser.add_argument("--dry-run", action="store_true", help="Validate without committing to DB")
    csv_parser.add_argument("--draft", action="store_true", help="Import as inactive draft content")

    # Command: add-question
    add_q = subparsers.add_parser("add-question", help="Add a single question via flags")
    add_q.add_argument("--type", required=True, help="Game type (e.g. missing-letter, find-letter, odd-one-out)")
    add_q.add_argument("--lang", default="gu", choices=["gu", "hi", "en", "all"], help="Language code")
    add_q.add_argument("--text", required=True, help="Question text")
    add_q.add_argument("--options", required=True, help="JSON list of options OR comma-separated choices: 'ત,દ,ન,ગ'")
    add_q.add_argument("--correct", default="1", help="Correct option ID or label (e.g. 1)")
    add_q.add_argument("--visual", default="", help="Emoji or visual icon (e.g. 🪁)")
    add_q.add_argument("--audio", default="", help="Audio spoken text prompt")
    add_q.add_argument("--category", default="general", help="Category (e.g. spelling, alphabet, numbers)")
    add_q.add_argument("--age", default="all", choices=["all", "2-4", "4-6", "6-8"], help="Target age group")
    add_q.add_argument("--difficulty", type=int, default=1, help="Difficulty (1=easy, 2=med, 3=hard)")
    add_q.add_argument("--points", type=int, default=10, help="Reward points")
    add_q.add_argument("--stable-id", default="", help="Unique identifier for idempotent updates")
    add_q.add_argument("--draft", action="store_true", help="Save as inactive draft")

    args = parser.parse_args()

    if args.command == "status":
        show_status()
    elif args.command == "list-types":
        list_game_types()
    elif args.command == "check-content":
        audit_existing_content()
    elif args.command == "export-samples":
        export_samples(args.dir, force=args.force)
    elif args.command == "import-json":
        import_json_file(args.filepath, dry_run=args.dry_run, publish=not args.draft)
    elif args.command == "import-csv":
        import_csv_file(args.filepath, dry_run=args.dry_run, publish=not args.draft)
    elif args.command == "add-question":
        add_single_question(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
