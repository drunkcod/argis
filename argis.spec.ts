import { describe, expect, it, test } from '@jest/globals';
import { ArgumentError, argNotNil, isNil, isNotNil, assertOwn, assertNotNil, intOrUndefined, hasOwn, omit, pick, hasKey } from './index.js';

describe('isNil', () => {
	test('null', () => expect(isNil(null)).toBe(true));
	test('undefined', () => expect(isNil(void 0)).toBe(true));
	test('{}', () => expect(isNil({})).toBe(false));
	test('x.value is nil', () => expect(isNil({ value: null }, 'value')).toBe(true));
	test('x.value is not nil', () => expect(isNil({ value: 42 }, 'value')).toBe(false));
	test('x.value when x is nil', () => expect(isNil(null as unknown as { value: string }, 'value')).toBe(true));
});

describe('isNotNil', () => {
	test('x', () => expect(isNotNil({})).toBe(true));
	test('x.value', () => expect(isNotNil({ value: 42 }, 'value')).toBe(true));
	test('x.null', () => expect(isNotNil({ null: null }, 'null')).toBe(false));
});

describe('argNotNil', () => {
	it('raise ArgumentError on null', () => {
		expect(() => argNotNil({ x: null as unknown as string }, 'x')).toThrow(ArgumentError);
	});
	it('rases ArgumentError on undefined', () => {
		expect(() => argNotNil({ x: undefined as unknown as string }, 'x')).toThrow(ArgumentError);
	});
});

describe('hasOwn', () => {
	test('exists', () => {
		expect(hasOwn({ answer: 42 }, 'answer')).toBeTruthy();
	});
	test('missing', () => {
		expect(hasOwn({ answer: 42 }, 'message')).toBeFalsy();
	});
	test('with type check', () => {
		const it = { answer: 42 };
		expect(hasOwn(it, 'answer', (x: unknown) => typeof x === 'number')).toBeTruthy();
		//it.answer is Number.
	});
	test('with type check failing', () => {
		const it = { answer: 42 };
		expect(hasOwn(it, 'answer', (x: unknown) => typeof x === 'object')).toBeFalsy();
	});
	test('unkown', () => {
		const value = { exists: 1 } as unknown;
		const nonObject = 2 as unknown;
		expect({
			exists: hasOwn(value, 'exists'),
			missing: hasOwn(value, 'missing'),
			nonObject: hasOwn(nonObject, 'hello'),
		}).toMatchObject({
			exists: true,
			missing: false,
			nonObject: false,
		});
	});
});

describe('hasKey', () => {
	test('exists', () => {
		expect(hasKey({ answer: 42 }, 'answer')).toBeTruthy();
	});
	test('missing', () => {
		expect(hasKey({ answer: 42 }, 'message')).toBeFalsy();
	});
	test('with type check', () => {
		const it = { answer: 42 };
		expect(hasKey(it, 'answer', (x: unknown) => typeof x === 'number')).toBeTruthy();
		//it.answer is Number.
	});
	test('with type check failing', () => {
		const it = { answer: 42 };
		expect(hasKey(it, 'answer', (x: unknown) => typeof x === 'object')).toBeFalsy();
	});
	test('unkown', () => {
		const value = { exists: 1 } as unknown;
		const nonObject = 2 as unknown;
		expect({
			exists: hasKey(value, 'exists'),
			missing: hasKey(value, 'missing'),
			nonObject: hasKey(nonObject, 'hello'),
		}).toMatchObject({
			exists: true,
			missing: false,
			nonObject: false,
		});
	});
});

describe('hasOwn vs hasKey', () => {
	test('hasKey looks in proto', () => {
		const x = Object.create({ message: 'hello world' });

		expect({
			hasOwn: hasOwn(x, 'message'),
			hasKey: hasKey(x, 'message'),
		}).toMatchObject({
			hasOwn: false,
			hasKey: true,
		});
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
		const x = { message: 'hello world' } as object;
		assertOwn(x, 'message');
		expect(x.message).toEqual('hello world');
	});
	test('with type check', () => {
		const it = { answer: 42 as unknown };
		assertOwn(it, 'answer', (x: unknown) => typeof x === 'number');
		expect(it.answer).toBe(42);
	});
	test('with type check failing', () => {
		const it = { answer: 42 };
		expect(() => assertOwn(it, 'answer', (x: unknown) => typeof x === 'object')).toThrow(ArgumentError);
	});
});

describe('assertNotNil', () => {
	it('raises ArgumentError on null', () => {
		expect(() => assertNotNil(null as unknown as object)).toThrow();
	});
	it('raises ArgumentError on undefined', () => {
		expect(() => assertNotNil(undefined)).toThrow();
	});
});

describe('intOrUndefined', () => {
	test('valid string', () => expect(intOrUndefined('42')).toEqual(42));
	test('empty string', () => expect(intOrUndefined('')).toBeUndefined());
	test('null string', () => expect(intOrUndefined(null)).toBeUndefined());
	test('undefined string', () => expect(intOrUndefined(null)).toBeUndefined());
});

describe('omit', () => {
	test('omit existing', () => expect(omit({ hello: 'world', number: 42 }, 'number')).toEqual({ hello: 'world' }));
});

describe('pick', () => {
	test('pick existing', () => expect(pick({ hello: 'world', number: 42 }, 'hello')).toEqual({ hello: 'world' }));
});
