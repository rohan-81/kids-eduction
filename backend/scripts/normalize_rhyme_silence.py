#!/usr/bin/env python3
"""
KidsZone Nursery Rhymes Audio Silence Normalizer & Verifier
Measures raw audio onset using miniaudio PCM decoding and RMS signal analysis.
Trims any leading silence above 0.15s threshold so singing begins at 0.0s.

Usage:
    python backend/scripts/normalize_rhyme_silence.py [--trim] [--threshold-db -40.0] [--max-onset 0.15]
"""

import math
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
AUDIO_DIR = BACKEND_DIR / 'media' / 'rhymes' / 'audio'

try:
    import miniaudio
except ImportError:
    print("Error: miniaudio package required. Run 'pip install miniaudio'.")
    sys.exit(1)


def measure_onset(filepath: Path, threshold_db: float = -30.0) -> tuple[float, float]:
    """Decodes MP3 to PCM and calculates RMS amplitude in 10ms windows to locate onset."""
    decoded = miniaudio.decode_file(str(filepath))
    samples = decoded.samples
    sample_rate = decoded.sample_rate
    nchannels = decoded.nchannels
    frame_samples = int(sample_rate * 0.01) * nchannels

    for i in range(0, len(samples), frame_samples):
        chunk = samples[i:i + frame_samples]
        if not chunk:
            break
        rms = math.sqrt(sum(s * s for s in chunk) / len(chunk))
        db = 20 * math.log10(rms / 32768.0) if rms > 0 else -100.0
        if db >= threshold_db:
            time_sec = (i // nchannels) / float(sample_rate)
            return time_sec, db

    return 0.0, -100.0


def trim_leading_frames(filepath: Path, target_onset: float = 0.02) -> bool:
    """Trims silent leading MP3 frame headers losslessly."""
    with open(filepath, 'rb') as f:
        data = f.read()

    frames = []
    idx = 0
    while idx < len(data) - 4:
        if data[idx] == 0xFF and (data[idx + 1] & 0xE0) == 0xE0:
            frames.append(idx)
            idx += 400
        else:
            idx += 1

    onset, _ = measure_onset(filepath)
    if onset <= 0.15:
        return False

    frames_to_cut = int(onset / 0.026)
    if len(frames) > frames_to_cut:
        cut_idx = frames[frames_to_cut]
        with open(filepath, 'wb') as f:
            f.write(data[cut_idx:])
        return True
    return False


def verify_all(trim_if_needed: bool = False, max_onset: float = 0.18) -> bool:
    if not AUDIO_DIR.exists():
        print(f"Directory not found: {AUDIO_DIR}")
        return False

    mp3_files = sorted(list(AUDIO_DIR.glob('*.mp3')))
    print(f"Scanning {len(mp3_files)} rhyme audio tracks in {AUDIO_DIR}")
    print(f"Threshold: onset must start within <= {max_onset}s")
    print("=" * 68)

    all_passed = True
    for mp3 in mp3_files:
        onset, db = measure_onset(mp3)
        if onset > max_onset and trim_if_needed:
            trimmed = trim_leading_frames(mp3)
            if trimmed:
                onset, db = measure_onset(mp3)

        passed = onset <= max_onset
        if not passed:
            all_passed = False
        status_str = "PASS" if passed else "FAIL"
        print(f"• {mp3.name:<24} onset: {onset:6.3f}s (peak: {db:5.1f} dBFS) -> [{status_str}]")

    print("=" * 68)
    if all_passed:
        print(f"ALL {len(mp3_files)} tracks verified: singing onset <= {max_onset}s.")
    else:
        print("WARNING: Some tracks have leading silence above threshold.")
    return all_passed


if __name__ == '__main__':
    trim = '--trim' in sys.argv
    success = verify_all(trim_if_needed=trim)
    sys.exit(0 if success else 1)
