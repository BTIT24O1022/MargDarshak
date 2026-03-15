import { useState, useEffect } from "react";
import { C } from "../../constants";

// ─── AnimatedNum ──────────────────────────────────────────────────────────────
export function AnimatedNum({ target, duration = 1200 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let s = null;
    const step = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / duration, 1);
      setVal(Math.floor(p * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return <span>{val}</span>;
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
export function Sparkline({ data, color = C.emerald, h = 28, w = 72 }) {
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`)
    .join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline
        points={pts} fill="none" stroke={color}
        strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── LiveDot ──────────────────────────────────────────────────────────────────
export function LiveDot({ color = C.emerald, size = 8 }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", width: size + 2, height: size + 2 }}>
      <span style={{ position: "absolute", width: size + 2, height: size + 2, borderRadius: "50%", background: color, opacity: 0.35, animation: "ping 1.5s infinite" }} />
      <span style={{ width: size - 2, height: size - 2, borderRadius: "50%", background: color, boxShadow: `0 0 7px ${color}` }} />
    </span>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
export function Badge({ children, color = C.emerald, size = 9 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 99, border: `1px solid ${color}55`, background: `${color}15`, color, fontSize: size, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.07em" }}>
      {children}
    </span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style = {}, glow, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
        padding: "16px 18px", position: "relative", overflow: "hidden",
        ...(glow ? { boxShadow: `0 0 22px ${glow}18` } : {}),
        ...(onClick ? { cursor: "pointer" } : {}),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── SectionHead ─────────────────────────────────────────────────────────────
export function SectionHead({ title, sub, icon, accent = C.amber }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: `${accent}20`, border: `1px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: C.text, letterSpacing: "0.07em" }}>{title}</div>
        {sub && <div style={{ fontFamily: "monospace", fontSize: 8, color: C.muted }}>{sub}</div>}
      </div>
    </div>
  );
}