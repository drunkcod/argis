interface Jsonable<Json> {
	toJSON(): Json;
}
// prettier-ignore
export type Json<T, IsRoot = true> = 
    T extends undefined ? never :
    T extends Array<infer A> ? Json<A, IsRoot>[] : 
    T extends (...args: any[]) => any ? never :
    T extends Jsonable<infer J> ? IsRoot extends true ? Json<J, false> : Json<Omit<T, 'toJSON'>> : 
    T extends object ? {[P in Extract<keyof T, string | number> as Json<T[P]> extends never ? never : P]: Json<T[P]> } : 
    T;
