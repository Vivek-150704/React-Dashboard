const accounts = [
    { id: "demo-admin", fullName: "Morgan Lee", email: "admin@mars.demo", password: "Admin123!", role: "Admin", status: "Approved" },
    { id: "demo-super", fullName: "Alex Morgan", email: "reviewer@mars.demo", password: "Review123!", role: "Super User", status: "Approved" },
    { id: "demo-viewer", fullName: "Taylor Reed", email: "viewer@mars.demo", password: "Viewer123!", role: "Viewer", status: "Approved" },
];
const registrations = [];
const wait = () => new Promise((resolve) => setTimeout(resolve, 250));
export const authService = {
    async signIn(email, password, requested) {
        await wait();
        const account = accounts.find(a => a.email === email.trim().toLowerCase() && a.password === password);
        if (!account)
            throw new Error("invalid-credentials");
        if (account.status === "Pending Approval")
            throw new Error("pending");
        if (account.status === "Rejected")
            throw new Error("rejected");
        if (account.role !== requested)
            throw new Error("wrong-role");
        const { password: _password, status: _status, ...user } = account;
        return user;
    },
    async register(fullName, email, password, requestedRole) {
        await wait();
        const normalized = email.trim().toLowerCase();
        if (accounts.some(a => a.email === normalized) || registrations.some(a => a.email === normalized))
            throw new Error("account-exists");
        // Demo only: no durable server or password hashing exists in this project.
        registrations.push({ id: `REG-${Date.now()}`, fullName: fullName.trim(), email: normalized, requestedRole, status: "Pending Approval", registeredAt: new Date().toISOString() });
        accounts.push({ id: `pending-${Date.now()}`, fullName: fullName.trim(), email: normalized, password, role: requestedRole, status: "Pending Approval" });
    },
    async requests() { await wait(); return structuredClone(registrations); },
    async decide(id, decision, assignedRole, reason) {
        await wait();
        const request = registrations.find(r => r.id === id);
        if (!request || request.status !== "Pending Approval")
            throw new Error("conflict");
        request.status = decision === "approve" ? "Approved" : "Rejected";
        request.assignedRole = decision === "approve" ? assignedRole : undefined;
        request.rejectionReason = reason;
        const account = accounts.find(a => a.email === request.email);
        if (account) {
            account.status = request.status;
            if (assignedRole)
                account.role = assignedRole;
        }
    },
};
