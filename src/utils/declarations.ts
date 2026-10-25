import { type ClassDeclaration, Node, type SourceFile } from "ts-morph"
import { type Callable, describeCallable } from "./callable.js"

/** A top-level class or function, as seen by the name, fileName and export rules. */
export interface Declaration {
    kind: "Class" | "Function"
    /** `undefined` for anonymous default exports. */
    name: string | undefined
    nameNode: Node
    isExported: boolean
    isDefaultExport: boolean
}

export interface FileFunction {
    declaration: Declaration
    callable: Callable
}

export function describeClass(cls: ClassDeclaration): Declaration {
    return {
        kind: "Class",
        name: cls.getName(),
        nameNode: cls.getNameNode() ?? cls,
        isExported: cls.isExported(),
        isDefaultExport: cls.isDefaultExport(),
    }
}

/**
 * Top-level functions of the file: `function` declarations and variables initialized
 * with a function (`const handle = () => {}`), in source order.
 */
export function getFileFunctions(file: SourceFile): FileFunction[] {
    const declarations = file.getFunctions().map((fn): FileFunction => {
        const nameNode = fn.getNameNode() ?? fn
        const name = fn.getName()
        return {
            declaration: {
                kind: "Function",
                name,
                nameNode,
                isExported: fn.isExported(),
                isDefaultExport: fn.isDefaultExport(),
            },
            callable: describeCallable(name ?? "default", nameNode, fn, fn, undefined),
        }
    })

    const variables = file.getVariableDeclarations().flatMap((variable): FileFunction[] => {
        const initializer = variable.getInitializer()
        if (!Node.isArrowFunction(initializer) && !Node.isFunctionExpression(initializer)) {
            return []
        }
        const nameNode = variable.getNameNode()
        const name = variable.getName()
        return [
            {
                declaration: {
                    kind: "Function",
                    name,
                    nameNode,
                    isExported: variable.isExported(),
                    isDefaultExport: variable.isDefaultExport(),
                },
                callable: describeCallable(
                    name,
                    nameNode,
                    variable,
                    initializer,
                    variable.getTypeNode(),
                ),
            },
        ]
    })

    return [...declarations, ...variables].sort(
        (a, b) => a.declaration.nameNode.getStart() - b.declaration.nameNode.getStart(),
    )
}
