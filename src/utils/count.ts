import type { Count } from "../schemes/index.js"

function describeExpected(expected: Count): string {
    if (typeof expected === "number") return `${expected}`
    const { min, max } = expected
    if (min !== undefined && max !== undefined) return `between ${min} and ${max}`
    if (min !== undefined) return `at least ${min}`
    return `at most ${max}`
}

function matches(expected: Count, actual: number): boolean {
    if (typeof expected === "number") return actual === expected
    return (
        (expected.min === undefined || actual >= expected.min) &&
        (expected.max === undefined || actual <= expected.max)
    )
}

/** Returns a mismatch description, or `undefined` when `actual` satisfies `expected`. */
export function checkCount(expected: Count, actual: number): string | undefined {
    if (matches(expected, actual)) return undefined
    return `expected ${describeExpected(expected)}, found ${actual}`
}
