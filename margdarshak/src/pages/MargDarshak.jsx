import { useState, useCallback } from "react";
import { C } from "../constants";
import { useInterval } from "../hooks/useInterval";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import DashboardPage from "./DashboardPage";
import FleetPage from "./FleetPage";
import AnalyticsPage from "./AnalyticsPage";
import DriverPage from "./DriverPage";
import ComingSoon from "./ComingSoon";

export default function MargDarshak({ user, onLogout }) {
  const [tab, setTab] = useState("Dashboard");
  const [calcCount, setCalcCount] = useState(1247);
  useInterval(useCallback(() => setCalcCount(c => c + Math.floor(Math.random()*3)+1), []),
    1800
  );

  const displayName = user?.name || "Arjun Kumar";
  const displayRole = user?.role || "Fleet Manager";

  return (
    <div style={{ minHeight:"100vh",background:C.bg,color:C.text }}>
      <style>{`
        @keyframes ping { 0%,100%{transform:scale(1);opacity:0.35} 50%{transform:scale(1.7);opacity:0} }
        @keyframes pulse { 0%,100%{box-shadow:0 0 22px rgba(16,185,129,0.35)} 50%{box-shadow:0 0 38px rgba(16,185,129,0.65)} }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:#060d1a; }
        ::-webkit-scrollbar-thumb { background:#1a2d4a; border-radius:3px; }
        button { transition:opacity 0.15s; }
        button:hover { opacity:0.82; }
        input::placeholder { color:#64748b; }
      `}</style>
      <Header tab={tab} setTab={setTab} calcCount={calcCount} userName={displayName} userRole={displayRole} onLogout={onLogout} />
      <main style={{ padding:"18px 22px",maxWidth:1440,margin:"0 auto" }}>
        {tab==="Dashboard" && <DashboardPage />}
        {tab==="Fleet"     && <FleetPage />}
        {tab==="Analytics" && <AnalyticsPage />}
        {tab==="Driver"    && <DriverPage />}
        {tab==="Reports"   && <ComingSoon title="Reports & Exports" />}
      </main>
      <Footer />
    </div>
  );
}