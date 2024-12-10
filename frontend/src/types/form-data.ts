import { z } from "zod"
import { formSchema } from "@/schemas/form-schema"

export type FormData = z.infer<typeof formSchema>
