import { z } from "zod";


export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

export const SignupSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "LEGAL", "PROCUREMENT", "VENDOR"]),
  password: z.string().min(6)
})

export const OrgSchema = z.object({
  userId: z.string(),
  name: z.string().min(2),
  logo: z.string().optional(),
  description: z.string().min(100),
  website: z.string().optional()
});

export const VendorSchema = z.object({
  userId: z.string(),
  name: z.string().min(2),
  logo: z.string().optional(),
  contactNumber: z.string().min(10).max(12),
  contactPerson: z.string().min(2),
  description: z.string().min(100),
  gstin: z.string().min(15).max(15),
  businessCategory: z.string(),
  website: z.string().optional()
});

export const RfpSchema = z.object({
  id: z.string().uuid().optional(),
  orgId: z.string().uuid(),
  title: z.string().min(3),
  description: z.string().min(10),
  deadline: z.string(),
  attachments: z.array(z.string()).default([])
});

export const ProposalSchema = z.object({
  id: z.string().uuid().optional(),
  rfpId: z.string().uuid(),
  vendorId: z.string().uuid(),
  price: z.number().nonnegative(),
  summary: z.string().min(5),
  attachments: z.array(z.string()).default([])
});

export const ContractSchema = z.object({
  id: z.string().uuid().optional(),
  rfpId: z.string().uuid(),
  vendorId: z.string().uuid(),
  status: z.enum(["DRAFT", "", "SIGNED"]).default("DRAFT"),
  body: z.string().min(10)
});
