import type { Node, SourceFile } from "ts-morph"

export interface Issue {
    /** Node the issue is reported at. */
    node: Node
    /** Config key of the rule, e.g. `classes.name`. */
    rule: string
    message: string
}

export type Rule<T> = (file: SourceFile, rules: T) => Issue[]
