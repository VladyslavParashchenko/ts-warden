import { execFileSync } from "node:child_process"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { analyze } from "../src/analyzer.js"
import { run } from "../src/cli.js"
import { loadProjectConfig } from "../src/config.js"
import { initProject } from "../src/init.js"

let root: string
const configDir = () => path.join(root, ".ts-warden")

beforeEach(async () => {
    root = await mkdtemp(path.join(tmpdir(), "ts-warden-init-"))
})

afterEach(async () => {
    await rm(root, { recursive: true, force: true })
})

describe("initProject", () => {
    it("creates a starter config that loads and runs", async () => {
        const result = await initProject(root, { gitIgnored: false })
        expect(result.created.map((file) => path.relative(root, file))).toEqual([
            ".ts-warden/project-manifest.yml",
            ".ts-warden/example.yml",
        ])

        await writeFile(path.join(root, "a.ts"), "")
        const config = await loadProjectConfig(path.join(configDir(), "project-manifest.yml"))
        expect(config.root).toBe(root)
        expect(analyze(config)).toEqual([])
    })

    it("adds a .gitignore that hides the directory from git", async () => {
        await initProject(root, { gitIgnored: true })
        expect(await readFile(path.join(configDir(), ".gitignore"), "utf8")).toBe("*\n")

        execFileSync("git", ["init", "-q"], { cwd: root })
        const status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all"], {
            cwd: root,
            encoding: "utf8",
        })
        expect(status).toBe("")
    })

    it("keeps existing files and creates only missing ones", async () => {
        await initProject(root, { gitIgnored: false })
        const manifest = path.join(configDir(), "project-manifest.yml")
        await writeFile(manifest, "custom: []\n")

        const result = await initProject(root, { gitIgnored: true })
        expect(result.created.map((file) => path.basename(file))).toEqual([".gitignore"])
        expect(result.skipped.map((file) => path.basename(file))).toEqual([
            "project-manifest.yml",
            "example.yml",
        ])
        expect(await readFile(manifest, "utf8")).toBe("custom: []\n")
    })
})

describe("run init", () => {
    it("rejects extra arguments", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        expect(await run(["init", "src"])).toBe(2)
    })

    it("rejects --git-ignored without init", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {})
        expect(await run(["--git-ignored"])).toBe(2)
    })
})
