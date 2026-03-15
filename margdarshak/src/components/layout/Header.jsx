import { useState } from "react";
import { C, TABS, VTYPES, AI_MODULES } from "../../constants";
import { LiveDot } from "../common";

export default function Header({ tab, setTab, calcCount, userName = "Arjun Kumar", userRole = "Fleet Manager", onLogout }) {
  const [search, setSearch] = useState("");

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100 }}>

      {/* ── Row 1: Logo + AI Engine strip + User ── */}
      <div style={{ background: `${C.card}f5`, borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(16px)", padding: "0 22px", display: "flex", alignItems: "center", gap: 0, height: 52 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${C.amber},#d97706)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 13px ${C.amberGlow}` }}>
            <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: "#000" }}>M</span>
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 800, color: C.text, letterSpacing: "0.04em", lineHeight: 1.2 }}>MargDarshak</div>
            <div style={{ fontFamily: "monospace", fontSize: 7, color: C.muted }}>Multi-Vehicle Intelligence</div>
          </div>
          <div style={{ padding: "2px 8px", borderRadius: 5, background: "#000c", border: `1px solid ${C.cyan}40` }}>
            <span style={{ fontFamily: "monospace", fontSize: 8, color: C.cyan, fontWeight: 700, letterSpacing: "0.09em" }}>ERROR 404</span>
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: C.border, margin: "0 16px", flexShrink: 0 }} />

        {/* AI Module pills */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            {AI_MODULES.map(m => (
              <div key={m.name} title={m.usp} style={{ display: "flex", alignItems: "center", gap: 4, background: `${m.color}10`, border: `1px solid ${m.color}40`, borderRadius: 7, padding: "3px 9px", flexShrink: 0, cursor: "default" }}>
                <span style={{ fontSize: 10 }}>{m.icon}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 7.5, color: m.color, fontWeight: 800, letterSpacing: "0.06em" }}>{m.name.replace(" AI", "")}</span>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: m.color, boxShadow: `0 0 5px ${m.color}` }} />
                    <span style={{ fontFamily: "monospace", fontSize: 9, color: C.text, fontWeight: 800 }}>{m.val}</span>
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 7, color: C.muted, letterSpacing: "0.03em" }}>{m.label}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginLeft: 4, fontFamily: "monospace", fontSize: 7.5, color: C.muted, flexShrink: 0 }}>
            <span style={{ color: C.mutedLight, fontWeight: 700 }}>{calcCount.toLocaleString()}</span> calcs/hr
          </div>
        </div>

        <div style={{ width: 1, height: 28, background: C.border, margin: "0 14px", flexShrink: 0 }} />

        {/* Search + User */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.muted}15`, borderRadius: 7, padding: "5px 10px", width: 190, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 11 }}>🔍</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicles, routes..."
              style={{ background: "none", border: "none", outline: "none", fontFamily: "monospace", fontSize: 9.5, color: C.text, flex: 1 }}
            />
          </div>
          <div style={{ position: "relative", cursor: "pointer", fontSize: 17 }}>
            🔔
            <span style={{ position: "absolute", top: 0, right: 0, width: 6, height: 6, borderRadius: "50%", background: C.amber, boxShadow: `0 0 5px ${C.amberGlow}` }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{ width: 29, height: 29, borderRadius: "50%", background: `linear-gradient(135deg,${C.blue},#1d4ed8)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, boxShadow: `0 0 9px ${C.blueGlow}` }}>👤</div>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 9.5, fontWeight: 700, color: C.text }}>{userName}</div>
              <div style={{ fontFamily: "monospace", fontSize: 7, color: C.muted }}>{userRole}</div>
            </div>
            {onLogout && (
              <button onClick={onLogout} title="Sign out" style={{ marginLeft: 4, background: `${C.muted}18`, border: `1px solid ${C.border}`, borderRadius: 7, padding: "4px 8px", cursor: "pointer", fontFamily: "monospace", fontSize: 8, color: C.muted, fontWeight: 700, letterSpacing: "0.06em" }}>
                ⏻
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 2: Tabs + Vehicle type pills ── */}
      <div style={{ background: `${C.card}f5`, borderBottom: `1px solid ${C.border}`, backdropFilter: "blur(16px)", padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 38 }}>
        <div style={{ display: "flex" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "0 14px", height: 38, background: "none", border: "none", cursor: "pointer", fontFamily: "monospace", fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", color: tab === t ? C.amber : C.muted, borderBottom: tab === t ? `2px solid ${C.amber}` : "2px solid transparent", transition: "all 0.2s" }}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {Object.entries(VTYPES).map(([k, v]) => (
            <div key={k} title={v.label} style={{ display: "flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 5, background: `${v.color}10`, border: `1px solid ${v.color}25` }}>
              <span style={{ fontSize: 10 }}>{v.icon}</span>
              <span style={{ fontFamily: "monospace", fontSize: 7, color: v.color, fontWeight: 700 }}>{v.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}