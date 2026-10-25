import { readFile } from "node:fs/promises"
import path from "node:path"
import { parse } from "yaml"
import type { z } from "zod"
import { projectFileSchema, type RulesFile, rulesFileSchema } from "./schemes/index.js"

export interface Target {
    /** Group name from the project file, e.g. `controllers`. */
    group: string
    /** Glob relative to the project root. */
    glob: string
    rules: RulesFile
}

export interface ProjectConfig {
    /** Directory containing the project file; globs are resolved against it. */
    root: string
    targets: Target[]
}

export class ConfigError extends Error {
    override name = "ConfigError"
}

async function readYaml<T>(filePath: string, schema: z.ZodType<T>): Promise<T> {
    let source: string
    try {
        source = await readFile(filePath, "utf8")
    } catch (error) {
        throw new ConfigError(`Cannot read ${filePath}: ${(error as Error).message}`)
    }

    let data: unknown
    try {
        data = parse(source)
    } catch (error) {
        throw new ConfigError(`Invalid YAML in ${filePath}: ${(error as Error).message}`)
    }

    const result = schema.safeParse(data)
    if (!result.success) {
        const issues = result.error.issues
            .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
            .join("\n")
        throw new ConfigError(`Invalid config ${filePath}:\n${issues}`)
    }
    return result.data
}

export async function loadProjectConfig(projectFilePath: string): Promise<ProjectConfig> {
    const absolutePath = path.resolve(projectFilePath)
    const root = path.dirname(absolutePath)
    const projectFile = await readYaml(absolutePath, projectFileSchema)

    // Several groups may share one rules file, so read each file only once.
    const rulesCache = new Map<string, Promise<RulesFile>>()
    const loadRules = (configPath: string) => {
        const resolved = path.resolve(root, configPath)
        let rules = rulesCache.get(resolved)
        if (!rules) {
            rules = readYaml(resolved, rulesFileSchema)
            rulesCache.set(resolved, rules)
        }
        return rules
    }

    const targets = await Promise.all(
        Object.entries(projectFile).flatMap(([group, entries]) =>
            entries.map(async (entry) => ({
                group,
                glob: entry.glob,
                rules: await loadRules(entry.config),
            })),
        ),
    )

    return { root, targets }
}
