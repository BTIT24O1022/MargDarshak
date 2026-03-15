import { useState, useCallback, useEffect } from "react";
import { C } from "../../constants";
import { Card, SectionHead, Badge, AnimatedNum, LiveDot } from "../common";
import { useInterval } from "../../hooks/useInterval";

// ─── ParkingGauge ─────────────────────────────────────────────────────────────
export function ParkingGauge() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setP(v => { if(v>=85){clearInterval(id);return 85;} return v+1; }), 18);
    return ()=>clearInterval(id);
  }, []);
  const r=42, circ=2*Math.PI*r;
  return (
    <Card style={{ height: "100%" }} glow={C.emerald}>
      <SectionHead title="PREDICTIVE PARKING" sub="Real-time availability" icon="🅿️" accent={C.emerald} />
      <div style={{ display:"flex",justifyContent:"center",padding:"4px 0 8px" }}>
        <div style={{ position:"relative" }}>
          <svg width="110" height="110" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="55" cy="55" r={r} fill="none" stroke="#1a2d4a" strokeWidth="8" />
            <circle cx="55" cy="55" r={r} fill="none" stroke={C.emerald} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ-(p/100)*circ} style={{ filter:`drop-shadow(0 0 5px ${C.emerald})`, transition:"stroke-dashoffset 0.3s" }} />
          </svg>
          <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
            <span style={{ fontFamily:"monospace",fontSize:24,fontWeight:800,color:C.emerald,textShadow:`0 0 14px ${C.emeraldGlow}` }}>{p}%</span>
            <span style={{ fontFamily:"monospace",fontSize:7,color:C.muted,letterSpacing:"0.07em" }}>PROBABILITY</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:10 }}>
        <div style={{ display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:9 }}>
          <span style={{ color:C.muted }}>Confidence</span><span style={{ color:C.emerald,fontWeight:700 }}>HIGH</span>
        </div>
        <div style={{ display:"flex",gap:3,marginTop:6 }}>
          {[...Array(5)].map((_,i)=><div key={i} style={{ height:4,flex:1,borderRadius:99,background:i<4?C.emerald:`${C.muted}30` }} />)}
        </div>
      </div>
    </Card>
  );
}

