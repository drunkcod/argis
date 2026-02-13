import { describe, it, expect } from '@jest/globals';
import type { Json } from './Json.js';

describe('maps types to their serialized versions', () => {
	// prettier-ignore
	type ExpectFail = [never]
	type Expect<Expected, Actual> = Expected extends Actual ? (Actual extends Expected ? Expected : ExpectFail) : ExpectFail;
	type NotFalse<T> = T extends ExpectFail ? 'expect-failed' : T;
	const expectJSON = <T, J>(x: T): Expect<Json<T>, J> => JSON.parse(JSON.stringify(x));

	it('maps Date to string', () => {
		const x = { date: new Date() };
		const json = expectJSON<typeof x, { date: string }>(x);
		const y: NotFalse<typeof json> = json;
		expect(typeof y.date).toBe('string');
	});

	it('follows toJSON', () => {
		const x = {
			toJSON() {
				return { date: new Date() };
			},
		};
		const json = expectJSON<typeof x, { date: string }>(x);
		const y: NotFalse<typeof json> = json;

		expect(typeof y.date).toBe('string');
	});

	it('detects arrays', () => {
		const x = {
			items: [{ hello: '' }],
		};
		const json = expectJSON<typeof x, { items: { hello: string }[] }>(x);
		const y: NotFalse<typeof json> = json;
		expect(y.items).toEqual(x.items);
	});

	it('excludes undefined and functions', () => {
		const x = {
			fn() {},
			missing: undefined,
		};
		const json = expectJSON<typeof x, {}>(x);
		const y: NotFalse<typeof json> = json;
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
		const y: NotFalse<typeof json> = json;
		expect(y).toEqual({ now: now.toJSON(), nested: 'world' });
	});
});
