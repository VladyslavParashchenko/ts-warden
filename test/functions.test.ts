import { describe, expect, it } from "vitest"
import type { FunctionRules } from "../src/schemes/index.js"
import { check as checkRules } from "./helpers.js"

const check = (functions: FunctionRules, code: string) => checkRules({ functions }, code)

describe("functions.count", () => {
    it("counts top-level function declarations and function variables", () => {
        const code = `
      function a() {}
      const b = () => {};
      const c = function () {};
      const value = 1;
      class A { method() {} }
      function outer() { function inner() {} }
    `
        expect(check({ count: { max: 3 } }, code)).toEqual([
            { rule: "functions.count", message: "Functions in file: expected at most 3, found 4" },
        ])
    })
})

describe("functions.name", () => {
    it("checks names of declarations and variables", () => {
        const code = `
      export function createUserHandler() {}
      export const deleteUser = () => {};
    `
        expect(check({ name: { endsWith: "Handler" } }, code)).toEqual([
            {
                rule: "functions.name",
                message: 'Function name "deleteUser" must end with "Handler"',
            },
        ])
    })

    it("reports an anonymous default function", () => {
        expect(check({ name: { matches: "^[a-z]" } }, "export default function () {}")).toEqual([
            { rule: "functions.name", message: "Anonymous function must be named" },
        ])
    })
})

describe("functions.export", () => {
    const rules: FunctionRules = { export: "named" }

    it("passes named exports", () => {
        expect(check(rules, "export function a() {}\nexport const b = () => {};")).toEqual([])
        expect(check(rules, "const a = () => {};\nexport { a };")).toEqual([])
    })

    it("reports default and missing exports", () => {
        const code = `
      export default function a() {}
      const b = () => {};
    `
        expect(check(rules, code)).toEqual([
            { rule: "functions.export", message: '"a" must use a named export, not default' },
            { rule: "functions.export", message: '"b" must be exported by name' },
        ])
    })
})

describe("functions constraints", () => {
    it("checks params, async, returnType and lines", () => {
        const code = `
      export async function ok(input: string): Promise<void> {}
      export function sync(a: string, b: string) {
        return a + b;
      }
      export const handle = async (input: string): Promise<void> => {};
    `
        const rules: FunctionRules = {
            params: { max: 1 },
            async: true,
            returnType: "explicit",
            lines: { max: 2 },
        }
        expect(check(rules, code)).toEqual([
            {
                rule: "functions.params",
                message: 'Function "sync" parameters: expected at most 1, found 2',
            },
            { rule: "functions.async", message: 'Function "sync" must be async' },
            {
                rule: "functions.returnType",
                message: 'Function "sync" must declare its return type',
            },
            {
                rule: "functions.lines",
                message: 'Function "sync" lines: expected at most 2, found 3',
            },
        ])
    })

    it("accepts a return type declared on the variable", () => {
        const code = `
      type Handler = () => void;
      export const handle: Handler = () => {};
    `
        expect(check({ returnType: "explicit" }, code)).toEqual([])
    })
})
