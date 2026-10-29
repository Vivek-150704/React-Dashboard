import { createMockData } from "../data/mockData.js";
const pause = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));
class MockFinesService {
    records;
    history;
    constructor() {
        const data = createMockData();
        this.records = data.fines;
        this.history = data.history;
    }
    async list() {
        await pause();
        return structuredClone(this.records);
    }
    async refresh() {
        await pause(500);
        return structuredClone(this.records);
    }
    async reviews(fineId) {
        await pause(150);
        return structuredClone(this.history
            .filter((r) => r.fineId === fineId)
            .sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt)));
    }
    async review(fineId, request, reviewer) {
        await pause(700);
        const index = this.records.findIndex((f) => f.fineId === fineId);
        if (index < 0)
            throw new Error("not-found");
        if (this.records[index].status !== request.expectedStatus)
            throw new Error("conflict");
        if (!request.comment.trim())
            throw new Error("comment-required");
        const previousStatus = this.records[index].status;
        const now = new Date().toISOString();
        const updated = {
            ...this.records[index],
            status: request.decision,
            updatedAt: now,
            lastReviewedAt: now,
            lastReviewerName: reviewer.fullName,
            lastReviewComment: request.comment.trim(),
        };
        this.records[index] = updated;
        this.history.unshift({
            reviewId: `REV-${Date.now()}`,
            fineId,
            oldStatus: previousStatus,
            newStatus: request.decision,
            reviewerId: reviewer.id,
            reviewerName: reviewer.fullName,
            comment: request.comment.trim(),
            reviewedAt: now,
        });
        return structuredClone(updated);
    }
}
// The UI depends only on this interface. A future ApiFinesService can implement the
// proposed /api/fines contract without changing page components.
export const finesService = new MockFinesService();
