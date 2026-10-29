const customers = [
    ["CUS-1042", "Northstar Retail"],
    ["CUS-1128", "Metro Market Group"],
    ["CUS-1195", "Continental Foods"],
    ["CUS-1251", "Harbor Wholesale"],
    ["CUS-1310", "Summit Stores"],
    ["CUS-1384", "Pioneer Distribution"],
    ["CUS-1422", "Oakline Grocers"],
    ["CUS-1508", "Central Commerce"],
];
export const reasons = [
    "Late delivery",
    "Incorrect quantity",
    "Short or over shipment",
    "Damaged goods",
    "Failure to meet agreed conditions",
    "Documentation issue",
    "Other",
];
const comments = [
    "Delivery records support the customer classification.",
    "Quantity confirmed against signed receiving documentation.",
    "Supporting documents do not substantiate the fine.",
    "Reviewed against the order and delivery confirmation.",
];
const reviewers = ["Jordan Lee", "Morgan Patel", "Casey Reed"];
export function createMockData() {
    const fines = [];
    const history = [];
    const today = new Date();
    for (let i = 0; i < 216; i++) {
        const [customerId, customerName] = customers[i % customers.length];
        const reasonCategory = reasons[(i * 5 + Math.floor(i / 7)) % reasons.length];
        const status = i % 6 === 0 || i % 11 === 0
            ? "Pending"
            : i % 3 === 0
                ? "Invalid"
                : "Valid";
        const date = new Date(today);
        date.setDate(today.getDate() - ((i * 11 + (i % 9) * 3) % 355));
        const fineDate = date.toISOString();
        const amount = Math.round((180 + ((i * 317) % 11700) + (i % 5) * 0.37) * 100) / 100;
        const updated = new Date(date);
        updated.setDate(date.getDate() + (status === "Pending" ? 1 : 4 + (i % 12)));
        const reviewer = reviewers[i % reviewers.length];
        const comment = comments[i % comments.length];
        const fineId = `FIN-${String(240001 + i).padStart(6, "0")}`;
        const record = {
            fineId,
            customerId,
            customerName,
            orderReference: `ORD-${String(780000 + i * 13).padStart(7, "0")}`,
            fineDate,
            fineAmount: amount,
            currencyCode: "USD",
            status,
            reasonCategory,
            reasonDescription: `${reasonCategory} recorded against the supplied order documentation.`,
            sourceArea: ["Logistics", "Warehouse", "Manufacturing"][i % 3],
            createdAt: fineDate,
            updatedAt: updated.toISOString(),
            expectedDeliveryDate: new Date(date.getTime() - 86400000 * 2).toISOString(),
            actualDeliveryDate: reasonCategory === "Late delivery"
                ? fineDate
                : new Date(date.getTime() - 86400000).toISOString(),
            orderedQuantity: 100 + (i % 15) * 20,
            deliveredQuantity: reasonCategory.includes("quantity") ||
                reasonCategory.includes("shipment")
                ? 90 + (i % 15) * 20
                : 100 + (i % 15) * 20,
            sourceSystemReference: `SRC-${9000 + i}`,
        };
        if (status !== "Pending") {
            record.lastReviewedAt = updated.toISOString();
            record.lastReviewerName = reviewer;
            record.lastReviewComment = comment;
            history.push({
                reviewId: `REV-${i + 1}`,
                fineId,
                oldStatus: "Pending",
                newStatus: status,
                reviewerId: `demo-${(i % 3) + 1}`,
                reviewerName: reviewer,
                comment,
                reviewedAt: updated.toISOString(),
            });
        }
        fines.push(record);
    }
    return { fines, history };
}
