import { existsSync } from "node:fs"
import path from "node:path"
import { Project, type SourceFile } from "ts-morph"
import type { ProjectConfig } from "./config.js"
import { checkFile } from "./rules/index.js"
import type { RulesFile } from "./schemes/index.js"

export interface Violation {
    /** Path relative to the project root, with forward slashes. */
    file: string
    line: number
    column: number
    group: string
    rule: string
    message: string
}

export interface AnalyzeOptions {
    /** Defaults to `tsconfig.json` in the project root when it exists. */
    tsConfigFilePath?: string
    /**
     * Absolute paths to check instead of everything matched by the globs.
     * Each file is checked by the groups whose glob matches it; other files are skipped.
     */
    files?: string[]
}

function createProject(root: string, options: AnalyzeOptions): Project {
    const tsConfigFilePath = options.tsConfigFilePath ?? path.join(root, "tsconfig.json")
    if (options.tsConfigFilePath !== undefined || existsSync(tsConfigFilePath)) {
        // Only the matched files are checked; imports are still resolved for the type checker.
        return new Project({ tsConfigFilePath, skipAddingFilesFromTsConfig: true })
    }
    return new Project()
}

export function analyze(config: ProjectConfig, options: AnalyzeOptions = {}): Violation[] {
    const project = createProject(config.root, options)
    const violations: Violation[] = []

    for (const target of config.targets) {
        const pattern = path.join(config.root, target.glob)
        const files =
            options.files === undefined
                ? project.addSourceFilesAtPaths(pattern)
                : options.files
                      .filter((file) => path.matchesGlob(file, pattern))
                      .map((file) => project.addSourceFileAtPath(file))
        for (const file of files) {
            violations.push(...checkTarget(file, config.root, target.group, target.rules))
        }
    }

    return violations.sort(
        (a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column,
    )
}

function checkTarget(file: SourceFile, root: string, group: string, rules: RulesFile): Violation[] {
    const relativePath = path.relative(root, file.getFilePath()).split(path.sep).join("/")
    return checkFile(file, rules).map((issue) => {
        const { line, column } = file.getLineAndColumnAtPos(issue.node.getStart())
        return { file: relativePath, line, column, group, rule: issue.rule, message: issue.message }
    })
}
