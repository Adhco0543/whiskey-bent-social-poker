const test = require('node:test');
const assert = require('node:assert/strict');
const { PokerEngine } = require('../dist/index.js');

const rank = (cards) => PokerEngine.evaluateBestHand(cards);

test('every hand category is recognized', () => {
  const examples = [
    ['Ah', 'Kd', '9c', '6h', '2s'],
    ['Ah', 'Ad', '9c', '6h', '2s'],
    ['Ah', 'Ad', '9c', '9h', '2s'],
    ['Ah', 'Ad', 'Ac', '9h', '2s'],
    ['5h', '4d', '3c', '2s', 'Ah'],
    ['Ah', 'Jh', '9h', '6h', '2h'],
    ['Ah', 'Ad', 'Ac', '9h', '9s'],
    ['Ah', 'Ad', 'Ac', 'As', '9h'],
    ['9h', '8h', '7h', '6h', '5h'],
    ['Ah', 'Kh', 'Qh', 'Jh', '10h'],
  ];
  examples.forEach((cards, i) => assert.equal(rank(cards).category, i));
});

test('wheel is five high and loses to a six high straight', () => {
  const wheel = rank(['Ah', '2c', '3d', '4s', '5h']);
  const six = rank(['2h', '3c', '4d', '5s', '6h']);
  assert.deepEqual(wheel.score, [4, 5]);
  assert.equal(PokerEngine.compareHands(wheel, six), -1);
});

test('higher kicker beats lower kicker on equal category', () => {
  const a = rank(['Ah', 'Ad', 'Kh', '7s', '2c']);
  const b = rank(['As', 'Ac', 'Qh', '7d', '2s']);
  assert.equal(PokerEngine.compareHands(a, b), 1);
});

test('split pots evaluate equally with different suits', () => {
  const a = rank(['Ah', 'Kd', 'Qc', 'Js', '9h']);
  const b = rank(['As', 'Kc', 'Qd', 'Jh', '9c']);
  assert.equal(PokerEngine.compareHands(a, b), 0);
});

test('best five of seven can use board plus hole cards', () => {
  assert.deepEqual(
    rank(['2d', '3c', 'Th', 'Jh', 'Qh', 'Kh', '9h']).score,
    [8, 13],
  );
});

test('Omaha requires exactly two hole cards', () => {
  const hand = PokerEngine.evaluateOmaha(
    ['Ah', 'Ad', 'Ac', 'As'],
    ['Kh', 'Qh', 'Jh', 'Th', '9h'],
  );
  assert.equal(hand.category, 1);
});

test('Omaha can make a straight flush with two hole cards', () => {
  const hand = PokerEngine.evaluateOmaha(
    ['Ah', 'Kh', '2s', '3d'],
    ['Qh', 'Jh', 'Th', '2c', '4d'],
  );
  assert.equal(hand.category, 9);
});

test('reject invalid or duplicated cards', () => {
  assert.throws(() => rank(['Ah', 'Ah', 'Kh', 'Qh', 'Jh']), /Duplicate/);
  assert.throws(() => rank(['Xh', '2d', '3s', '4c', '5h']), /Invalid/);
  assert.throws(() => rank(['Ah', 'Kh', 'Qh', 'Jh']), /5 to 7/);
});

test('pot only accepts finite non-negative integer units', () => {
  assert.equal(PokerEngine.calculatePot([25, 25, 50]), 100);
  assert.throws(() => PokerEngine.calculatePot([-1, 5]), /non-negative/);
  assert.throws(() => PokerEngine.calculatePot([1.2]), /non-negative/);
});
