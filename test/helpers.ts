import { Project } from "ts-morph"
import { checkFile } from "../src/rules/index.js"
import type { RulesFile } from "../src/schemes/index.js"

const useCaseInterface = `
export interface IUseCase<TInput, TOutput> {
  execute(input: TInput): Promise<TOutput>;
}
`

/** Checks `code` in an in-memory project that also has `IUseCase` in `/src/use-case.ts`. */
export function check(rules: RulesFile, code: string, filePath = "/src/example.ts") {
    const project = new Project({ useInMemoryFileSystem: true })
    project.createSourceFile("/src/use-case.ts", useCaseInterface)
    const file = project.createSourceFile(filePath, code)
    return checkFile(file, rules).map(({ rule, message }) => ({ rule, message }))
}