// ─── WeatherWidget ────────────────────────────────────────────────────────────
export function WeatherWidget() {
  const [temp, setTemp] = useState(18.0);
  useInterval(useCallback(() => setTemp(t => +(t + (Math.random()>.5?.1:-.1)).toFixed(1)), []), 3000);
  return (
    <Card style={{ height:"100%" }} glow={C.blue}>
      <SectionHead title="WEATHER MODULE" sub="Live · Gwalior" icon="🌧" accent={C.blue} />
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
        <div style={{ fontSize:40,filter:`drop-shadow(0 0 9px ${C.blueGlow})` }}>🌧</div>
        <div>
          <div style={{ fontFamily:"monospace",fontSize:17,fontWeight:800,color:C.text }}>Heavy Rain</div>
          <div style={{ fontFamily:"monospace",fontSize:9,color:C.muted,marginTop:2 }}>🌡 {temp}°C · Vis: Low</div>
        </div>
      </div>
      <div style={{ background:`${C.amber}12`,border:`1px solid ${C.amber}40`,borderRadius:8,padding:"8px 11px",marginBottom:10 }}>
        <div style={{ fontFamily:"monospace",fontSize:9,color:C.amber,fontWeight:700 }}>⚠ SAFETY-FIRST ROUTING</div>
        <div style={{ fontFamily:"monospace",fontSize:9,color:C.muted,marginTop:2 }}>ETA +4 min · <span style={{ color:C.purple }}>🛸 Drones paused</span></div>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
        {[["💨 Wind","24 km/h","NW"],["💧 Rain","85%","2 hrs"]].map(([l,v,s]) => (
          <div key={l} style={{ background:`${C.muted}12`,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 9px" }}>
            <div style={{ fontFamily:"monospace",fontSize:7,color:C.muted }}>{l}</div>
            <div style={{ fontFamily:"monospace",fontSize:13,fontWeight:700,color:C.text }}>{v}</div>
            <div style={{ fontFamily:"monospace",fontSize:8,color:C.blue }}>{s}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── AIAlertsPanel ────────────────────────────────────────────────────────────
export function AIAlertsPanel() {
  const [alerts, setAlerts] = useState([
    { id:1, icon:"⚠️", msg:"Traffic spike on NH-44 — Scooters rerouted",                          time:"Just now",  color:C.amber   },
    { id:2, icon:"🧠", msg:"AI: Reassign DEL-1043 from scooter → bike — saves 3 min",              time:"1 min ago", color:C.blue    },
    { id:3, icon:"✅", msg:"DEL-1038 delivered on time — +5 rating",                               time:"3 min ago", color:C.emerald },
    { id:4, icon:"🔋", msg:"BK-017 battery at 71% — optimal for 4 more stops",                    time:"5 min ago", color:C.emerald },
    { id:5, icon:"🛸", msg:"Drone DEL-1046 paused — weather clearance",                            time:"7 min ago", color:C.purple  },
  ]);
  return (
    <Card glow={C.blue}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
        <SectionHead title="AI ALERTS" sub="Real-time intelligence" icon="🔔" accent={C.blue} />
        <Badge color={C.red}>{alerts.length} NEW</Badge>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
        {alerts.map(a => (
          <div key={a.id} style={{ display:"flex",alignItems:"flex-start",gap:8,background:`${a.color}10`,border:`1px solid ${a.color}30`,borderRadius:8,padding:"8px 10px" }}>
            <span style={{ fontSize:12,flexShrink:0 }}>{a.icon}</span>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={{ fontFamily:"monospace",fontSize:9,color:C.text }}>{a.msg}</div>
              <div style={{ fontFamily:"monospace",fontSize:7,color:C.muted,marginTop:1 }}>{a.time}</div>
            </div>
            <button onClick={() => setAlerts(al=>al.filter(x=>x.id!==a.id))} style={{ background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:13,lineHeight:1 }}>×</button>
          </div>
        ))}
        {alerts.length===0 && <div style={{ textAlign:"center",fontFamily:"monospace",fontSize:9,color:C.muted,padding:"10px 0" }}>✅ No active alerts</div>}
      </div>
    </Card>
  );
}

// ─── AnalyticsSidebar ─────────────────────────────────────────────────────────
export default function AnalyticsSidebar() {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <Card glow={C.emerald}>
        <SectionHead title="TIME SAVED" sub="Parking optimization" icon="⏱" accent={C.emerald} />
        <div style={{ display:"flex",alignItems:"flex-end",gap:5,marginBottom:7 }}>
          <span style={{ fontFamily:"monospace",fontSize:38,fontWeight:800,color:C.emerald,textShadow:`0 0 14px ${C.emeraldGlow}` }}><AnimatedNum target={12} /></span>
          <span style={{ fontFamily:"monospace",fontSize:14,color:C.muted,paddingBottom:5 }}>mins</span>
        </div>
        <div style={{ fontFamily:"monospace",fontSize:9,color:C.emerald,marginBottom:10 }}>📈 +23% vs. yesterday</div>
        <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:9 }}>
          <div style={{ display:"flex",justifyContent:"space-between",fontFamily:"monospace",fontSize:9,marginBottom:5 }}>
            <span style={{ color:C.muted }}>Daily Goal</span><span style={{ color:C.text,fontWeight:700 }}>15 mins</span>
          </div>
          <div style={{ height:5,background:`${C.muted}18`,borderRadius:99,overflow:"hidden" }}>
            <div style={{ width:"80%",height:"100%",background:`linear-gradient(90deg,${C.emerald},#34d399)`,borderRadius:99 }} />
          </div>
          <div style={{ fontFamily:"monospace",fontSize:7,color:C.muted,marginTop:3 }}>80% achieved</div>
        </div>
      </Card>
      <Card glow={C.amber}>
        <SectionHead title="FUEL EFFICIENCY" sub="Route optimization" icon="⛽" accent={C.amber} />
        <div style={{ fontFamily:"monospace",fontSize:34,fontWeight:800,color:C.amber,textShadow:`0 0 14px ${C.amberGlow}` }}>+15%</div>
        <div style={{ fontFamily:"monospace",fontSize:9,color:C.muted,marginBottom:10 }}>improvement this week</div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
          {[["Saved","8.2L",C.emerald],["CO2 ↓","19kg",C.blue]].map(([l,v,c]) => (
            <div key={l} style={{ background:`${C.muted}12`,borderRadius:7,padding:"7px",textAlign:"center",border:`1px solid ${C.border}` }}>
              <div style={{ fontFamily:"monospace",fontSize:7,color:C.muted }}>{l}</div>
              <div style={{ fontFamily:"monospace",fontSize:13,fontWeight:700,color:c }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionHead title="TODAY'S STATS" icon="📊" accent={C.blue} />
        <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
          {[["📦","Deliveries","312/353",C.emerald],["⚡","On-Time","96.8%",C.emerald],["⏱","Avg. Time","8.4 min",C.blue],["⭐","Rating","4.9/5.0",C.amber],["🛸","Drone Jobs","4 active",C.purple]].map(([ic,l,v,c]) => (
            <div key={l} style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <div style={{ display:"flex",alignItems:"center",gap:7 }}><span style={{ fontSize:11 }}>{ic}</span><span style={{ fontFamily:"monospace",fontSize:9,color:C.muted }}>{l}</span></div>
              <span style={{ fontFamily:"monospace",fontSize:11,fontWeight:700,color:c }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
      <AIAlertsPanel />
    </div>
  );
}