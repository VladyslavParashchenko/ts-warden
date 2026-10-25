import type { CallableRules } from "../../schemes/index.js"
import type { Callable } from "../../utils/callable.js"
import { checkCount } from "../../utils/count.js"
import type { Issue } from "../types.js"
import { checkName } from "./name.js"

/** Constraints shared by methods and functions. `kind` starts messages: `Method "list" ...`. */
export function checkCallable(
    callable: Callable,
    rules: CallableRules,
    kind: string,
    options: { checkName: boolean },
): Issue[] {
    const problems: Array<[rule: string, message: string]> = []
    const subject = `${kind} "${callable.name}"`

    if (options.checkName && rules.name !== undefined) {
        for (const problem of checkName(callable.name, rules.name)) {
            problems.push(["name", `${kind} name "${callable.name}" ${problem}`])
        }
    }

    if (rules.params !== undefined) {
        const mismatch = checkCount(rules.params, callable.params)
        if (mismatch) problems.push(["params", `${subject} parameters: ${mismatch}`])
    }

    if (rules.async !== undefined && callable.isAsync !== rules.async) {
        problems.push(["async", `${subject} ${rules.async ? "must" : "must not"} be async`])
    }

    if (rules.returnType === "explicit" && !callable.hasReturnType) {
        problems.push(["returnType", `${subject} must declare its return type`])
    }

    if (rules.lines !== undefined) {
        const mismatch = checkCount(rules.lines, callable.lines)
        if (mismatch) problems.push(["lines", `${subject} lines: ${mismatch}`])
    }

    return problems.map(([rule, message]) => ({ node: callable.nameNode, rule, message }))
}
