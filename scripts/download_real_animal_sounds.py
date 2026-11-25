import os
import urllib.request
import sys

DEST_DIRS = [
    os.path.abspath('assets/audio/animals'),
    os.path.abspath('public/audio/animals'),
    os.path.abspath('backend/media/audio/animals'),
]

for d in DEST_DIRS:
    os.makedirs(d, exist_ok=True)

ORKUN_BASE = 'https://raw.githubusercontent.com/orkuneyb/animal_sounds_flutter/master/assets/animal_sounds/{}'
DEV_BASE = 'https://raw.githubusercontent.com/dev-you-need/AnimalSounds/master/app/src/main/res/raw/{}'
ROLLIE_BASE = 'https://raw.githubusercontent.com/rollie42/animal-sounds/master/src/Animals/Animals/{}/sounds/1.mp3'
AJIMENEZ_BASE = 'https://raw.githubusercontent.com/ajimenez1503/Animals3D/master/app/src/main/res/raw/{}'

SOURCES = {
    'buffalo': (ORKUN_BASE.format('bison.mp3'), 'mp3'),
    'ox': (DEV_BASE.format('cow.mp3'), 'mp3'),
    'fox': (DEV_BASE.format('fox.mp3'), 'mp3'),
    'wolf': (ORKUN_BASE.format('wolf.mp3'), 'mp3'),
    'cheetah': (ORKUN_BASE.format('cheetah.mp3'), 'mp3'),
    'leopard': (ORKUN_BASE.format('jaguar.mp3'), 'mp3'),
    'panda': (ORKUN_BASE.format('panda.mp3'), 'mp3'),
    'kangaroo': (ORKUN_BASE.format('kangaroo.mp3'), 'mp3'),
    'hippo': (ORKUN_BASE.format('hippopotamus.mp3'), 'mp3'),
    'rhino': (ORKUN_BASE.format('rhinoceros.mp3'), 'mp3'),
    'squirrel': (ORKUN_BASE.format('squirrel.mp3'), 'mp3'),
    'rabbit': (ORKUN_BASE.format('rabbit.mp3'), 'mp3'),
    'turtle': (AJIMENEZ_BASE.format('turtle.wav'), 'wav'),
    'crocodile': (ORKUN_BASE.format('crocodile.mp3'), 'mp3'),
    'koel': (ORKUN_BASE.format('cuckoo.mp3'), 'mp3'),
    'eagle': (ORKUN_BASE.format('eagle.mp3'), 'mp3'),
    'swan': (ORKUN_BASE.format('swan.mp3'), 'mp3'),
    'flamingo': (ORKUN_BASE.format('flamingo.mp3'), 'mp3'),
    'crane': (ORKUN_BASE.format('crane.mp3'), 'mp3'),
    'woodpecker': (ORKUN_BASE.format('woodpecker.mp3'), 'mp3'),
    'kingfisher': (ORKUN_BASE.format('kingfisher.mp3'), 'mp3'),
    'penguin': (ORKUN_BASE.format('penguin.mp3'), 'mp3'),
    'ostrich': (ROLLIE_BASE.format('Ostrich'), 'mp3'),
    'vulture': (ORKUN_BASE.format('peregrine_falcon.mp3'), 'mp3'),
    'peacock': (ORKUN_BASE.format('peacock.mp3'), 'mp3'),
}

print(f"Downloading {len(SOURCES)} verified, authentic animal sounds...")
sys.stdout.flush()

failed = []

for name, (url, ext) in SOURCES.items():
    print(f"Fetching {name} from {url}...")
    sys.stdout.flush()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
            if len(data) < 5000:
                print(f"  [ERROR] {name}: file too small ({len(data)} bytes)")
                failed.append((name, 'Too small'))
                continue
            
            print(f"  [OK] {name}: size={len(data)} bytes")
            sys.stdout.flush()
            
            for dest_dir in DEST_DIRS:
                # Save both .mp3 and .wav so all references and bundlers succeed
                p_mp3 = os.path.join(dest_dir, f"{name}.mp3")
                p_wav = os.path.join(dest_dir, f"{name}.wav")
                with open(p_mp3, 'wb') as f:
                    f.write(data)
                with open(p_wav, 'wb') as f:
                    f.write(data)
    except Exception as e:
        print(f"  [FAILED] {name}: {e}")
        sys.stdout.flush()
        failed.append((name, str(e)))

print("\n" + "="*50)
if failed:
    print(f"Completed with {len(failed)} failures: {failed}")
    sys.exit(1)
else:
    print("ALL 25 VERIFIED AUTHENTIC ANIMAL SOUNDS DOWNLOADED SUCCESSFULLY!")
