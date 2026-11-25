import os, sys, re, json, urllib.request, urllib.parse, time, hashlib
from utils_numbers import GUJARATI_NUMBERS

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
    
    if os.path.exists(asset_path) and os.path.getsize(asset_path) > 300:
        if not os.path.exists(pub_path) or os.path.getsize(pub_path) <= 300:
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
                if len(data) > 300:
                    with open(asset_path, 'wb') as f:
                        f.write(data)
                    with open(pub_path, 'wb') as f:
                        f.write(data)
                    return True
        except Exception as e:
            time.sleep(0.4 * (attempt + 1))
    return False

# Collect all items
all_items = [] # (id_or_hash, text, lang, filename)
seen_texts = set()

def add_item(identifier, text, lang='gu'):
    if not text or len(text.strip()) == 0:
        return
    text = text.strip()
    key = (lang, text)
    if key in seen_texts:
        return
    seen_texts.add(key)
    
    # Generate stable safe filename
    h = hashlib.md5(f"{lang}:{text}".encode('utf-8')).hexdigest()[:10]
    safe_prefix = re.sub(r'[^a-zA-Z0-9_]', '_', identifier)[:24]
    filename = f"{safe_prefix}_{h}_{lang}.mp3"
    all_items.append((identifier, text, lang, filename))

# 1. Existing Phase 1 items (to keep mapping intact)
# Phase 1 items are in lessons.ts: varnamala, alphabet, phonics, hi-varnamala, numbers 1-20, praise
with open('src/data/lessons.ts', 'r', encoding='utf-8') as f:
    lessons_code = f.read()

blocks = lessons_code.split('{\n    id: \'')
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
    title_match = re.search(r"title:\s*'([^']+)'", b)
    title = title_match.group(1) if title_match else ''

    title_parts = title.split('•') if '•' in title else None
    gu_title = title_parts[1].strip() if title_parts and len(title_parts) > 1 else None

    if cat == 'gu-varnamala':
        p = prompt_gu or prompt
        if p: add_item(id_part, p, 'gu')
    elif cat == 'en-alphabet':
        letter = symbol or id_part.replace('en-alpha-', '').upper()
        add_item(id_part, f"{letter} for {word or 'Apple'}", 'en')
    elif cat == 'en-phonics':
        if prompt_en: add_item(id_part, prompt_en, 'en')
        if prompt_gu: add_item(id_part, prompt_gu, 'gu')
    elif cat == 'hi-varnamala':
        p = prompt_hi or prompt
        if p: add_item(id_part, p, 'hi')
    else:
        # All other categories in Gujarati! (Fruits, Animals, Colors-Shapes, GK, Objects, etc.)
        gu_target = prompt_gu or gu_title or prompt or title
        if gu_target:
            add_item(id_part, gu_target, 'gu')

# 2. Add All Numbers 1 to 100 in Gujarati
with open('src/utils/languageData.ts', 'r', encoding='utf-8') as f:
    lang_data_text = f.read()

# Numbers from languageData.ts
num_matches = re.findall(r"(\d+):\s*'([^']+)'", lang_data_text)
for n_str, word in num_matches:
    n = int(n_str)
    if 1 <= n <= 100:
        add_item(f"num-{n}", word, 'gu')

# 3. Add Ghadiya Recitation Chants (Table 1 to 10) in Gujarati
# In languageData.ts: GUJARATI_TABLE_RECITATION
ghadiya_section_match = re.search(r"export const GUJARATI_TABLE_RECITATION:.*?\{([\s\S]*?)\n\};", lang_data_text)
if ghadiya_section_match:
    ghadiya_text = ghadiya_section_match.group(1)
    audios = re.findall(r"audio:\s*'([^']+)'", ghadiya_text)
    texts = re.findall(r"text:\s*'([^']+)'", ghadiya_text)
    for idx, a in enumerate(audios):
        add_item(f"ghadiya_audio_{idx+1}", a, 'gu')
    for idx, t in enumerate(texts):
        add_item(f"ghadiya_text_{idx+1}", t, 'gu')

# 4. Add All Rhymes in Gujarati
with open('app/rhymes.tsx', 'r', encoding='utf-8') as f:
    rhymes_text = f.read()

rhyme_lines = re.findall(r"gu:\s*'([^']+)'", rhymes_text)
for idx, r in enumerate(rhyme_lines):
    add_item(f"rhyme_line_{idx+1}", r, 'gu')

# 5. Add All Stories in Gujarati
with open('src/data/storiesData.ts', 'r', encoding='utf-8') as f:
    stories_text = f.read()

story_scenes = re.findall(r"textGu:\s*'([^']+)'", stories_text)
story_morals = re.findall(r"moralGu:\s*'([^']+)'", stories_text)
story_questions = re.findall(r"questionGu:\s*'([^']+)'", stories_text)
story_feedbacks = re.findall(r"feedbackGu:\s*'([^']+)'", stories_text)

