# @drunkcod/argis

A tiny, type-first toolkit for runtime argument validation and structural object utilities.

`argis` (Arguments & Is) is designed to bridge the gap between runtime checks and TypeScript inference. It provides a suite of lightweight, zero-dependency utilities to safely narrow types while performing common runtime validations and data transformations.

## Aim & Philosophy

In TypeScript, we often find ourselves writing repetitive type guards or utility functions to handle nulls, property existence, and object shaping. `argis` aims to provide a consistent, high-fidelity set of tools that:

1.  **Prioritize Inference:** Every function is built to provide the strongest possible type narrowing at the call site.
2.  **Handle Objects Safely:** Deeply nested paths and structural transformations are type-checked at compile time.
3.  **Stay Minimal:** Only provide what's necessary for robust argument handling and object manipulation without the overhead of a full-blown validation library.

---

## Installation

```bash
npm install @drunkcod/argis
```

---

## Utilities

### 1. Guarding & Presence

#### `isNil` / `isNotNil`

Simple checks for `null` or `undefined` that narrow types correctly.

```typescript
import { isNil, isNotNil } from '@drunkcod/argis';

const value: string | null = getNullableValue();

if (isNotNil(value)) {
  // value is string
}

const obj = { data: null };
if (isNil(obj, 'data')) {
  // obj.data is null | undefined
}
```

#### `assertNotNil` / `argNotNil`

Throws an `ArgumentError` if a value is nil. Useful for early exits in functions.

```typescript
import { argNotNil } from '@drunkcod/argis';

function process(input: { id: string | null }) {
  argNotNil(input, 'id');
  // input.id is now string
}
```

---

### 2. Property Access

#### `hasOwn` / `hasKey`

Safely check for the presence of a property and narrow the object type. `hasOwn` uses `Object.hasOwn`, while `hasKey` checks the prototype chain (`in` operator).

```typescript
import { hasOwn } from '@drunkcod/argis';

const data: unknown = { id: 123, name: 'Argis' };

if (hasOwn(data, 'id', 'number')) {
  // data is { id: number }
}

if (hasOwn(data, 'name', (val): val is string => typeof val === 'string')) {
  // data is { id: number, name: string }
}
```

#### `assertOwn` / `assertKey`

Throws a `MissingPropertyError` (subtype of `ArgumentError`) if the property is missing or fails the type check.

```typescript
import { assertOwn } from '@drunkcod/argis';

function start(config: object) {
  assertOwn(config, 'apiKey', 'string');
  // config.apiKey is string
}
```

---

### 3. Object Shaping

#### `pick` / `omit`

Type-safe versions of common object subsetting.

```typescript
import { pick, omit } from '@drunkcod/argis';

const user = { id: 1, name: 'User', secret: '123' };

const publicUser = pick(user, 'id', 'name'); // { id: number, name: string }
const safeUser = omit(user, 'secret'); // { id: number, name: string }
```

#### `select`

A transformative pick. Select fields and optionally transform them in one pass.

```typescript
import { select } from '@drunkcod/argis';

const input = { value: 21, message: 'hello' };
const result = select(input, {
  value: (x) => (x * 2).toString(), // Transform number to string
  message: 1, // Keep as-is (1 acts as 'true')
});
// result: { value: '42', message: 'hello' }
```

#### `Projected<T, P>` (Type only)

High-fidelity type inference for MongoDB-style projections, including dot-notation for nested paths.

```typescript
import { Projected } from '@drunkcod/argis';

type User = {
  id: number;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string;
  };
  posts: { title: string; content: string }[];
};

// Inclusion (1)
type Summary = Projected<
  User,
  {
    'profile.firstName': 1;
    'posts.title': 1;
  }
>;
// Result: { profile: { firstName: string }, posts: { title: string }[] }

// Exclusion (0)
type SansAvatar = Projected<User, { 'profile.avatar': 0 }>;
// Result: { id: number, profile: { firstName: string, lastName: string }, posts: ... }
```

---

### 4. Serialization & Parsing

#### `Json<T>` (Type only)

A recursive type that ensures a type is JSON-serializable. It handles `toJSON()` methods and filters out non-serializable members like functions and symbols.

```typescript
import { Json } from '@drunkcod/argis';

type Valid = Json<{ a: number; b: string }>; // { a: number, b: string }
type Invalid = Json<{ a: bigint }>; // JsonError<'bigint-not-serializeable'>
```

#### `parseBool`

A robust boolean parser for strings. Supports `true`, `false`, `1`, `0`, `yes`, `no`, `on`, `off` (case-insensitive).

```typescript
import { parseBool, isBool } from '@drunkcod/argis';

const enabled = parseBool('on'); // true
const disabled = parseBool('0'); // false
const unknown = parseBool('maybe'); // null

if (isBool(unknown)) {
  // narrows to boolean
}
```

---

### 5. Utilities

- **`intOrUndefined(str)`**: Safely parses an integer or returns `undefined`.
- **`nullIfEmpty(arr)`**: Returns `null` if the array (or object with length) is empty.
- **`isThenable(obj)`**: Checks if an object is a Promise-like (has `.then()`).

---

## License

MIT
