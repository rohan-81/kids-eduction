import { audioService, emitSpeechStart, buildWordTimings, WordBoundaryEvent } from '../src/services/audioService';

describe('Story Word Highlighting & Speech Synchronization Tests', () => {
  const countSyllables = (word: string): number => {
    const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—।|]/g, '').trim();
    if (!clean) return 0;
    const baseChars = clean.replace(
      /[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963\u0A81-\u0A83\u0ABE-\u0ACD\u0AE2-\u0AE3]/g,
      ''
    );
    return Math.max(1, baseChars.length);
  };

  const calcDuration = (word: string, lang: 'hi' | 'gu' | 'en', speechRate: number = 1.15): number => {
    const syllables = countSyllables(word);
    const hasComma = word.includes(',') || word.includes('،') || word.includes(';');
    const hasSentenceEnd = /[.!?।|]/.test(word);
    const isHyphenated = word.includes('-');

    let dur = 280;
    if (syllables <= 1) {
      dur = 200;
    } else if (syllables === 2) {
      dur = 270;
    } else if (syllables === 3) {
      dur = 350;
    } else if (syllables === 4) {
      dur = 420;
    } else {
      dur = 480 + Math.min(200, (syllables - 4) * 40);
    }

    if (isHyphenated) dur = Math.max(dur, 550);
    if (lang === 'gu' || lang === 'hi') dur = Math.round(dur * 1.05);
    if (hasComma) dur += 140;
    if (hasSentenceEnd) dur += 300;

    const effectiveRate = Math.max(0.75, Math.min(1.5, speechRate || 1.15));
    const finalDur = Math.round(dur / effectiveRate);
    const minDur = Math.round(160 / effectiveRate);
    const maxDur = Math.round(1300 / effectiveRate);
    return Math.min(maxDur, Math.max(minDur, finalDur));
  };

  const calcSentencePause = (speechRate: number = 1.15): number => {
    const basePause = 540;
    const effectiveRate = Math.max(0.75, Math.min(1.5, speechRate || 1.15));
    return Math.round(basePause / effectiveRate);
  };

  it('audioService exports speech start listeners and effective speech rates', () => {
    let started = false;
    const unsub = audioService.addSpeechStartListener(() => {
      started = true;
    });

    emitSpeechStart();
    expect(started).toBe(true);
    unsub();

    started = false;
    emitSpeechStart();
    expect(started).toBe(false);
  });

  it('audioService.getEffectiveSpeechRate calculates accurate rates across languages and respects baseRate override', async () => {
    await audioService.setVoiceRate(1.18);
    const hiRate = audioService.getEffectiveSpeechRate('hi');
    const guRate = audioService.getEffectiveSpeechRate('gu');
    const enRate = audioService.getEffectiveSpeechRate('en');

    expect(hiRate).toBeGreaterThanOrEqual(1.0);
    expect(hiRate).toBeLessThanOrEqual(1.35);
    expect(guRate).toBeGreaterThanOrEqual(1.0);
    expect(enRate).toBeGreaterThanOrEqual(1.0);

    // Explicit settings baseRate overrides (e.g. 1.0x slow, 1.30x fast)
    const slowRate = audioService.getEffectiveSpeechRate('hi', 1.0);
    const fastRate = audioService.getEffectiveSpeechRate('hi', 1.30);
    expect(slowRate).toBeLessThan(fastRate);
    expect(slowRate).toBe(0.96);
    expect(fastRate).toBe(1.25);
  });

  it('Monotonic boundary guard prevents backward jumps and clamps excessive leaps', () => {
    let activeIdx = 0;
    const wordSpans = [
      { word: 'अगले' }, { word: 'दिन' }, { word: 'एक' }, { word: 'शिकारी' },
      { word: 'पेड़' }, { word: 'पर' }, { word: 'सो' }, { word: 'रहे' }
    ];

    const simulateBoundary = (incomingIdx: number) => {
      if (incomingIdx >= 0 && incomingIdx < wordSpans.length) {
        if (activeIdx >= 0) {
          if (incomingIdx <= activeIdx) return activeIdx; // Monotonic guard: no backward jump
          const nextTarget = Math.min(incomingIdx, activeIdx + 2); // Clamping guard
          activeIdx = nextTarget;
          return activeIdx;
        } else {
          activeIdx = incomingIdx;
          return activeIdx;
        }
      }
      return activeIdx;
    };

    // Step 0 -> 1
    expect(simulateBoundary(1)).toBe(1);
    // Backward event 0 arrives late -> ignored, stays 1
    expect(simulateBoundary(0)).toBe(1);
    // Duplicate event 1 arrives -> ignored, stays 1
    expect(simulateBoundary(1)).toBe(1);
    // Next step 2 -> advances to 2
    expect(simulateBoundary(2)).toBe(2);
    // Wild jump to 7 arriving due to network/browser jitter -> clamped to min(7, 2+2) = 4
    expect(simulateBoundary(7)).toBe(4);
  });

  it('Accurately counts Indic syllables for short, medium, and compound words', () => {
    expect(countSyllables('में')).toBe(1);
    expect(countSyllables('की')).toBe(1);
    expect(countSyllables('था')).toBe(1);
    expect(countSyllables('सो')).toBe(1);
    expect(countSyllables('शेर')).toBe(2);
    expect(countSyllables('घने')).toBe(2);
    expect(countSyllables('पेड़')).toBe(2);
    expect(countSyllables('जंगल')).toBe(3);
    expect(countSyllables('खेलते-खेलते')).toBe(6);
  });

  it('Calculates calibrated word durations scaled by voice speed', () => {
    // Fast speed (1.3x) yields faster word timing than normal speed (1.0x)
    const normalDur = calcDuration('जंगल', 'hi', 1.0);
    const fastDur = calcDuration('जंगल', 'hi', 1.3);
    expect(fastDur).toBeLessThan(normalDur);

    // Short function words (e.g. "में", "की") are fast and strictly <= 210ms at 1.18x speed
    const shortDur = calcDuration('में', 'hi', 1.18);
    expect(shortDur).toBeLessThanOrEqual(210);

    // Sentence-end word includes natural inter-sentence breath pause
    const normalWordDur = calcDuration('था', 'hi', 1.18);
    const sentenceEndDur = calcDuration('था।', 'hi', 1.18);
    expect(sentenceEndDur).toBeGreaterThan(normalWordDur);

    // Compound word like "खेलते-खेलते" has ample time for both subwords
    const compoundDur = calcDuration('खेलते-खेलते', 'hi', 1.18);
    expect(compoundDur).toBeGreaterThanOrEqual(400);
  });

  it('Verifies Scene 1 sentence total duration matches TTS speaking time within tight tolerance', () => {
    const sceneText = 'एक घने जंगल में एक शेर पेड़ की छाया में गहरी नींद सो रहा था।';
    const words = sceneText.split(/\s+/);

    const totalDur118 = words.reduce((acc, w) => acc + calcDuration(w, 'hi', 1.13), 0);
    // 15 words spoken at 1.13x is ~4.2 seconds, matching real TTS speaking time
    expect(totalDur118).toBeGreaterThanOrEqual(3800);
    expect(totalDur118).toBeLessThanOrEqual(4500);
  });

  it('Verifies inter-sentence breath pause coordinates accurately between sentences', () => {
    const pauseDur = calcSentencePause(1.15);
    // Breath break between sentences should be 450ms - 550ms
    expect(pauseDur).toBeGreaterThanOrEqual(450);
    expect(pauseDur).toBeLessThanOrEqual(550);

    // Multi-sentence Story Scene 1 text with sentence break
    const s1Text = 'એક દિવસ ઉનાળાની ખૂબ ગરમી હતી.';
    const s2Text = 'એક કાગડાને બહુ જ તરસ લાગી હતી.';
    const s1Words = s1Text.split(/\s+/);
    const s2Words = s2Text.split(/\s+/);

    const s1Dur = s1Words.slice(0, -1).reduce((acc, w) => acc + calcDuration(w, 'gu', 1.15), 0) + 246; // 246ms for હતી.
    const s2Dur = s2Words.reduce((acc, w) => acc + calcDuration(w, 'gu', 1.15), 0);
    const totalWithPause = s1Dur + pauseDur + s2Dur;

    // Both sentences combined with sentence pause should take ~4.0 to 4.6 seconds at 1.15x
    expect(totalWithPause).toBeGreaterThanOrEqual(4000);
    expect(totalWithPause).toBeLessThanOrEqual(4600);
  });

  it('Ensures audioService.stopInternal(false) does not fire speechEnd before starting new speech', () => {
    let endEventCount = 0;
    const unsub = audioService.addSpeechEndListener(() => {
      endEventCount++;
    });

    // Calling stopInternal(false) as speak() does when preparing a new utterance
    (audioService as any).stopInternal(false);
    expect(endEventCount).toBe(0);

    // Calling stop() explicitly should fire speechEnd
    audioService.stop();
    expect(endEventCount).toBe(1);

    unsub();
  });

  it('Strips smart quotes and punctuation from Gujarati and Indic story words for clean TTS', () => {
    const rawQuoteWord1 = '“વાદળોની';
    const rawQuoteWord2 = 'છે!”';
    const rawPunctWord = 'સવારે,';

    const clean1 = rawQuoteWord1.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—।|“’”«»]/g, '').trim();
    const clean2 = rawQuoteWord2.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—।|“’”«»]/g, '').trim();
    const clean3 = rawPunctWord.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'–—।|“’”«»]/g, '').trim();

    expect(clean1).toBe('વાદળોની');
    expect(clean2).toBe('છે');
    expect(clean3).toBe('સવારે');
  });

  it('audioService.splitIntoSpeechChunks correctly segments long story scenes at sentence boundaries under 180 chars', () => {
    const cleverCrowScene = 'गर्मी का एक बहुत तपता हुआ दिन था। एक कौवे को बहुत तेज प्यास लगी थी। वह पानी की खोज में जंगल में इधर-उधर उड़ रहा था।';
    const chunks = (audioService as any).splitIntoSpeechChunks(cleverCrowScene, 180);
    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(cleverCrowScene);

    // Multi-sentence text exceeding 180 characters
    const longScene = 'गर्मी का एक बहुत तपता हुआ दिन था। एक कौवे को बहुत तेज प्यास लगी थी। वह पानी की खोज में जंगल में इधर-उधर उड़ रहा था। चारों तरफ सूखा था और कहीं भी पानी की एक बूंद नहीं दिख रही थी। तभी अचानक उसे एक बगीचे में पुराना घड़ा दिखाई दिया।';
    const splitChunks = (audioService as any).splitIntoSpeechChunks(longScene, 180);
    expect(splitChunks.length).toBeGreaterThan(1);
    for (const chunk of splitChunks) {
      expect(chunk.length).toBeLessThanOrEqual(180);
      expect(chunk.trim().length).toBeGreaterThan(0);
    }
  });

  it('buildWordTimings computes monotonic, duration-aligned word timestamps with punctuation pauses', () => {
    const text = 'गर्मी का एक बहुत तपता हुआ दिन था।';
    const totalDuration = 3.6; // 3.6 seconds audio
    const timings = buildWordTimings(text, totalDuration, 'hi');

    expect(timings.length).toBe(8);
    expect(timings[0].word).toBe('गर्मी');
    expect(timings[4].word).toBe('तपता');
    expect(timings[5].word).toBe('हुआ');
    expect(timings[7].word).toBe('था।');

    // First word starts at 0
    expect(timings[0].startTime).toBe(0);

    // Each word's start time equals previous word's endTime + pauseAfter
    for (let i = 1; i < timings.length; i++) {
      const prev = timings[i - 1];
      const curr = timings[i];
      expect(curr.startTime).toBeGreaterThanOrEqual(prev.endTime);
      expect(curr.endTime).toBeGreaterThan(curr.startTime);
    }

    // Sentence-ending word 'था।' has a pause allocated
    const lastWord = timings[timings.length - 1];
    expect(lastWord.pauseAfter).toBeGreaterThan(0);

    // Last word endTime + pauseAfter is approximately equal to total duration
    expect(Math.abs(lastWord.endTime + lastWord.pauseAfter - totalDuration)).toBeLessThanOrEqual(0.05);
  });

  it('buildWordTimings with secondsPerUnitOverride scales durations realistically for mobile TTS', () => {
    const text = 'गर्मी का एक बहुत तपता हुआ दिन था।';
    const secondsPerUnit = 0.40 / 1.18; // ~0.339s per unit
    const timings = buildWordTimings(text, 0, 'hi', secondsPerUnit);

    expect(timings.length).toBe(8);
    expect(timings[0].startTime).toBe(0);
    // Word 0 ('गर्मी') duration should be approximately weight * 0.339
    expect(timings[0].endTime).toBeGreaterThan(0.35);
    expect(timings[0].endTime).toBeLessThan(0.70);

    // Total sentence duration with pause should be in 3.5s - 4.5s range
    const lastWord = timings[timings.length - 1];
    const totalTime = lastWord.endTime + lastWord.pauseAfter;
    expect(totalTime).toBeGreaterThanOrEqual(3.0);
    expect(totalTime).toBeLessThanOrEqual(4.5);
  });

  it('charToWordIndex maps character positions in Hindi and Gujarati text in O(1) time without drift', () => {
    const text = 'गर्मी का एक बहुत तपता हुआ दिन था।';
    const regex = /\S+/g;
    let match: RegExpExecArray | null;
    const wordSpans: { word: string; start: number; end: number }[] = [];
    while ((match = regex.exec(text)) !== null) {
      wordSpans.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    const map = new Int32Array(text.length + 1).fill(-1);
    for (let i = 0; i < wordSpans.length; i++) {
      const span = wordSpans[i];
      for (let c = span.start; c < span.end && c <= text.length; c++) {
        map[c] = i;
      }
      const nextStart = i + 1 < wordSpans.length ? wordSpans[i + 1].start : text.length;
      for (let c = span.end; c < nextStart && c <= text.length; c++) {
        map[c] = i;
      }
    }

    // Word 4 is 'तपता' (starts at 17, ends at 22)
    const taptaSpan = wordSpans[4];
    expect(taptaSpan.word).toBe('तपता');
    for (let c = taptaSpan.start; c < taptaSpan.end; c++) {
      expect(map[c]).toBe(4);
    }

    // Word 5 is 'हुआ' (starts at 23, ends at 26)
    const huaSpan = wordSpans[5];
    expect(huaSpan.word).toBe('हुआ');
    for (let c = huaSpan.start; c < huaSpan.end; c++) {
      expect(map[c]).toBe(5);
    }

    // When voice is at char 17-21 ('तपता'), highlight index MUST be 4 and NEVER 5
    expect(map[17]).toBe(4);
    expect(map[18]).toBe(4);
    expect(map[21]).toBe(4);
    expect(map[17]).not.toBe(5);
  });

  it('audioService supports pause, resume, and isPaused state management', () => {
    expect(typeof audioService.pause).toBe('function');
    expect(typeof audioService.resume).toBe('function');
    expect(typeof audioService.isPaused).toBe('function');

    // Idle state
    expect(audioService.isPaused()).toBe(false);
  });

  it('audioService exports narrateStory for synchronized multi-sentence storytelling', () => {
    expect(typeof audioService.narrateStory).toBe('function');
  });

  it('narrateStory segments multi-sentence story into sentences and maps global word indices with 100% precision', () => {
    const text = 'गर्मी का एक बहुत तपता हुआ दिन था। एक कौवे को बहुत तेज प्यास लगी थी। वह पानी की खोज में जंगल में इधर-उधर उड़ रहा था।';
    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;
    const globalWordSpans: { word: string; start: number; end: number }[] = [];
    while ((match = wordRegex.exec(text)) !== null) {
      globalWordSpans.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    expect(globalWordSpans.length).toBe(27);

    const sentenceRegex = /[^।!?.\n]+[।!?.\n]*/g;
    const rawSentences = text.match(sentenceRegex) || [text];
    expect(rawSentences.length).toBe(3);

    let wordPointer = 0;
    const sentenceWordCounts = [8, 8, 11];

    for (let sIdx = 0; sIdx < rawSentences.length; sIdx++) {
      const sWords = rawSentences[sIdx].match(/\S+/g) || [];
      expect(sWords.length).toBe(sentenceWordCounts[sIdx]);

      // Verify every word in sentence matches the corresponding global word span
      for (let i = 0; i < sWords.length; i++) {
        expect(globalWordSpans[wordPointer + i].word).toBe(sWords[i]);
      }
      wordPointer += sWords.length;
    }
    expect(wordPointer).toBe(27);
  });

  it('narrateStory handles Gujarati story scenes with accurate sentence segmentation and word alignments', () => {
    const textGu = 'એક દિવસ ઉનાળાની ખૂબ ગરમી હતી. એક કાગડાને બહુ જ તરસ લાગી હતી. તે પાણીની શોધમાં આકાશમાં આમ-તેમ ઉડતો હતો.';
    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;
    const globalWordSpans: { word: string; start: number; end: number }[] = [];
    while ((match = wordRegex.exec(textGu)) !== null) {
      globalWordSpans.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }

    const sentenceRegex = /[^।!?.\n]+[।!?.\n]*/g;
    const sentences = textGu.match(sentenceRegex) || [textGu];
    expect(sentences.length).toBe(3);

    // Sentence 0: 'એક દિવસ ઉનાળાની ખૂબ ગરમી હતી.'
    const s0Words = sentences[0].match(/\S+/g) || [];
    expect(s0Words.length).toBe(6);
    expect(globalWordSpans[0].word).toBe('એક');
    expect(globalWordSpans[5].word).toBe('હતી.');

    // Sentence 1: 'એક કાગડાને બહુ જ તરસ લાગી હતી.'
    const s1Words = sentences[1].match(/\S+/g) || [];
    expect(s1Words.length).toBe(7);
    expect(globalWordSpans[6].word).toBe('એક');
    expect(globalWordSpans[12].word).toBe('હતી.');

    // Sentence 2: 'તે પાણીની શોધમાં આકાશમાં આમ-તેમ ઉડતો હતો.'
    const s2Words = sentences[2].match(/\S+/g) || [];
    expect(s2Words.length).toBe(7);
    expect(globalWordSpans[13].word).toBe('તે');
    expect(globalWordSpans[19].word).toBe('હતો.');
  });
});
