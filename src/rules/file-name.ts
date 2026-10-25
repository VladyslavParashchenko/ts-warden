import type { RulesFile } from "../schemes/index.js"
import { toKebabCase } from "../utils/case.js"
import { type Declaration, describeClass, getFileFunctions } from "../utils/declarations.js"
import type { Rule } from "./types.js"

/** `CreateUserUseCase` with suffix `UseCase` -> `create-user.use-case`. */
export function expectedFileName(name: string, suffix: string | undefined): string {
    if (suffix && name.endsWith(suffix) && name.length > suffix.length) {
        const base = name.slice(0, -suffix.length)
        return `${toKebabCase(base)}.${toKebabCase(suffix)}`
    }
    return toKebabCase(name)
}

interface Candidate {
    declaration: Declaration & { name: string }
    expected: string
}

/**
 * Declarations the file may be named after. Only sections configured in the rules
 * file are considered, so a helper function does not name a controller file.
 */
function getCandidates(file: Parameters<Rule<RulesFile>>[0], rules: RulesFile): Candidate[] {
    const both = rules.classes === undefined && rules.functions === undefined
    const sources: Array<[Declaration[], string | undefined]> = []
    if (both || rules.classes !== undefined) {
        sources.push([file.getClasses().map(describeClass), rules.classes?.name?.endsWith])
    }
    if (both || rules.functions !== undefined) {
        const functions = getFileFunctions(file).map((fn) => fn.declaration)
        sources.push([functions, rules.functions?.name?.endsWith])
    }

    return sources.flatMap(([declarations, suffix]) =>
        declarations.flatMap((declaration) => {
            const { name } = declaration
            if (name === undefined) return []
            return [
                { declaration: { ...declaration, name }, expected: expectedFileName(name, suffix) },
            ]
        }),
    )
}

/** The file must be named after at least one of its top-level declarations. */
export const fileNameRule: Rule<RulesFile> = (file, rules) => {
    if (rules.fileName === undefined) return []

    const candidates = getCandidates(file, rules)
    const actual = file.getBaseNameWithoutExtension()
    const [first] = candidates
    if (!first || candidates.some((candidate) => candidate.expected === actual)) return []

    const describe = ({ declaration, expected }: Candidate) =>
        `"${expected}" for ${declaration.kind.toLowerCase()} "${declaration.name}"`
    return [
        {
            node: first.declaration.nameNode,
            rule: "fileName",
            message:
                candidates.length === 1
                    ? `File name "${actual}" must be ${describe(first)}`
                    : `File name "${actual}" must be one of: ${candidates.map(describe).join(", ")}`,
        },
    ]
}
