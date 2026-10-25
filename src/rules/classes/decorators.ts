import type { ClassRules } from "../../schemes/index.js"
import { checkDecorators } from "../shared/decorators.js"
import type { Rule } from "../types.js"

export const decoratorsRule: Rule<ClassRules> = (file, rules) => {
    const config = rules.decorators
    if (config === undefined) return []

    return file.getClasses().flatMap((cls) => {
        const present = cls.getDecorators().map((decorator) => decorator.getName())
        const className = cls.getName() ?? "Anonymous class"
        return checkDecorators(present, config).map((problem) => ({
            node: cls.getNameNode() ?? cls,
            rule: "decorators",
            message: `"${className}" ${problem}`,
        }))
    })
}
