import { describe, it, test } from '@jest/globals';
import { UnionMerge, PickRequired, IsAny, IsUnknown, IsOptional, TagCycles, TagCycle, IsFn } from '../TypeUtils.js';
import { ExpectSame } from './ExpectSame.js';

describe('TypeUtils', () => {
	test('IsAny', () => {
		const anyIsAny: IsAny<any> = true;
		const unknownIsNotAny: IsAny<unknown> = false;
	});

	test('IsUnknown', () => {
		const anyIsNotUnknown: IsUnknown<any> = false;
		const unknownIsUnknown: IsUnknown<unknown> = true;
	});

	test('IsOptional', () => {
		const a: IsOptional<{ a?: number }, 'a'> = true;
		const b: IsOptional<{ b: boolean }, 'b'> = false;
	});

	describe('UnionMerge', () => {
		it('merges shared property type', () => {
			type R = UnionMerge<{ a: string }, { a: number }>;
			const r: ExpectSame<R, { a: string | number }> = true;
		});

		it('non shared properties becomes optional', () => {
			type R = UnionMerge<{ onlyA: number; both: boolean }, { both: boolean; onlyB: string }>;
			const r: ExpectSame<R, { onlyA?: number; both: boolean; onlyB?: string }> = true;
		});

		it('preserves unknown', () => {
			type R = UnionMerge<{}, { u: unknown }>;
			const a: IsUnknown<R['u']> = true;
			const b: IsOptional<R, 'u'> = true;
			const r: ExpectSame<R, { u?: unknown }> = true;
		});

		it('preserves empty objects', () => {
			type R = UnionMerge<{ u: Record<string, unknown> }, { u: Record<string, unknown> }>;
			const r: ExpectSame<R, { u: {} }> = true;
		});

		it('merges optional properties', () => {
			type R = UnionMerge<{ a?: string }, { a?: number }>;
			const r: ExpectSame<R, { a?: string | number }> = true;
		});

		it('merges required and optional properties', () => {
			type R = UnionMerge<{ a: string }, { a?: number }>;
			const r: ExpectSame<R, { a?: string | number }> = true;
		});

		it('merges multiple types', () => {
			type A = { a: string };
			type B = { b: number };
			type C = { c: boolean };
			type R = UnionMerge<UnionMerge<A, B>, C>;
			const r: ExpectSame<R, { a?: string; b?: number; c?: boolean }> = true;
		});

		it('preserves optional any', () => {
			type R = UnionMerge<{ a?: any }, { a?: any }>;
			const r: IsOptional<R, 'a'> = true;
		});
	});

	test('PickRequired', () => {
		type T = { a: string; b?: number; c: boolean | undefined };
		type R = PickRequired<T>;
		const r: ExpectSame<R, { a: string; c: boolean | undefined }> = true;
	});

	test('TagCycles', () => {
		it('detects direct cycle', () => {
			type Node = { value: number; next: Node };
			type A = TagCycles<Node>;
			const r: ExpectSame<A, { value: number; next: TagCycle<Node> }> = true;
		});

		it('keeps primivites, any and unknown', () => {
			type Node = { number: number; string: string; fn: () => void; any: any; unknown: unknown };
			type A = TagCycles<Node>;
			const r: ExpectSame<A, Node> = true;
		});

		it('supports optionality', () => {
			type Node = { value: number; next?: Node };
			type A = TagCycles<Node>;
			const r: ExpectSame<A, { value: number; next?: TagCycle<Node> }> = true;
		});

		it('detects indirect cycles', () => {
			type X = { y: Y };
			type Y = { x: X };
			type A = TagCycles<X>;
			const r: ExpectSame<A, { y: { x: TagCycle<X> } }> = true;
		});

		it('handles complex indexers (since those usually fall of the rails)', () => {
			type Node = { [x in `hello_${string}`]: Node };
			type A = TagCycles<Node>;
			const r: ExpectSame<A, { [x in `hello_${string}`]: TagCycle<Node> }> = true;
		});
	});
});
