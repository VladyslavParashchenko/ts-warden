# Demos

Example configuration for a project with controllers, use cases and handlers. Copy the [.ts-warden](.ts-warden/) directory to the root of your project and adjust the globs and rules.

| File                                                      | Purpose                                 |
| --------------------------------------------------------- | --------------------------------------- |
| [project-manifest.yml](.ts-warden/project-manifest.yml)   | Project file: maps globs to rules files |
| [controller.yml](.ts-warden/controller.yml)               | Rules for HTTP controllers              |
| [use-case-services.yml](.ts-warden/use-case-services.yml) | Rules for use case classes              |
| [handler.yml](.ts-warden/handler.yml)                     | Rules for handler functions             |

## Controllers

[controller.yml](.ts-warden/controller.yml) expects each `*.controller.ts` file to contain exactly one class that:
- is named `*Controller` and lives in a matching file: `UserProfileController` → `user-profile.controller.ts`;
- is exported by name;
- is decorated with `@Controller`;
- has no private or protected methods;
- has exactly one HTTP decorator (`@Get`, `@Post`, `@Put`, `@Patch` or `@Delete`) on every public method;
- has only async public methods with an explicit return type;
- has no method longer than 30 lines.

```ts
@Controller("users")
export class UserProfileController {
    @Get()
    async show(): Promise<UserProfile> {
        // ...
    }

    @Patch()
    async update(): Promise<void> {
        // ...
    }
}
```

## Use cases

[use-case-services.yml](.ts-warden/use-case-services.yml) expects each `*.use-case.ts` file to contain exactly one class that:
- is named `*UseCase` and lives in a matching file: `CreateUserUseCase` → `create-user.use-case.ts`;
- is exported by name;
- implements `IUseCase`;
- has no public methods besides `execute()` required by `IUseCase`;
- has an `execute()` that is async, takes at most one parameter and declares its return type;
- has no static methods.

```ts
export class CreateUserUseCase implements IUseCase<CreateUserInput, User> {
    constructor(private readonly users: IUserRepository) {}

    async execute(input: CreateUserInput): Promise<User> {
        return this.users.create(input)
    }
}
```

## Handlers

[handler.yml](.ts-warden/handler.yml) expects each `*.handler.ts` file to contain exactly one top-level function that:
- is named `*Handler` and lives in a matching file: `createUserHandler` → `create-user.handler.ts`;
- is exported by name;
- is async, takes at most one parameter and declares its return type;
- is at most 40 lines long.

```ts
export const createUserHandler = async (event: CreateUserEvent): Promise<void> => {
    // ...
}
```

## Running

With `.ts-warden/` in the project root, run from the root without arguments:

```sh
ts-warden
```

See the [configuration reference](../docs/README.md) for the full list of options.