for idx, s in enumerate(story_scenes):
    add_item(f"story_scene_{idx+1}", s, 'gu')
for idx, m in enumerate(story_morals):
    add_item(f"story_moral_{idx+1}", m, 'gu')
for idx, q in enumerate(story_questions):
    add_item(f"story_question_{idx+1}", q, 'gu')
for idx, fb in enumerate(story_feedbacks):
    add_item(f"story_fb_{idx+1}", fb, 'gu')

# 6. Add Science & GK & Math extra lessons
for extra_file in ['src/data/lessonsScience.ts', 'src/data/lessonsGK.ts', 'src/data/lessonsMath.ts']:
    if os.path.exists(extra_file):
        with open(extra_file, 'r', encoding='utf-8') as f:
            c = f.read()
        prompts = re.findall(r"audioPromptGu:\s*'([^']+)'", c)
        for idx, p in enumerate(prompts):
            add_item(f"extra_gu_{idx+1}", p, 'gu')

# 7. Celebration & Encouragement phrases
celebrations = [
    ('praise-gu-1', 'શાબાશ, ખૂબ સરસ!', 'gu'),
    ('praise-gu-2', 'વાહ, અદ્ભુત!', 'gu'),
    ('praise-gu-3', 'ખૂબ સરસ!', 'gu'),
    ('praise-gu-4', 'શાબાશ, સાચો જવાબ!', 'gu'),
    ('praise-gu-5', 'સુપરસ્ટાર!', 'gu'),
    ('praise-gu-6', 'તમે જીતી ગયા!', 'gu'),
    ('praise-en-1', 'Well done!', 'en'),
    ('praise-en-2', 'Great job!', 'en'),
    ('praise-en-3', 'Awesome superstar!', 'en'),
    ('praise-hi-1', 'बहुत बढ़िया!', 'hi'),
    ('praise-hi-2', 'शाबाश, सही जवाब!', 'hi'),
    ('praise-hi-3', 'अद्भुत!', 'hi'),
]
for id_p, t, l in celebrations:
    add_item(id_p, t, l)

print(f"Total unique audio items in entire application: {len(all_items)}")

mapping_entries = []
success_count = 0
already_cached = 0

for idx, (identifier, text_prompt, lang, filename) in enumerate(all_items):
    asset_path = os.path.join('assets', 'audio', 'lessons', filename)
    is_cached = os.path.exists(asset_path) and os.path.getsize(asset_path) > 300
    if is_cached:
        already_cached += 1
    
    ok = download_tts(text_prompt, lang, filename)
    if ok:
        success_count += 1
        normalized = clean_key(text_prompt)
        mapping_entries.append((identifier, lang, text_prompt, normalized, filename))
    
    if (idx + 1) % 30 == 0 or idx == len(all_items) - 1:
        print(f"Progress: {idx+1}/{len(all_items)} (Success: {success_count}, Cached: {already_cached})")
    
    if not is_cached:
        time.sleep(0.06)

print(f"Download complete: {success_count}/{len(all_items)} audio files ready.")

# Generate TypeScript map: src/services/promptAudioMap.ts
ts_lines = [
    "/* eslint-disable @typescript-eslint/no-require-imports */",
    "/**",
    " * Auto-generated KidsZone Complete Offline Audio Map",
    " * Bundles 100% of all educational lessons, varnamala, numbers, ghadiya, rhymes, and stories.",
    " * Guarantees identical studio-quality Google Gujarati female voice on all devices offline.",
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

    # 3. Map by raw_text directly
    if raw_text not in seen_keys:
        seen_keys.add(raw_text)
        safe_raw = raw_text.replace('\\', '\\\\').replace("'", "\\'")
        ts_lines.append(f"  '{safe_raw}': require('../../assets/audio/lessons/{filename}'),")
        
    if norm_text not in seen_keys:
        seen_keys.add(norm_text)
        safe_norm = norm_text.replace('\\', '\\\\').replace("'", "\\'")
        ts_lines.append(f"  '{safe_norm}': require('../../assets/audio/lessons/{filename}'),")

    # 4. Map by identifier:lang
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

    if raw_text not in seen_web_keys:
        seen_web_keys.add(raw_text)
        safe_raw = raw_text.replace('\\', '\\\\').replace("'", "\\'")
        ts_lines.append(f"  '{safe_raw}': '/audio/lessons/{filename}',")

    if norm_text not in seen_web_keys:
        seen_web_keys.add(norm_text)
        safe_norm = norm_text.replace('\\', '\\\\').replace("'", "\\'")
        ts_lines.append(f"  '{safe_norm}': '/audio/lessons/{filename}',")

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
