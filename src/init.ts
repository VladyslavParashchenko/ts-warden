import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { defaultManifestPath } from "./config.js"

const manifestTemplate = `# Project manifest: each key is a group name of your choice.
# \`glob\` is relative to the project root (the parent of this directory),
# \`config\` is relative to this file.
example:
    - glob: src/**/*.{ts,tsx}
      config: ./example.yml
`

const rulesTemplate = `# Rules for every file matched by the \`example\` group.
# Every option is optional; uncomment and adjust the ones you need.

# fileName: kebab-case

classes:
    export: named
    # count: 1
    # name:
    #     endsWith: Service
    # implements:
    #     - IService
    # decorators:
    #     allOf: [Injectable]
    # methods:
    #     public:
    #         async: true
    #         returnType: explicit
    #     private:
    #         count: { max: 3 }

# functions:
#     export: named
#     params: { max: 2 }
#     returnType: explicit
`

// Ignores everything in the directory, including this file.
const gitignoreTemplate = "*\n"

export interface InitOptions {
    /** Add a `.gitignore` that keeps the directory out of git. */
    gitIgnored: boolean
}

export interface InitResult {
    created: string[]
    /** Files that already existed and were left untouched. */
    skipped: string[]
}

/** Creates `.ts-warden/` in `root` with a starter config. Existing files are never overwritten. */
export async function initProject(root: string, options: InitOptions): Promise<InitResult> {
    const manifestPath = path.join(root, defaultManifestPath)
    const configDir = path.dirname(manifestPath)
    const files: Array<[string, string]> = [
        [manifestPath, manifestTemplate],
        [path.join(configDir, "example.yml"), rulesTemplate],
    ]
    if (options.gitIgnored) files.push([path.join(configDir, ".gitignore"), gitignoreTemplate])

    await mkdir(configDir, { recursive: true })
    const result: InitResult = { created: [], skipped: [] }
    for (const [filePath, content] of files) {
        try {
            await writeFile(filePath, content, { flag: "wx" })
            result.created.push(filePath)
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error
            result.skipped.push(filePath)
        }
    }
    return result
}
