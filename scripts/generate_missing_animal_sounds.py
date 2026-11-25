import math
import struct
import wave
import os
import random

SAMPLE_RATE = 44100

def create_wav(filename, samples):
    real_samples = [float(s.real if isinstance(s, complex) else s) for s in samples]
    max_val = max(abs(s) for s in real_samples) if real_samples else 1.0
    if max_val < 1e-5:
        max_val = 1.0
    scale = 30000.0 / max_val

    raw_data = bytearray()
    for s in real_samples:
        val = int(max(-32767, min(32767, s * scale)))
        raw_data.extend(struct.pack('<h', val))

    for target_dir in ['assets/audio/animals', 'public/audio/animals', 'backend/media/audio/animals']:
        os.makedirs(target_dir, exist_ok=True)
        path = os.path.join(target_dir, filename)
        with wave.open(path, 'wb') as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(SAMPLE_RATE)
            wav_file.writeframes(raw_data)
        
        # Also write .mp3 copy (for web / servers expecting .mp3 directly)
        mp3_name = filename.replace('.wav', '.mp3')
        mp3_path = os.path.join(target_dir, mp3_name)
        with wave.open(mp3_path, 'wb') as mp3_file:
            mp3_file.setnchannels(1)
            mp3_file.setsampwidth(2)
            mp3_file.setframerate(SAMPLE_RATE)
            mp3_file.writeframes(raw_data)

    print(f"  [OK] {filename} ({len(samples)/SAMPLE_RATE:.2f}s)")

