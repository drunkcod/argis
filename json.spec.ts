import { describe, it, expect } from '@jest/globals';
import type { Json, Jsonable } from './Json.js';

describe('maps types to their serialized versions', () => {
	// prettier-ignore
	type ExpectFail = [never]
	type Expect<Expected, Actual> = Expected extends Actual ? (Actual extends Expected ? Expected : ExpectFail) : ExpectFail;
	type Success<T> = T extends ExpectFail ? 'expect-failed' : T;

	const expectJSON = <T, J>(x: T): Expect<Json<T>, J> => JSON.parse(JSON.stringify(x));

	it('maps Date to string', () => {
		const x = { date: new Date() };
		const json = expectJSON<typeof x, { date: string }>(x);
		const y: Success<typeof json> = json;
		expect(typeof y.date).toBe('string');
	});

	it('follows toJSON', () => {
		const x = {
			toJSON() {
				return { date: new Date() };
			},
		};
		const json = expectJSON<typeof x, { date: string }>(x);
		const y: Success<typeof json> = json;

		expect(typeof y.date).toBe('string');
	});

	it('detects arrays', () => {
		const x = {
			items: [{ hello: '' }],
		};
		const json = expectJSON<typeof x, { items: { hello: string }[] }>(x);
		const y: Success<typeof json> = json;
		expect(y.items).toEqual(x.items);
	});

	it('excludes undefined and functions', () => {
		const x = {
			fn() {},
			missing: undefined,
		};
		const json = expectJSON<typeof x, {}>(x);
		const y: Success<typeof json> = json;
		expect(y).toEqual({});
	});

	it('matches JSON.stringify on nested toJSON', () => {
		const now = new Date();
		const x = {
			toJSON() {
				return {
					now,
					toJSON() {
						return 'hello';
					},
					nested: {
						toJSON() {
							return 'world';
						},
					},
				};
			},
		};
		const json = expectJSON<typeof x, { now: string; nested: string }>(x);
		const y: Success<typeof json> = json;
		expect(y).toEqual({ now: now.toJSON(), nested: 'world' });
	});

	it('handles Map, Set, and RegExp as empty objects', () => {
		const x = {
			map: new Map([['a', 'b']]),
			set: new Set([1, 2]),
			regex: /abc/,
		};
		const json = expectJSON<typeof x, { map: {}; set: {}; regex: {} }>(x);
		const y: Success<typeof json> = json;
		expect(y).toEqual({ map: {}, set: {}, regex: {} });
	});

	it('preserves optional properties', () => {
		type Input = { a?: string; b: number };
		type Expected = { a?: string; b: number };
		type Actual = Json<Input>;

		type Check = Expect<Actual, Expected>;
		const check: Success<Check> = true as any;
	});

	it('handles tuples and preserves structure', () => {
		type Input = [string, number];
		type Expected = [string, number];
		type Actual = Json<Input>;

		type Check = Expect<Actual, Expected>;
		const check: Success<Check> = true as any;
	});

	it('converts undefined/functions/symbols to null in arrays', () => {
		const x = [undefined, () => {}, Symbol('foo')] as const;
		const json = expectJSON<typeof x, readonly [null, null, null]>(x);
		type J = Json<typeof json>;
		const y: Success<typeof json> = json;
		expect(y).toEqual([null, null, null]);
	});

	it('handles toJSON on arrays', () => {
		const x = Object.assign([1, 2, 3], {
			toJSON() {
				return 'foo';
			},
		}) as Array<number> & Jsonable<string>;
		const json = expectJSON<typeof x, string>(x);
		const y: Success<typeof json> = json;
		expect(y).toBe('foo');
	});
});
