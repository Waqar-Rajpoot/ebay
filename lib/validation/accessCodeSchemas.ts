// import { z } from "zod";

// export const MIN_ACCESS_CODE_LENGTH = 8;
// export const MAX_ACCESS_CODE_LENGTH = 128;

// const newCodeSchema = z.string().trim().min(MIN_ACCESS_CODE_LENGTH).max(MAX_ACCESS_CODE_LENGTH);

// /**
//  * Body of the "change codes" request. Shared by the form and the route.
//  * The form must send undefined (not "") for a code the admin leaves blank.
//  */
// export const changeAccessCodesSchema = z
//   .object({
//     currentAdminCode: z.string().min(1).max(MAX_ACCESS_CODE_LENGTH),
//     newAdminCode: newCodeSchema.optional(),
//     newTeamCode: newCodeSchema.optional(),
//   })
//   .refine((values) => values.newAdminCode || values.newTeamCode, {
//     path: ["newAdminCode"],
//     message: "Enter at least one new code.",
//   })
//   .refine((values) => !(values.newAdminCode && values.newAdminCode === values.newTeamCode), {
//     path: ["newTeamCode"],
//     message: "Admin and team codes must be different.",
//   });

// export type ChangeAccessCodesInput = z.infer<typeof changeAccessCodesSchema>;




import { z } from "zod";

export const MIN_ACCESS_CODE_LENGTH = 10;
export const MAX_ACCESS_CODE_LENGTH = 128;

const newCodeSchema = z
  .string()
  .trim()
  .min(MIN_ACCESS_CODE_LENGTH, `Use at least ${MIN_ACCESS_CODE_LENGTH} characters.`)
  .max(MAX_ACCESS_CODE_LENGTH, `Use at most ${MAX_ACCESS_CODE_LENGTH} characters.`);

/**
 * Body of the "change codes" request, shared by the form and the route.
 * Blank new codes must be sent as undefined (the form does this).
 */
export const changeAccessCodesSchema = z
  .object({
    currentAdminCode: z.string().min(1, "Enter your current admin code.").max(MAX_ACCESS_CODE_LENGTH),
    newAdminCode: newCodeSchema.optional(),
    newTeamCode: newCodeSchema.optional(),
  })
  .refine((values) => values.newAdminCode || values.newTeamCode, {
    path: ["newAdminCode"],
    message: "Enter at least one new code.",
  })
  .refine((values) => !(values.newAdminCode && values.newAdminCode === values.newTeamCode), {
    path: ["newTeamCode"],
    message: "Admin and team codes must be different.",
  });

export type ChangeAccessCodesInput = z.infer<typeof changeAccessCodesSchema>;