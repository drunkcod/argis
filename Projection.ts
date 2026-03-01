import { IsAny } from 'TypeUtils.js';

type Split<X extends string> = X extends `${infer H}.${infer R}` ? [H, R] : [X, never];

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

const PROJECTION_ERROR: unique symbol = Symbol('ProjectionError');
export type ProjectionError<T extends string> = { readonly [PROJECTION_ERROR]: T };

const PROJECTION_TYPE: unique symbol = Symbol('ProjectionType');
export type ProjectionType<T extends 0 | 1, P> = { readonly [PROJECTION_TYPE]: T; P: P };

type Leafs<T> = T extends object ? { [K in keyof T]: Leafs<T[K]> }[keyof T] : T;
type Errors<T> = T extends ProjectionError<any> ? T : T extends object ? { [K in keyof T]: Errors<T[K]> }[keyof T] : never;

type Splut<T> = {
	[K in keyof T as K extends string ? Split<K>[0] : never]: K extends string
		? Split<K> extends [infer _, infer R]
			? [R] extends [never]
				? T[K]
				: Splut<{ [P in R extends string ? R : never]: T[K] }>
			: never
		: never;
};

type Squish<T> = T extends object ? { [P in keyof T]: Squish<UnionToIntersection<T[P]>> } : T;

// prettier-ignore
type _EnsureValidProjection<Leafs, Ok> =
	[Leafs] extends [1] ? ProjectionType<1, Ok> :
	[Leafs] extends [0] ? ProjectionType<0, Ok> :
	ProjectionError<'ERROR: Cannot mix inclusiton (1) with exlcustion (0)'>;
type EnsureValidProjection<P> = _EnsureValidProjection<Leafs<P>, P>;

type UnwrapProjection<T> = T extends ProjectionType<any, infer P> ? P : T;

type EnsureNoError<T> = [Errors<T>] extends [never] ? T : Errors<T>;

// prettier-ignore
type _ProjectInclusion<T, P> = 
	P extends 1 ? T : 
	T extends (infer U)[] ? _ProjectInclusion<U, P>[] :
	{ [K in keyof T as K extends keyof P ? K : never]: K extends keyof P ? _ProjectInclusion<T[K], P[K]> : never };

type _ProjectExclusion<T, P> = {
	[K in keyof T as K extends keyof P ? (P[K] extends 0 ? never : K) : K]: K extends keyof P ? _ProjectExclusion<T[K], P[K]> : T[K];
};

// prettier-ignore
export type _ProjectParsed<T, P> =
	P extends ProjectionType<1, infer Inclusion> ? _ProjectInclusion<T, Inclusion> :
	P extends ProjectionType<0, infer Exclusion> ? _ProjectExclusion<T, Exclusion> :
	ProjectionError<`ERROR: Unknown Projection type.`>;

type _ParsedProjection<T> = EnsureValidProjection<Squish<Splut<T>>>;

// prettier-ignore
export type Projection<T> = EnsureNoError<UnwrapProjection<_ParsedProjection<T>>>;

type Ungarbage<T, P> = {} extends P ? (IsAny<T> extends true ? T : P) : P;
export type Projected<T, P> = Ungarbage<T, _ProjectParsed<T, _ParsedProjection<P>>>;
