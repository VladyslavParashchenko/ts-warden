import type {
    ArrowFunction,
    FunctionDeclaration,
    FunctionExpression,
    MethodDeclaration,
    Node,
} from "ts-morph"

export type FunctionLike =
    | MethodDeclaration
    | FunctionDeclaration
    | ArrowFunction
    | FunctionExpression

/** What method and function constraints are checked against. */
export interface Callable {
    name: string
    /** Node issues about the callable are reported at. */
    nameNode: Node
    isAsync: boolean
    hasReturnType: boolean
    params: number
    /** Lines from the name to the end of the declaration. */
    lines: number
}

/**
 * @param declaration The whole declaration: the method, property or variable holding `fn`.
 * @param typeNode Type annotation of the property or variable, e.g. `handle: Handler = () => {}`.
 */
export function describeCallable(
    name: string,
    nameNode: Node,
    declaration: Node,
    fn: FunctionLike,
    typeNode: Node | undefined,
): Callable {
    return {
        name,
        nameNode,
        isAsync: fn.isAsync(),
        hasReturnType: fn.getReturnTypeNode() !== undefined || typeNode !== undefined,
        params: fn.getParameters().length,
        lines: declaration.getEndLineNumber() - nameNode.getStartLineNumber() + 1,
    }
}
