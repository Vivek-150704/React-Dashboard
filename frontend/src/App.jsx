import { useEffect, useState } from "react";
import { FineDrawer, ExportModal, ReviewModal } from "./components/FinePanels.jsx";
import { Layout } from "./components/Layout.jsx";
import { LoadingPage, Toast } from "./components/ui.jsx";
import { finesService } from "./services/finesService.js";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { FinesDetailsPage } from "./pages/FinesDetailsPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { SignUpPage } from "./pages/SignUpPage.jsx";
import { shortDate } from "./utils/fines.js";
import { can } from "./services/permissions.js";
export default function App() {
    const [user, setUser] = useState(null);
    const [authPage, setAuthPage] = useState("login");
    const [authNotice, setAuthNotice] = useState("");
    const [page, setPage] = useState("dashboard");
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [navFilters, setNavFilters] = useState({});
    const [selected, setSelected] = useState(null);
    const [history, setHistory] = useState([]);
    const [reviewing, setReviewing] = useState(null);
    const [exportState, setExportState] = useState(null);
    const [toast, setToast] = useState(null);
    useEffect(() => {
        let active = true;
        finesService.list()
            .then((data) => {
                if (!active) return;
                setRecords(data);
                setLoading(false);
            })
            .catch(() => {
                if (!active) return;
                setRecords([]);
                setLoading(false);
                setToast({
                    message: "Unable to load fine records. Please try again.",
                    type: "error",
                });
            });
        return () => {
            active = false;
        };
    }, []);
    useEffect(() => {
        let active = true;
        if (!selected) {
            setHistory([]);
            return () => {
                active = false;
            };
        }
        setHistory([]);
        finesService.reviews(selected.fineId)
            .then((items) => {
                if (active) setHistory(items);
            })
            .catch(() => {
                if (active) setHistory([]);
            });
        return () => {
            active = false;
        };
    }, [selected]);
    useEffect(() => {
        if (!toast)
            return;
        const timer = setTimeout(() => setToast(null), 4000);
        return () => clearTimeout(timer);
    }, [toast]);
    const refresh = async () => {
        setLoading(true);
        try {
            const data = await finesService.refresh();
            setRecords(data);
            setToast({ message: "Demo data refreshed." });
        }
        catch {
            setToast({
                message: "Unable to load fine records. Check your connection and try again.",
                type: "error",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const openFine = (fine, review = false) => {
        setSelected(fine);
        if (review && user && can(user.role, "fine:review"))
            setReviewing(fine);
    };
    const saveReview = async (request) => {
        if (!reviewing)
            return;
        if (!user || !can(user.role, "fine:review"))
            throw new Error("unauthorized");
        const updated = await finesService.review(reviewing.fineId, request, user);
        setRecords((all) => all.map((fine) => (fine.fineId === updated.fineId ? updated : fine)));
        setSelected(updated);
        setReviewing(null);
        setToast({ message: "Fine review saved successfully." });
    };
    const navigateFines = (filters) => {
        setNavFilters(filters);
        setPage("fines");
    };
    const exportWorkbook = async () => {
        if (!exportState)
            return;
        const XLSX = await import("xlsx");
        const rows = exportState.records.map((fine) => ({
            "Fine ID": fine.fineId,
            "Customer ID": fine.customerId,
            Customer: fine.customerName,
            "Order Reference": fine.orderReference,
            "Fine Date": new Date(fine.fineDate),
            "Fine Amount": fine.fineAmount,
            Currency: fine.currencyCode,
            "Fine Reason": fine.reasonCategory,
            Status: fine.status,
            "Updated At": new Date(fine.updatedAt),
        }));
        const sheet = XLSX.utils.json_to_sheet(rows, { cellDates: true });
        sheet["!cols"] = [14, 14, 24, 18, 14, 14, 10, 34, 12, 20].map((wch) => ({
            wch,
        }));
        const book = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(book, sheet, "Fine Records");
        XLSX.writeFile(book, `fines_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
        setExportState(null);
        setToast({ message: `${rows.length} fine records exported successfully.` });
    };
    if (!user)
        if (authPage === "signup")
            return (<SignUpPage onSignIn={(message) => {
                    setAuthNotice(message ?? "");
                    setAuthPage("login");
                }}/>);
        else
            return (<LoginPage notice={authNotice} onSignUp={() => {
                    setAuthNotice("");
                    setAuthPage("signup");
                }} onLogin={setUser}/>);
    return (<Layout page={page} user={user} onLogout={() => {
            setUser(null);
            setPage("dashboard");
            setSelected(null);
        }} onNavigate={(next) => {
            setPage(next);
            if (next === "dashboard")
                setNavFilters({});
        }}>
      {loading && !records.length ? (<LoadingPage />) : page === "dashboard" ? (<><h1 className="page-title">Executive Summary</h1><DashboardPage records={records} onNavigateFines={navigateFines}/></>) : (<><h1 className="page-title">Fines Details</h1><FinesDetailsPage key={JSON.stringify(navFilters)} records={records} role={user.role} initialFilters={navFilters} onOpen={openFine} onRefresh={refresh} onExport={(fines, filters) => setExportState({ records: fines, filters })}/></>)}
      {selected && (<FineDrawer fine={selected} role={user.role} history={history} onClose={() => setSelected(null)} onReview={() => setReviewing(selected)}/>)}
      {reviewing && (<ReviewModal fine={reviewing} role={user.role} onClose={() => setReviewing(null)} onSave={saveReview}/>)}
      {exportState && (<ExportModal count={exportState.records.length} filters={{
                date: exportState.filters.fromDate || exportState.filters.toDate
                    ? `${exportState.filters.fromDate
                        ? shortDate(exportState.filters.fromDate)
                        : "Any"} – ${exportState.filters.toDate
                        ? shortDate(exportState.filters.toDate)
                        : "Any"}`
                    : "All dates",
                status: exportState.filters.status ?? "All",
                customer: exportState.filters.customerId ?? "All",
                reason: exportState.filters.reasons.join(", ") || "All",
                search: exportState.filters.search ?? "",
            }} onClose={() => setExportState(null)} onExport={exportWorkbook}/>)}
      {toast && <Toast {...toast} onClose={() => setToast(null)}/>}
    </Layout>);
}
