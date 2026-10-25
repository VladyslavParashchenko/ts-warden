import { describe, expect, it } from "vitest"
import { countLines } from "../src/rules/file-lines.js"
import { check } from "./helpers.js"

describe("countLines", () => {
    it("counts every line without the trailing newline", () => {
        expect(countLines("")).toBe(0)
        expect(countLines("a")).toBe(1)
        expect(countLines("a\n")).toBe(1)
        expect(countLines("a\n\n// comment\nb\n")).toBe(4)
        expect(countLines("a\r\nb\r\n")).toBe(2)
    })
})

describe("fileLines", () => {
    const code = "export class A {}\n\n// helper\nexport function b() {}\n"

    it("passes a file within the limit", () => {
        expect(check({ fileLines: { max: 4 } }, code)).toEqual([])
    })

    it("reports a file over the limit", () => {
        expect(check({ fileLines: { max: 3 } }, code)).toEqual([
            { rule: "fileLines", message: "File lines: expected at most 3, found 4" },
        ])
    })
})
