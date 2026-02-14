export interface Jsonable<Json> {
	toJSON(): Json;
}

type AnyFn = (...args: any[]) => any;
type NeverJson = undefined | symbol | AnyFn;
type EmptyJson = Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any> | RegExp;

const JsonErrorSym: unique symbol = Symbol('JsonError');
export type JsonError<T> = { [JsonErrorSym]: T };

// prettier-ignore
export type Json<T, IsRoot = true> = 
	T extends Jsonable<infer J> ? (IsRoot extends true ? Json<J, false> : Json<Omit<T, 'toJSON'>>) : 
	T extends NeverJson ? never :
	T extends EmptyJson ? Record<string, never> :
	T extends bigint ? JsonError<'bigint-not-serializeable'> :
	T extends readonly any[] ? { [I in keyof T]: [Json<T[I]>] extends [never] ? null : Json<T[I]> } :
	T extends object ? { [P in keyof T as P extends string | number ? Json<T[P]> extends never ? never : P : never ]: Json<T[P]> } : 
	T;
