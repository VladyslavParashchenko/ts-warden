import { existsSync } from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { analyze } from "./analyzer.js"
import { ConfigError, defaultManifestPath, loadProjectConfig } from "./config.js"
import { initProject } from "./init.js"
import { formatPretty } from "./report.js"

const usage = `Usage: ts-warden [options] [files...]
       ts-warden init [--git-ignored]

Checks all files matched by the project manifest, or only the given files.
Files that match no group are skipped.

The project root is the parent of the directory holding the manifest.

Commands:
  init                   Create ${path.dirname(defaultManifestPath)}/ with a starter config in the
                         current directory; existing files are kept

Options:
  -c, --config <path>    Project manifest (default: ${defaultManifestPath})
  -p, --tsconfig <path>  tsconfig used for type resolution
                         (default: tsconfig.json in the project root)
      --format <format>  pretty | json (default: pretty)
      --git-ignored      init: add a .gitignore that keeps the directory out of git
  -h, --help             Show this help`

/** Exit codes: 0 — no violations, 1 — violations found, 2 — usage or config error. */
export async function run(argv: string[]): Promise<number> {
    let parsed: ReturnType<typeof parseCliArgs>
    try {
        // `pnpm dev -- <args>` forwards the separator itself.
        parsed = parseCliArgs(argv[0] === "--" ? argv.slice(1) : argv)
    } catch (error) {
        console.error(`${(error as Error).message}\n\n${usage}`)
        return 2
    }
    const { values, positionals } = parsed

    if (values.help) {
        console.log(usage)
        return 0
    }
    if (positionals[0] === "init") {
        if (positionals.length > 1) {
            console.error(`Unexpected arguments for init: ${positionals.slice(1).join(" ")}`)
            return 2
        }
        return runInit(values["git-ignored"])
    }
    if (values["git-ignored"]) {
        console.error(`--git-ignored is only valid with init\n\n${usage}`)
        return 2
    }
    if (values.format !== "pretty" && values.format !== "json") {
        console.error(`Unknown format "${values.format}"\n\n${usage}`)
        return 2
    }

    const files = positionals.map((file) => path.resolve(file))
    const missing = files.filter((file) => !existsSync(file))
    if (missing.length > 0) {
        console.error(`File not found: ${missing.join(", ")}`)
        return 2
    }

    try {
        const config = await loadProjectConfig(values.config)
        const violations = analyze(config, {
            ...(values.tsconfig !== undefined && { tsConfigFilePath: values.tsconfig }),
            ...(files.length > 0 && { files }),
        })
        console.log(
            values.format === "json"
                ? JSON.stringify(violations, null, 2)
                : formatPretty(violations),
        )
        return violations.length > 0 ? 1 : 0
    } catch (error) {
        if (error instanceof ConfigError) {
            console.error(error.message)
            return 2
        }
        throw error
    }
}

async function runInit(gitIgnored: boolean): Promise<number> {
    const { created, skipped } = await initProject(process.cwd(), { gitIgnored })
    const relative = (file: string) => path.relative(process.cwd(), file)
    for (const file of created) console.log(`Created ${relative(file)}`)
    for (const file of skipped) console.log(`Skipped ${relative(file)} (already exists)`)
    if (created.length > 0) {
        console.log(`\nEdit the rules in ${path.dirname(defaultManifestPath)}/ and run ts-warden.`)
    }
    return 0
}

function parseCliArgs(argv: string[]) {
    return parseArgs({
        args: argv,
        options: {
            config: { type: "string", short: "c", default: defaultManifestPath },
            tsconfig: { type: "string", short: "p" },
            format: { type: "string", default: "pretty" },
            "git-ignored": { type: "boolean", default: false },
            help: { type: "boolean", short: "h", default: false },
        },
        allowPositionals: true,
        strict: true,
    })
}
