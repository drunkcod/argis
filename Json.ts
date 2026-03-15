import { AnyFn, IfOptional, Pretty, Tagged, TagCycle, TagCycles, IsAny } from './TypeUtils.js';

export interface Jsonable<Json> {
	toJSON(): Json;
}

type NeverJson = undefined | symbol | AnyFn;
type EmptyJson = Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any> | RegExp;

const JsonError: unique symbol = Symbol('JsonError');
export type JsonError<T, Data = {}> = Tagged<typeof JsonError, T, Data>;
export type JsonCycleError<T> = JsonError<'cycle-detected', { data: T }>;

type JsonProperty<T, P extends keyof T> = P extends string | number ? (_Json<T[P]> extends never ? never : P) : never;

// prettier-ignore
type JsonObject<T> = 
	{ [P in keyof T as IfOptional<T, P, never, JsonProperty<T, P>>]: Pretty<_Json<T[P]>> } & 
	{ [P in keyof T as IfOptional<T, P, JsonProperty<T, P>, never>]?: Pretty<_Json<T[P]>> };

// prettier-ignore
type _Json<T, IsRoot = true> = 
	IsAny<T> extends true ? any :
	T extends TagCycle<infer X> ? (X extends Jsonable<infer J> ? Json<J, false> : JsonCycleError<X>) : 
	T extends Jsonable<infer J> ? (IsRoot extends true ? Json<J, false> : _Json<Omit<T, 'toJSON'>>) : 
	T extends NeverJson ? never :
	T extends EmptyJson ? Record<string, never> :
	T extends bigint ? JsonError<'bigint-not-serializeable'> :
	T extends readonly any[] ? { [I in keyof T]: [_Json<T[I]>] extends [never] ? null : Pretty<_Json<T[I]>> } :
	T extends object ? JsonObject<T> : 
	T;

export type Json<T, IsRoot = true> = Pretty<_Json<TagCycles<T>, IsRoot>>;
