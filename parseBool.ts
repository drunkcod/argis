export const parseBool = (b?: string | null) => {
	if (b == null) return null;
	const p = b.match(/^(?:\s*)(?:(t(?:rue)?|1|y(?:es)?|on)|(?:f(?:alse)?|0|n(?:o)?|off))(?:\s*)$/i);
	if (p) return p[1] !== undefined;
	return null;
};

export function isBool(x: true | false | null): x is true | false {
	return x !== null;
}
