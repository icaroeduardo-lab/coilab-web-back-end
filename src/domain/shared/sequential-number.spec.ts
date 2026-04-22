import { generateNextNumber } from './sequential-number';

describe('generateNextNumber', () => {
  const year = new Date().getFullYear();

  it('starts at 0001 when no previous number', () => {
    expect(generateNextNumber(null)).toBe(`#${year}0001`);
  });

  it('increments sequence within same year', () => {
    expect(generateNextNumber(`#${year}0001`)).toBe(`#${year}0002`);
    expect(generateNextNumber(`#${year}0099`)).toBe(`#${year}0100`);
  });

  it('resets to 0001 on new year', () => {
    expect(generateNextNumber(`#${year - 1}0099`)).toBe(`#${year}0001`);
  });

  it('pads sequence with leading zeros', () => {
    expect(generateNextNumber(`#${year}0009`)).toBe(`#${year}0010`);
  });
});
