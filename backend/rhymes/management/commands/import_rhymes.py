import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from rhymes.importing import rhyme_defaults, has_lyrics, rhyme_slug, upsert_rhyme


class Command(BaseCommand):
    help = (
        "Import only the nursery rhymes (with full lyrics) from backend/data_exports/kidszone_data.json. "
        "Regenerate that file first with: npx tsx -r ./scripts/register_assets.cjs scripts/export_static_data.ts"
    )

    def add_arguments(self, parser):
        parser.add_argument('--file', help='Path to an export JSON file (defaults to data_exports/kidszone_data.json).')
        parser.add_argument('--dry-run', action='store_true', help='Validate without writing to the database.')

    def handle(self, *args, **options):
        backend_dir = Path(__file__).resolve().parents[3]
        export_file = Path(options['file']) if options.get('file') else backend_dir / 'data_exports' / 'kidszone_data.json'
        if not export_file.exists():
            raise CommandError(f"Export file not found: {export_file}")

        with open(export_file, 'r', encoding='utf-8') as f:
            records = json.load(f).get('rhymes', [])

        created = updated = skipped = 0
        with transaction.atomic():
            for idx, record in enumerate(records):
                if not has_lyrics(rhyme_defaults(record, idx)):
                    skipped += 1
                    self.stdout.write(self.style.WARNING(f"  skip {rhyme_slug(record, idx)}: no lyrics"))
                    continue
                if options['dry_run']:
                    created += 1
                    continue
                _, was_created = upsert_rhyme(record, idx)
                created += int(was_created)
                updated += int(not was_created)
            if options['dry_run']:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS(
            f"Rhymes: {len(records)} found, {created} created, {updated} updated, {skipped} skipped"
            + (" (dry run)" if options['dry_run'] else "")
        ))
