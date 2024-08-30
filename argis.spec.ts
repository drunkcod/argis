import { describe, expect, it, test } from '@jest/globals';
import { ArgumentError, argNotNil, isNil, isNotNil, assertOwn } from './';

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
    it('raise ArgumentError on null', () => {
        expect(() => argNotNil({ x: null as unknown as string}, 'x')).toThrow(ArgumentError)
    });
    it('rases ArgumentError on undefined', () => {
        expect(() => argNotNil({ x: undefined as unknown as string}, 'x')).toThrow(ArgumentError)
    });
})

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
})