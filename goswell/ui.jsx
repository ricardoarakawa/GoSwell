// ===== Shared UI primitives =====
const { useState, useEffect, useRef } = React;

const cond = (key) => window.CONDITIONS[key] || window.CONDITIONS.boa;

// hex -> rgba
function tint(hex, a) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, ${a})`;
}

// Condition badge (pill)
function CondBadge({ condition, size = "md" }) {
  const c = cond(condition);
  const pad = size === "sm" ? "3px 9px" : "5px 12px";
  const fs = size === "sm" ? 11 : 12.5;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: pad, borderRadius: 999, fontSize: fs, fontWeight: 600,
      color: c.color, background: tint(c.color, 0.14), letterSpacing: 0.2,
      whiteSpace: "nowrap"
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: c.color }}></span>
      {c.label}
    </span>);

}

// Stat box (Altura / Período / Vento / Potência)
function StatBox({ label, value, unit, accent }) {
  return (
    <div className="gs-statbox">
      <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 500, letterSpacing: 0.4, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 3, marginTop: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: accent || "var(--text)", lineHeight: 1 }}>{value}</span>
        {unit && <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 500 }}>{unit}</span>}
      </div>
    </div>);

}

// Avatar chip with initials
function Avatar({ initials, size = 30, color, ring }) {
  const palette = { RL: "#08A0F8", MK: "#00C896", TF: "#F5A623", JP: "#A06BFF", BR: "#E0578A", LC: "#19B3C6", Eu: "#E0578A" };
  const bg = color || palette[initials] || "#08A0F8";
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, background: tint(bg, 0.9),
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff",
      border: ring ? "2px solid var(--bg)" : "none", flexShrink: 0
    }}>{initials}</div>);

}

// Button
function Btn({ variant = "blue", children, onClick, full, size = "md" }) {
  const base = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
    borderRadius: 12, transition: "filter .15s, transform .08s",
    fontSize: size === "sm" ? 13 : 14.5,
    padding: size === "sm" ? "8px 13px" : "12px 16px",
    width: full ? "100%" : "auto"
  };
  const styles = {
    blue: { ...base, background: "#08A0F8", color: "#fff" },
    green: { ...base, background: "#00C896", color: "#fff" },
    ghost: { ...base, background: "transparent", color: "#08A0F8", border: "1px solid #08A0F8" },
    grad: { ...base, background: "#08A0F8", color: "#fff" },
    neg: { ...base, background: "#E04040", color: "#fff" },
    whats: { ...base, background: "rgba(0,200,150,0.13)", color: "#00C896", border: "1px solid rgba(0,200,150,0.3)" }
  };
  return (
    <button style={{ ...styles[variant] }} onClick={onClick}
    onMouseDown={(e) => e.currentTarget.style.transform = "scale(.97)"}
    onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}>
      {children}
    </button>);

}

// Sticky top header (logo + search + favorites). The favorites button expands
// the header to reveal up to 5 saved spots with their live condition.
function TopHeader({ profile, onOpenFavorite }) {
  const [favOpen, setFavOpen] = useState(false);
  const favs = (profile && profile.favorites || []).
  map((f) => ({ ...f, peak: window.PEAKS.find((p) => p.name === f.name) })).
  filter((f) => f.peak).slice(0, 5);
  return (
    <header className="gs-header">
      <div className="gs-header-row">
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src="goswell/logo-mark.png" alt="GoSwell" style={{ height: 28, width: "auto", display: "block" }} />
        </div>
        <div className="gs-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--muted)" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" /></svg>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>Buscar pico ou praia…</span>
        </div>
        <button className={"gs-fav-btn" + (favOpen ? " on" : "")} onClick={() => setFavOpen((v) => !v)}
        aria-label="Favoritos" aria-expanded={favOpen}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill={favOpen ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 17.3l-5.4 3 1-6-4.3-4.2 6-.9L12 3l2.7 5.2 6 .9-4.3 4.2 1 6z" />
          </svg>
          {favs.length > 0 && <span className="gs-fav-count">{favs.length}</span>}
        </button>
      </div>
      {favOpen &&
      <div className="gs-fav-panel">
        <div className="gs-fav-phead">
          <span>Meus favoritos</span>
          <span className="gs-fav-psub">{favs.length} {favs.length === 1 ? "local" : "locais"}</span>
        </div>
        {favs.map((f) => {
          const c = window.cond(window.personalCondition(f.peak, window.SURF));
          return (
            <button key={f.peak.id} className="gs-fav-row"
            onClick={() => {setFavOpen(false);onOpenFavorite && onOpenFavorite(f.peak.id);}}>
                <span className="gs-fav-dot" style={{ background: c.color }}></span>
                <span className="gs-fav-info">
                  <span className="gs-fav-name">{f.peak.name}{f.tag && <span className="gs-fav-tag">{f.tag}</span>}</span>
                  <span className="gs-fav-meta">{f.peak.direction} · {f.peak.windDir}</span>
                </span>
                <span className="gs-fav-h" style={{ color: c.color }}>{f.peak.height.toFixed(1)}m</span>
                <span className="gs-fav-arrow">→</span>
              </button>);

        })}
      </div>}
    </header>);

}

// Sticky bottom nav (icon + label)
function NavIcon({ id, color }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
  if (id === "mapa") return (
    <svg {...common}><path d="M12 21s-6.5-5.7-6.5-10.2A6.5 6.5 0 0 1 12 4.3a6.5 6.5 0 0 1 6.5 6.5C18.5 15.3 12 21 12 21z" /><circle cx="12" cy="10.6" r="2.3" /></svg>);

  if (id === "trips") return (
    <svg {...common}><path d="M3 14c1.6 0 1.6-1.4 3.2-1.4S7.8 14 9.4 14s1.6-1.4 3.2-1.4S14.2 14 15.8 14s1.6-1.4 3.2-1.4S20.6 14 21 14" /><path d="M3 18.5c1.6 0 1.6-1.4 3.2-1.4s1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4 1.6 1.4 3.2 1.4 1.6-1.4 3.2-1.4" /><path d="M12 3.5c2.4 1.6 3.4 4 2.6 6.6" /></svg>);

  if (id === "produtos") return (
    <svg {...common}><path d="M6 8h12l-1 12H7L6 8z" /><path d="M9 8a3 3 0 0 1 6 0" /></svg>);

  return (
    <svg {...common}><circle cx="12" cy="8" r="3.6" /><path d="M5 20c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" /></svg>);

}

function BottomNav({ tab, setTab, badges }) {
  const tabs = [
  { id: "mapa", label: "Mapa" },
  { id: "trips", label: "Trips" },
  { id: "produtos", label: "Produtos" },
  { id: "perfil", label: "Perfil" }];

  return (
    <nav className="gs-bottomnav">
      {tabs.map((t) => {
        const active = tab === t.id;
        const color = active ? "#08A0F8" : "var(--muted)";
        const badge = badges && badges[t.id];
        return (
          <button key={t.id} onClick={() => setTab(t.id)} className="gs-navbtn" style={{ color }}>
            <span style={{ position: "relative", display: "inline-flex" }}>
              <NavIcon id={t.id} color={color} />
              {badge ? <span className="gs-nav-badge">{badge}</span> : null}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: active ? 700 : 500, marginTop: 3, color }}>{t.label}</span>
            <span style={{ width: 5, height: 5, borderRadius: 999, marginTop: 4,
              background: active ? color : "transparent" }}></span>
          </button>);

      })}
    </nav>);

}

// Weather icon (tempo)
function WeatherIcon({ kind, size = 20, color }) {
  const c = color || "#9FB4D4";
  const s = { width: size, height: size, viewBox: "0 0 24 24", fill: "none" };
  if (kind === "sun" || kind === "sol") return (
    <svg {...s}><circle cx="12" cy="12" r="4.2" fill="#F5A623" /><g stroke="#F5A623" strokeWidth="2" strokeLinecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" /></g></svg>);

  if (kind === "partly" || kind === "parcial") return (
    <svg {...s}><circle cx="9" cy="9" r="3.4" fill="#F5A623" /><path d="M7 18h9.5a3.4 3.4 0 0 0 .3-6.8A4.6 4.6 0 0 0 8 11.4 3.3 3.3 0 0 0 7 18z" fill="#9FB4D4" /></svg>);

  if (kind === "rain" || kind === "chuva") return (
    <svg {...s}><path d="M7 15h9.5a3.4 3.4 0 0 0 .3-6.8A4.8 4.8 0 0 0 7.6 8 3.4 3.4 0 0 0 7 15z" fill="#7E93B4" /><g stroke="#08A0F8" strokeWidth="2" strokeLinecap="round"><path d="M9 18l-1 2.5M13 18l-1 2.5M17 18l-1 2.5" /></g></svg>);

  return (// cloud / nublado
    <svg {...s}><path d="M7 17h9.5a3.6 3.6 0 0 0 .3-7.2A4.9 4.9 0 0 0 7.4 9 3.5 3.5 0 0 0 7 17z" fill={c} /></svg>);

}

Object.assign(window, { cond, tint, CondBadge, StatBox, Avatar, Btn, TopHeader, BottomNav, WeatherIcon });