import { useState } from "react";
import { C, VEHICLES } from "../constants";
import { Card, LiveDot } from "../components/common";
import USPSection from "../components/dashboard/USPSection";
import StatsBar from "../components/dashboard/StatsBar";
import LiveMapComponent from "../components/dashboard/LiveMap";
import PriorityComparisonBoard from "../components/dashboard/PriorityBoard";
import AnalyticsSidebar from "../components/dashboard/AnalyticsSidebar";

export default function DashboardPage() {
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <USPSection />
      <StatsBar />
      <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:14 }}>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Card style={{ padding:0,overflow:"hidden" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${C.border}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:9 }}>
                <div style={{ width:28,height:28,borderRadius:7,background:`${C.blue}20`,border:`1px solid ${C.blue}40`,display:"flex",alignItems:"center",justifyContent:"center" }}>🗺</div>
                <div>
                  <div style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.text,letterSpacing:"0.07em" }}>LIVE FLEET MAP</div>
                  <div style={{ fontFamily:"monospace",fontSize:8,color:C.muted }}>Click any vehicle for details · {VEHICLES.length} active</div>
                </div>
              </div>
              <div style={{ display:"flex",alignItems:"center",gap:5,background:`${C.emerald}12`,border:`1px solid ${C.emerald}40`,borderRadius:99,padding:"4px 10px" }}>
                <LiveDot color={C.emerald} size={6} />
                <span style={{ fontFamily:"monospace",fontSize:8,color:C.emerald,fontWeight:700,letterSpacing:"0.07em" }}>LIVE</span>
              </div>
            </div>
            <div style={{ height:340 }}>
              <LiveMapComponent selected={selected} onSelect={setSelected} />
            </div>
          </Card>
          <PriorityComparisonBoard />
        </div>
        <AnalyticsSidebar />
      </div>
    </div>
  );
}