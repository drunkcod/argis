type NoNullMembers<T> = { [P in keyof T]: NonNullable<T[P]> };

export type WithRequired<T, K extends keyof T> = Required<NoNullMembers<Pick<T, K>>> & Omit<T, K>;

export class ArgumentError extends Error {
    constructor(message: string) {
        super(message);
    }

    static null(message: string) {
        const e = new ArgumentError(message);
        e.name = 'ArgumentNullError';
        throw e;
    }
}

export function isNil(x: any): x is null | undefined {
    return x == null;
}

export function isNotNil<T>(x?: T): x is T;
export function isNotNil<T, K extends keyof T>(x: T, key: K): x is T & { [P in K]-?: NonNullable<T[K]> } 
export function isNotNil<T, K extends keyof T>(x?: T, key?: K) {
	return !isNil(x) && (key === undefined || !isNil(x[key]));
}

export function argNotNil<T, K extends keyof T>(x: T, key: K): asserts x is T & { [P in K]-?: NonNullable<T[K]> } {
    isNotNil(x, key) || ArgumentError.null(`'${String(key)}' was null or undefined`);
}
