# Common values

Several options share the same value format. This page describes them once.

## Count

Used by `count`, `params` and `lines`.

A count is either a number, meaning an exact value, or a range with `min`, `max` or both. Bounds are inclusive and must be non-negative integers. A range must set at least one bound.

```yaml
count: 1 # exactly 1
params: { max: 2 } # 0, 1 or 2
lines: { min: 1, max: 40 } # from 1 to 40
```

Mismatches are described as `expected 1, found 2`, `expected at most 2, found 3`, `expected at least 1, found 0` or `expected between 1 and 40, found 52`.

## Names

Used by `name` in [classes](classes.md#name), [methods](methods.md#name) and [functions](functions.md#name).

| Option     | Value              | Checks                              |
| ---------- | ------------------ | ----------------------------------- |
| `endsWith` | string             | The name ends with the suffix       |
| `matches`  | regular expression | The name matches the pattern        |
| `oneOf`    | list of strings    | The name is one of the listed names |

Every option that is set must hold; each failed option is a separate violation.

```yaml
name:
    endsWith: Controller
    matches: "^[A-Z]"
```

- `matches` uses JavaScript regular expression syntax and is not anchored, so add `^` and `$` when the whole name must match. An invalid pattern is a config error.
- `endsWith` also defines the suffix used by [`fileName`](rules-file.md#filename).

**Messages:**

```
Class name "UserService" must end with "Controller"
Method name "compute" must match /^(load|save)/
Method name "run" must be one of execute
```

## Decorators

Used by `decorators` in [classes](classes.md#decorators) and [methods](methods.md#decorators).

| Option  | Value           | Checks                                          |
| ------- | --------------- | ----------------------------------------------- |
| `allOf` | list of strings | Every listed decorator is present               |
| `oneOf` | list of strings | Exactly one of the listed decorators is present |

At least one of the options must be set; both can be combined.

```yaml
decorators:
    allOf: [Auth]
    oneOf: [Get, Post, Put, Patch, Delete]
```

Decorators are matched by name: `@Get()`, `@Get` and `@http.Get()` all count as `Get`. Where the decorator is imported from is not checked.

**Messages:**

```
"UserController" is missing @Controller
Method "list" must have exactly one of @Get, @Post, found none
Method "create" must have exactly one of @Get, @Post, found @Get, @Post
```
