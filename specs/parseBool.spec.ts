import { describe, expect, it, test } from '@jest/globals';
import { isBool, parseBool } from '../parseBool.js';

describe('parseBool', () => {
	const boolsy = [
		['true', true],
		['True', true],
		['TRUE', true],
		['t', true],
		['T', true],
		['1', true],
		['yes', true],
		['YES', true],
		['y', true],
		['Y', true],
		['on', true],
		['ON', true],
		['false', false],
		['False', false],
		['FALSE', false],
		['f', false],
		['F', false],
		['0', false],
		['no', false],
		['NO', false],
		['n', false],
		['N', false],
		['off', false],
		['OFF', false],
		[' true', true],
		['false ', false],
		['  true  ', true],
		['', null],
		['garbage', null],
		['trueish', null],
		[null as any, null],
		[undefined as any, null],
	] satisfies [string, boolean | null][];
	test.each(boolsy.map(([input, expected]) => ({ input, expected })))('returns $expected for $input', ({ input, expected }) => {
		expect(parseBool(input)).toEqual(expected);
	});
});

describe('isBool', () => {
	it('returns true for true', () => {
		expect(isBool(true)).toBe(true);
	});
	it('returns true for false', () => {
		expect(isBool(false)).toBe(true);
	});
	it('returns false for null', () => {
		expect(isBool(null)).toBe(false);
	});
});