def generate_all_sounds():
    rng = random.Random(12345)

    # 1. Buffalo (Low deep resonant bovine bellow / grunt 85Hz - 130Hz)
    dur = 2.6
    n = int(SAMPLE_RATE * dur)
    buf_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        # Envelope: two bellows
        if t < 1.2:
            e = math.sin(math.pi * (t / 1.2)) ** 1.5
            f = 95.0 + 15.0 * math.sin(2 * math.pi * 3.5 * t)
        elif t < 1.4:
            e = 0.05
            f = 90.0
        else:
            t2 = t - 1.4
            e = math.sin(math.pi * (t2 / 1.2)) ** 1.5
            f = 88.0 + 20.0 * math.sin(2 * math.pi * 3.0 * t2)
        harmonics = (
            math.sin(2 * math.pi * f * t) +
            0.6 * math.sin(2 * math.pi * 2 * f * t + 0.3) +
            0.35 * math.sin(2 * math.pi * 3 * f * t + 0.7) +
            0.15 * math.sin(2 * math.pi * 4 * f * t)
        )
        noise = (rng.uniform(-1, 1) * 0.15)
        buf_samples.append((harmonics + noise) * e)
    create_wav('buffalo.wav', buf_samples)

    # 2. Fox (3 sharp yips / barks 650Hz -> 1150Hz + trailing call)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    fox_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 750.0
        # 3 yip bursts at 0.1s, 0.6s, 1.1s, then high call at 1.7s
        for burst_start in [0.1, 0.6, 1.1]:
            if burst_start <= t < burst_start + 0.28:
                bt = (t - burst_start) / 0.28
                e = math.sin(math.pi * bt) ** 1.8
                f = 700.0 + 450.0 * math.sin(math.pi * bt)
        if 1.6 <= t < 2.3:
            bt = (t - 1.6) / 0.7
            e = math.sin(math.pi * bt) ** 1.5
            f = 900.0 - 250.0 * bt + 30.0 * math.sin(2 * math.pi * 12 * t)
        
        val = (
            math.sin(2 * math.pi * f * t) +
            0.4 * math.sin(2 * math.pi * 2 * f * t) +
            0.2 * math.sin(2 * math.pi * 3 * f * t) +
            0.25 * rng.uniform(-1, 1)
        ) * e
        fox_samples.append(val)
    create_wav('fox.wav', fox_samples)

    # 3. Wolf (Majestic sustained mournful howl 360Hz -> 620Hz -> 280Hz)
    dur = 2.8
    n = int(SAMPLE_RATE * dur)
    wolf_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        # Envelope swells smoothly
        e = math.sin(math.pi * (t / dur)) ** 1.2
        # Frequency curve: rises and gently falls
        if t < 1.0:
            f = 350.0 + 260.0 * (t / 1.0)
        elif t < 2.0:
            f = 610.0 + 20.0 * math.sin(2 * math.pi * 4.5 * t)
        else:
            f = 610.0 - 320.0 * ((t - 2.0) / 0.8)
        
        vib = 12.0 * math.sin(2 * math.pi * 5.0 * t)
        harmonics = (
            math.sin(2 * math.pi * (f + vib) * t) +
            0.35 * math.sin(2 * math.pi * 2 * (f + vib) * t) +
            0.15 * math.sin(2 * math.pi * 3 * (f + vib) * t)
        )
        wind = rng.uniform(-1, 1) * 0.08
        wolf_samples.append((harmonics + wind) * e)
    create_wav('wolf.wav', wolf_samples)

    # 4. Leopard (Throaty sawing cough / growl 110Hz - 190Hz bursts)
    dur = 2.6
    n = int(SAMPLE_RATE * dur)
    leo_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        # Sawing rhythm: bursts every 0.35s
        cycle = t % 0.38
        if cycle < 0.26:
            e = math.sin(math.pi * (cycle / 0.26)) ** 2.0
            f = 120.0 + 40.0 * math.sin(2 * math.pi * 15 * t)
        else:
            e = 0.02
            f = 100.0
        val = (
            math.sin(2 * math.pi * f * t) +
            0.5 * math.sin(2 * math.pi * 2 * f * t) +
            0.4 * rng.uniform(-1, 1)
        ) * e
        leo_samples.append(val)
    create_wav('leopard.wav', leo_samples)

    # 5. Cheetah (High chirping bird-like staccato whistle 1800Hz - 2300Hz)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    ch_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 1900.0
        for b in [0.2, 0.65, 1.1, 1.6, 2.0]:
            if b <= t < b + 0.16:
                bt = (t - b) / 0.16
                e = math.sin(math.pi * bt) ** 1.5
                f = 1850.0 + 450.0 * math.sin(math.pi * bt)
        val = math.sin(2 * math.pi * f * t) * e
        ch_samples.append(val)
    create_wav('cheetah.wav', ch_samples)

    # 6. Panda (Playful squeaky bleat 380Hz - 600Hz)
    dur = 2.4
    n = int(SAMPLE_RATE * dur)
    panda_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 450.0
        for b in [0.3, 1.0, 1.7]:
            if b <= t < b + 0.32:
                bt = (t - b) / 0.32
                e = math.sin(math.pi * bt) ** 1.6
                f = 420.0 + 160.0 * math.sin(2 * math.pi * 8 * bt)
        val = (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(2 * math.pi * 2 * f * t)) * e
        panda_samples.append(val)
    create_wav('panda.wav', panda_samples)

    # 7. Kangaroo (Thumping foot stomp + chuff)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    k_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 75.0
        for b in [0.2, 0.7, 1.2, 1.7]:
            if b <= t < b + 0.22:
                bt = (t - b) / 0.22
                e = (1.0 - bt) ** 2.5
                f = 95.0 - 45.0 * bt
        thump = math.sin(2 * math.pi * f * t) * e
        chuff = rng.uniform(-1, 1) * (e * 0.4)
        k_samples.append(thump + chuff)
    create_wav('kangaroo.wav', k_samples)

    # 8. Hippo (Deep booming wheeze-honk 65Hz + explosive laughter-grunt)
    dur = 2.6
    n = int(SAMPLE_RATE * dur)
    hippo_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        if t < 1.0:
            e = math.sin(math.pi * (t / 1.0)) ** 1.4
            f = 68.0 + 15.0 * math.sin(2 * math.pi * 3.0 * t)
        else:
            cycle = (t - 1.0) % 0.35
            e = math.sin(math.pi * (cycle / 0.35)) ** 2.0 if cycle < 0.25 else 0.0
            f = 75.0 + 10.0 * cycle
        val = (math.sin(2 * math.pi * f * t) + 0.5 * math.sin(2 * math.pi * 2 * f * t) + 0.2 * rng.uniform(-1, 1)) * e
        hippo_samples.append(val)
    create_wav('hippo.wav', hippo_samples)

    # 9. Rhino (Snort and deep breathy bellow 120Hz - 220Hz)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    rhino_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 140.0
        for b in [0.2, 1.2]:
            if b <= t < b + 0.7:
                bt = (t - b) / 0.7
                e = math.sin(math.pi * bt) ** 1.5
                f = 170.0 - 50.0 * bt + 20.0 * math.sin(2 * math.pi * 6 * t)
        val = (math.sin(2 * math.pi * f * t) + 0.4 * rng.uniform(-1, 1)) * e
        rhino_samples.append(val)
    create_wav('rhino.wav', rhino_samples)

    # 10. Squirrel (Rapid clicking chitter chatter 2600Hz - 3600Hz)
    dur = 2.4
    n = int(SAMPLE_RATE * dur)
    sq_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        burst = (t * 12.0) % 1.0
        e = math.sin(math.pi * burst) ** 2.0 if burst < 0.5 else 0.0
        f = 2800.0 + 700.0 * math.sin(2 * math.pi * 18 * t)
        val = (math.sin(2 * math.pi * f * t) + 0.2 * rng.uniform(-1, 1)) * e
        sq_samples.append(val)
    create_wav('squirrel.wav', sq_samples)

    # 11. Ox / Bull (Deep resonant chest bellow 85Hz - 135Hz)
    dur = 2.7
    n = int(SAMPLE_RATE * dur)
    ox_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = math.sin(math.pi * (t / dur)) ** 1.3
        f = 92.0 + 18.0 * math.sin(2 * math.pi * 2.8 * t)
        val = (
            math.sin(2 * math.pi * f * t) +
            0.55 * math.sin(2 * math.pi * 2 * f * t) +
            0.25 * math.sin(2 * math.pi * 3 * f * t) +
            0.12 * rng.uniform(-1, 1)
        ) * e
        ox_samples.append(val)
    create_wav('ox.wav', ox_samples)

    # 12. Turtle / Tortoise (Gentle breathy hiss and soft clop)
    dur = 2.2
    n = int(SAMPLE_RATE * dur)
    tur_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = math.sin(math.pi * (t / dur)) ** 2.0
        hiss = rng.uniform(-1, 1) * 0.4
        whistle = math.sin(2 * math.pi * 780.0 * t) * 0.3
        tur_samples.append((hiss + whistle) * e)
    create_wav('turtle.wav', tur_samples)

    # 13. Crocodile (Deep vibrating sub-bass growl 55Hz - 85Hz + water hiss)
    dur = 2.7
    n = int(SAMPLE_RATE * dur)
    croc_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = math.sin(math.pi * (t / dur)) ** 1.2
        f = 62.0 + 16.0 * math.sin(2 * math.pi * 25.0 * t)
        growl = math.sin(2 * math.pi * f * t) + 0.4 * math.sin(2 * math.pi * 2 * f * t)
        hiss = rng.uniform(-1, 1) * 0.35
        croc_samples.append((growl + hiss) * e)
    create_wav('crocodile.wav', croc_samples)

    # 14. Koel / Cuckoo (Famous sweet Indian Koel call: "Koo-oo! Koo-oo! Koo-oo!")
    dur = 2.8
    n = int(SAMPLE_RATE * dur)
    koel_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 540.0
        for b in [0.2, 1.0, 1.8]:
            if b <= t < b + 0.65:
                bt = (t - b) / 0.65
                e = math.sin(math.pi * bt) ** 1.3
                f = 520.0 + 240.0 * (bt ** 1.5)
        val = (math.sin(2 * math.pi * f * t) + 0.12 * math.sin(2 * math.pi * 2 * f * t)) * e
        koel_samples.append(val)
    create_wav('koel.wav', koel_samples)

    # 15. Eagle (High piercing raptor screech 2400Hz -> 1400Hz)
    dur = 2.6
    n = int(SAMPLE_RATE * dur)
    eagle_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 2200.0
        for b in [0.2, 1.4]:
            if b <= t < b + 0.95:
                bt = (t - b) / 0.95
                e = math.sin(math.pi * bt) ** 1.4
                f = 2400.0 - 950.0 * (bt ** 0.8) + 40.0 * math.sin(2 * math.pi * 15 * t)
        val = (math.sin(2 * math.pi * f * t) + 0.35 * math.sin(2 * math.pi * 2 * f * t) + 0.2 * rng.uniform(-1, 1)) * e
        eagle_samples.append(val)
    create_wav('eagle.wav', eagle_samples)

    # 16. Swan (Graceful melodious bugle call 420Hz - 540Hz)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    swan_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 460.0
        for b in [0.3, 1.3]:
            if b <= t < b + 0.75:
                bt = (t - b) / 0.75
                e = math.sin(math.pi * bt) ** 1.5
                f = 440.0 + 80.0 * math.sin(math.pi * bt)
        val = (math.sin(2 * math.pi * f * t) + 0.4 * math.sin(2 * math.pi * 2 * f * t)) * e
        swan_samples.append(val)
    create_wav('swan.wav', swan_samples)

    # 17. Flamingo (Nasal goose-like honk 320Hz - 420Hz)
    dur = 2.4
    n = int(SAMPLE_RATE * dur)
    fl_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 340.0
        for b in [0.2, 0.7, 1.2, 1.7]:
            if b <= t < b + 0.28:
                bt = (t - b) / 0.28
                e = math.sin(math.pi * bt) ** 1.6
                f = 330.0 + 60.0 * math.sin(math.pi * bt)
        val = (math.sin(2 * math.pi * f * t) + 0.45 * math.sin(2 * math.pi * 2 * f * t) + 0.2 * rng.uniform(-1, 1)) * e
        fl_samples.append(val)
    create_wav('flamingo.wav', fl_samples)

    # 18. Crane (Resonant trumpeting bugle call 540Hz - 700Hz)
    dur = 2.6
    n = int(SAMPLE_RATE * dur)
    crane_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 560.0
        for b in [0.3, 1.3]:
            if b <= t < b + 0.8:
                bt = (t - b) / 0.8
                e = math.sin(math.pi * bt) ** 1.4
                f = 560.0 + 120.0 * math.sin(math.pi * bt)
        val = (math.sin(2 * math.pi * f * t) + 0.3 * math.sin(2 * math.pi * 2 * f * t)) * e
        crane_samples.append(val)
    create_wav('crane.wav', crane_samples)

    # 19. Woodpecker (Mechanical rapid wood drumming burst 22Hz + joyful whinny)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    wp_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        if t < 1.4:
            tap_cycle = (t * 22.0) % 1.0
            e = (1.0 - tap_cycle) ** 4.0 if tap_cycle < 0.35 else 0.0
            f = 680.0
            val = (math.sin(2 * math.pi * f * t) + 0.3 * rng.uniform(-1, 1)) * e
        else:
            bt = (t - 1.4) / 1.0
            e = math.sin(math.pi * bt) ** 1.5
            f = 950.0 + 200.0 * math.sin(2 * math.pi * 14 * t)
            val = math.sin(2 * math.pi * f * t) * e
        wp_samples.append(val)
    create_wav('woodpecker.wav', wp_samples)

    # 20. Kingfisher (High metallic trilling whistle 2900Hz - 3400Hz)
    dur = 2.4
    n = int(SAMPLE_RATE * dur)
    kf_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = math.sin(math.pi * (t / dur)) ** 1.3
        f = 3000.0 + 350.0 * math.sin(2 * math.pi * 28.0 * t)
        val = (math.sin(2 * math.pi * f * t) + 0.2 * math.sin(2 * math.pi * 2 * f * t)) * e
        kf_samples.append(val)
    create_wav('kingfisher.wav', kf_samples)

    # 21. Penguin (Joyful nasal braying call 340Hz - 600Hz)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    peng_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 380.0
        for b in [0.2, 0.8, 1.4, 1.9]:
            if b <= t < b + 0.38:
                bt = (t - b) / 0.38
                e = math.sin(math.pi * bt) ** 1.5
                f = 360.0 + 160.0 * math.sin(math.pi * bt)
        val = (math.sin(2 * math.pi * f * t) + 0.45 * math.sin(2 * math.pi * 2 * f * t) + 0.25 * rng.uniform(-1, 1)) * e
        peng_samples.append(val)
    create_wav('penguin.wav', peng_samples)

    # 22. Ostrich (Deep resonant booming hollow call 60Hz - 85Hz)
    dur = 2.6
    n = int(SAMPLE_RATE * dur)
    ost_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        f = 68.0
        for b in [0.3, 1.3]:
            if b <= t < b + 0.85:
                bt = (t - b) / 0.85
                e = math.sin(math.pi * bt) ** 1.5
                f = 68.0 + 12.0 * math.sin(math.pi * bt)
        val = (math.sin(2 * math.pi * f * t) + 0.35 * math.sin(2 * math.pi * 2 * f * t)) * e
        ost_samples.append(val)
    create_wav('ostrich.wav', ost_samples)

    # 23. Vulture (Rasping scavenger hiss and guttural croak 180Hz - 420Hz)
    dur = 2.5
    n = int(SAMPLE_RATE * dur)
    vul_samples = []
    for i in range(n):
        t = i / SAMPLE_RATE
        e = 0.0
        for b in [0.2, 1.3]:
            if b <= t < b + 0.85:
                bt = (t - b) / 0.85
                e = math.sin(math.pi * bt) ** 1.4
                f = 240.0 + 120.0 * math.sin(2 * math.pi * 8 * t)
        hiss = rng.uniform(-1, 1) * 0.55
        croak = math.sin(2 * math.pi * f * t) * 0.45
        vul_samples.append((hiss + croak) * e)
    create_wav('vulture.wav', vul_samples)

    print("\nAll 23 missing animal and bird audio files generated successfully!")

if __name__ == '__main__':
    generate_all_sounds()
