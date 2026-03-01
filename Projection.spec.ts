import { describe, it } from '@jest/globals';
import { _ProjectParsed, Projected, Projection, ProjectionError, ProjectionType } from './Projection.js';
import { IsAny } from './TypeUtils.js';

type IsError<T> = T extends ProjectionError<any> ? true : false;
type ExpectFail = [never];
type Expect<Expected, Actual> = Expected extends Actual ? (Actual extends Expected ? Expected : ExpectFail) : ExpectFail;

// any-aware ExpectSame
type ExpectSame<Expected, Actual> =
	IsAny<Expected> extends true ? IsAny<Actual> : IsAny<Actual> extends true ? false : Expected extends Actual ? (Actual extends Expected ? true : false) : false;

type Success<T> = T extends ExpectFail ? 'expect-failed' : T;

describe('Projection describes Mongo projections', () => {
	describe('nested.paths are parsed', () => {
		it('transforms a.b to { a: { b: ...}}', () => {
			const check: Success<Expect<{ a: { b: 1 } }, Projection<{ 'a.b': 1 }>>> = { a: { b: 1 } };
		});
		it('merges subpaths', () => {
			const given = {
				'a.b': 1,
				'a.c': 1,
			} as const;
			const expect = { a: { b: 1, c: 1 } } as const;

			const check: Success<Expect<typeof expect, Projection<typeof given>>> = expect;
		});
	});

	it('rejects projection with non 0 or 1 leaf', () => {
		const invalid = {
			foo: 'hello',
		} as const;
		type P = Projection<typeof invalid>;
		const check: IsError<P> = true;
	});

	it('reject projection mixing inclusion and exclusion', () => {
		const invalid = {
			foo: 1,
			bar: 0,
		} as const;
		type P = Projection<typeof invalid>;
		const check: IsError<P> = true;
	});
});

describe('Projected is the resulting type', () => {
	it('detects invalid projections', () => {
		type Result = Projected<{ a: number; b: { c: string } }, { 'b.c': -1 }>;

		const check: IsError<Result> = true;
	});

	it('acts as pick for inclusion (1)', () => {
		type Input = { a: number; b: { c: string } };
		type Result = Projected<Input, { b: 1 }>;
		const check: ExpectSame<Pick<Input, 'b'>, Result> = true;
	});

	it('acts as omit for exlcusion (0)', () => {
		type Input = { a: number; b: { c: string } };
		type Result = Projected<Input, { a: 0 }>;

		const check: ExpectSame<Omit<Input, 'a'>, Result> = true;
	});

	it('handles nested inclusion (1)', () => {
		type Input = { a: { b: number; c: string }; d: number };
		type Result = Projected<Input, { 'a.b': 1 }>;
		type Expected = { a: { b: number } };

		const check: ExpectSame<Expected, Result> = true;
	});

	it('handles nested exclusion (0)', () => {
		type Input = { a: { b: number; c: string }; d: number };
		type Result = Projected<Input, { 'a.b': 0 }>;
		type Expected = { a: { c: string }; d: number };

		const check: ExpectSame<Expected, Result> = true;
	});

	it('handles arrays with inclusion', () => {
		type Input = { items: { name: string; age: number }[] };
		type Result = Projected<Input, { 'items.name': 1 }>;
		type Expected = { items: { name: string }[] };

		const check: ExpectSame<Expected, Result> = true;
	});

	it('handles any input', () => {
		type Result = Projected<any, { a: 1 }>;
		const check: ExpectSame<any, Result> = true;
	});

	it('handles unknown input', () => {
		type Result = Projected<unknown, { a: 1 }>;
		const check: ExpectSame<unknown, Result> = true;
	});
});
