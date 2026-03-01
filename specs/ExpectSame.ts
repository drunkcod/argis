import { IsAny } from '../TypeUtils';

// any-aware ExpectSame
export type ExpectSame<Expected, Actual> =
	IsAny<Expected> extends true ? IsAny<Actual> : IsAny<Actual> extends true ? false : Expected extends Actual ? (Actual extends Expected ? true : false) : false;
