import os
import sys
import time
import hashlib
import subprocess
import urllib.parse

# Mapping of animal keys to authentic Wikimedia Commons recordings
ANIMAL_RECORDINGS = {
    'lion': 'Lion raring-sound1TamilNadu178.ogg',
    'cat': 'Meow domestic cat.ogg',
    'dog': 'Barking of a dog.ogg',
    'cow': 'Mudchute cow 1.ogg',
    'peacock': 'Peacock1.ogg',
    'elephant': 'Elephant voice - trumpeting.ogg',
    'horse': 'Wiehern.ogg',
    'rooster': 'Rooster crowing.ogg',
    'duck': 'Pekin duck & mallard.ogg',
    'sparrow': 'House Sparrows chirping.ogg',
    'bear': 'Yellowstone sound library - Grizzly Bears Roar - 001.mp3',
    'frog': 'Single Frog Croak.oga',
    'sheep': 'Sheep bleating.ogg',
    'pigeon': 'Dove cooing.ogg',
    'tiger': '439280 schots angry-tiger.wav',
    'monkey': 'Howler monkey.ogg',
    'deer': 'Red Deer (Cervus elaphus) (W1CDR0001424 BD3).ogg',
    'parrot': 'African grey parrot sound.wav',
    'rabbit': 'Rabbit oinks and squeaks.wav',
    'zebra': 'Grévys zebra (Sound Effects).ogg',
    'giraffe': 'Giraffe grunt.oga',
    'goat': 'Herd of goats bleating.ogg',
    'donkey': '157763 felix-blume a-donkey-is-braying-in-his-enclosure-in-south-of-france.wav',
    'crow': 'Corvus corone - Carrion Crow XC511945.mp3',
    'owl': 'Strix aluco - Tawny Owl XC563348.mp3',
}

def get_wikimedia_url(filename):
    fname = filename.replace(' ', '_')
    if fname.startswith('File:'):
        fname = fname[5:]
    h = hashlib.md5(fname.encode('utf-8')).hexdigest()
    if fname.endswith('.mp3') or fname.endswith('.wav'):
        return f'https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(fname)}', fname.split('.')[-1]
    else:
        # Transcoded MP3
        return f'https://upload.wikimedia.org/wikipedia/commons/transcoded/{h[0]}/{h[:2]}/{urllib.parse.quote(fname)}/{urllib.parse.quote(fname)}.mp3', 'mp3'

def resolve_ip(host):
    out = subprocess.check_output(['nslookup', host, '8.8.8.8'], text=True, timeout=10)
    lines = out.split('Name:')[1] if 'Name:' in out else out
    import re
    ips = [ip for ip in re.findall(r'([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)', lines) if ip != '8.8.8.8']
    return ips[0]

def main():
    assets_dir = os.path.abspath('assets/audio/animals')
    public_dir = os.path.abspath('public/audio/animals')
    os.makedirs(assets_dir, exist_ok=True)
    os.makedirs(public_dir, exist_ok=True)

    ip = resolve_ip('upload.wikimedia.org')
    print(f'upload.wikimedia.org resolved to: {ip}')

    results = {}
    for key, source_file in ANIMAL_RECORDINGS.items():
        url, ext = get_wikimedia_url(source_file)
        dest_filename = f'{key}.mp3' if ext == 'mp3' else f'{key}.wav'
        asset_path = os.path.join(assets_dir, dest_filename)
        public_path = os.path.join(public_dir, dest_filename)

        print(f'Downloading {key} ({source_file}) -> {dest_filename}...')
        cmd = [
            'curl.exe', '-s', '-L',
            '--connect-timeout', '10',
            '--resolve', f'upload.wikimedia.org:443:{ip}',
            '-H', 'User-Agent: KidsLearningApp/1.0 (contact: support@kidszone.edu)',
            '-o', asset_path,
            url
        ]
        try:
            subprocess.check_call(cmd)
            size = os.path.getsize(asset_path)
            if size > 1000:
                # Copy to public dir for Web Audio
                with open(asset_path, 'rb') as f_in, open(public_path, 'wb') as f_out:
                    f_out.write(f_in.read())
                print(f'  [SUCCESS] {key} size: {size} bytes')
                results[key] = {'status': 'OK', 'size': size, 'file': dest_filename}
            else:
                print(f'[FAIL] {key} file too small ({size} bytes)')
                results[key] = {'status': 'FAIL', 'size': size}
        except Exception as e:
            print(f'  [ERROR] {key}: {e}')
            results[key] = {'status': 'ERROR', 'error': str(e)}

        time.sleep(0.5)

    print('\nSummary:')
    for k, v in results.items():
        print(f'{k}: {v}')

if __name__ == '__main__':
    main()
