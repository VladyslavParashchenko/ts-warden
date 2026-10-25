import {
    type ClassDeclaration,
    type MethodDeclaration,
    Node,
    type PropertyDeclaration,
    Scope,
    type Type,
} from "ts-morph"
import { type Callable, describeCallable, type FunctionLike } from "./callable.js"

export type MethodScope = "public" | "protected" | "private"

export interface ClassMethod extends Callable {
    scope: MethodScope
    isStatic: boolean
    decorators: string[]
}

type Member = MethodDeclaration | PropertyDeclaration

function getScope(member: Member): MethodScope {
    // `#method()` has no modifier but is private.
    if (Node.isPrivateIdentifier(member.getNameNode())) return "private"
    switch (member.getScope()) {
        case Scope.Private:
            return "private"
        case Scope.Protected:
            return "protected"
        default:
            return "public"
    }
}

function describeMethod(member: Member, fn: FunctionLike): ClassMethod {
    const typeNode = Node.isPropertyDeclaration(member) ? member.getTypeNode() : undefined
    return {
        ...describeCallable(member.getName(), member.getNameNode(), member, fn, typeNode),
        scope: getScope(member),
        isStatic: member.isStatic(),
        decorators: member.getDecorators().map((decorator) => decorator.getName()),
    }
}

/**
 * Methods of the class, including properties initialized with a function
 * (`handle = () => {}`), in source order. Constructors and accessors are not methods.
 */
export function getClassMethods(cls: ClassDeclaration): ClassMethod[] {
    const methods = cls.getMethods().map((method) => describeMethod(method, method))
    const functionProperties = cls.getProperties().flatMap((property) => {
        const initializer = property.getInitializer()
        if (Node.isArrowFunction(initializer) || Node.isFunctionExpression(initializer)) {
            return [describeMethod(property, initializer)]
        }
        return []
    })
    return [...methods, ...functionProperties].sort(
        (a, b) => a.nameNode.getStart() - b.nameNode.getStart(),
    )
}

/**
 * Walks every interface the class implements, including interfaces they extend.
 * Unresolved types fall back to the name written in the `implements` clause.
 */
export function getImplementedInterfaces(cls: ClassDeclaration): Map<string, Type | undefined> {
    const found = new Map<string, Type | undefined>()

    const visit = (type: Type) => {
        const symbol = type.getSymbol()
        if (!symbol || found.has(symbol.getName())) return
        // A heritage clause type has no base types; the declared interface type does.
        const declared = symbol.getDeclaredType()
        found.set(symbol.getName(), declared)
        for (const base of declared.getBaseTypes()) visit(base)
    }

    for (const clause of cls.getImplements()) {
        const type = clause.getType()
        if (type.getSymbol()) {
            visit(type)
        } else {
            const name = clause.getExpression().getText().split(".").at(-1)
            if (name) found.set(name, undefined)
        }
    }
    return found
}

/** Member names declared by the listed interfaces (and the interfaces they extend). */
export function getInterfaceMemberNames(
    cls: ClassDeclaration,
    interfaceNames: string[],
): Set<string> {
    const members = new Set<string>()
    const implemented = getImplementedInterfaces(cls)
    for (const name of interfaceNames) {
        for (const property of implemented.get(name)?.getProperties() ?? []) {
            members.add(property.getName())
        }
    }
    return members
}
