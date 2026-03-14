import { describe, it } from '@jest/globals';
import { UnionMerge, IsUnknown, IsOptional } from '../TypeUtils.js';
import { ExpectSame } from './ExpectSame.js';

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
