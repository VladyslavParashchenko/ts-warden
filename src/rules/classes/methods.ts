import type { ClassDeclaration } from "ts-morph"
import {
    type ClassRules,
    type MethodRules,
    type MethodScopeKey,
    methodScopes,
} from "../../schemes/index.js"
import { checkCount } from "../../utils/count.js"
import { type ClassMethod, getClassMethods, getInterfaceMemberNames } from "../../utils/members.js"
import { checkCallable } from "../shared/callable.js"
import { checkDecorators } from "../shared/decorators.js"
import type { Issue, Rule } from "../types.js"

const scopeLabels: Record<MethodScopeKey, string> = {
    public: "Public methods",
    protected: "Protected methods",
    private: "Private methods",
    all: "Methods",
}

export const methodsRule: Rule<ClassRules> = (file, rules) => {
    const scopes = rules.methods
    if (scopes === undefined) return []

    return file.getClasses().flatMap((cls) => {
        // Methods required by `implements` are the class contract, not extra API.
        const contract = getInterfaceMemberNames(cls, rules.implements ?? [])
        const methods = getClassMethods(cls)

        return methodScopes.flatMap((scope) => {
            const config = scopes[scope]
            if (config === undefined) return []

            const selected =
                scope === "all" ? methods : methods.filter((method) => method.scope === scope)
            const prefix = `methods.${scope}`
            const counted = selected.filter((method) => !contract.has(method.name))
            return [
                ...checkMethodCount(cls, counted, config, prefix, scopeLabels[scope]),
                ...selected.flatMap((method) => checkMethod(method, config, prefix)),
            ]
        })
    })
}

function checkMethodCount(
    cls: ClassDeclaration,
    methods: ClassMethod[],
    config: MethodRules,
    prefix: string,
    label: string,
): Issue[] {
    if (config.count === undefined) return []
    const mismatch = checkCount(config.count, methods.length)
    if (!mismatch) return []

    const names = methods.map((method) => method.name).join(", ")
    return [
        {
            node: cls.getNameNode() ?? cls,
            rule: `${prefix}.count`,
            message: `${label}: ${mismatch}${names ? ` (${names})` : ""}`,
        },
    ]
}

function checkMethod(method: ClassMethod, config: MethodRules, prefix: string): Issue[] {
    const issues: Issue[] = []
    const subject = `Method "${method.name}"`

    if (config.decorators) {
        for (const problem of checkDecorators(method.decorators, config.decorators)) {
            issues.push({
                node: method.nameNode,
                rule: "decorators",
                message: `${subject} ${problem}`,
            })
        }
    }

    issues.push(...checkCallable(method, config, "Method", { checkName: true }))

    if (config.static !== undefined && method.isStatic !== config.static) {
        issues.push({
            node: method.nameNode,
            rule: "static",
            message: `${subject} ${config.static ? "must" : "must not"} be static`,
        })
    }

    return issues.map((issue) => ({ ...issue, rule: `${prefix}.${issue.rule}` }))
}
