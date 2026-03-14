import { AnyFn, IfOptional } from './TypeUtils.js';

export interface Jsonable<Json> {
	toJSON(): Json;
}

type NeverJson = undefined | symbol | AnyFn;
type EmptyJson = Map<any, any> | Set<any> | WeakMap<any, any> | WeakSet<any> | RegExp;

const JsonErrorSym: unique symbol = Symbol('JsonError');
export type JsonError<T> = { [JsonErrorSym]: T };

type JsonProperty<T, P extends keyof T> = P extends string | number ? (Json<T[P]> extends never ? never : P) : never;

// prettier-ignore
type JsonObject<T> = 
	{ [P in keyof T as IfOptional<T, P, never, JsonProperty<T, P>>]: Json<T[P]> } & 
	{ [P in keyof T as IfOptional<T, P, JsonProperty<T, P>, never>]?: Json<T[P]> };

// prettier-ignore
export type Json<T, IsRoot = true> = 
	T extends Jsonable<infer J> ? (IsRoot extends true ? Json<J, false> : Json<Omit<T, 'toJSON'>>) : 
	T extends NeverJson ? never :
	T extends EmptyJson ? Record<string, never> :
	T extends bigint ? JsonError<'bigint-not-serializeable'> :
	T extends readonly any[] ? { [I in keyof T]: [Json<T[I]>] extends [never] ? null : Json<T[I]> } :
	T extends object ? JsonObject<T> : 
	T;
