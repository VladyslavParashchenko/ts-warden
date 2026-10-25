import { z } from "zod"

export const projectFileSchema = z.record(
    z.string().min(1),
    z.array(
        z.strictObject({
            glob: z.string().min(1),
            config: z.string().min(1),
        }),
    ),
)

export type ProjectFile = z.infer<typeof projectFileSchema>
