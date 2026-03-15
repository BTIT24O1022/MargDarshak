import { C, VTYPES } from "../../constants";
import { LiveDot } from "../common";

export default function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `linear-gradient(135deg,${C.amber},#d97706)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 800, color: "#000" }}>M</span>
        </div>
        <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: C.text }}>MargDarshak</span>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: C.muted }}>by</span>
        <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: C.cyan, letterSpacing: "0.09em" }}>TEAM ERROR 404</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {Object.values(VTYPES).map(v => (
            <span key={v.label} title={v.label} style={{ fontSize: 12 }}>{v.icon}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "monospace", fontSize: 9, color: C.muted }}>
        <span>v1.4.0</span>
        <span>•</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <LiveDot color={C.emerald} size={6} />
          Last sync: Just now
        </span>
      </div>
    </footer>
  );
}