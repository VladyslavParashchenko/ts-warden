import { describe, expect, it } from "vitest"
import type { RulesFile } from "../src/schemes/index.js"
import { check } from "./helpers.js"

describe("fileName", () => {
    const classRules: RulesFile = {
        fileName: "kebab-case",
        classes: { name: { endsWith: "UseCase" } },
    }

    it("separates the class suffix with a dot", () => {
        expect(
            check(classRules, "class CreateUserUseCase {}", "/src/create-user.use-case.ts"),
        ).toEqual([])
    })

    it("handles acronyms", () => {
        expect(
            check(
                classRules,
                "class SendHTTPRequestUseCase {}",
                "/src/send-http-request.use-case.ts",
            ),
        ).toEqual([])
    })

    it("reports a mismatching file name", () => {
        expect(check(classRules, "class CreateUserUseCase {}", "/src/create-user.ts")).toEqual([
            {
                rule: "fileName",
                message:
                    'File name "create-user" must be "create-user.use-case" for class "CreateUserUseCase"',
            },
        ])
    })

    it("uses the full name without a suffix rule", () => {
        const rules: RulesFile = { fileName: "kebab-case" }
        expect(check(rules, "class UserProfile {}", "/src/user-profile.ts")).toEqual([])
    })

    it("names files after functions with the function suffix", () => {
        const rules: RulesFile = {
            fileName: "kebab-case",
            functions: { name: { endsWith: "Handler" } },
        }
        expect(
            check(
                rules,
                "export const createUserHandler = () => {}",
                "/src/create-user.handler.ts",
            ),
        ).toEqual([])
    })

    it("passes when any declaration matches and lists all candidates otherwise", () => {
        const rules: RulesFile = { fileName: "kebab-case" }
        const code = "export class UserProfile {}\nexport function loadProfile() {}"
        expect(check(rules, code, "/src/load-profile.ts")).toEqual([])
        expect(check(rules, code, "/src/profile.ts")).toEqual([
            {
                rule: "fileName",
                message:
                    'File name "profile" must be one of: "user-profile" for class "UserProfile", ' +
                    '"load-profile" for function "loadProfile"',
            },
        ])
    })

    it("only considers sections configured in the rules file", () => {
        const code = "export class UserController {}\nfunction toDto() {}"
        expect(check({ fileName: "kebab-case", classes: {} }, code, "/src/to-dto.ts")).toEqual([
            {
                rule: "fileName",
                message: 'File name "to-dto" must be "user-controller" for class "UserController"',
            },
        ])
    })
})
