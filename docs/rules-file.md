# Rules file

A rules file describes what every file matched by its group must contain. It has three top-level keys; each is optional, but at least one must be set.

| Key                     | Value                     | Description                                   |
| ----------------------- | ------------------------- | --------------------------------------------- |
| [`fileName`](#filename) | `kebab-case`              | The file is named after its class or function |
| `classes`               | [Classes](classes.md)     | Rules for top-level classes                   |
| `functions`             | [Functions](functions.md) | Rules for top-level functions                 |

```yaml
fileName: kebab-case
classes:
    count: 1
    name:
        endsWith: UseCase
    export: named
functions:
    count: 0
```

## `fileName`

**Value:** `kebab-case` · **Rule id:** `fileName`

The file must be named after one of its top-level declarations. The expected name is built from the declaration name:
1. If the declaration's section sets `name.endsWith` and the name ends with that suffix, the suffix is split off.
2. The rest of the name is converted to kebab-case.
3. The suffix, also in kebab-case, is appended after a dot.

| Declaration            | Suffix rule                         | Expected file               |
| ---------------------- | ----------------------------------- | --------------------------- |
| `CreateUserUseCase`    | `classes.name.endsWith: UseCase`    | `create-user.use-case.ts`   |
| `HTTPClientController` | `classes.name.endsWith: Controller` | `http-client.controller.ts` |
| `createUserHandler`    | `functions.name.endsWith: Handler`  | `create-user.handler.ts`    |
| `UserProfile`          | none                                | `user-profile.ts`           |

The extension is not compared, so `user-card.tsx` matches `UserCard` as well.

Which declarations are considered:
- If the rules file has `classes`, `functions` or both, only declarations of those sections count. A helper function in a controller file therefore cannot satisfy the rule when only `classes` is configured.
- If the rules file has neither, both classes and functions count.
- Anonymous declarations (`export default class {}`) are skipped.
- If the file has no named declarations, the rule does not report anything; use `count` to require one.

The rule passes when the file name matches **any** candidate. The violation is reported at the first candidate.

**Messages:**

```
File name "create-user" must be "create-user.use-case" for class "CreateUserUseCase"
File name "profile" must be one of: "user-profile" for class "UserProfile", "load-profile" for function "loadProfile"
```
