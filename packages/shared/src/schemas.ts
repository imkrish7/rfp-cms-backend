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

export const ResendEmailVerificationSchema = z.object({
  email: z.string().email()
})

export const EmailVerificationSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4)
})

export const OrgSchema = z.object({
  name: z.string().min(2),
  logo: z.string().optional(),
  description: z.string().min(100),
  website: z.string().optional()
});

export const VendorSchema = z.object({
  name: z.string().min(2),
  logo: z.string().optional(),
  contactNumber: z.string().min(10).max(14),
  contactPerson: z.string().min(2),
  description: z.string().min(100),
  gstin: z.string().min(15).max(20),
  businessCategory: z.string(),
  website: z.string().optional()
});

const timelineSchema = z.object({
  proposalSubmission: z.string(), // see note below
  vendorSelection: z.string(),
  projectStart: z.string(),
  completion: z.string(),
});

export const RfpSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  deadline: z.string(),
  issuedBy: z.string(),
  status: z.enum(["DRAFT",
  "PUBLISHED",
  "RESPONSE_SUBMITED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "ARCHIEVED"]).optional(),
  scopeOfWork: z.string(),
  evaluationCriteria:z.string(),
  deliverables: z.string(),
  timeline: timelineSchema
});

export const ProposalSchema = z.object({
  id: z.string().uuid().optional(),
  rfpId: z.string().uuid(),
  price: z.number().nonnegative(),
  summary: z.string().min(5),
});

export const ContractSchema = z.object({
  id: z.string().uuid().optional(),
  rfpId: z.string().uuid(),
  vendorId: z.string().uuid(),
  status: z.enum(["DRAFT", "", "SIGNED"]).default("DRAFT"),
  body: z.string().min(10)
});
