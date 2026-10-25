import type { RulesFile } from "../schemes/index.js"
import { checkCount } from "../utils/count.js"
import type { Rule } from "./types.js"

/** Every line counts, including blank lines and comments; a trailing newline does not add one. */
export function countLines(text: string): number {
    if (text === "") return 0
    const lines = text.split(/\r?\n/)
    return text.endsWith("\n") ? lines.length - 1 : lines.length
}

export const fileLinesRule: Rule<RulesFile> = (file, rules) => {
    if (rules.fileLines === undefined) return []

    const mismatch = checkCount(rules.fileLines, countLines(file.getFullText()))
    return mismatch ? [{ node: file, rule: "fileLines", message: `File lines: ${mismatch}` }] : []
}
