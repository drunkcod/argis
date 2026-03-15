import { describe, it } from '@jest/globals';
import { TagCycles, TagCycle, TagSpecial, IsIdentical } from '../TypeUtils.js';

describe('TagCycles', () => {
	it('detects direct cycle', () => {
		type Node = { value: number; next: Node };
		type A = TagCycles<Node>;
		const r: IsIdentical<A, { value: number; next: TagCycle<Node> }> = true;
	});

	it('keeps primivites, any and unknown', () => {
		type Node = {
			number: number;
			string: string;
			symbol: symbol;
			fn: () => void;
			any: any;
			unknown: unknown;
			undefined: undefined;
		};
		type T = TagSpecial<Node>;
		type A = TagCycles<Node>;
		const r: IsIdentical<A, Node> = true;
	});

	it('supports optionality', () => {
		type Node = { value: number; next?: Node };
		type A = TagCycles<Node>;
		const r: IsIdentical<A, { value: number; next?: TagCycle<Node> }> = true;
	});

	it('detects indirect cycles', () => {
		type X = { y: Y };
		type Y = { x: X };
		type A = TagCycles<X>;
		const r: IsIdentical<A, { y: { x: TagCycle<X> } }> = true;
	});

	it('handles tuples', () => {
		type Input = [string, number];
		type A = TagCycles<Input>;
		const r: IsIdentical<A, Input> = true;
	});

	it('handles complex indexers without cycles', () => {
		type NodeData = { value: number };
		type Node = { [x in `hello_${string}`]?: NodeData };
		type A = TagCycles<Node>;
		const r: IsIdentical<A, { [x in `hello_${string}`]?: { value: number } }> = true;
	});

	it('handles complex indexers with cycles', () => {
		type Node = { [x in `hello_${string}`]?: Node };
		type K = keyof Node;
		type T = TagSpecial<Node>;
		type A = TagCycles<Node>;
		const r: IsIdentical<A, { [x in `hello_${string}`]?: TagCycle<Node> }> = true;
	});
});
