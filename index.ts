type NoNullMembers<T> = { [P in keyof T]: NonNullable<T[P]> };

export type WithRequired<T, K extends keyof T> = Required<NoNullMembers<Pick<T, K>>> & Omit<T, K>;

export type WithKey<K extends PropertyKey, V = unknown> = { [p in K]: V };

export type OmitIndex<T> = {
	[K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K];
};

export type OfType<K, T> = K extends T ? K : never;

export type PickOfType<T, X> = { [P in keyof T as T[P] extends X ? P : never]: T[P] };
export type OmitOfType<T, X> = { [P in keyof T as T[P] extends X ? never : P]: T[P] };

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

export function isThenable(x: unknown): boolean {
	return x != null && typeof x === 'object' && 'then' in x && typeof x.then === 'function';
}

export function assertNotNil<T>(x: T | null): asserts x is T {
	if (x == null) ArgumentError.null('Unexpected null');
}

export function argNotNil<T, K extends keyof T>(x: T, key: K): asserts x is T & { [P in K]-?: NonNullable<T[K]> } {
	isNotNil(x, key) || ArgumentError.null(`'${String(key)}' was null or undefined`);
}

interface TypeGuard<T> {
	(x: unknown): x is T;
}

type TypeOf = {
	boolean: boolean;
	number: number;
	bigint: bigint;
	string: string;
	object: object;
	symbol: symbol;
	function: Function;
	undefined: undefined;
};

type TypeGuardOrType<T = any> = T extends TypeGuard<infer V> ? TypeGuard<V> : T extends keyof TypeOf ? T : never;
type TypeFrom<T> = T extends TypeGuard<infer V> ? V : T extends keyof TypeOf ? TypeOf[T] : never;

const isObject = (x: unknown): x is object => !!x && (typeof x === 'object' || typeof x === 'function');

function _hasOwn<T extends object, K extends PropertyKey>(x: T, key: K): x is T & WithKey<K> {
	return Object.hasOwn(x, key);
}
export function hasOwn<T extends object, K extends PropertyKey>(x: T | unknown, key: K): x is T & WithKey<K>;
export function hasOwn<T extends object, K extends PropertyKey, V>(x: T, key: K, ofType?: TypeGuardOrType<V>): x is T & WithKey<K, TypeFrom<V>>;
export function hasOwn(x: unknown, key: PropertyKey, ofType?: TypeGuardOrType) {
	return isObject(x) && _hasOwn(x, key) && (ofType === undefined || (typeof ofType === 'string' ? typeof x[key] === ofType : ofType(x[key])));
}

function _hasKey<T extends object, K extends PropertyKey>(x: T, key: K): x is T & WithKey<K> {
	return key in x;
}
export function hasKey<T extends object, K extends PropertyKey>(x: T | unknown, key: K): x is T & WithKey<K>;
export function hasKey<T extends object, K extends PropertyKey, V>(x: T, key: K, ofType?: TypeGuardOrType<V>): x is T & WithKey<K, TypeFrom<V>>;
export function hasKey(x: unknown, key: PropertyKey, ofType?: TypeGuardOrType) {
	return isObject(x) && _hasKey(x, key) && (ofType === undefined || (typeof ofType === 'string' ? typeof x[key] === ofType : ofType(x[key])));
}

export function assertOwn<T extends object, K extends PropertyKey>(x: T, key: K): asserts x is T & WithKey<K>;
export function assertOwn<T extends object, K extends PropertyKey, V>(x: T, key: K, ofType: (found: unknown) => found is V): asserts x is T & WithKey<K, V>;
export function assertOwn<T extends object, K extends PropertyKey, V = unknown>(x: T, key: K, ofType?: (found: unknown) => found is V): asserts x is T & WithKey<K, V> {
	(ofType ? hasOwn(x, key, ofType) : hasOwn(x, key)) || ArgumentError.missing({ key });
}

export function assertKey<T extends object, K extends PropertyKey>(x: T, key: K): asserts x is T & WithKey<K>;
export function assertKey<T extends object, K extends PropertyKey, V>(x: T, key: K, ofType: (found: unknown) => found is V): asserts x is T & WithKey<K, V>;
export function assertKey<T extends object, K extends PropertyKey, V = unknown>(x: T, key: K, ofType?: (found: unknown) => found is V): asserts x is T & WithKey<K, V> {
	(ofType ? hasKey(x, key, ofType) : hasKey(x, key)) || ArgumentError.missing({ key });
}

export function nullIfEmpty<T extends { length: number }>(x: T | null) {
	return x == null || x.length == 0 ? null : x;
}

export function intOrUndefined(x?: string | null): number | undefined {
	if (isNil(x)) return undefined;
	const v = Number.parseInt(x);
	return Number.isNaN(v) ? undefined : v;
}

function* excludeEntries(x: object, p: (value: string) => boolean) {
	for (const k in x) if (!p(k)) yield [k, Reflect.get(x, k)] as [key: PropertyKey, value: unknown];
}

export function omit<T extends object, K extends OfType<keyof T, string>>(x: T, ...keys: readonly K[]): Omit<T, K> {
	return Object.fromEntries(excludeEntries(x, Array.prototype.includes.bind(keys))) as Omit<T, K>;
}

export function pick<T extends object, K extends OfType<keyof T, string>>(x: T, ...keys: readonly K[]): Pick<T, K> {
	return Object.fromEntries(keys.map((k) => [k, x[k]])) as Pick<T, K>;
}

export { select } from './select.js';
