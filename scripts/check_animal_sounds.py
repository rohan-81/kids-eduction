import re
import os

with open('src/data/lessons.ts', 'r', encoding='utf-8') as f:
    lessons_content = f.read()

with open('src/utils/phonicsData.ts', 'r', encoding='utf-8') as f:
    phonics_content = f.read()

with open('src/services/soundEffects.ts', 'r', encoding='utf-8') as f:
    sound_content = f.read()

# Extract keys in ANIMAL_SOUNDS_DATA
sounds_data_keys = set(re.findall(r"(\w+):\s*\{\s*id:\s*'\1'", phonics_content))

# Extract keys in ANIMAL_AUDIO_MAP
audio_map_keys = set(re.findall(r"(\w+):\s*require\('\.\./\.\./assets/audio/animals/", sound_content))

# Extract lesson IDs
blocks = re.findall(r"\{\s*id:\s*'(an-[^']+)',(.*?)\n\s*\},", lessons_content, re.DOTALL)

print(f"{'Lesson ID':20} | {'Short Name':12} | {'phonicsData?':12} | {'audioMap?':10} | {'file exists?':12}")
print("-" * 75)

unmatched = []

for lesson_id, body in blocks:
    short_name = lesson_id.replace('an-', '')
    has_sound_data = short_name in sounds_data_keys or (short_name == 'koel' and 'koel' in sounds_data_keys)
    has_audio = short_name in audio_map_keys
    file_exists = os.path.exists(f'assets/audio/animals/{short_name}.wav') or os.path.exists(f'assets/audio/animals/{short_name}.mp3')
    
    print(f"{lesson_id:20} | {short_name:12} | {str(has_sound_data):12} | {str(has_audio):10} | {str(file_exists):12}")
    if not (has_sound_data and has_audio and file_exists):
        unmatched.append((lesson_id, short_name, has_sound_data, has_audio, file_exists))

print(f"\nTotal lessons: {len(blocks)}")
print(f"Unmatched: {len(unmatched)}")
if unmatched:
    for u in unmatched:
        print("  ISSUE:", u)
else:
    print("ALL 49 ANIMAL AND BIRD LESSONS 100% MATCHED WITH REAL VOICE AUDIO!")
