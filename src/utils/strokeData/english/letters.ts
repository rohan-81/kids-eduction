import { CharacterStrokeDefinition } from '../types';
import { sampleCurve, interpolatePoints, makeLoop, createStroke } from '../strokeSampler';

/**
 * Authentic English Alphabet Uppercase (A to Z) with correct stroke definitions.
 */
export const ENGLISH_LETTERS: Record<string, CharacterStrokeDefinition> = {
  'A': {
    character: 'A',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 50, y: 24 },
      { x: 30, y: 86 },
    ],
    [
      { x: 50, y: 24 },
      { x: 70, y: 86 },
    ],
    [
      { x: 38, y: 62 },
      { x: 62, y: 62 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_a_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter A stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 50, y: 24 },
      { x: 30, y: 86 },
    ],
    [
      { x: 50, y: 24 },
      { x: 70, y: 86 },
    ],
    [
      { x: 38, y: 62 },
      { x: 62, y: 62 },
    ],
    ]).length,
    metadata: { phonetic: 'A', transliteration: 'A' },
  },
  'B': {
    character: 'B',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 66, y: 40 },
      { x: 50, y: 52 },
      { x: 34, y: 52 },
    ]),
    sampleCurve([
      { x: 34, y: 52 },
      { x: 66, y: 52 },
      { x: 70, y: 70 },
      { x: 54, y: 86 },
      { x: 34, y: 86 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_b_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter B stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 66, y: 40 },
      { x: 50, y: 52 },
      { x: 34, y: 52 },
    ]),
    sampleCurve([
      { x: 34, y: 52 },
      { x: 66, y: 52 },
      { x: 70, y: 70 },
      { x: 54, y: 86 },
      { x: 34, y: 86 },
    ]),
    ]).length,
    metadata: { phonetic: 'B', transliteration: 'B' },
  },
  'C': {
    character: 'C',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([sampleCurve([
      { x: 68, y: 34 },
      { x: 50, y: 24 },
      { x: 32, y: 42 },
      { x: 32, y: 68 },
      { x: 50, y: 86 },
      { x: 68, y: 76 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_c_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter C stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([sampleCurve([
      { x: 68, y: 34 },
      { x: 50, y: 24 },
      { x: 32, y: 42 },
      { x: 32, y: 68 },
      { x: 50, y: 86 },
      { x: 68, y: 76 },
    ]),
    ]).length,
    metadata: { phonetic: 'C', transliteration: 'C' },
  },
  'D': {
    character: 'D',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 56, y: 24 },
      { x: 72, y: 44 },
      { x: 72, y: 66 },
      { x: 56, y: 86 },
      { x: 34, y: 86 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_d_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter D stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 56, y: 24 },
      { x: 72, y: 44 },
      { x: 72, y: 66 },
      { x: 56, y: 86 },
      { x: 34, y: 86 },
    ]),
    ]).length,
    metadata: { phonetic: 'D', transliteration: 'D' },
  },
  'E': {
    character: 'E',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 34, y: 24 },
      { x: 68, y: 24 },
    ],
    [
      { x: 34, y: 54 },
      { x: 60, y: 54 },
    ],
    [
      { x: 34, y: 86 },
      { x: 68, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_e_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter E stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 34, y: 24 },
      { x: 68, y: 24 },
    ],
    [
      { x: 34, y: 54 },
      { x: 60, y: 54 },
    ],
    [
      { x: 34, y: 86 },
      { x: 68, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'E', transliteration: 'E' },
  },
  'F': {
    character: 'F',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 34, y: 24 },
      { x: 68, y: 24 },
    ],
    [
      { x: 34, y: 54 },
      { x: 58, y: 54 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_f_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter F stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 34, y: 24 },
      { x: 68, y: 24 },
    ],
    [
      { x: 34, y: 54 },
      { x: 58, y: 54 },
    ],
    ]).length,
    metadata: { phonetic: 'F', transliteration: 'F' },
  },
  'G': {
    character: 'G',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([sampleCurve([
      { x: 68, y: 34 },
      { x: 50, y: 24 },
      { x: 32, y: 42 },
      { x: 32, y: 68 },
      { x: 50, y: 86 },
      { x: 68, y: 86 },
      { x: 68, y: 56 },
      { x: 52, y: 56 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_g_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter G stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([sampleCurve([
      { x: 68, y: 34 },
      { x: 50, y: 24 },
      { x: 32, y: 42 },
      { x: 32, y: 68 },
      { x: 50, y: 86 },
      { x: 68, y: 86 },
      { x: 68, y: 56 },
      { x: 52, y: 56 },
    ]),
    ]).length,
    metadata: { phonetic: 'G', transliteration: 'G' },
  },
  'H': {
    character: 'H',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 66, y: 24 },
      { x: 66, y: 86 },
    ],
    [
      { x: 34, y: 55 },
      { x: 66, y: 55 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_h_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter H stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 66, y: 24 },
      { x: 66, y: 86 },
    ],
    [
      { x: 34, y: 55 },
      { x: 66, y: 55 },
    ],
    ]).length,
    metadata: { phonetic: 'H', transliteration: 'H' },
  },
  'I': {
    character: 'I',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 50, y: 24 },
      { x: 50, y: 86 },
    ],
    [
      { x: 36, y: 24 },
      { x: 64, y: 24 },
    ],
    [
      { x: 36, y: 86 },
      { x: 64, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_i_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter I stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 50, y: 24 },
      { x: 50, y: 86 },
    ],
    [
      { x: 36, y: 24 },
      { x: 64, y: 24 },
    ],
    [
      { x: 36, y: 86 },
      { x: 64, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'I', transliteration: 'I' },
  },
  'J': {
    character: 'J',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([sampleCurve([
      { x: 36, y: 24 },
      { x: 64, y: 24 },
    ]),
    sampleCurve([
      { x: 54, y: 24 },
      { x: 54, y: 72 },
      { x: 44, y: 86 },
      { x: 32, y: 76 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_j_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter J stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([sampleCurve([
      { x: 36, y: 24 },
      { x: 64, y: 24 },
    ]),
    sampleCurve([
      { x: 54, y: 24 },
      { x: 54, y: 72 },
      { x: 44, y: 86 },
      { x: 32, y: 76 },
    ]),
    ]).length,
    metadata: { phonetic: 'J', transliteration: 'J' },
  },
  'K': {
    character: 'K',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 66, y: 26 },
      { x: 36, y: 56 },
      { x: 68, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_k_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter K stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    [
      { x: 66, y: 26 },
      { x: 36, y: 56 },
      { x: 68, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'K', transliteration: 'K' },
  },
  'L': {
    character: 'L',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 36, y: 24 },
      { x: 36, y: 86 },
      { x: 68, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_l_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter L stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 36, y: 24 },
      { x: 36, y: 86 },
      { x: 68, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'L', transliteration: 'L' },
  },
  'M': {
    character: 'M',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 32, y: 86 },
      { x: 32, y: 24 },
      { x: 50, y: 58 },
      { x: 68, y: 24 },
      { x: 68, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_m_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter M stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 32, y: 86 },
      { x: 32, y: 24 },
      { x: 50, y: 58 },
      { x: 68, y: 24 },
      { x: 68, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'M', transliteration: 'M' },
  },
  'N': {
    character: 'N',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 86 },
      { x: 34, y: 24 },
      { x: 66, y: 86 },
      { x: 66, y: 24 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_n_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter N stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 86 },
      { x: 34, y: 24 },
      { x: 66, y: 86 },
      { x: 66, y: 24 },
    ],
    ]).length,
    metadata: { phonetic: 'N', transliteration: 'N' },
  },
  'O': {
    character: 'O',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([makeLoop(50, 55, 20, 29, -Math.PI / 2, Math.PI * 2, 28),
      ]).map((pts, idx) => createStroke(
        `en_letter_o_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter O stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([makeLoop(50, 55, 20, 29, -Math.PI / 2, Math.PI * 2, 28),
    ]).length,
    metadata: { phonetic: 'O', transliteration: 'O' },
  },
  'P': {
    character: 'P',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 68, y: 40 },
      { x: 54, y: 56 },
      { x: 34, y: 56 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_p_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter P stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 68, y: 40 },
      { x: 54, y: 56 },
      { x: 34, y: 56 },
    ]),
    ]).length,
    metadata: { phonetic: 'P', transliteration: 'P' },
  },
  'Q': {
    character: 'Q',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([makeLoop(50, 52, 20, 27, -Math.PI / 2, Math.PI * 2, 28),
    [
      { x: 54, y: 64 },
      { x: 72, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_q_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter Q stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([makeLoop(50, 52, 20, 27, -Math.PI / 2, Math.PI * 2, 28),
    [
      { x: 54, y: 64 },
      { x: 72, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'Q', transliteration: 'Q' },
  },
  'R': {
    character: 'R',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 68, y: 40 },
      { x: 54, y: 56 },
      { x: 34, y: 56 },
    ]),
    [
      { x: 50, y: 56 },
      { x: 68, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_r_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter R stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 34, y: 24 },
      { x: 34, y: 86 },
    ],
    sampleCurve([
      { x: 34, y: 24 },
      { x: 62, y: 24 },
      { x: 68, y: 40 },
      { x: 54, y: 56 },
      { x: 34, y: 56 },
    ]),
    [
      { x: 50, y: 56 },
      { x: 68, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'R', transliteration: 'R' },
  },
  'S': {
    character: 'S',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([sampleCurve([
      { x: 66, y: 34 },
      { x: 50, y: 24 },
      { x: 34, y: 36 },
      { x: 44, y: 52 },
      { x: 66, y: 64 },
      { x: 52, y: 84 },
      { x: 34, y: 78 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_s_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter S stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([sampleCurve([
      { x: 66, y: 34 },
      { x: 50, y: 24 },
      { x: 34, y: 36 },
      { x: 44, y: 52 },
      { x: 66, y: 64 },
      { x: 52, y: 84 },
      { x: 34, y: 78 },
    ]),
    ]).length,
    metadata: { phonetic: 'S', transliteration: 'S' },
  },
  'T': {
    character: 'T',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 30, y: 24 },
      { x: 70, y: 24 },
    ],
    [
      { x: 50, y: 24 },
      { x: 50, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_t_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter T stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 30, y: 24 },
      { x: 70, y: 24 },
    ],
    [
      { x: 50, y: 24 },
      { x: 50, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'T', transliteration: 'T' },
  },
  'U': {
    character: 'U',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([sampleCurve([
      { x: 34, y: 24 },
      { x: 34, y: 68 },
      { x: 50, y: 86 },
      { x: 66, y: 68 },
      { x: 66, y: 24 },
    ]),
      ]).map((pts, idx) => createStroke(
        `en_letter_u_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter U stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([sampleCurve([
      { x: 34, y: 24 },
      { x: 34, y: 68 },
      { x: 50, y: 86 },
      { x: 66, y: 68 },
      { x: 66, y: 24 },
    ]),
    ]).length,
    metadata: { phonetic: 'U', transliteration: 'U' },
  },
  'V': {
    character: 'V',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 32, y: 24 },
      { x: 50, y: 86 },
      { x: 68, y: 24 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_v_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter V stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 32, y: 24 },
      { x: 50, y: 86 },
      { x: 68, y: 24 },
    ],
    ]).length,
    metadata: { phonetic: 'V', transliteration: 'V' },
  },
  'W': {
    character: 'W',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 28, y: 24 },
      { x: 40, y: 86 },
      { x: 50, y: 48 },
      { x: 60, y: 86 },
      { x: 72, y: 24 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_w_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter W stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 28, y: 24 },
      { x: 40, y: 86 },
      { x: 50, y: 48 },
      { x: 60, y: 86 },
      { x: 72, y: 24 },
    ],
    ]).length,
    metadata: { phonetic: 'W', transliteration: 'W' },
  },
  'X': {
    character: 'X',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 32, y: 24 },
      { x: 68, y: 86 },
    ],
    [
      { x: 68, y: 24 },
      { x: 32, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_x_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter X stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 32, y: 24 },
      { x: 68, y: 86 },
    ],
    [
      { x: 68, y: 24 },
      { x: 32, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'X', transliteration: 'X' },
  },
  'Y': {
    character: 'Y',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 32, y: 24 },
      { x: 50, y: 54 },
      { x: 68, y: 24 },
    ],
    [
      { x: 50, y: 54 },
      { x: 50, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_y_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter Y stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 32, y: 24 },
      { x: 50, y: 54 },
      { x: 68, y: 24 },
    ],
    [
      { x: 50, y: 54 },
      { x: 50, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'Y', transliteration: 'Y' },
  },
  'Z': {
    character: 'Z',
    language: 'en',
    category: 'consonant',
    strokes: [
      ...([[
      { x: 32, y: 24 },
      { x: 68, y: 24 },
      { x: 32, y: 86 },
      { x: 68, y: 86 },
    ],
      ]).map((pts, idx) => createStroke(
        `en_letter_z_s${idx + 1}`,
        idx + 1,
        pts,
        'forward',
        `Letter Z stroke ${idx + 1}`
      )),
    ],
    totalStrokes: ([[
      { x: 32, y: 24 },
      { x: 68, y: 24 },
      { x: 32, y: 86 },
      { x: 68, y: 86 },
    ],
    ]).length,
    metadata: { phonetic: 'Z', transliteration: 'Z' },
  },
};
