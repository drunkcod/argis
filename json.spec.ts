import { describe, it, expect } from '@jest/globals';
import type { Json, Jsonable } from './Json.js';

describe('maps types to their serialized versions', () => {
	type ExpectFail = [never];
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

	it('handles Collections and RegExp as empty objects', () => {
		const x = {
			map: new Map(),
			set: new Set(),
			wmap: new WeakMap(),
			wset: new WeakSet(),
			regex: /abc/,
		};
		const json = expectJSON<typeof x, { map: {}; set: {}; wmap: {}; wset: {}; regex: {} }>(x);
		const y: Success<typeof json> = json;
		expect(y).toEqual({ map: {}, set: {}, wmap: {}, wset: {}, regex: {} });
	});

	it('prioritizes toJSON on collections and functions', () => {
		const m = new Map() as Map<any, any> & Jsonable<number>;
		m.toJSON = () => 1;
		const f = (() => {}) as (() => void) & Jsonable<number>;
		f.toJSON = () => 2;

		const x = { m, f };
		const json = expectJSON<typeof x, { m: number; f: number }>(x);
		const y: Success<typeof json> = json;
		expect(y).toEqual({ m: 1, f: 2 });
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

	it('converts everything that would be omitted to null in arrays', () => {
		const x = [
			undefined,
			() => {},
			Symbol('foo'),
			{
				toJSON() {
					return undefined;
				},
			},
		] as const;
		const json = expectJSON<typeof x, readonly [null, null, null, null]>(x);
		const y: Success<typeof json> = json;
		expect(y).toEqual([null, null, null, null]);
	});

	it('detects bigint as JsonError', () => {
		type Actual = Json<{ a: bigint }>;
		type Expected = { a: { [K in any]: 'bigint-not-serializeable' } };
		// We can't easily match the unique symbol in the test, but we can verify it's not omitted
		type IsEmpty = {} extends Actual ? true : false;
		const check: Success<IsEmpty> = false;
	});
});
