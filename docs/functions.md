# Functions

The `functions` section checks top-level functions of the file:
- `function` declarations: `export function createUserHandler() {}`;
- variables initialized with an arrow function or a function expression: `export const createUserHandler = async () => {}`.

Functions nested in other functions, class methods, and variables initialized with a call such as `memo(() => ...)` are not checked.

```yaml
fileName: kebab-case
functions:
    count: 1
    name:
        endsWith: Handler
    export: named
    params: { max: 1 }
    async: true
    returnType: explicit
    lines: { max: 40 }
```

| Option                      | Value                           | Rule id                |
| --------------------------- | ------------------------------- | ---------------------- |
| [`count`](#count)           | [count](common-values.md#count) | `functions.count`      |
| [`name`](#name)             | [names](common-values.md#names) | `functions.name`       |
| [`export`](#export)         | `named`                         | `functions.export`     |
| [`params`](#params)         | [count](common-values.md#count) | `functions.params`     |
| [`async`](#async)           | boolean                         | `functions.async`      |
| [`returnType`](#returntype) | `explicit`                      | `functions.returnType` |
| [`lines`](#lines)           | [count](common-values.md#count) | `functions.lines`      |

All options except `count` apply to every function in the file and are reported at the function name.

## `count`

Number of top-level functions in the file. Reported at the start of the file.

```
Functions in file: expected 1, found 2
```

## `name`

Name of each function; see [Names](common-values.md#names). For a variable, the variable name is used. An anonymous default export (`export default function () {}`) is reported when any `name` option is set.

```
Function name "deleteUser" must end with "Handler"
Anonymous function must be named
```

## `export`

**Value:** `named`

Each function must be exported by name, inline (`export function`, `export const`) or with `export { name }`.

```
"createUser" must use a named export, not default
"toDto" must be exported by name
```

## `params`

Number of parameters of each function.

```
Function "removeUser" parameters: expected at most 1, found 2
```

## `async`

`true` — each function must be `async`; `false` — no function may be `async`. Returning a `Promise` from a non-async function does not count as async.

```
Function "removeUser" must be async
```

## `returnType`

**Value:** `explicit`

Each function must declare its return type. For a variable, a type annotation on the variable also counts:

```ts
export function list(): User[] {} // passes
export const handle: Handler = () => {} // passes
export const handle = (): void => {} // passes
export const handle = () => {} // reported
```

```
Function "handle" must declare its return type
```

## `lines`

Lines from the function name to the end of the declaration. JSDoc comments above the function are not counted.

```
Function "createUserHandler" lines: expected at most 40, found 57
```

## React components

`.tsx` files are supported. Function components are regular functions for these rules, and PascalCase names convert to kebab-case file names: `UserCard` → `user-card.tsx`. Remember to include `.tsx` in the group's glob.

```yaml
fileName: kebab-case
functions:
    count: 1
    name:
        matches: "^[A-Z]"
    export: named
    params: { max: 1 }
```
