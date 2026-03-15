import { useState } from "react";
import { C, FLEET_ALL, VTYPES } from "../constants";
import { Card, SectionHead, Badge } from "../components/common";
import { getAllVehicles } from "../services/fleetAPI";
export default function FleetPage() {
  const [filter, setFilter] = useState("all");
  const counts = {
    all:     FLEET_ALL.length,
    active:  FLEET_ALL.filter(v=>v.status==="active").length,
    warning: FLEET_ALL.filter(v=>v.status==="warning").length,
    idle:    FLEET_ALL.filter(v=>v.status==="idle").length,
  };
  const shown = filter==="all" ? FLEET_ALL : FLEET_ALL.filter(v=>v.status===filter);

  return (
    <div>
      {/* Vehicle Type Counts */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginBottom:16 }}>
        {Object.entries(VTYPES).map(([k,v]) => {
          const n = FLEET_ALL.filter(x=>x.type===k).length;
          return (
            <Card key={k} style={{ textAlign:"center",padding:"10px 8px" }}>
              <div style={{ fontSize:22,marginBottom:4 }}>{v.icon}</div>
              <div style={{ fontFamily:"monospace",fontSize:18,fontWeight:800,color:v.color }}>{n}</div>
              <div style={{ fontFamily:"monospace",fontSize:7,color:C.muted,marginTop:1 }}>{v.label}</div>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:14 }}>
        {[["all","All"],["active","Active"],["warning","Warning"],["idle","Idle"]].map(([k,l]) => (
          <button key={k} onClick={()=>setFilter(k)} style={{ padding:"5px 13px",borderRadius:8,border:`1px solid ${filter===k?C.amber+"80":C.border}`,background:filter===k?`${C.amber}18`:"transparent",color:filter===k?C.amber:C.muted,fontFamily:"monospace",fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:"0.07em" }}>
            {l} ({counts[k]})
          </button>
        ))}
      </div>

      {/* Fleet Table */}
      <Card>
        <SectionHead title="FULL FLEET STATUS" sub="All vehicle types · real-time" icon="🚗" accent={C.blue} />
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {shown.map(v => {
            const vt = VTYPES[v.type];
            return (
              <div key={v.id} style={{ display:"flex",alignItems:"center",gap:12,background:`${C.muted}07`,border:`1px solid ${v.status==="warning"?C.amber+"50":C.border}`,borderRadius:10,padding:"11px 14px" }}>
                <div style={{ width:36,height:36,borderRadius:9,background:`${vt.color}20`,border:`1px solid ${vt.color}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{vt.icon}</div>
                <div style={{ flex:"0 0 100px" }}>
                  <div style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.text }}>{v.id}</div>
                  <div style={{ fontFamily:"monospace",fontSize:7,color:vt.color,fontWeight:700,marginBottom:2 }}>{vt.label}</div>
                  <Badge color={v.status==="active"?C.emerald:v.status==="warning"?C.amber:C.muted}>{v.status.toUpperCase()}</Badge>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"monospace",fontSize:10,color:C.text }}>👤 {v.driver}</div>
                  <div style={{ fontFamily:"monospace",fontSize:8,color:C.muted,marginTop:2 }}>📍 {v.route}</div>
                </div>
                <div style={{ flex:"0 0 110px" }}>
                  <div style={{ fontFamily:"monospace",fontSize:8,color:C.muted,marginBottom:3 }}>Battery {v.battery}%</div>
                  <div style={{ height:4,background:`${C.muted}20`,borderRadius:99 }}>
                    <div style={{ width:`${v.battery}%`,height:"100%",background:v.battery>30?C.emerald:C.red,borderRadius:99 }} />
                  </div>
                </div>
                <div style={{ flex:"0 0 110px" }}>
                  <div style={{ fontFamily:"monospace",fontSize:8,color:C.muted,marginBottom:3 }}>Load {v.load}%</div>
                  <div style={{ height:4,background:`${C.muted}20`,borderRadius:99 }}>
                    <div style={{ width:`${v.load}%`,height:"100%",background:C.blue,borderRadius:99 }} />
                  </div>
                </div>
                <div style={{ fontFamily:"monospace",fontSize:12,color:C.amber,fontWeight:800,flex:"0 0 50px",textAlign:"right" }}>{v.deliveries} 📦</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}