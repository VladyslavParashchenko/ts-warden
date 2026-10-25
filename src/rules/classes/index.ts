import type { ClassRules } from "../../schemes/index.js"
import { describeClass } from "../../utils/declarations.js"
import { checkDeclarations } from "../shared/declarations.js"
import type { Rule } from "../types.js"
import { decoratorsRule } from "./decorators.js"
import { implementsRule } from "./implements.js"
import { methodsRule } from "./methods.js"

const declarationsRule: Rule<ClassRules> = (file, rules) =>
    checkDeclarations(file, file.getClasses().map(describeClass), rules, "Classes in file")

export const classRules: Rule<ClassRules>[] = [
    declarationsRule,
    implementsRule,
    decoratorsRule,
    methodsRule,
]
