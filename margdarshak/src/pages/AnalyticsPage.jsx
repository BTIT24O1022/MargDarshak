import { C, DAYS } from "../constants";
import { Card, SectionHead } from "../components/common";

function BarChart({ data, labels, color=C.blue, h=90 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display:"flex",alignItems:"flex-end",gap:7,height:h+18 }}>
      {data.map((v,i) => (
        <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
          <div style={{ fontFamily:"monospace",fontSize:7,color:C.text }}>{v}</div>
          <div style={{ width:"100%",height:`${(v/max)*h}px`,background:color,borderRadius:"4px 4px 0 0",boxShadow:`0 0 6px ${color}55` }} />
          <div style={{ fontFamily:"monospace",fontSize:7,color:C.muted }}>{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
      {[
        ["📊","WEEKLY DELIVERIES","Last 7 days",[220,240,265,258,280,298,312],C.blue],
        ["✅","ON-TIME RATE","Daily %",[92,95,96,94,97,96,95],C.emerald],
        ["⏱","AVG DELIVERY TIME","Minutes",[24,22,21,20,19,17,16],C.amber],
        ["🅿️","PARKING INCIDENTS","Failed attempts",[12,9,7,8,5,4,3],C.red],
      ].map(([ic,t,s,d,c]) => (
        <Card key={t} glow={c}>
          <SectionHead title={t} sub={s} icon={ic} accent={c} />
          <BarChart data={d} labels={DAYS} color={c} />
        </Card>
      ))}
      <Card style={{ gridColumn:"span 2" }}>
        <SectionHead title="PERFORMANCE SUMMARY" sub="This week vs last week" icon="📈" accent={C.blue} />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12 }}>
          {[
            ["📦 Deliveries","1,946","+12.4%",C.emerald],
            ["⏱ Avg Time","16 min","-14%",C.emerald],
            ["⛽ Fuel Saved","57.4L","+15%",C.emerald],
            ["⭐ Rating","4.9/5","+0.2",C.amber],
            ["🌱 CO2 Saved","133kg","+18%",C.blue],
            ["🛸 Drone Trips","22","NEW",C.purple],
          ].map(([l,v,t,c]) => (
            <div key={l} style={{ background:`${C.muted}08`,borderRadius:10,padding:"13px",border:`1px solid ${C.border}`,textAlign:"center" }}>
              <div style={{ fontFamily:"monospace",fontSize:8,color:C.muted,marginBottom:5 }}>{l}</div>
              <div style={{ fontFamily:"monospace",fontSize:18,fontWeight:800,color:C.text }}>{v}</div>
              <div style={{ fontFamily:"monospace",fontSize:9,color:c,fontWeight:700,marginTop:3 }}>{t}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}