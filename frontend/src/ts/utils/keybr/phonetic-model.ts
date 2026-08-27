import { MODEL_EN_BASE64 } from "./model-data";
import { KEYBR_DICTIONARY } from "./dictionary";

export type CodePoint = number;

export type LetterInfo = {
  codePoint: CodePoint;
  char: string;
  frequency: number;
};

// Standard Keybr English letter frequency unlock sequence (starting with top 6: e, n, i, t, r, l)
export const KEYBR_ENGLISH_ORDER = [
  "e",
  "n",
  "i",
  "t",
  "r",
  "l",
  "s",
  "a",
  "u",
  "o",
  "d",
  "y",
  "c",
  "h",
  "g",
  "m",
  "p",
  "b",
  "k",
  "v",
  "w",
  "f",
  "z",
  "x",
  "q",
  "j",
] as const;

export const INITIAL_UNLOCKED_COUNT = 6; // e, n, i, t, r, l

export type Entry = {
  codePoint: CodePoint;
  frequency: number;
};

export type Segment = readonly Entry[];

export class Chain {
  readonly order: number;
  readonly alphabet: readonly CodePoint[];
  readonly size: number;
  readonly segments: number;
  readonly offsets: number[];
  readonly charToIndex: Map<CodePoint, number>;

  constructor(order: number, alphabet: readonly CodePoint[]) {
    this.order = order;
    this.alphabet = alphabet;
    this.size = this.alphabet.length;
    this.segments = Math.pow(this.size, this.order - 1);
    this.offsets = new Array<number>(order);
    for (let i = 0; i < order; i++) {
      this.offsets[i] = Math.pow(this.size, order - i - 1);
    }
    this.charToIndex = new Map();
    for (let i = 0; i < alphabet.length; i++) {
      const cp = alphabet[i];
      if (cp !== undefined) {
        this.charToIndex.set(cp, i);
      }
    }
  }

  segmentIndex(chain: readonly CodePoint[]): number {
    const { order, offsets } = this;
    const { length } = chain;
    let index = 0;
    for (let i = 0; i < order - 1; i++) {
      const pos = length - order + i + 1;
      const codePoint = (pos >= 0 ? chain[pos] : undefined) ?? 0x0020;
      const charIdx = this.charToIndex.get(codePoint) ?? 0;
      const offset = offsets[i + 1] ?? 1;
      index += charIdx * offset;
    }
    return index;
  }

  codePoint(index: number): CodePoint {
    return this.alphabet[index] ?? 0x0020;
  }

  index(codePoint: CodePoint): number {
    return this.charToIndex.get(codePoint) ?? 0;
  }
}

export class TransitionTable {
  readonly chain: Chain;
  readonly segments: readonly Segment[];

  constructor(chain: Chain, segments: readonly Segment[]) {
    this.chain = chain;
    this.segments = segments;
  }

  segment(chain: readonly CodePoint[]): Segment {
    const idx = this.chain.segmentIndex(chain);
    return this.segments[idx] ?? [];
  }

  static loadFromBuffer(buffer: Uint8Array): TransitionTable {
    let offset = 0;
    // Skip 9-byte signature "keybr.com"
    offset += 9;
    const order = buffer[offset++] ?? 4;
    const size = buffer[offset++] ?? 27;
    const alphabet: CodePoint[] = [];
    for (let i = 0; i < size; i++) {
      const high = buffer[offset++] ?? 0;
      const low = buffer[offset++] ?? 0;
      alphabet.push((high << 8) | low);
    }

    const chain = new Chain(order, alphabet);
    const segments: Segment[] = [];
    for (let segIdx = 0; segIdx < chain.segments; segIdx++) {
      const length = buffer[offset++] ?? 0;
      const segment: Entry[] = [];
      for (let e = 0; e < length; e++) {
        const charIdx = buffer[offset++] ?? 0;
        const frequency = buffer[offset++] ?? 0;
        segment.push({
          codePoint: chain.codePoint(charIdx),
          frequency,
        });
      }
      segments.push(segment);
    }

    return new TransitionTable(chain, segments);
  }
}

