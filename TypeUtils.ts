export type Pretty<T> = T extends object ? { [P in keyof T]: T[P] } & {} : T;
export type Optional<T, K extends keyof T> = Pretty<Omit<T, K> & Partial<Pick<T, K>>>;

const SPECIAL_TAG: unique symbol = Symbol('');
type SpecialTag<T, Data = never> = { readonly [SPECIAL_TAG]: T; data: Data };
type TagAny = SpecialTag<'any'>;
type TagOptional = SpecialTag<'?'>;
type TagUnknown = SpecialTag<'unknown'>;
export type TagCycle<T> = SpecialTag<'cycle', T>;

export type AnyFn = (...args: any[]) => any;

export type IsAny<T> = 0 extends 1 & T ? true : false;
export type IsFn<T> = T extends AnyFn ? true : false;
export type IsUnknown<T> = unknown extends T ? (IsAny<T> extends true ? false : true) : false;
export type IsOptional<T, K extends keyof T> = IfOptional<T, K, true, false>;

export type IfOptional<T, K extends keyof T, True, False> = { [P in K]?: T[K] } extends Pick<T, K> ? True : False;

// prettier-ignore
export type TagSpecial<T> = {
	[P in keyof T]: 
		IfOptional<T, P, TagOptional, never> |
		(IsAny<T[P]> extends true ? TagAny :
		IsUnknown<T[P]> extends true ? TagUnknown :
		T[P]);
};

export type IsIdentical<T, V> = IsAny<T> extends true ? IsAny<V> : [T] extends [V] ? ([V] extends [T] ? true : false) : false;
export type HasIdentical<T, U> = true extends (U extends any ? IsIdentical<T, U> : false) ? true : false;

export type IsVisited<T, Visited> = [NonNullable<T>] extends [Visited] ? HasIdentical<T, Visited> : false;
// prettier-ignore
export type TagCycles<T, Visited = never> = 
	T extends SpecialTag<any> ? T :
	IsFn<T> extends true ? T :
	T extends undefined ? undefined :
	IsVisited<T, Visited> extends true ? TagCycle<NonNullable<T>> :
	T extends object ? { [P in keyof T]: TagCycles<T[P], Visited | NonNullable<T>> } :
	T;

type IfTagged<T, X extends SpecialTag<any>, True, False> = [Extract<T, X>] extends [never] ? False : True;

// prettier-ignore
type UnwrapOptional<T> =
	{ [P in keyof T as IfTagged<T[P], TagOptional, never, P>]: T[P] } & 
	{ [P in keyof T as IfTagged<T[P], TagOptional, P, never>]?: Exclude<T[P], TagOptional> };

type UnwrapTagsCore<T> = {
	[P in keyof T]: IfTagged<T[P], TagAny, any, IfTagged<T[P], TagUnknown, unknown, T[P]>>;
};

type UnwrapTags<T> = UnwrapTagsCore<UnwrapOptional<T>>;

type UnionMergeCore<A, B> = {
	[K in keyof A | keyof B]: (K extends keyof A ? A[K] : TagOptional) | (K extends keyof B ? B[K] : TagOptional);
};

export type Assign<Target, Source> = Omit<Target, keyof Source> & Source;

export type UnionMerge<A, B> = Pretty<UnwrapTags<UnionMergeCore<TagSpecial<A>, TagSpecial<B>>>>;

export type PickRequired<T> = { [P in keyof T as IfOptional<T, P, never, P>]: T[P] };

// prettier-ignore
export type Substitute<T, Target, Replacement> = 
	IsIdentical<T, Target> extends true ? Replacement :
	T extends SpecialTag<any> ? T :
	IsAny<T> extends true ? T :
	IsUnknown<T> extends true ? T :
	IsFn<T> extends true ? T :
	T extends readonly any[] ? { [K in keyof T]: Substitute<T[K], Target, Replacement> } :
	T extends object ? Pretty<UnwrapTags<{ [P in keyof TagSpecial<T>]: Substitute<TagSpecial<T>[P], Target, Replacement> }>> :
	T;
