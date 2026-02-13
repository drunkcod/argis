export interface Jsonable<Json> {
	toJSON(): Json;
}

type AnyFn = (...args: any[]) => any;

// prettier-ignore
type ToJsonValue<T> = 
	T extends undefined | AnyFn | symbol ? null :
	[Json<T>] extends [never] ? null : 
	Json<T>;

type NeverJson = undefined | symbol | bigint | AnyFn;
type EmptyJson = Map<any, any> | Set<any> | RegExp;

// prettier-ignore
export type Json<T, IsRoot = true> = 
	T extends NeverJson ? never :
	T extends EmptyJson ? Record<string, never> :
	T extends Jsonable<infer J> ? IsRoot extends true ? Json<J, false> : Json<Omit<T, 'toJSON'>> : 
	T extends readonly any[] ? { [I in keyof T]: ToJsonValue<T[I]> } :
	T extends object ? { [P in keyof T as P extends string | number ? Json<T[P]> extends never ? never : P : never]: Json<T[P]> } : 
	T;
