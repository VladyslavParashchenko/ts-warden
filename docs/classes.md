# Classes

The `classes` section checks top-level classes of the file: classes declared directly in the module, exported or not. Classes nested in functions or namespaces are not checked.

```yaml
classes:
    count: 1
    name:
        endsWith: UseCase
    export: named
    implements:
        - IUseCase
    decorators:
        allOf: [Injectable]
    methods:
        public:
            count: 0
```

| Option                      | Value                                     | Rule id              |
| --------------------------- | ----------------------------------------- | -------------------- |
| [`count`](#count)           | [count](common-values.md#count)           | `classes.count`      |
| [`name`](#name)             | [names](common-values.md#names)           | `classes.name`       |
| [`export`](#export)         | `named`                                   | `classes.export`     |
| [`implements`](#implements) | list of strings                           | `classes.implements` |
| [`decorators`](#decorators) | [decorators](common-values.md#decorators) | `classes.decorators` |
| [`methods`](methods.md)     | see [Methods](methods.md)                 | `classes.methods.*`  |

All options except `count` apply to every class in the file.

## `count`

Number of top-level classes in the file. Reported at the start of the file.

```yaml
count: 1
```

```
Classes in file: expected 1, found 2
```

## `name`

Name of each class; see [Names](common-values.md#names). An anonymous class (`export default class {}`) is reported when any `name` option is set.

```yaml
name:
    endsWith: Controller
```

```
Class name "UserService" must end with "Controller"
Anonymous class must be named
```

## `export`

**Value:** `named`

Each class must be exported by name. Both forms pass:

```ts
export class CreateUserUseCase {}

class CreateUserUseCase {}
export { CreateUserUseCase }
```

A default export, inline or separate, and a class that is not exported are reported:

```
"CreateUserUseCase" must use a named export, not default
"CreateUserUseCase" must be exported by name
```

## `implements`

Each class must implement every listed interface. Names are compared after the type checker resolves the `implements` clause, so all of these satisfy `implements: [IUseCase]`:

```ts
class A implements IUseCase<Input, Output> {} // generic arguments are ignored

import { IUseCase as Base } from "./use-case"
class B implements Base<Input, Output> {} // aliased import

interface ICreateUser extends IUseCase<Input, Output> {}
class C implements ICreateUser {} // inherited interface
```

When the interface cannot be resolved, for example because the import is broken, the name written in the `implements` clause is used.

Interfaces listed here also affect [`methods.*.count`](methods.md#count): methods they declare are not counted.

```
"DeleteUserUseCase" must implement "IUseCase"
```

## `decorators`

Decorators on each class; see [Decorators](common-values.md#decorators).

```yaml
decorators:
    allOf: [Controller]
```

```
"OrderController" is missing @Controller
```

## `methods`

Constraints on class methods, grouped by visibility. See [Methods](methods.md).
