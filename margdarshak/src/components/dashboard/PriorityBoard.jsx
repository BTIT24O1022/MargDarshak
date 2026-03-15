import { useState } from "react";
import { C, DELIVERIES, VTYPES, URGENCY_COLOR } from "../../constants";
import { Card, Badge, LiveDot } from "../common";
import { getAllDeliveries } from "../../services/fleetAPI";

const SORT_KEYS = ["score", "eta", "dist", "profit", "risk"];

export default function PriorityComparisonBoard() {
  const [sortBy, setSortBy] = useState("score");
  const [recalc, setRecalc] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [view, setView] = useState("table");

  const sorted = [...DELIVERIES].sort((a, b) => {
    if (sortBy === "score")  return b.score - a.score;
    if (sortBy === "profit") return b.profit - a.profit;
    if (sortBy === "dist")   return parseFloat(a.dist) - parseFloat(b.dist);
    if (sortBy === "eta")    return parseFloat(a.eta) - parseFloat(b.eta);
    if (sortBy === "risk")   return ["Low","Med","High"].indexOf(a.risk) - ["Low","Med","High"].indexOf(b.risk);
    return 0;
  });

  const triggerRecalc = () => { setRecalc(true); setTimeout(() => setRecalc(false), 1800); };

  return (
    <Card glow={C.blue} style={{ padding: "18px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `linear-gradient(135deg,${C.amber}30,${C.blue}30)`, border: `1px solid ${C.amber}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 800, color: C.text, letterSpacing: "0.06em" }}>AI DISPATCH ENGINE</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: `${C.emerald}15`, border: `1px solid ${C.emerald}40`, borderRadius: 99, padding: "2px 8px" }}>
                <LiveDot color={C.emerald} size={5} />
                <span style={{ fontFamily: "monospace", fontSize: 7.5, fontWeight: 700, color: C.emerald, letterSpacing: "0.07em" }}>LIVE SCORING</span>
              </div>
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: C.muted, marginTop: 1 }}>Priority AI · 7-factor ranking · weather + traffic + risk + SLA + urgency + distance + workload</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", borderRadius: 7, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {[["table","≡ TABLE"],["cards","⊞ CARDS"]].map(([k,l]) => (
              <button key={k} onClick={() => setView(k)} style={{ padding: "4px 10px", background: view===k ? `${C.blue}30` : "transparent", border: "none", color: view===k ? C.blue : C.muted, fontFamily: "monospace", fontSize: 8, fontWeight: 700, cursor: "pointer" }}>{l}</button>
            ))}
          </div>
          <button onClick={triggerRecalc} style={{ padding: "5px 10px", borderRadius: 7, background: `${C.amber}15`, border: `1px solid ${C.amber}40`, color: C.amber, fontFamily: "monospace", fontSize: 8, fontWeight: 700, cursor: "pointer", letterSpacing: "0.07em" }}>
            {recalc ? "⟳ RECALC..." : "↺ RECALCULATE"}
          </button>
        </div>
      </div>

      {/* Recalc Banner */}
      {recalc && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: `${C.amber}10`, border: `1px solid ${C.amber}40`, borderRadius: 8, padding: "7px 14px", marginBottom: 12 }}>
          <LiveDot color={C.amber} size={6} />
          <span style={{ fontFamily: "monospace", fontSize: 9, color: C.amber, fontWeight: 700 }}>PRIORITY AI RECALCULATING</span>
          <span style={{ fontFamily: "monospace", fontSize: 8, color: C.muted }}>— applying weather (🌧 +4m), traffic (×1.4), SLA weights, driver workload…</span>
        </div>
      )}

      {/* Sort Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
        <span style={{ fontFamily: "monospace", fontSize: 8, color: C.muted, marginRight: 4 }}>SORT BY:</span>
        {SORT_KEYS.map(k => (
          <button key={k} onClick={() => setSortBy(k)} style={{ padding: "3px 9px", borderRadius: 6, border: `1px solid ${sortBy===k ? C.amber+"80" : C.border}`, background: sortBy===k ? `${C.amber}18` : "transparent", color: sortBy===k ? C.amber : C.muted, fontFamily: "monospace", fontSize: 8, fontWeight: 700, cursor: "pointer", letterSpacing: "0.07em", textTransform: "uppercase" }}>{k}</button>
        ))}
      </div>

      {/* Table View */}
      {view === "table" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
            <thead>
              <tr>
                {["#","Delivery","Customer","Vehicle","Score","Urgency","Risk","ETA","Dist","SLA","Profit","Action"].map(h => (
                  <th key={h} style={{ fontFamily: "monospace", fontSize: 8, color: C.muted, fontWeight: 700, letterSpacing: "0.08em", textAlign: "left", padding: "4px 8px", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((d, i) => {
                const vt = VTYPES[d.type];
                const isTop = i === 0;
                return (
                  <tr key={d.id} onClick={() => setExpanded(expanded===d.id?null:d.id)} style={{ cursor: "pointer" }}>
                    {[
                      <div style={{ width:22,height:22,borderRadius:6,background:isTop?`${C.amber}25`:`${C.blue}18`,border:`1px solid ${isTop?C.amber+"50":C.blue+"40"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:800,color:isTop?C.amber:C.blue }}>{i+1}</div>,
                      <div><div style={{ fontFamily:"monospace",fontSize:10,fontWeight:700,color:C.text }}>{d.id}</div><div style={{ fontFamily:"monospace",fontSize:7,color:C.muted,maxWidth:130,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{d.addr}</div></div>,
                      <span style={{ fontFamily:"monospace",fontSize:10,color:C.text }}>{d.customer}</span>,
                      <div style={{ display:"flex",alignItems:"center",gap:4 }}><span style={{ fontSize:13 }}>{vt.icon}</span><span style={{ fontFamily:"monospace",fontSize:8,color:vt.color,fontWeight:700 }}>{vt.label}</span></div>,
                      <div style={{ display:"flex",alignItems:"center",gap:5 }}><div style={{ width:36,height:4,background:`${C.muted}20`,borderRadius:99 }}><div style={{ width:`${d.score}%`,height:"100%",background:d.score>85?C.emerald:d.score>60?C.amber:C.red,borderRadius:99 }} /></div><span style={{ fontFamily:"monospace",fontSize:11,fontWeight:800,color:d.score>85?C.emerald:d.score>60?C.amber:C.red }}>{d.score}</span></div>,
                      <Badge color={URGENCY_COLOR[d.urgency]}>{d.urgency}</Badge>,
                      <Badge color={d.riskC}>{d.risk} Risk</Badge>,
                      <span style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.amber }}>{d.eta}</span>,
                      <span style={{ fontFamily:"monospace",fontSize:10,color:C.text }}>{d.dist}</span>,
                      <span style={{ fontFamily:"monospace",fontSize:9,color:C.cyan }}>{d.sla}</span>,
                      <span style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.emerald }}>₹{d.profit}</span>,
                      <button style={{ padding:"4px 10px",borderRadius:6,background:`${C.blue}20`,border:`1px solid ${C.blue}50`,color:C.blue,fontFamily:"monospace",fontSize:8,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap" }}>DISPATCH →</button>
                    ].map((cell, ci) => (
                      <td key={ci} style={{ padding:"8px",background:`${C.muted}08`,border:`1px solid ${isTop?C.amber+"40":C.border}`,borderLeft:ci===0?`1px solid ${isTop?C.amber+"40":C.border}`:"none",borderRight:ci===11?`1px solid ${isTop?C.amber+"40":C.border}`:"none",borderRadius:ci===0?"8px 0 0 8px":ci===11?"0 8px 8px 0":"0" }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cards View */}
      {view === "cards" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {sorted.map((d, i) => {
            const vt = VTYPES[d.type];
            const isTop = i === 0;
            const isExp = expanded === d.id;
            return (
              <div key={d.id} onClick={() => setExpanded(isExp?null:d.id)} style={{ borderRadius: 11, border: `1px solid ${isTop?C.amber+"60":C.border}`, background: isTop?`${C.amber}06`:`${C.muted}05`, padding: "12px 14px", cursor: "pointer" }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <div style={{ width:22,height:22,borderRadius:6,background:isTop?`${C.amber}25`:`${C.blue}18`,border:`1px solid ${isTop?C.amber+"50":C.blue+"40"}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:800,color:isTop?C.amber:C.blue }}>{i+1}</div>
                    <span style={{ fontFamily:"monospace",fontSize:10,fontWeight:700,color:C.text }}>{d.id}</span>
                  </div>
                  <Badge color={URGENCY_COLOR[d.urgency]}>{d.urgency}</Badge>
                </div>
                <div style={{ fontFamily:"monospace",fontSize:10,color:C.text,fontWeight:700,marginBottom:2 }}>{d.customer}</div>
                <div style={{ fontFamily:"monospace",fontSize:8,color:C.muted,marginBottom:10,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{d.addr}</div>
                <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
                  <div style={{ flex:1,height:5,background:`${C.muted}20`,borderRadius:99 }}>
                    <div style={{ width:`${d.score}%`,height:"100%",background:d.score>85?C.emerald:d.score>60?C.amber:C.red,borderRadius:99 }} />
                  </div>
                  <span style={{ fontFamily:"monospace",fontSize:12,fontWeight:800,color:d.score>85?C.emerald:d.score>60?C.amber:C.red,minWidth:28 }}>{d.score}</span>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:8 }}>
                  {[[vt.icon+" "+vt.label,vt.color],[d.eta+" min",C.amber],[d.dist,C.blue]].map(([v,c],j) => (
                    <div key={j} style={{ background:`${C.muted}10`,borderRadius:6,padding:"4px 5px",textAlign:"center",border:`1px solid ${C.border}` }}>
                      <div style={{ fontFamily:"monospace",fontSize:8,color:c,fontWeight:700 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                  <Badge color={d.riskC}>🛡 {d.risk}</Badge>
                  <span style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.emerald }}>₹{d.profit}</span>
                  <button style={{ padding:"4px 10px",borderRadius:6,background:`${C.blue}20`,border:`1px solid ${C.blue}50`,color:C.blue,fontFamily:"monospace",fontSize:8,fontWeight:700,cursor:"pointer" }}>→ GO</button>
                </div>
                {isExp && (
                  <div style={{ marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}` }}>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5 }}>
                      {[["Weight",d.weight],["SLA",d.sla],["Attempts",d.attempts],["Profit","₹"+d.profit]].map(([l,v]) => (
                        <div key={l} style={{ background:`${C.muted}10`,borderRadius:6,padding:"5px 8px",border:`1px solid ${C.border}` }}>
                          <div style={{ fontFamily:"monospace",fontSize:7,color:C.muted }}>{l}</div>
                          <div style={{ fontFamily:"monospace",fontSize:10,fontWeight:700,color:C.text }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Summary */}
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {[["Total Value", `₹${DELIVERIES.reduce((s,d)=>s+d.profit,0)}`],["Avg Score", Math.round(DELIVERIES.reduce((s,d)=>s+d.score,0)/DELIVERIES.length)+""],["High Risk", DELIVERIES.filter(d=>d.risk==="High").length+" orders"]].map(([l,v]) => (
            <div key={l}>
              <div style={{ fontFamily:"monospace",fontSize:8,color:C.muted }}>{l}</div>
              <div style={{ fontFamily:"monospace",fontSize:14,fontWeight:800,color:C.text }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {[["URGENCY","30pt",C.red],["DISTANCE","20pt",C.blue],["WEATHER","15pt",C.cyan],["TRAFFIC","15pt",C.amber],["SLA","10pt",C.purple]].map(([f,w,c]) => (
            <div key={f} style={{ padding:"2px 7px",borderRadius:5,background:`${c}12`,border:`1px solid ${c}30`,fontFamily:"monospace",fontSize:7,fontWeight:700,color:c,letterSpacing:"0.06em" }}>{f} <span style={{ color:C.muted }}>{w}</span></div>
          ))}
          <button style={{ padding:"7px 16px",borderRadius:8,background:`linear-gradient(135deg,${C.amber},#d97706)`,border:"none",color:"#000",fontFamily:"monospace",fontSize:10,fontWeight:800,cursor:"pointer",letterSpacing:"0.07em",marginLeft:4 }}>
            DISPATCH ALL →
          </button>
        </div>
      </div>
    </Card>
  );
}