import { C, STATS } from "../../constants";
import { Card, Badge, AnimatedNum, Sparkline } from "../common";

export default function StatsBar() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 18 }}>
      {STATS.map((s, i) => (
        <Card key={i} style={{ padding: "13px 15px" }} glow={s.color}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <Badge color={s.up ? C.emerald : C.red}>{s.trend}</Badge>
          </div>
          <div style={{ margin: "8px 0 0" }}>
            <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 800, color: C.text }}>
              <AnimatedNum target={Math.floor(s.val)} />
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: C.muted, marginTop: 1 }}>{s.label}</div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: `${C.muted}88` }}>{s.sub}</div>
          </div>
          <div style={{ marginTop: 7 }}>
            <Sparkline data={s.spark} color={s.color} />
          </div>
        </Card>
      ))}
    </div>
  );
}