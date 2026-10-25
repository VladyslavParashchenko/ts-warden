import { styleText } from "node:util"
import type { Violation } from "./analyzer.js"

export function formatPretty(violations: Violation[]): string {
    if (violations.length === 0) return styleText("green", "✔ No problems found")

    const byFile = Map.groupBy(violations, (violation) => violation.file)
    const lines: string[] = []

    for (const [file, fileViolations] of byFile) {
        lines.push(styleText("underline", file))
        for (const violation of fileViolations) {
            const position = styleText("dim", `${violation.line}:${violation.column}`.padEnd(8))
            const rule = styleText("dim", `${violation.group}/${violation.rule}`)
            lines.push(`  ${position}${styleText("red", "error")}  ${violation.message}  ${rule}`)
        }
        lines.push("")
    }

    const problems = violations.length === 1 ? "problem" : "problems"
    const files = byFile.size === 1 ? "file" : "files"
    lines.push(styleText("red", `✖ ${violations.length} ${problems} in ${byFile.size} ${files}`))
    return lines.join("\n")
}
