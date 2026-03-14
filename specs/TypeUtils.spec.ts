import { describe, test } from '@jest/globals';
import { PickRequired, IsAny, IsUnknown, IsOptional } from '../TypeUtils.js';
import { ExpectSame } from './ExpectSame.js';

describe('TypeUtils', () => {
	test('IsAny', () => {
		const anyIsAny: IsAny<any> = true;
		const unknownIsNotAny: IsAny<unknown> = false;
	});

	test('IsUnknown', () => {
		const anyIsNotUnknown: IsUnknown<any> = false;
		const unknownIsUnknown: IsUnknown<unknown> = true;
	});

	test('IsOptional', () => {
		const a: IsOptional<{ a?: number }, 'a'> = true;
		const b: IsOptional<{ b: boolean }, 'b'> = false;
	});

	test('PickRequired', () => {
		type T = { a: string; b?: number; c: boolean | undefined };
		type R = PickRequired<T>;
		const r: ExpectSame<R, { a: string; c: boolean | undefined }> = true;
	});
});
