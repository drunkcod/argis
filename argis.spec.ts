import { describe, expect, it, test } from '@jest/globals';
import { ArgumentError, argNotNil, isNil, isNotNil } from './';

describe('isNil', () => {
    test('null', () => expect(isNil(null)).toBe(true));
    test('undefined', () => expect(isNil(void 0)).toBe(true));
    test('{}', () => expect(isNil({})).toBe(false));
});

describe('isNotNil', () => {
    test('x', () => expect(isNotNil({})).toBe(true));
    test('x.value', () => expect(isNotNil({ value: 42}, 'value')).toBe(true));
    test('x.null', () => expect(isNotNil({ null: null}, 'null')).toBe(false));
});

describe('argNotNil', () => {
    it('rases ArgumentError on null', () => {
        expect(() => {
            argNotNil({ x: null as unknown as string}, 'x')
        }).toThrow(ArgumentError)
    });
    it('rases ArgumentError on undefined', () => {
        expect(() => {
            argNotNil({ x: undefined as unknown as string}, 'x')
        }).toThrow(ArgumentError)
    });
})