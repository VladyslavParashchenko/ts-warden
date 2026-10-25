# Methods

`classes.methods` checks methods of each class. Constraints are grouped by visibility:

| Group       | Methods                                       |
| ----------- | --------------------------------------------- |
| `public`    | Methods without a modifier or with `public`   |
| `protected` | Methods with `protected`                      |
| `private`   | Methods with `private` and `#private` methods |
| `all`       | Every method, regardless of visibility        |

Every group accepts the same options. A method can be checked by two groups, for example `public` and `all`.

```yaml
classes:
    methods:
        public:
            decorators:
                oneOf: [Get, Post]
            async: true
            returnType: explicit
        private:
            count: { max: 3 }
        all:
            static: false
            lines: { max: 30 }
```

## What counts as a method

- Method declarations, static or not, including `#private` ones.
- Properties initialized with a function: `handle = () => {}` and `handle = function () {}`. Without this, an arrow property could be used to bypass every method rule.
- The constructor, getters and setters are **not** methods.

## Options

| Option                      | Value                                     | Rule id                              |
| --------------------------- | ----------------------------------------- | ------------------------------------ |
| [`count`](#count)           | [count](common-values.md#count)           | `classes.methods.<group>.count`      |
| [`name`](#name)             | [names](common-values.md#names)           | `classes.methods.<group>.name`       |
| [`decorators`](#decorators) | [decorators](common-values.md#decorators) | `classes.methods.<group>.decorators` |
| [`params`](#params)         | [count](common-values.md#count)           | `classes.methods.<group>.params`     |
| [`async`](#async)           | boolean                                   | `classes.methods.<group>.async`      |
| [`returnType`](#returntype) | `explicit`                                | `classes.methods.<group>.returnType` |
| [`static`](#static)         | boolean                                   | `classes.methods.<group>.static`     |
| [`lines`](#lines)           | [count](common-values.md#count)           | `classes.methods.<group>.lines`      |

`count` is checked once per class and reported at the class name. All other options are checked for each method and reported at the method name.

### `count`

Number of methods in the group.

Methods declared by an interface from [`classes.implements`](classes.md#implements), including interfaces it extends, are not counted: they are the class contract, not extra API. A use case with only `execute()` from `IUseCase` passes `count: 0`. All other options still apply to those methods.

```
Public methods: expected 0, found 1 (audit)
Methods: expected at most 3, found 5 (a, b, c, d, e)
```

The list in parentheses names the counted methods.

### `name`

Name of each method; see [Names](common-values.md#names). Private methods are named with `#` when declared that way: `#validate`.

```yaml
public:
    name:
        oneOf: [execute]
private:
    name:
        matches: "^(load|save|validate)"
```

```
Method name "run" must be one of execute
Method name "compute" must match /^(load|save|validate)/
```

### `decorators`

Decorators on each method; see [Decorators](common-values.md#decorators).

```
Method "remove" must have exactly one of @Get, @Post, found none
Method "list" is missing @Auth
```

### `params`

Number of parameters of each method.

```
Method "update" parameters: expected at most 1, found 3
```

### `async`

`true` — each method must be `async`; `false` — no method may be `async`. Returning a `Promise` from a non-async method does not count as async.

```
Method "list" must be async
Method "toDto" must not be async
```

### `returnType`

**Value:** `explicit`

Each method must declare its return type. For a function property, a type annotation on the property also counts:

```ts
async list(): Promise<User[]> {}       // passes
handle: Handler = () => {}             // passes
handle = (): void => {}                // passes
list() {}                              // reported
```

```
Method "list" must declare its return type
```

### `static`

`true` — each method must be static; `false` — no method may be static.

```
Method "create" must not be static
```

### `lines`

Lines from the method name to the end of the declaration. Decorators and JSDoc comments above the method are not counted.

```ts
@Get()          // not counted
list() {        // 1
    return []   // 2
}               // 3
```

```
Method "list" lines: expected at most 30, found 42
```
