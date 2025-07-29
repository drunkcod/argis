interface Fn1<T, R> {
	(arg0: T): R;
}

declare const error: unique symbol;

type SelectError<T extends string> = T & { [error]: void };

type Select<T, S> = {
	[P in keyof S]: P extends keyof T
		? S[P] extends Fn1<infer In, unknown>
			? In extends T[P]
				? S[P]
				: SelectError<`wrong-parameter-type:${string & P})`>
			: S[P] extends 1
			? 1
			: SelectError<`not-a-function:${string & P}`>
		: SelectError<`not-in-source:${string & P}`>;
};

type Errors<T> = { [P in keyof T as T[P] extends SelectError<string> ? P : never]: T[P] };

type Transform<T, S> = S extends Select<T, S> ? S : Errors<Select<T, S>>;

type Selected<T, S> = { [P in keyof Transform<T, S>]: Transform<T, S>[P] extends Fn1<any, infer R> ? R : P extends keyof T ? T[P] : never };

export function select<T extends object, S>(x: T, transform: Transform<T, S>): Selected<T, S> {
	return Object.fromEntries({
		*[Symbol.iterator]() {
			for (const k in transform) {
				const fn = transform[k];
				const v = Reflect.get(x, k);
				if (fn === 1) yield [k, v];
				else if (typeof fn === 'function') yield [k, fn(v)];
			}
		},
	}) as any;
}
