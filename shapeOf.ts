const id = (x: unknown) => x;
const empty = (x: unknown) => (x == null ? x : {});
type ShapeOp = '💎' | '🗑️' | '🏗️';
const cacheKey = (op: ShapeOp, ks: (string | number)[]) => `${op}${ks.join('␟')}`;
const cache = new Map<string, Function>();
const init = <K extends string | number>(keyOrKeys: K | K[], op: ShapeOp) => {
	const ks = Array.isArray(keyOrKeys) ? Array.from(new Set(keyOrKeys)).sort() : [keyOrKeys];
	const key = cacheKey(op, ks);
	return { ks: ks.map((x) => JSON.stringify(x)), key, found: cache.get(key) };
};
const finalize = <Fn extends Function>(key: string, body: string) => {
	const fn = Function('x', body) as Fn;
	cache.set(key, fn);
	return fn;
};

interface MapIf<TIn, T> {
	(input: null): null;
	(input: undefined): undefined;
	(input: TIn): T;
}

export const shapeOf = <T>() => ({
	omit<K extends Extract<keyof T, string | number>[]>(keys: K) {
		type Fn = MapIf<T, Omit<T, K[number]>>;
		if (!keys?.length) return id as Fn;
		const { ks, key, found } = init(keys, '🗑️');
		if (found) return found as Fn;

		const capture = ks.map((x, i) => `${x}:_${i}`).join(', ');
		const body = `if(!x) return x; const {${capture}, ...rest} = x; return rest;`;
		return finalize<Fn>(key, body);
	},

	pick<K extends Extract<keyof T, string | number>[]>(keys: K) {
		type Fn = MapIf<T, Pick<T, K[number]>>;
		if (!keys?.length) return empty as Fn;
		const { ks, key, found } = init(keys, '💎');
		if (found) return found as Fn;

		const capture = ks.map((x, i) => `${x}:_${i}`).join(', ');
		const body = `if(!x) return x; const {${capture}} = x; return {${capture}};`;
		return finalize<Fn>(key, body);
	},

	pluck<K extends Extract<keyof T, string | number>>(key: K) {
		type Fn = MapIf<T, T[K]>;
		const {
			ks: { 0: safeKey },
			key: cacheKey,
			found,
		} = init(key, '🏗️');
		if (found) return found as Fn;

		const body = `if(!x) return x; return x[${safeKey}];`;
		return finalize<Fn>(cacheKey, body);
	},
});
