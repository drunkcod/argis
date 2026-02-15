type Pretty<T> = { [P in keyof T]: T[P] } & {};

const SPECIAL_TAG: unique symbol = Symbol('');
type SpecialTag<T> = { readonly [SPECIAL_TAG]: T };
type TagAny = SpecialTag<'any'>;
type TagOptional = SpecialTag<'?'>;
type TagUnknown = SpecialTag<'unknown'>;

export type IsAny<T> = 0 extends 1 & T ? true : false;
export type IsUnknown<T> = unknown extends T ? (IsAny<T> extends true ? false : true) : false;
export type IsOptional<T, K extends keyof T> = { [P in K]?: T[K] } extends Pick<T, K> ? true : false;

// prettier-ignore
type TagSpecial<T> = {
	[P in keyof T]: 
		(IsOptional<T, P> extends true ? TagOptional : never) |
		(IsAny<T[P]> extends true ? TagAny :
		IsUnknown<T[P]> extends true ? TagUnknown :
		T[P]);
};

type IsTagged<T, X extends SpecialTag<any>> = [Extract<T, X>] extends [never] ? false : true;

// prettier-ignore
type UnwrapOptional<T> =
	{ [P in keyof T as IsTagged<T[P], TagOptional> extends false ? P : never]: T[P] } & 
	{ [P in keyof T as IsTagged<T[P], TagOptional> extends true ? P : never]?: Exclude<T[P], TagOptional> };

type UnwrapTagsCore<T> = {
	[P in keyof T]: IsTagged<T[P], TagAny> extends true ? any : IsTagged<T[P], TagUnknown> extends true ? unknown : T[P];
};

type UnwrapTags<T> = UnwrapTagsCore<UnwrapOptional<T>>;

type UnionMergeCore<A, B> = {
	[K in keyof A | keyof B]: (K extends keyof A ? A[K] : TagOptional) | (K extends keyof B ? B[K] : TagOptional);
};

export type UnionMerge<A, B> = Pretty<UnwrapTags<UnionMergeCore<TagSpecial<A>, TagSpecial<B>>>>;

export type PickRequired<T> = { [P in keyof T as IsOptional<T, P> extends true ? never : P]: T[P] };