class Prefix {
  readonly codePoints: readonly CodePoint[];

  constructor(codePoints: readonly CodePoint[]) {
    this.codePoints = codePoints;
  }

  matches(allowedSet: Set<CodePoint>): boolean {
    return this.codePoints.every((cp) => allowedSet.has(cp));
  }
}

export class PrefixList {
  readonly map: Map<CodePoint, Prefix[]>;

  constructor(table: TransitionTable) {
    this.map = new Map();
    for (const cp of table.chain.alphabet) {
      this.map.set(cp, []);
    }

    const minLength = 3;
    const walk = (word: CodePoint[]): void => {
      for (const { codePoint } of table.segment(word)) {
        if (codePoint !== 0x0020) {
          word.push(codePoint);
          const prefix = new Prefix([...word]);
          for (const distinctCp of new Set(word)) {
            const list = this.map.get(distinctCp);
            if (list) {
              list.push(prefix);
            }
          }
          if (word.length < minLength) {
            walk(word);
          }
          word.pop();
        }
      }
    };

    walk([]);
  }

  findPrefixes(
    focusedCodePoint: CodePoint | null,
    allowedSet: Set<CodePoint>,
  ): Prefix[] {
    if (focusedCodePoint !== null) {
      const list = this.map.get(focusedCodePoint) ?? [];
      const matching = list.filter((p) => p.matches(allowedSet));
      if (matching.length > 0) {
        return matching;
      }
      return [new Prefix([focusedCodePoint])];
    }
    return [];
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

let cachedPhoneticEngine: {
  table: TransitionTable;
  prefixList: PrefixList;
} | null = null;

function getPhoneticEngine(): {
  table: TransitionTable;
  prefixList: PrefixList;
} {
  if (!cachedPhoneticEngine) {
    const buffer = base64ToUint8Array(MODEL_EN_BASE64);
    const table = TransitionTable.loadFromBuffer(buffer);
    const prefixList = new PrefixList(table);
    cachedPhoneticEngine = { table, prefixList };
  }
  return cachedPhoneticEngine;
}

export type WordGenOptions = {
  unlockedChars: string[];
  focusedChar?: string | null;
  minLength?: number;
  maxLength?: number;
  withCapitals?: boolean;
  withPunctuation?: boolean;
  wordCount?: number;
};

export function generateKeybrWord(
  unlockedChars: string[],
  focusedChar: string | null = null,
  minLength = 3,
  maxLength = 8,
): string {
  const { table, prefixList } = getPhoneticEngine();
  const allowedSet = new Set(
    unlockedChars.map((c) => c.toLowerCase().charCodeAt(0)),
  );
  allowedSet.add(0x0020);

  const focusedCodePoint =
    focusedChar !== null && focusedChar !== ""
      ? focusedChar.toLowerCase().charCodeAt(0)
      : null;
  const prefixes = prefixList.findPrefixes(focusedCodePoint, allowedSet);

  let word: CodePoint[] = [];
  let attempt = 0;

  const retry = (): boolean => {
    if (attempt < 6) {
      attempt++;
      word = [];
      if (prefixes.length > 0) {
        const randPrefix =
          prefixes[Math.floor(Math.random() * prefixes.length)];
        if (randPrefix !== undefined) {
          word.push(...randPrefix.codePoints);
        }
      } else if (focusedCodePoint !== null) {
        word.push(focusedCodePoint);
      }
      return true;
    }
    return false;
  };

  retry();

  for (let step = 0; step < 40; step++) {
    const entries = table
      .segment(word)
      .filter(({ codePoint }) => {
        if (codePoint === 0x0020) {
          return word.length >= minLength;
        }
        return allowedSet.has(codePoint);
      })
      .map(({ codePoint, frequency }) => {
        if (codePoint === 0x0020) {
          return {
            codePoint,
            frequency: frequency * Math.pow(1.3, word.length),
          };
        }
        return { codePoint, frequency };
      });

    if (entries.length === 0) {
      if (retry()) continue;
      break;
    }

    const totalWeight = entries.reduce((sum, e) => sum + e.frequency, 0);
    const r = Math.random() * totalWeight;
    let cum = 0;
    let chosen = entries[0]?.codePoint ?? 0x0020;
    for (const e of entries) {
      cum += e.frequency;
      if (r <= cum) {
        chosen = e.codePoint;
        break;
      }
    }

    if (chosen === 0x0020) {
      break;
    }

    if (word.length >= maxLength) {
      if (retry()) continue;
      break;
    }

    word.push(chosen);
  }

  if (word.length < minLength) {
    // Fallback if generated word was too short
    const pool =
      unlockedChars.length > 0 ? unlockedChars : ["e", "n", "i", "t", "r", "l"];
    let fallback = focusedChar ?? pool[0] ?? "e";
    while (fallback.length < minLength) {
      fallback += pool[Math.floor(Math.random() * pool.length)];
    }
    return fallback;
  }

  return String.fromCharCode(...word);
}

export function generateKeybrLessonWords(options: WordGenOptions): string[] {
  const count = options.wordCount ?? 35;
  const words: string[] = [];
  const minLen = options.minLength ?? 3;
  const maxLen = options.maxLength ?? 10;
  const punctuators = [".", ",", "!", "?", ";", ":", "-", "'", '"'];

  const allowedSet = new Set(options.unlockedChars.map((c) => c.toLowerCase()));
  const focusLower =
    options.focusedChar !== null && options.focusedChar !== undefined
      ? options.focusedChar.toLowerCase()
      : null;

  // Filter dictionary for natural English words matching current unlocked letters
  const validDictWords = KEYBR_DICTIONARY.filter((w) => {
    if (w.length < minLen || w.length > maxLen) return false;
    for (const char of w) {
      if (!allowedSet.has(char)) return false;
    }
    return true;
  });

  const focusedDictWords =
    focusLower !== null
      ? validDictWords.filter((w) => w.includes(focusLower))
      : validDictWords;

  const generalDictWords =
    focusLower !== null
      ? validDictWords.filter((w) => !w.includes(focusLower))
      : validDictWords;

  let lastWord = "";
  for (let i = 0; i < count; i++) {
    const shouldTargetFocus = focusLower !== null && Math.random() < 0.7;
    let word = "";

    // 1. Try to pick from dictionary
    if (shouldTargetFocus && focusedDictWords.length > 0) {
      let attempts = 0;
      do {
        word =
          focusedDictWords[
            Math.floor(Math.random() * focusedDictWords.length)
          ] ?? "";
        attempts++;
      } while (
        word === lastWord &&
        focusedDictWords.length > 1 &&
        attempts < 5
      );
    } else if (generalDictWords.length > 0) {
      let attempts = 0;
      do {
        word =
          generalDictWords[
            Math.floor(Math.random() * generalDictWords.length)
          ] ?? "";
        attempts++;
      } while (
        word === lastWord &&
        generalDictWords.length > 1 &&
        attempts < 5
      );
    } else if (validDictWords.length > 0) {
      word =
        validDictWords[Math.floor(Math.random() * validDictWords.length)] ?? "";
    }

    // 2. Fallback to Markov pseudo-word generator if not enough dictionary words
    if (word === "") {
      const targetFocus = shouldTargetFocus ? focusLower : null;
      word = generateKeybrWord(
        options.unlockedChars,
        targetFocus,
        minLen,
        maxLen,
      );
    }

    lastWord = word;

    // Apply capitalization if enabled
    if (options.withCapitals && Math.random() < 0.15) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Apply punctuation if enabled
    if (
      options.withPunctuation &&
      Math.random() < 0.12 &&
      punctuators.length > 0
    ) {
      const punct =
        punctuators[Math.floor(Math.random() * punctuators.length)] ?? ".";
      if (punct === '"' || punct === "'") {
        word = `${punct}${word}${punct}`;
      } else {
        word = `${word}${punct}`;
      }
    }

    words.push(word);
  }

  return words;
}
