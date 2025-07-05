import {z} from 'zod';


export const signupSchema= z.object({
username: z.string().min(3,"Username must be atleast 3 characters").max(100,"Username must be less than 100 characters"),
password: z.string().min(6,"Password must be atleast 6 characters").max(50, "Password must be less than 50 characters").refine((val)=>!["123456","abcdef","abc123","123abc"].includes(val),{
   message: "Password is too common or easy to guess!"
}
)

})


export const loginSchema=z.object({
    username: z.string().min(1,"Username is required"),
    password: z.string().min(1,"Password is required")
})

export const todoStructure=z.object({
title: z.string().min(1,"Title is required"),
deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
priority: z.enum(["low","medium", "high"]).optional()

})

