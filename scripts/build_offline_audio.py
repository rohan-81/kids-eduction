import os, sys, re, json, urllib.request, urllib.parse, time
from utils_numbers import GUJARATI_NUMBERS, HINDI_NUMBERS, ENGLISH_NUMBERS

os.makedirs('assets/audio/lessons', exist_ok=True)
os.makedirs('public/audio/lessons', exist_ok=True)

USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

def clean_key(text):
    clean = text.strip()
    clean = re.sub(r'\.{2,}', ', ', clean)
    clean = re.sub(r'^\/([^/]+)\/$', r'\1', clean)
    clean = re.sub(r'\s*\([^)]*\)', '', clean)
    clean = re.sub(r'\s*,\s*', ', ', clean)
    clean = re.sub(r'\s{2,}', ' ', clean).strip()
    return clean

def download_tts(text, lang, filename):
    asset_path = os.path.join('assets', 'audio', 'lessons', filename)
    pub_path = os.path.join('public', 'audio', 'lessons', filename)
    
    if os.path.exists(asset_path) and os.path.getsize(asset_path) > 500:
        if not os.path.exists(pub_path) or os.path.getsize(pub_path) <= 500:
            with open(asset_path, 'rb') as src, open(pub_path, 'wb') as dst:
                dst.write(src.read())
        return True
    
    encoded = urllib.parse.quote(text)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl={lang}&q={encoded}"
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=12) as resp:
                data = resp.read()
                if len(data) > 500:
                    with open(asset_path, 'wb') as f:
                        f.write(data)
                    with open(pub_path, 'wb') as f:
                        f.write(data)
                    return True
        except Exception as e:
            time.sleep(0.6 * (attempt + 1))
    return False

# 1. Parse lessons from src/data/lessons.ts
with open('src/data/lessons.ts', 'r', encoding='utf-8') as f:
    text = f.read()

blocks = text.split('{\n    id: \'')
items_to_download = []

for b in blocks[1:]:
    id_part = b.split("'")[0]
    cat_match = re.search(r"categoryId:\s*'([^']+)'", b)
    cat = cat_match.group(1) if cat_match else ''
    
    prompt_match = re.search(r"audioPrompt:\s*'([^']+)'", b)
    prompt = prompt_match.group(1) if prompt_match else ''

    prompt_gu_match = re.search(r"audioPromptGu:\s*'([^']+)'", b)
    prompt_gu = prompt_gu_match.group(1) if prompt_gu_match else prompt

    prompt_hi_match = re.search(r"audioPromptHi:\s*'([^']+)'", b)
    prompt_hi = prompt_hi_match.group(1) if prompt_hi_match else prompt

    prompt_en_match = re.search(r"audioPromptEn:\s*'([^']+)'", b)
    prompt_en = prompt_en_match.group(1) if prompt_en_match else prompt

    word_match = re.search(r"exampleWord:\s*'([^']+)'", b)
    word = word_match.group(1) if word_match else ''

    sym_match = re.search(r"symbol:\s*'([^']+)'", b)
    symbol = sym_match.group(1) if sym_match else ''

    # Filter targets
    if cat == 'gu-varnamala':
        p = prompt_gu or prompt
        if p:
            items_to_download.append((id_part, p, 'gu', f"{id_part.replace('-', '_')}_gu.mp3"))
    elif cat == 'en-alphabet':
        letter = symbol or id_part.replace('en-alpha-', '').upper()
        p = f"{letter} for {word or 'Apple'}"
        items_to_download.append((id_part, p, 'en', f"{id_part.replace('-', '_')}_en.mp3"))
    elif cat == 'en-phonics':
        if prompt_en:
            items_to_download.append((id_part, prompt_en, 'en', f"{id_part.replace('-', '_')}_en.mp3"))
        if prompt_gu:
            items_to_download.append((id_part, prompt_gu, 'gu', f"{id_part.replace('-', '_')}_gu.mp3"))
    elif cat == 'hi-varnamala':
        p = prompt_hi or prompt
        if p:
            items_to_download.append((id_part, p, 'hi', f"{id_part.replace('-', '_')}_hi.mp3"))

# 2. Add Numbers 1 to 20
for n in range(1, 21):
    items_to_download.append((f"num-{n}", GUJARATI_NUMBERS[n], 'gu', f"num_{n}_gu.mp3"))
    items_to_download.append((f"num-{n}", ENGLISH_NUMBERS[n], 'en', f"num_{n}_en.mp3"))
    items_to_download.append((f"num-{n}", HINDI_NUMBERS[n], 'hi', f"num_{n}_hi.mp3"))

