#!/usr/bin/env python3
"""
Imports extra 3D Pixar renders (Weather, Water & Air, Human Body, Objects) from Downloads,
cuts out white backgrounds, centers and frames to 1024x1024, saves to assets/images/characters/,
and regenerates src/utils/extraRenders.ts.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from generate_3d_animals import finish_and_save, CHAR_DIR, available_render

EXTRA_REGISTRY_TS = ROOT / 'src' / 'utils' / 'extraRenders.ts'

# lesson_id -> (target_stem, keywords_to_match, emoji)
EXTRA_LESSONS: dict[str, tuple[str, list[str], str]] = {
    # Weather & Seasons
    'weather-sunny': ('sunny', ['sunny', 'sunshine', 'sunny day'], '☀️'),
    'weather-rainy': ('rainy', ['rainy', 'raincloud'], '🌧️'),
    'season-summer': ('summer', ['summer', 'summer season', 'sunflower summer'], '🌞'),
    'season-monsoon': ('monsoon', ['monsoon', 'thundercloud', 'monsoon season'], '⛈️'),
    'season-winter': ('winter', ['winter', 'snowflake', 'winter season'], '❄️'),
    'season-spring': ('spring', ['spring', 'blossom', 'spring season'], '🌸'),
    'season-autumn': ('autumn', ['autumn', 'fall leaf', 'autumn season'], '🍂'),
    'weather-rainbow': ('rainbow', ['rainbow'], '🌈'),
    'weather-windy': ('windy', ['windy', 'tornado', 'twister', 'windy storm'], '🌪️'),
    'weather-snow': ('snowman', ['snowman', 'snow mascot'], '☃️'),

    # Water & Air
    'water-drop': ('water_drop', ['water drop', 'pure water', 'droplet'], '💧'),
    'water-rain': ('rain_shower', ['rain shower', 'shower'], '🌧️'),
    'water-clouds': ('clouds', ['clouds', 'cloud', 'fluffy cloud'], '☁️'),
    'water-river': ('river', ['river', 'flowing river', 'stream'], '🏞️'),
    'water-ocean': ('ocean', ['ocean', 'sea wave', 'ocean wave'], '🌊'),
    'air-wind': ('wind', ['wind breeze', 'cool wind', 'breeze'], '💨'),
    'air-oxygen': ('oxygen', ['oxygen', 'fresh air', 'breath bubble'], '🌬️'),
    'water-ice': ('ice', ['ice cube', 'ice block', 'ice'], '🧊'),
    'water-cycle': ('water_cycle', ['water cycle', 'cycle diagram'], '🔄'),
    'water-drinking': ('drinking_water', ['drinking water', 'glass of water', 'water glass'], '🥛'),

    # Human Body & Senses
    'body-eyes': ('eyes', ['eyes', 'sight', 'pair of eyes'], '👀'),
    'body-ears': ('ears', ['ears', 'hearing', 'ear'], '👂'),
    'body-nose': ('nose', ['nose', 'smell'], '👃'),
    'body-tongue': ('tongue', ['tongue', 'taste'], '👅'),
    'body-skin': ('skin_hand', ['skin', 'hand', 'touch', 'hands'], '🖐️'),
    'body-brain': ('brain', ['brain', 'mind'], '🧠'),
    'body-heart': ('heart', ['heart mascot', 'cute heart'], '❤️'),
    'body-teeth': ('teeth', ['teeth', 'tooth', 'strong teeth'], '🦷'),
    'body-legs': ('legs', ['legs', 'feet', 'legs and feet', 'foot'], '🦵'),
    'body-bones': ('skeleton_bones', ['bones', 'skeleton', 'bone'], '🦴'),

    # Space & Solar System
    'space-sun': ('sun', ['sun mascot', 'sun star', 'the sun', 'sun'], '☀️'),
    'space-mercury': ('mercury', ['mercury', 'mercury planet'], '☿️'),
    'space-venus': ('venus', ['venus', 'venus planet'], '♀️'),
    'space-earth': ('earth', ['earth', 'blue planet', 'earth planet', 'planet earth'], '🌎'),
    'space-mars': ('mars', ['mars', 'red planet', 'mars planet'], '🔴'),
    'space-jupiter': ('jupiter', ['jupiter', 'jupiter planet'], '🪐'),
    'space-saturn': ('saturn', ['saturn', 'saturn planet', 'ringed planet'], '🪐'),
    'space-uranus': ('uranus', ['uranus', 'uranus planet', 'cyan planet'], '🔵'),
    'space-neptune': ('neptune', ['neptune', 'neptune planet', 'blue giant'], '🔷'),
    'space-moon': ('moon', ['moon mascot', 'crescent moon', 'the moon', 'moon'], '🌙'),
    'space-stars': ('twinkling_star', ['twinkling star', 'gold star', 'stars', 'star mascot', 'star'], '⭐'),
    'space-rocket': ('rocket', ['rocket', 'space rocket', 'spaceship'], '🚀'),

    # Everyday Objects
    'obj-clock': ('clock', ['clock', 'alarm clock'], '⏰'),
    'obj-book': ('book', ['book'], '📖'),
    'obj-pencil': ('pencil', ['pencil'], '✏️'),
    'obj-car': ('car', ['car', 'toy car'], '🚗'),
    'obj-house': ('house', ['house', 'home'], '🏠'),

    # Earth & Environment
    'earth-planet': ('earth_planet', ['earth planet', 'planet earth', 'globe earth'], '🌍'),
    'earth-mountains': ('mountains', ['mountains', 'mountain', 'snow mountains'], '🏔️'),
    'earth-forest': ('forest', ['forest', 'green forest', 'trees forest'], '🌲'),
    'earth-save-trees': ('save_trees', ['save trees', 'plant trees', 'planting tree', 'sapling'], '🌳'),
    'earth-recycle': ('recycle', ['recycle', 'recycling', 'clean recycle'], '♻️'),
    'earth-soil': ('soil', ['fertile soil', 'soil sprout', 'soil'], '🌱'),
    'earth-sunlight': ('sunlight', ['sunlight', 'sunlight energy', 'sunrise'], '🌅'),
    'earth-blue-sky': ('blue_sky', ['atmosphere', 'blue sky', 'atmosphere sky'], '🌌'),
    'earth-water-save': ('save_water', ['save water', 'water tap', 'save drop', 'water save'], '🚰'),
    'earth-clean-energy': ('solar_energy', ['clean solar', 'solar energy', 'solar panel', 'clean energy'], '⚡'),

    # Scientific Discoveries
    'sci-wheel': ('wheel', ['wheel', 'the wheel', 'stone wheel', 'cart wheel'], '⚙️'),
    'sci-bulb': ('bulb', ['bulb', 'electric bulb', 'light bulb', 'lightbulb'], '💡'),
    'sci-gravity': ('gravity', ['gravity', 'newton apple', 'gravity apple'], '🍏'),
    'sci-telescope': ('telescope', ['telescope', 'galileo telescope'], '🔭'),
    'sci-microscope': ('microscope', ['microscope', 'lab microscope'], '🔬'),
    'sci-telephone': ('telephone', ['telephone', 'phone', 'rotary phone'], '☎️'),
    'sci-airplane': ('airplane', ['airplane', 'aeroplane', 'plane', 'biplane'], '✈️'),
    'sci-steam-engine': ('steam_engine', ['steam engine', 'locomotive', 'steam train'], '🚂'),
    'sci-computer': ('computer', ['computer', 'desktop computer', 'pc'], '💻'),
    'sci-magnet': ('magnet', ['magnet', 'horseshoe magnet', 'magnetism'], '🧲'),

    # English Grammar
    'gram-noun': ('gram_noun', ['noun', 'naming words', 'name tag', 'nametag'], '🏷️'),
    'gram-verb': ('gram_verb', ['verb', 'action words', 'running boy', 'action'], '🏃'),
    'gram-adjective': ('gram_adjective', ['adjective', 'describing words', 'sparkling star'], '✨'),
    'gram-pronoun': ('gram_pronoun', ['pronoun', 'pronouns', 'two kids', 'he she'], '👥'),
    'gram-singular-plural': ('gram_singular_plural', ['singular plural', 'singular and plural', 'one and many', 'apples'], '📚'),
    'gram-capital': ('gram_capital', ['capital letters', 'capital letter', 'big letter a', 'capital a'], '🔠'),
    'gram-period': ('gram_period', ['full stop', 'period dot', 'stop sign dot'], '🛑'),
    'gram-question': ('gram_question', ['question mark', 'question mascot', 'curious question'], '❓'),

    # English Sentences
    'sent-1': ('sparrow', ['sparrow', 'bird'], '🐦'),
    'sent-2': ('cat', ['cat', 'kitten'], '🐱'),
    'sent-3': ('sun', ['sun', 'sunny'], '☀️'),
    'sent-4': ('book', ['book', 'reading'], '📚'),
    'sent-5': ('apple', ['apple', 'red apple'], '🍎'),
    'sent-6': ('play_together', ['play together', 'playing kids', 'friends playing'], '🤝'),
    'sent-7': ('eagle', ['eagle'], '🦅'),
    'sent-8': ('fish', ['fish', 'clownfish', 'goldfish'], '🐟'),

    # English Action Verbs
    'verb-run': ('gram_verb', ['run', 'running'], '🏃'),
    'verb-jump': ('kangaroo', ['jump', 'jumping', 'kangaroo'], '🦘'),
    'verb-read': ('book', ['read', 'reading book'], '📖'),
    'verb-eat': ('apple', ['eat', 'eating'], '🍎'),
    'verb-sleep': ('sleep', ['sleep', 'sleeping', 'sleepy'], '😴'),
    'verb-play': ('play_together', ['play', 'playing ball'], '⚽'),
    'verb-dance': ('dance', ['dance', 'dancing', 'ballerina'], '💃'),
    'verb-write': ('write', ['write', 'writing', 'pencil writing'], '✍️'),
    'verb-sing': ('sing', ['sing', 'singing', 'microphone singing'], '🎤'),
    'verb-swim': ('swim', ['swim', 'swimming', 'swimmer'], '🏊'),

    # English Nouns & Objects
    'noun-person': ('person', ['person', 'boy student', 'kid avatar'], '👦'),
    'noun-place': ('place_school', ['place school', 'schoolhouse', 'school'], '🏫'),
    'noun-animal': ('lion', ['animal lion', 'lion'], '🦁'),
    'noun-thing': ('book', ['thing book', 'book'], '📖'),
    'noun-proper': ('proper_noun', ['proper noun', 'nametag banner'], '🇮🇳'),
    'noun-common': ('common_city', ['common city', 'toy city', 'city buildings'], '🏙️'),
    'noun-fruits': ('apple', ['fruits apple', 'fruit apple'], '🍎'),
    'noun-toys': ('bear', ['toys bear', 'teddy bear'], '🧸'),

    # GK - National Symbols
    'sym-emblem': ('national_emblem', ['national emblem', 'ashoka lion'], '🏛️'),
    'sym-animal': ('tiger', ['tiger'], '🐅'),
    'sym-bird': ('peacock', ['peacock'], '🦚'),
    'sym-tree': ('banyan_tree', ['banyan'], '🌳'),
    'sym-flower': ('lotus', ['lotus'], '🌸'),
    'sym-fruit': ('mango_tree', ['mango'], '🥭'),
    'sym-river': ('river', ['river'], '🌊'),

    # GK - Vehicles
    'veh-car': ('car', ['car'], '🚗'),
    'veh-bus': ('bus', ['bus', 'school bus'], '🚌'),
    'veh-auto': ('auto', ['auto', 'auto rickshaw'], '🛺'),
    'veh-bicycle': ('bicycle', ['bicycle'], '🚲'),
    'veh-helicopter': ('helicopter', ['helicopter'], '🚁'),
    'veh-ship': ('ship', ['ship'], '🚢'),
    'veh-boat': ('boat', ['boat', 'sailboat'], '⛵'),
    'veh-fire-truck': ('fire_truck', ['fire truck', 'fire engine'], '🚒'),
    'veh-train': ('steam_engine', ['train', 'steam engine'], '🚆'),
    'veh-aeroplane': ('airplane', ['airplane', 'aeroplane'], '✈️'),

    # GK - History & Freedom Heroes
    'hist-gandhi': ('gandhi', ['mahatma gandhi', 'gandhi'], '👓'),
    'hist-patel': ('sardar_patel', ['sardar patel', 'iron man'], '🛡️'),
    'hist-ambedkar': ('ambedkar', ['dr ambedkar', 'constitution'], '📜'),
    'hist-bhagat': ('hist_bhagat', ['bhagat singh'], '⭐'),
    'hist-bose': ('hist_bose', ['subhash chandra bose', 'netaji'], '🎖️'),
    'hist-rani': ('rani_lakshmibai', ['rani lakshmibai', 'queen of jhansi'], '⚔️'),
    'hist-shivaji': ('shivaji', ['chhatrapati shivaji', 'shivaji maharaj'], '👑'),
    'hist-indus': ('indus_valley', ['indus valley', 'ancient pot'], '🏺'),
    'hist-ashoka': ('hist_ashoka', ['ashoka', 'emperor ashoka'], '☸️'),

    # GK - Personalities
    'pers-kalam': ('rocket', ['abdul kalam'], '🚀'),
    'pers-tagore': ('person', ['rabindranath tagore'], '✍️'),
    'pers-chawla': ('pers_chawla', ['kalpana chawla'], '👩‍🚀'),
    'pers-aryabhata': ('pers_aryabhata', ['aryabhata'], '🔢'),
    'pers-raman': ('microscope', ['cv raman'], '🔬'),
    'pers-teresa': ('pers_teresa', ['mother teresa'], '🕊️'),
    'pers-vivekananda': ('pers_vivekananda', ['swami vivekananda'], '🧘'),
    'pers-ramanujan': ('pers_ramanujan', ['ramanujan'], '🧮'),
    'pers-bhabha': ('pers_bhabha', ['homi bhabha'], '⚛️'),
    'pers-sarabhai': ('pers_sarabhai', ['vikram sarabhai'], '🛰️'),

    # GK - Monuments
    'mon-taj': ('taj_mahal', ['taj mahal'], '🕌'),
    'mon-statue-unity': ('statue_unity', ['statue of unity'], '🗿'),
    'red_fort': ('red_fort', ['red fort'], '🏰'),
    'mon-red-fort': ('red_fort', ['red fort', 'lal qila'], '🏰'),
    'mon-qutub': ('qutub', ['qutub minar'], '🗼'),
    'mon-gateway': ('gateway', ['gateway of india'], '🏛️'),
    'mon-india-gate': ('india_gate', ['india gate'], '🎖️'),
    'mon-great-wall': ('great_wall', ['great wall of china'], '🧱'),
    'mon-pyramid': ('pyramid', ['pyramids of giza'], '🔺'),
    'mon-liberty': ('liberty', ['statue of liberty'], '🗽'),

    # GK - Geography
    'geo-himalayas': ('mountains', ['himalayas', 'mountains'], '🏔️'),
    'geo-ganga': ('river', ['ganga', 'river'], '🌊'),
    'geo-narmada': ('river', ['narmada', 'river'], '🏞️'),
    'geo-ocean': ('ocean', ['ocean'], '🌊'),
    'geo-desert': ('desert', ['thar desert', 'desert'], '🏜️'),
    'geo-everest': ('everest', ['mount everest'], '⛰️'),
    'geo-continents': ('continents', ['7 continents'], '🌐'),
    'geo-oceans': ('earth_planet', ['oceans', 'earth'], '🌍'),
    'geo-islands': ('island', ['islands', 'island'], '🏝️'),
    'geo-monsoon': ('monsoon', ['monsoon'], '🌧️'),

    # GK - Sports
    'sport-cricket': ('cricket', ['cricket'], '🏏'),
    'sport-hockey': ('hockey', ['hockey'], '🏑'),
    'sport-football': ('play_together', ['football', 'soccer'], '⚽'),
    'sport-badminton': ('badminton', ['badminton'], '🏸'),
    'sport-chess': ('chess', ['chess'], '♟️'),
    'sport-kabaddi': ('kabaddi', ['kabaddi'], '🤼'),
    'sport-tennis': ('tennis', ['lawn tennis', 'tennis'], '🎾'),
    'sport-table-tennis': ('table_tennis', ['table tennis', 'ping pong'], '🏓'),
    'sport-swimming': ('swim', ['swim', 'swimming'], '🏊'),
    'sport-athletics': ('legs', ['run', 'athletics'], '🏃'),

    # GK - Inventions
    'inv-zero': ('zero', ['zero'], '0️⃣'),
    'inv-bulb': ('bulb', ['bulb', 'electric bulb'], '💡'),
    'inv-telephone': ('telephone', ['telephone', 'phone'], '📞'),
    'inv-airplane': ('airplane', ['airplane'], '🛩️'),
    'inv-wheel': ('wheel', ['wheel'], '⚙️'),
    'inv-press': ('printing_press', ['printing press'], '📰'),
    'inv-radio': ('radio', ['radio'], '📻'),
    'inv-tv': ('tv', ['television', 'tv'], '📺'),
    'inv-computer': ('computer', ['computer'], '💻'),
    'inv-clock': ('clock', ['clock'], '⏰'),

    # GK - Our World (lessons.ts)
    'gk-earth': ('earth_planet', ['earth'], '🌍'),
    'gk-sun': ('sun', ['sun'], '☀️'),
    'gk-moon': ('moon', ['moon'], '🌙'),
    'gk-peacock': ('peacock', ['peacock'], '🦚'),
    'gk-tiger': ('tiger', ['tiger'], '🐅'),
    'gk-lotus': ('lotus', ['lotus'], '🌸'),
    'gk-aeroplane': ('airplane', ['airplane'], '✈️'),
    'gk-train': ('steam_engine', ['train'], '🚂'),
    'gk-rainbow': ('rainbow', ['rainbow'], '🌈'),
    'gk-tree': ('banyan_tree', ['tree'], '🌳'),
    'gk-mountain': ('mountains', ['mountain'], '🏔️'),
    'gk-rocket': ('rocket', ['rocket'], '🚀'),
    'gk-stars': ('twinkling_star', ['star'], '⭐'),
    'gk-doctor': ('doctor', ['doctor'], '👨‍⚕️'),
    'gk-teacher': ('teacher', ['teacher'], '👩‍🏫'),
    'gk-police': ('police', ['police'], '👮'),
    'gk-firefighter': ('fire_truck', ['firefighter'], '👨‍🚒'),
    'gk-ship': ('ship', ['ship'], '🚢'),
    'gk-bicycle': ('bicycle', ['bicycle'], '🚲'),
    # Time, word problems & states: reuse existing renders (no emoji -> emoji map unchanged)
    'time-clock-hours': ('clock', [], ''),
    'time-sixty-seconds': ('clock', [], ''),
    'time-yesterday-today': ('clock', [], ''),
    'time-am-pm': ('sun', [], ''),
    'time-day-night': ('moon', [], ''),
    'time-seasons-cycle': ('autumn', [], ''),
    'prob-apple-add': ('apple', [], ''),
    'prob-bird-sub': ('sparrow', [], ''),
    'prob-pencil-box': ('pencil', [], ''),
    'prob-star-sub': ('twinkling_star', [], ''),
    'state-gujarat': ('lion', [], ''),
    'state-maharashtra': ('gateway', [], ''),
    'state-rajasthan': ('camel', [], ''),
    'state-karnataka': ('computer', [], ''),
    'state-delhi': ('india_gate', [], ''),
    'state-punjab': ('tractor', [], ''),
    'state-up': ('taj_mahal', [], ''),
    'state-kerala': ('boat', [], ''),
    'state-mp': ('tiger', [], ''),
    'state-goa': ('island', [], ''),
    'state-wb': ('river', [], ''),
}

def rebuild_registry() -> None:
    by_lesson = []
    emoji_map: dict[str, str] = {}
    for lid, (stem, _kw, emoji) in EXTRA_LESSONS.items():
        p = available_render(f'3d_{stem}')
        if p is None and stem == 'sunny':
            p = available_render('3d_sun')
        if p is None and stem == 'earth_planet':
            p = available_render('3d_earth')
        if p is not None:
            req = f"characterAsset('{p.stem}')"
            by_lesson.append(f"  '{lid}': {req},")
            if emoji and emoji not in emoji_map:
                emoji_map[emoji] = req

    by_emoji = [f"  '{em}': {req}," for em, req in emoji_map.items()]
    content = (
        "// AUTO-GENERATED by scripts/import_extra_3d.py. Do not edit by hand.\n"
        "// Real 1024x1024 transparent 3D Pixar renders for Weather, Water & Air, Body, and Objects.\n"
        "// Renders are served remotely (Django /media/characters/<key>.webp) and disk-cached by expo-image;\n"
        "// see src/utils/remoteAssets.ts. Bundled copies were removed to keep the app small.\n"
        "import { characterAsset, RemoteImageSource } from './remoteAssets';\n\n"
        "export const EXTRA_RENDERS_BY_LESSON: Record<string, RemoteImageSource> = {\n"
        + "\n".join(by_lesson)
        + "\n};\n\n"
        "export const EXTRA_RENDERS_BY_EMOJI: Record<string, RemoteImageSource> = {\n"
        + "\n".join(by_emoji)
        + "\n};\n"
    )
    EXTRA_REGISTRY_TS.write_text(content, encoding='utf-8', newline='\n')
    print(f"Registry updated: {len(by_lesson)} lesson renders, {len(by_emoji)} emoji renders.")

def import_folder(folder: Path) -> int:
    files = sorted(p for p in folder.iterdir() if p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webp'))
    done = 0
    for p in files:
        name_lower = p.stem.lower()
        matched_stem = None
        for _lid, (stem, keywords, _emoji) in EXTRA_LESSONS.items():
            if any(re.search(r'\b' + re.escape(k) + r'\b', name_lower) for k in keywords):
                matched_stem = stem
                break
        if not matched_stem:
            continue
        print(f"Importing {p.name} -> 3d_{matched_stem}.png ...")
        img = Image.open(p)
        finish_and_save(img, matched_stem, CHAR_DIR)
        done += 1
    rebuild_registry()
    return done

if __name__ == '__main__':
    dl = Path.home() / 'Downloads'
    count = import_folder(dl)
    print(f"Done! Imported {count} image(s).")
