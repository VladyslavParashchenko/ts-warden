import type { ClassRules } from "../../schemes/index.js"
import { getImplementedInterfaces } from "../../utils/members.js"
import type { Rule } from "../types.js"

export const implementsRule: Rule<ClassRules> = (file, rules) => {
    const required = rules.implements
    if (required === undefined) return []

    return file.getClasses().flatMap((cls) => {
        const implemented = getImplementedInterfaces(cls)
        const name = cls.getName() ?? "Anonymous class"
        return required
            .filter((interfaceName) => !implemented.has(interfaceName))
            .map((interfaceName) => ({
                node: cls.getNameNode() ?? cls,
                rule: "implements",
                message: `"${name}" must implement "${interfaceName}"`,
            }))
    })
}
