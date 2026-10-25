import type { IUseCase } from "./use-case.js"

export class CreateUserUseCase implements IUseCase<string, number> {
    async execute(name: string) {
        return name.length
    }
}
