type NoNullMembers<T> = { [P in keyof T]: NonNullable<T[P]> };

export type WithRequired<T, K extends keyof T> = Required<NoNullMembers<Pick<T, K>>> & Omit<T, K>;

export type WithKey<K extends PropertyKey, V = unknown> = { [p in K]: V };

export type OmitIndex<T> = {
	[K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K];
};

export type OfType<K, T> = K extends T ? K : never;

export class ArgumentError extends Error {
	constructor(message: string) {
		super(message);
	}

	static null(message: string): never {
		const e = new ArgumentError(message);
		e.name = 'ArgumentNullError';
		throw e;
	}

	static missing({ key }: { key: PropertyKey }): never {
		const e = new ArgumentError(`Missing property ${String(key)}.`);
		e.name = 'MissingPropertyError';
		throw e;
	}
}

export function isNil(x: any): x is null | undefined;
export function isNil<T extends object>(x: T | null, key: keyof T): x is T & WithKey<typeof key, null | undefined>;
export function isNil(x: any, key?: any): boolean {
	return x == null || (key !== undefined && x[key] == null);
}

export function isNotNil<T>(x?: T): x is T;
export function isNotNil<T, K extends keyof T>(x: T, key: K): x is T & { [P in K]-?: NonNullable<T[K]> };
export function isNotNil<T, K extends keyof T>(x?: T, key?: K) {
	return !isNil(x) && (key === undefined || !isNil(x[key]));
}

export function assertNotNil<T>(x: T | null): asserts x is T {
	if (x == null) ArgumentError.null('Unexpected null');
}

export function argNotNil<T, K extends keyof T>(x: T, key: K): asserts x is T & { [P in K]-?: NonNullable<T[K]> } {
	isNotNil(x, key) || ArgumentError.null(`'${String(key)}' was null or undefined`);
}

function _hasOwn<T extends object, K extends PropertyKey>(x: T, key: K): x is T & WithKey<K> {
	return Object.hasOwn(x, key);
}

export function hasOwn<T extends object, K extends PropertyKey>(x: T, key: K): x is T & WithKey<K>;
export function hasOwn<T extends object, K extends PropertyKey, V>(x: T, key: K, ofType: (found: unknown) => found is V): x is T & WithKey<K, V>;
export function hasOwn<T extends object, K extends PropertyKey, V = unknown>(x: T, key: K, ofType?: (found: unknown) => found is V): x is T & WithKey<K, V> {
	return _hasOwn(x, key) && (ofType == undefined || ofType(x[key]));
}

export function assertOwn<T extends object, K extends PropertyKey>(x: T, key: K): asserts x is T & WithKey<K>;
export function assertOwn<T extends object, K extends PropertyKey, V>(x: T, key: K, ofType: (found: unknown) => found is V): asserts x is T & WithKey<K, V>;
export function assertOwn<T extends object, K extends PropertyKey, V = unknown>(x: T, key: K, ofType?: (found: unknown) => found is V): asserts x is T & WithKey<K, V> {
	(ofType ? hasOwn(x, key, ofType) : hasOwn(x, key)) || ArgumentError.missing({ key });
}

export function nullIfEmpty<T extends { length: number }>(x: T | null) {
	return x == null || x.length == 0 ? null : x;
}

export function intOrUndefined(x?: string | null): number | undefined {
	if (isNil(x)) return undefined;
	const v = Number.parseInt(x);
	return Number.isNaN(v) ? undefined : v;
}

function filterEntries(x: null, p: (x: [string, unknown]) => boolean): null;
function filterEntries(x: object, p: (x: [string, unknown]) => boolean): object;
function filterEntries(x: object | null, p: (x: [string, unknown]) => boolean): object | null {
	if (x == null) return null;
	if (typeof x !== 'object') return x;
	return Object.fromEntries(Object.entries(x).filter(p));
}

export function omit<T extends object, K extends OfType<keyof T, string>>(x: T, ...keys: readonly K[]): Omit<T, K> {
	const ks: readonly string[] = keys;
	return filterEntries(x, ([key]) => !ks.includes(key)) as any;
}

export function pick<T extends object, K extends OfType<keyof T, string>>(x: T, ...keys: readonly K[]): Pick<T, K> {
	const ks: readonly string[] = keys;
	return filterEntries(x, ([key]) => ks.includes(key)) as any;
}
