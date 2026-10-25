import { existsSync } from "node:fs"
import path from "node:path"
import { parseArgs } from "node:util"
import { analyze } from "./analyzer.js"
import { ConfigError, defaultManifestPath, loadProjectConfig } from "./config.js"
import { formatPretty } from "./report.js"

const usage = `Usage: ts-warden [options] [files...]

Checks all files matched by the project manifest, or only the given files.
Files that match no group are skipped.

The project root is the parent of the directory holding the manifest.

Options:
  -c, --config <path>    Project manifest (default: ${defaultManifestPath})
  -p, --tsconfig <path>  tsconfig used for type resolution
                         (default: tsconfig.json in the project root)
      --format <format>  pretty | json (default: pretty)
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

function parseCliArgs(argv: string[]) {
    return parseArgs({
        args: argv,
        options: {
            config: { type: "string", short: "c", default: defaultManifestPath },
            tsconfig: { type: "string", short: "p" },
            format: { type: "string", default: "pretty" },
            help: { type: "boolean", short: "h", default: false },
        },
        allowPositionals: true,
        strict: true,
    })
}
