import type { SourceFile } from "ts-morph"
import type { DeclarationRules } from "../../schemes/index.js"
import { checkCount } from "../../utils/count.js"
import type { Declaration } from "../../utils/declarations.js"
import type { Issue } from "../types.js"
import { checkName } from "./name.js"

/** `count`, `name` and `export` rules shared by classes and functions. */
export function checkDeclarations(
    file: SourceFile,
    declarations: Declaration[],
    rules: DeclarationRules,
    label: string,
): Issue[] {
    const issues: Issue[] = []

    if (rules.count !== undefined) {
        const mismatch = checkCount(rules.count, declarations.length)
        if (mismatch) issues.push({ node: file, rule: "count", message: `${label}: ${mismatch}` })
    }

    for (const declaration of declarations) {
        const { kind, name, nameNode } = declaration

        if (rules.name !== undefined) {
            if (name === undefined) {
                issues.push({
                    node: nameNode,
                    rule: "name",
                    message: `Anonymous ${kind.toLowerCase()} must be named`,
                })
            } else {
                for (const problem of checkName(name, rules.name)) {
                    issues.push({
                        node: nameNode,
                        rule: "name",
                        message: `${kind} name "${name}" ${problem}`,
                    })
                }
            }
        }

        if (rules.export === "named") {
            const subject = `"${name ?? `Anonymous ${kind.toLowerCase()}`}"`
            if (declaration.isDefaultExport) {
                issues.push({
                    node: nameNode,
                    rule: "export",
                    message: `${subject} must use a named export, not default`,
                })
            } else if (!declaration.isExported) {
                issues.push({
                    node: nameNode,
                    rule: "export",
                    message: `${subject} must be exported by name`,
                })
            }
        }
    }
    return issues
}
