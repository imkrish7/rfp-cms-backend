export interface AuthUser {
    sub: string;
    role: string;
    vendorId: string | null;
    orgId: string | null;
}