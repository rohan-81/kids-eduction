"""
Retire the four rhymes whose recordings come from copyrighted film songs
(AUDIO_PROVENANCE.md, Category B). Their MP3s were removed from media/, so any
database that imported them earlier would otherwise keep serving dead audio_url
links. Rows are deactivated (not deleted) and their audio_url cleared, so the
change is reversible and historical progress keys keep a matching row.

The public-domain replacements (row-boat, mota-hathi, upar-pankha, bandar-mama)
are loaded by `python manage.py import_rhymes` from data_exports/kidszone_data.json.
"""

from django.db import migrations

RETIRED_SLUGS = ['lakdi-kathi', 'chanda-mama', 'titli', 'bus-wheels']


def retire(apps, schema_editor):
    Rhyme = apps.get_model('rhymes', 'Rhyme')
    Rhyme.objects.filter(slug__in=RETIRED_SLUGS).update(is_active=False, audio_url='')


def restore(apps, schema_editor):
    # Re-activates the rows only; the audio files are gone and must not be re-linked.
    Rhyme = apps.get_model('rhymes', 'Rhyme')
    Rhyme.objects.filter(slug__in=RETIRED_SLUGS).update(is_active=True)


class Migration(migrations.Migration):

    dependencies = [
        ('rhymes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(retire, restore),
    ]
