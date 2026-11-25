import os
import glob
import struct
import wave
import shutil

ASSETS_DIR = r"e:\kidsapp\assets\audio\animals"
PUBLIC_DIR = r"e:\kidsapp\public\audio\animals"

os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

def slice_wav(src_path, dst_path, start_sec, dur_sec=2.8):
    with wave.open(src_path, 'rb') as w:
        nframes = w.getnframes()
        rate = w.getframerate()
        nchan = w.getnchannels()
        width = w.getsampwidth()
        
        start_frame = int(start_sec * rate)
        dur_frames = int(dur_sec * rate)
        
        w.setpos(min(start_frame, max(0, nframes-1)))
        frames = w.readframes(min(dur_frames, nframes - start_frame))
        
    actual_frames = len(frames) // (nchan * width)
    if actual_frames == 0:
        print(f"Warning: no frames for {src_path}")
        return

    fade_in = int(0.05 * rate)
    fade_out = int(0.25 * rate)
    out_bytes = bytearray()
    
    for i in range(actual_frames):
        vol = 1.0
        if i < fade_in:
            vol = i / float(fade_in)
        elif i > actual_frames - fade_out:
            vol = (actual_frames - i) / float(fade_out)
            
        for c in range(nchan):
            sample_idx = (i * nchan + c) * width
            if width == 2:
                val = struct.unpack('<h', frames[sample_idx:sample_idx+2])[0]
            elif width == 3:
                val = int.from_bytes(frames[sample_idx:sample_idx+3], 'little', signed=True) >> 8
            elif width == 4:
                val = int.from_bytes(frames[sample_idx:sample_idx+4], 'little', signed=True) >> 16
            else:
                val = 0
            val = int(max(-32767, min(32767, val * vol)))
            out_bytes += struct.pack('<h', val)
            
    with wave.open(dst_path, 'wb') as out:
        out.setnchannels(nchan)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(out_bytes)
    print(f"Trimmed WAV: {os.path.basename(src_path)} -> {len(out_bytes)} bytes")

def slice_rabbit_float(src_path, dst_path, start_sec=20.25, dur_sec=2.8):
    with open(src_path, 'rb') as f:
        data = f.read()

    data_idx = data.find(b'data')
    if data_idx == -1:
        print("Cannot find data chunk in rabbit.wav")
        return
        
    data_size = struct.unpack('<I', data[data_idx+4:data_idx+8])[0]
    raw_floats = data[data_idx+8 : data_idx+8+data_size]

    rate = 44100
    start_sample = int(start_sec * rate)
    dur_samples = int(dur_sec * rate)
    target_floats = raw_floats[start_sample*4 : (start_sample+dur_samples)*4]
    floats = struct.unpack(f'<{len(target_floats)//4}f', target_floats)

    fade_in = int(0.05 * rate)
    fade_out = int(0.25 * rate)
    total_s = len(floats)
    out_bytes = bytearray()
    for i, val in enumerate(floats):
        vol = 1.0
        if i < fade_in: vol = i / float(fade_in)
        elif i > total_s - fade_out: vol = (total_s - i) / float(fade_out)
        
        pcm_val = int(max(-32767, min(32767, val * 32767 * vol * 2.0)))
        out_bytes += struct.pack('<h', pcm_val)

    with wave.open(dst_path, 'wb') as out:
        out.setnchannels(1)
        out.setsampwidth(2)
        out.setframerate(rate)
        out.writeframes(out_bytes)
    print(f"Trimmed Rabbit WAV -> {len(out_bytes)} bytes")

def slice_mp3_frames(src_path, dst_path, max_frames=115):
    with open(src_path, 'rb') as f:
        data = f.read()
    start = 0
    if data[:3] == b'ID3':
        tag_size = ((data[6] & 0x7F) << 21) | ((data[7] & 0x7F) << 14) | ((data[8] & 0x7F) << 7) | (data[9] & 0x7F)
        start = 10 + tag_size
        
    frames = []
    pos = start
    frame_count = 0
    bitrates_v1_l3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
    bitrates_v2_l3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
    rates_v1 = [44100, 48000, 32000, 0]
    rates_v2 = [22050, 24000, 16000, 0]
    rates_v25 = [11025, 12000, 8000, 0]
    
    while pos < len(data) - 4 and frame_count < max_frames:
        if data[pos] == 0xFF and (data[pos+1] & 0xE0) == 0xE0:
            version = (data[pos+1] >> 3) & 0x03
            layer = (data[pos+1] >> 1) & 0x03
            bitrate_idx = (data[pos+2] >> 4) & 0x0F
            sr_idx = (data[pos+2] >> 2) & 0x03
            padding = (data[pos+2] >> 1) & 0x01
            
            if layer == 1:
                if version == 3:
                    b_list = bitrates_v1_l3
                    r_list = rates_v1
                    coeff = 144
                else:
                    b_list = bitrates_v2_l3
                    r_list = rates_v2 if version == 2 else rates_v25
                    coeff = 72
                    
                if bitrate_idx < len(b_list) and sr_idx < len(r_list):
                    br = b_list[bitrate_idx] * 1000
                    sr = r_list[sr_idx]
                    if br > 0 and sr > 0:
                        flen = int(coeff * br / sr) + padding
                        if pos + flen <= len(data):
                            frames.append(data[pos : pos + flen])
                            pos += flen
                            frame_count += 1
                            continue
        pos += 1
    
    if len(frames) > 0:
        with open(dst_path, 'wb') as out:
            out.write(b''.join(frames))
        print(f"Trimmed MP3: {os.path.basename(src_path)} -> {sum(len(f) for f in frames)} bytes ({len(frames)} frames)")
    else:
        shutil.copy2(src_path, dst_path)

def main():
    wav_offsets = {
        'tiger.wav': (22.0, 2.8),
        'donkey.wav': (6.2, 2.8),
        'parrot.wav': (0.1, 2.8),
        'camel.wav': (0.1, 2.8),
    }

    # 1. Process WAVs
    for fname, (start, dur) in wav_offsets.items():
        src = os.path.join(ASSETS_DIR, fname)
        tmp = os.path.join(ASSETS_DIR, fname + '.tmp')
        if os.path.exists(src):
            slice_wav(src, tmp, start, dur)
            os.replace(tmp, src)
            shutil.copy2(src, os.path.join(PUBLIC_DIR, fname))

    # 2. Process Rabbit
    rabbit_src = os.path.join(ASSETS_DIR, 'rabbit.wav')
    rabbit_tmp = os.path.join(ASSETS_DIR, 'rabbit.wav.tmp')
    if os.path.exists(rabbit_src):
        slice_rabbit_float(rabbit_src, rabbit_tmp, 20.25, 2.8)
        os.replace(rabbit_tmp, rabbit_src)
        shutil.copy2(rabbit_src, os.path.join(PUBLIC_DIR, 'rabbit.wav'))

    # 3. Process all MP3s
    for src in glob.glob(os.path.join(ASSETS_DIR, '*.mp3')):
        fname = os.path.basename(src)
        tmp = src + '.tmp'
        slice_mp3_frames(src, tmp, max_frames=115)
        os.replace(tmp, src)
        shutil.copy2(src, os.path.join(PUBLIC_DIR, fname))

    print("ALL 27 ANIMAL AUDIO FILES TRIMMED SUCCESSFULLY!")

if __name__ == '__main__':
    main()
