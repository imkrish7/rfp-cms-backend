declare namespace Express {
  interface Request {
    user?: { sub: string; role: string, vendorId: string?, orgId: string? };
  }
}
