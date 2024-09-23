import { describe, expect, it, test } from '@jest/globals';
import { ArgumentError, argNotNil, isNil, isNotNil, assertOwn, assertNotNil, intOrUndefined } from './index';

describe('isNil', () => {
    test('null', () => expect(isNil(null)).toBe(true));
    test('undefined', () => expect(isNil(void 0)).toBe(true));
    test('{}', () => expect(isNil({})).toBe(false));
    test('x.value is nil', () => expect(isNil({ value: null }, 'value')).toBe(true));
    test('x.value is not nil', () => expect(isNil({ value: 42 }, 'value')).toBe(false));
    test('x.value when x is nil', () => expect(isNil(null as unknown as ({ value: string }), 'value')).toBe(true));
});

describe('isNotNil', () => {
    test('x', () => expect(isNotNil({})).toBe(true));
    test('x.value', () => expect(isNotNil({ value: 42}, 'value')).toBe(true));
    test('x.null', () => expect(isNotNil({ null: null}, 'null')).toBe(false));
});

describe('argNotNil', () => {
    it('raise ArgumentError on null', () => {
        expect(() => argNotNil({ x: null as unknown as string}, 'x')).toThrow(ArgumentError)
    });
    it('rases ArgumentError on undefined', () => {
        expect(() => argNotNil({ x: undefined as unknown as string}, 'x')).toThrow(ArgumentError)
    });
});

describe('assertOwn', () => {
    it('raise ArgumentError if missing', () => {
        expect(() => assertOwn({}, 'missing')).toThrow(ArgumentError);
    });
    it('raise ArgumentError if not own', () => {
        expect(() => assertOwn({}, 'toString')).toThrow(ArgumentError);
    });
    it('narrows type', () => {
        const x = { message: 'hello world'} as object;
        assertOwn(x, 'message');
        expect(x.message).toEqual('hello world');
    });
});

describe('assertNotNil', () => {
    it('raises ArgumentError on null', () => {
        expect(() => assertNotNil(null as unknown as object)).toThrow();
    });
    it('raises ArgumentError on undefined', () => {
        expect(() => assertNotNil(undefined)).toThrow();
    });
})

describe('intOrUndefined', () => {
    test("valid string", () => expect(intOrUndefined("42")).toEqual(42));
    test("empty string", () => expect(intOrUndefined("")).toBeUndefined());
    test("null string", () => expect(intOrUndefined(null)).toBeUndefined());
    test("undefined string", () => expect(intOrUndefined(null)).toBeUndefined());
})