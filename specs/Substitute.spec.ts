import { describe, it } from '@jest/globals';
import { Substitute, Pretty } from '../TypeUtils.js';
import { ExpectSame } from './ExpectSame.js';

describe('Substitute', () => {
	it('substitutes a simple type', () => {
		type Input = { a: number; b: string };
		type Target = string;
		type Replacement = boolean;
		type Result = Substitute<Input, Target, Replacement>;
		const r: ExpectSame<Result, { a: number; b: boolean }> = true;
	});

	it('substitutes recursively', () => {
		type Input = { a: { b: string } };
		type Target = string;
		type Replacement = number;
		type Result = Substitute<Input, Target, Replacement>;
		const r: ExpectSame<Result, { a: { b: number } }> = true;
	});

	it('substitutes in arrays', () => {
		type Input = { a: string[] };
		type Target = string;
		type Replacement = number;
		type Result = Substitute<Input, Target, Replacement>;
		const r: ExpectSame<Result, { a: number[] }> = true;
	});

	it('plugs a hole in a recursive structure', () => {
		type Node = { value: number; next: Node };
		type Tree = { root: Node };

		// We want to replace Node with something that doesn't have a cycle
		// or has a "broken" cycle.
		type BrokenNode = { value: number; next: null };

		type Result = Substitute<Tree, Node, BrokenNode>;

		const r: ExpectSame<Result, { root: { value: number; next: null } }> = true;
	});

	it('works with optional properties', () => {
		type Input = { a?: string; b: number };
		type Target = string;
		type Replacement = boolean;
		type Result = Substitute<Input, Target, Replacement>;

		type PropA = Result['a'];
		const a: ExpectSame<PropA, boolean | undefined> = true;

		type PropB = Result['b'];
		const b: ExpectSame<PropB, number> = true;
	});

	it('handles any correctly', () => {
		type Input = { a: any; b: string };
		type Target = string;
		type Replacement = number;
		type Result = Substitute<Input, Target, Replacement>;
		const r: ExpectSame<Result, { a: any; b: number }> = true;
	});

	it('handles unknown correctly', () => {
		type Input = { a: unknown; b: string };
		type Target = string;
		type Replacement = number;
		type Result = Substitute<Input, Target, Replacement>;
		const r: ExpectSame<Result, { a: unknown; b: number }> = true;
	});

	it('does not break functions', () => {
		type F = (a: string) => number;
		type Input = { f: F; b: string };
		type Target = string;
		type Replacement = number;
		type Result = Substitute<Input, Target, Replacement>;
		// Function internal types (args/return) are not substituted unless the function itself is the target
		const r: ExpectSame<Result, { f: F; b: number }> = true;
	});

	it('substitutes the function itself if it is the target', () => {
		type F = (a: string) => number;
		type Input = { f: F; b: string };
		type Target = F;
		type Replacement = string;
		type Result = Substitute<Input, Target, Replacement>;
		const r: ExpectSame<Result, { f: string; b: string }> = true;
	});
});
