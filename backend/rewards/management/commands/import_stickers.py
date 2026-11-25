from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from rewards.importing import DEFAULT_STICKER_FIXTURE, load_sticker_records, upsert_sticker


class Command(BaseCommand):
    help = (
        "Seed/refresh the Sticker Album catalog (idempotent). Defaults to rewards/fixtures/sticker_catalog.json, "
        "which mirrors src/data/stickersData.ts."
    )

    def add_arguments(self, parser):
        parser.add_argument('--file', help=f'JSON file with a "stickers" list (default: {DEFAULT_STICKER_FIXTURE.name}).')
        parser.add_argument('--dry-run', action='store_true', help='Validate without writing to the database.')

    def handle(self, *args, **options):
        try:
            records = load_sticker_records(options.get('file'))
        except FileNotFoundError as exc:
            raise CommandError(str(exc))

        created = updated = 0
        with transaction.atomic():
            for idx, record in enumerate(records):
                _, was_created = upsert_sticker(record, idx)
                created += int(was_created)
                updated += int(not was_created)
            if options['dry_run']:
                transaction.set_rollback(True)

        self.stdout.write(self.style.SUCCESS(
            f"Stickers: {len(records)} found, {created} created, {updated} updated"
            + (" (dry run, rolled back)" if options['dry_run'] else "")
        ))
