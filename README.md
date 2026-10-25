# ts-warden

Static analyzer that enforces architecture conventions in TypeScript projects. You describe what classes and functions in each part of the codebase must look like — controllers, use cases, handlers — and `ts-warden` reports every file that breaks the rules.

Built on [ts-morph](https://ts-morph.com), so checks use the TypeScript type checker rather than text matching: aliased imports, generic interfaces and interface inheritance are resolved correctly.

```
src/controllers/order-api.controller.ts
  3:14    error  File name "order-api.controller" must be "order.controller" for class "OrderController"  controllers/fileName
  3:14    error  "OrderController" is missing @Controller  controllers/classes.decorators
  7:5     error  Method "remove" must have exactly one of @Get, @Post, found none  controllers/classes.methods.public.decorators

src/use-cases/delete-user.use-case.ts
  1:22    error  "DeleteUserUseCase" must implement "IUseCase"  use-cases/classes.implements

✖ 4 problems in 2 files
```

## Requirements

- Node.js 22 or newer
- pnpm

## Getting started

The package is not published yet. Build it from source and link the binary:

```sh
pnpm install
pnpm build
pnpm link --global
```

Then add a project file to the root of the project you want to check (see [Configuration](#configuration)) and run:

```sh
ts-warden
```

## CLI

```
ts-warden [options] [files...]

  -c, --config <path>    Project config (default: ts-warden.yml)
  -p, --tsconfig <path>  tsconfig used for type resolution
                         (default: tsconfig.json next to the project config)
      --format <format>  pretty | json (default: pretty)
  -h, --help             Show this help
```

| Exit code | Meaning                     |
| --------- | --------------------------- |
| `0`       | No violations               |
| `1`       | Violations found            |
| `2`       | Invalid arguments or config |

### Checking specific files

By default every file matched by the globs in the project file is checked. Pass file paths to check only those files:

```sh
ts-warden src/controllers/user.controller.ts src/use-cases/create-user.use-case.ts
```

Paths are relative to the current directory. Each file is checked by the groups whose glob matches it, and files that match no group are skipped, so you can pass any list of changed files as is. A path that does not exist is an error (exit code `2`).

`--format json` prints an array of violations with `file`, `line`, `column`, `group`, `rule` and `message`, for use in scripts and CI integrations.

## Configuration

Configuration has two levels: a **project manifest** that maps globs to rules files, and **rules files** that describe what the matched files must contain.

`ts-warden.yml`:

```yaml
controllers:
    - glob: src/controllers/**/*.controller.ts
      config: ./controller.yml
handlers:
    - glob: src/handlers/**/*.handler.ts
      config: ./handler.yml
```

`controller.yml`:

```yaml
fileName: kebab-case
classes:
    count: 1
    name:
        endsWith: Controller
    export: named
    decorators:
        allOf: [Controller]
    methods:
        public:
            decorators:
                oneOf: [Get, Post, Put, Patch, Delete]
            async: true
            returnType: explicit
        private:
            count: 0
```

`handler.yml`:

```yaml
fileName: kebab-case
functions:
    count: 1
    name:
        endsWith: Handler
    export: named
    params: { max: 1 }
```

Every option is described in the [configuration reference](docs/README.md):

| Page                                         | Describes                                              |
| -------------------------------------------- | ------------------------------------------------------ |
| [Project manifest](docs/project-manifest.md) | Groups, globs and how paths are resolved               |
| [Rules file](docs/rules-file.md)             | Top-level keys of a rules file and the `fileName` rule |
| [Classes](docs/classes.md)                   | `count`, `name`, `export`, `implements`, `decorators`  |
| [Methods](docs/methods.md)                   | Constraints on class methods, grouped by visibility    |
| [Functions](docs/functions.md)               | Constraints on top-level functions                     |
| [Common values](docs/common-values.md)       | Counts, names and decorators                           |

Ready-made examples are in [demos/](demos/).

## Using in CI and git hooks

Since violations make the process exit with `1`, `ts-warden` can run as a CI step as is. To run it before each commit with [prek](https://github.com/j178/prek) or pre-commit, add a local hook. With `pass_filenames: true` only the staged files are checked:

```yaml
- repo: local
  hooks:
      - id: ts-warden
        name: ts-warden
        entry: ts-warden
        language: system
        pass_filenames: true
        types: [ts]
```

## Development

```sh
pnpm install      # also installs git hooks via prek
pnpm dev -c test/fixtures/app/ts-warden.yml
pnpm test
pnpm typecheck
pnpm check:fix    # biome lint + format
pnpm build
```

| Path                         | Contents                                                             |
| ---------------------------- | -------------------------------------------------------------------- |
| `src/index.ts`, `src/cli.ts` | Binary entry point and argument parsing                              |
| `src/schemes/`               | Config schemas (zod), collected in `src/schemes/index.ts`            |
| `src/config.ts`              | Loading of the project and rules files                               |
| `src/analyzer.ts`            | Creates the ts-morph project and runs rules on matched files         |
| `src/rules/`                 | Rules: `file-name.ts`, `classes/`, `functions/` and `shared/` checks |
| `src/utils/`                 | Helpers that read classes, methods and functions from the AST        |
| `src/report.ts`              | Terminal output                                                      |
| `test/`                      | Unit tests per config section and end-to-end tests for the CLI       |
| `test/fixtures/`             | Sample projects used by the end-to-end tests                         |

### Adding a rule

1. Add the option to the schema in `src/schemes/`: `classes.ts`, `functions.ts`, or `callable.ts` for a constraint shared by methods and functions.
2. Implement it as a `Rule` in `src/rules/classes/` or `src/rules/functions/` — a function that takes a `SourceFile` and the section config and returns issues — or extend a shared check in `src/rules/shared/`. Return no issues when the option is not set.
3. Register a new `Rule` in `classRules` or `functionRules` in that folder's `index.ts`. Rule ids are prefixed with the section automatically.
4. Cover it in `test/classes.test.ts`, `test/functions.test.ts` or `test/file-name.test.ts`.
5. Document it in `docs/`.

### Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org) and are checked by commitlint. The pre-commit hook runs biome and `tsc`.

## License

MIT