# 3. Add Celebration phrases
celebrations = [
    ('praise-gu-1', 'શાબાશ, ખૂબ સરસ!', 'gu', 'praise_gu_1.mp3'),
    ('praise-gu-2', 'વાહ, અદ્ભુત!', 'gu', 'praise_gu_2.mp3'),
    ('praise-gu-3', 'ખૂબ સરસ!', 'gu', 'praise_gu_3.mp3'),
    ('praise-en-1', 'Well done!', 'en', 'praise_en_1.mp3'),
    ('praise-en-2', 'Great job!', 'en', 'praise_en_2.mp3'),
    ('praise-en-3', 'Awesome superstar!', 'en', 'praise_en_3.mp3'),
    ('praise-hi-1', 'बहुत बढ़िया!', 'hi', 'praise_hi_1.mp3'),
    ('praise-hi-2', 'शाबाश, सही जवाब!', 'hi', 'praise_hi_2.mp3'),
    ('praise-hi-3', 'अद्भुत!', 'hi', 'praise_hi_3.mp3'),
]
for item in celebrations:
    items_to_download.append(item)

print(f"Total items queued for offline bundle: {len(items_to_download)}")

mapping_entries = []
success_count = 0

for idx, (id_part, text_prompt, lang, filename) in enumerate(items_to_download):
    ok = download_tts(text_prompt, lang, filename)
    if ok:
        success_count += 1
        normalized = clean_key(text_prompt)
        mapping_entries.append((id_part, lang, text_prompt, normalized, filename))
    if idx % 15 == 0:
        print(f"Progress: {idx+1}/{len(items_to_download)} (Success: {success_count})")
    time.sleep(0.08)

print(f"Completed download: {success_count}/{len(items_to_download)} audio files generated.")

# Generate TypeScript map: src/services/promptAudioMap.ts
ts_lines = [
    "/* eslint-disable @typescript-eslint/no-require-imports */",
    "/**",
    " * Auto-generated KidsZone Offline Audio Map",
    " * Maps normalized prompt text and lesson IDs directly to bundled local MP3 assets.",
    " * Guarantees 100% offline, identical, studio-quality pronunciation on all devices.",
    " */",
    "",
    "export const PROMPT_AUDIO_MAP: Record<string, any> = {"
]

seen_keys = set()
for id_part, lang, raw_text, norm_text, filename in mapping_entries:
    # 1. Map by lang:normalized
    key1 = f"{lang}:{norm_text}"
    if key1 not in seen_keys:
        seen_keys.add(key1)
        safe_key = key1.replace('\\', '\\\\').replace("'", "\\'")
        ts_lines.append(f"  '{safe_key}': require('../../assets/audio/lessons/{filename}'),")
    
    # 2. Map by lang:raw_text if different
    if raw_text != norm_text:
        key2 = f"{lang}:{raw_text}"
        if key2 not in seen_keys:
            seen_keys.add(key2)
            safe_key2 = key2.replace('\\', '\\\\').replace("'", "\\'")
            ts_lines.append(f"  '{safe_key2}': require('../../assets/audio/lessons/{filename}'),")

    # 3. Map by lessonId:lang
    key3 = f"{id_part}:{lang}"
    if key3 not in seen_keys:
        seen_keys.add(key3)
        ts_lines.append(f"  '{key3}': require('../../assets/audio/lessons/{filename}'),")

ts_lines.append("};")
ts_lines.append("")
ts_lines.append("export const WEB_PROMPT_AUDIO_MAP: Record<string, string> = {")

seen_web_keys = set()
for id_part, lang, raw_text, norm_text, filename in mapping_entries:
    key1 = f"{lang}:{norm_text}"
    if key1 not in seen_web_keys:
        seen_web_keys.add(key1)
        safe_key = key1.replace('\\', '\\\\').replace("'", "\\'")
        ts_lines.append(f"  '{safe_key}': '/audio/lessons/{filename}',")
    
    if raw_text != norm_text:
        key2 = f"{lang}:{raw_text}"
        if key2 not in seen_web_keys:
            seen_web_keys.add(key2)
            safe_key2 = key2.replace('\\', '\\\\').replace("'", "\\'")
            ts_lines.append(f"  '{safe_key2}': '/audio/lessons/{filename}',")

    key3 = f"{id_part}:{lang}"
    if key3 not in seen_web_keys:
        seen_web_keys.add(key3)
        ts_lines.append(f"  '{key3}': '/audio/lessons/{filename}',")

ts_lines.append("};")
ts_lines.append("")

out_map_path = 'src/services/promptAudioMap.ts'
with open(out_map_path, 'w', encoding='utf-8') as f:
    f.write('\n'.join(ts_lines))

print(f"Generated {out_map_path} with {len(seen_keys)} entries.")
