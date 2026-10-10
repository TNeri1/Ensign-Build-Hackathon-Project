import { describe, it, expect } from 'vitest';
import { editDistance, scoreAnswer, stem, wordsMatch } from './answerMatch';

const v = (expected: string, given: string, mode: 'contains' | 'exact' = 'contains') => scoreAnswer(mode, expected, given).verdict;

describe('real near-misses now match', () => {
  it('typo + plural + omitted filler word (reported case)', () => {
    expect(v('American Mountain Guide Association logo', 'American mountain guides assosiation')).toBe('match');
  });
  it.each([
    ['golden retriever on a beach', 'my golden retreiver at the beach'],   // transposed letters
    ['cracked top-left corner', 'top left corner is cracked'],             // word order
    ['clear case with a green sticker', 'Clear case, green sticker on the back'],
    ['red leather folio', 'red leather folios'],                            // plural
    ['Starbucks gift card', 'a starbuck giftcard'],                         // joined words + missing s
    ['Priya Raman', 'priya ramen'],                                         // one-letter typo in a name
    ['scratched screen', 'the screen is scratched'],
    ["kids' drawings", 'kids drawing'],                                     // possessive + plural
  ])('%s ~ %s', (expected, given) => {
    expect(v(expected, given)).toBe('match');
  });
});

describe('still rejects different answers', () => {
  it.each([
    ['iPhone 14', 'iPhone 13'],                 // numbers are exact
    ['Pixel 7', 'Pixel 8'],
    ['golden retriever on a beach', 'cat in a sweater'],
    ['black', 'blue'],
    ['cat', 'car'],                             // short words: no typo tolerance
    ['Priya Raman', 'Marcus Webb'],
    ['clear case', ''],
  ])('%s vs %s', (expected, given) => {
    expect(v(expected, given)).toBe('differs');
  });
});

describe('close: partly right answers are flagged for a careful look', () => {
  it('half the details', () => {
    expect(v('golden retriever on a beach', 'a dog on a beach')).toBe('close');
    expect(v('American Mountain Guide Association logo', 'some mountain association')).toBe('close');
  });
  it('a single vague word is not close for a long description', () => {
    expect(v('clear case with a green sticker and a crack', 'case')).toBe('differs');
  });
});

describe('exact mode (numbers, codes, dates)', () => {
  it('compares numbers by value, everything else strictly', () => {
    expect(v('40', '$40', 'exact')).toBe('match');
    expect(v('40', '40.00', 'exact')).toBe('differs'); // "40 00" is two tokens; staff still see both
    expect(v('1990-05-12', '1990 5 12', 'exact')).toBe('match');
    expect(v('AB12', 'ab12', 'exact')).toBe('match');
    expect(v('AB12', 'AB13', 'exact')).toBe('differs');
    expect(v('5', '6', 'exact')).toBe('differs');
  });
});

describe('building blocks', () => {
  it('stem', () => {
    expect(stem('guides')).toBe('guide');
    expect(stem('stories')).toBe('story');
    expect(stem('cracked')).toBe('crack');
    expect(stem('drawings')).toBe(stem('drawing'));
    expect(stem('boxes')).toBe('box');
    expect(stem('glass')).toBe('glass');
    expect(stem('42')).toBe('42');
  });
  it('editDistance with transpositions and early exit', () => {
    expect(editDistance('association', 'assosiation')).toBe(1);
    expect(editDistance('retriever', 'retreiver')).toBe(1);
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('abc', 'xyzxyz', 1)).toBe(2);
  });
  it('wordsMatch: tolerance grows with word length, numbers by value', () => {
    expect(wordsMatch('assosiation', 'association')).toBe(true);
    expect(wordsMatch('ramen', 'raman')).toBe(true);
    expect(wordsMatch('cat', 'car')).toBe(false);
    expect(wordsMatch('07', '7')).toBe(true);
    expect(wordsMatch('14', '13')).toBe(false);
  });
});
