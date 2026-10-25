import path from "node:path"
import { describe, expect, it, vi } from "vitest"
import { analyze } from "../src/analyzer.js"
import { run } from "../src/cli.js"
import { ConfigError, loadProjectConfig } from "../src/config.js"

const fixture = path.resolve(import.meta.dirname, "fixtures/app")
const projectFile = path.join(fixture, ".ts-warden/project-manifest.yml")

describe("analyze", () => {
    it("reports violations of the fixture project", async () => {
        const violations = analyze(await loadProjectConfig(projectFile))
        expect(
            violations.map((v) => `${v.file}:${v.line}:${v.column} ${v.group}/${v.rule}`),
        ).toEqual([
            "src/controllers/order-api.controller.ts:3:14 controllers/fileName",
            "src/controllers/order-api.controller.ts:3:14 controllers/classes.decorators",
            "src/controllers/order-api.controller.ts:3:14 controllers/classes.methods.private.count",
            "src/controllers/order-api.controller.ts:7:5 controllers/classes.methods.public.decorators",
            "src/handlers/delete-user.handler.ts:1:17 handlers/fileName",
            "src/handlers/delete-user.handler.ts:1:17 handlers/functions.name",
            "src/handlers/delete-user.handler.ts:1:17 handlers/functions.params",
            "src/handlers/delete-user.handler.ts:1:17 handlers/functions.async",
            "src/use-cases/delete-user.use-case.ts:1:22 use-cases/classes.export",
            "src/use-cases/delete-user.use-case.ts:1:22 use-cases/classes.implements",
            "src/use-cases/delete-user.use-case.ts:1:22 use-cases/classes.methods.public.count",
        ])
    })

    it("checks only the given files", async () => {
        const violations = analyze(await loadProjectConfig(projectFile), {
            files: [path.join(fixture, "src/use-cases/delete-user.use-case.ts")],
        })
        expect(new Set(violations.map((v) => v.file))).toEqual(
            new Set(["src/use-cases/delete-user.use-case.ts"]),
        )
    })

    it("skips given files that match no group", async () => {
        const violations = analyze(await loadProjectConfig(projectFile), {
            files: [path.join(fixture, "src/decorators.ts")],
        })
        expect(violations).toEqual([])
    })
})

describe("loadProjectConfig", () => {
    it("rejects unknown keys", async () => {
        const dir = path.resolve(import.meta.dirname, "fixtures/invalid")
        await expect(
            loadProjectConfig(path.join(dir, ".ts-warden/project-manifest.yml")),
        ).rejects.toThrow(ConfigError)
        await expect(
            loadProjectConfig(path.join(dir, ".ts-warden/project-manifest.yml")),
        ).rejects.toThrow(/classes: Unrecognized key: "restrictions"/)
    })
})

describe("run", () => {
    it("exits with 1 when violations are found", async () => {
        vi.spyOn(console, "log").mockImplementation(() => {})
        expect(await run(["--config", projectFile, "--format", "json"])).toBe(1)
    })

    it("exits with 0 when the given files are clean", async () => {
        vi.spyOn(console, "log").mockImplementation(() => {})
        const file = path.join(fixture, "src/controllers/user.controller.ts")
        expect(await run(["--config", projectFile, file])).toBe(0)
    })

    it("exits with 2 on a missing file", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        const file = path.join(fixture, "src/missing.controller.ts")
        expect(await run(["--config", projectFile, file])).toBe(2)
    })

    it("exits with 2 on a missing config", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        expect(await run(["--config", path.join(fixture, "missing.yml")])).toBe(2)
    })
})
