// ===== Tab 1: Mapa (full-bleed, pan + zoom, Google-Maps-style) =====

// pin diameter from wave height (28–56px)
function pinSize(h) {
  const s = 28 + (h - 0.8) / (2.2 - 0.8) * (56 - 28);
  return Math.max(26, Math.min(58, s));
}

function MapPin({ peak, selected, onSelect }) {
  const cKey = window.personalCondition(peak, window.SURF);
  const c = window.cond(cKey);
  const d = pinSize(peak.height);
  const r = d / 2;
  const pulsing = cKey === "perfeita" || cKey === "otima";
  return (
    <g transform={`translate(${peak.x},${peak.y})`} style={{ cursor: "pointer" }}
      onClick={(e) => { e.stopPropagation(); onSelect(peak.id); }}>
      {pulsing &&
      <circle r={r} fill="none" stroke={c.color} strokeWidth="2" opacity="0.6">
          <animate attributeName="r" from={r} to={r + 22} dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.55" to="0" dur="2.4s" repeatCount="indefinite" />
        </circle>
      }
      <circle r={r} cy="2" fill="rgba(0,0,0,0.45)" />
      <circle r={r} fill={c.color} stroke={selected ? "#fff" : window.tint(c.color, 0.55)} strokeWidth={selected ? 3 : 1.5} />
      <text y={r * 0.18} textAnchor="middle" fontSize={Math.max(10, r * 0.5)} fontWeight="700" fill={cKey === "perfeita" || cKey === "boa" ? "#04210A" : "#fff"}>
        {peak.height.toFixed(1)}
      </text>
      <text y={r + 15} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)" style={{ paintOrder: "stroke" }} stroke="var(--map-stroke)" strokeWidth="3.5">
        {peak.name}
      </text>
    </g>);
}

function CoastMap({ zoom, pan, dragging, selectedId, onSelect }) {
  const showBiz = zoom >= 1.5;
  return (
    <svg viewBox="0 0 390 470" className="gs-map-svg" preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center center", transition: dragging ? "none" : "transform .25s ease" }}>
      <defs>
        <pattern id="depth" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(8)">
          <path d="M0 13 H26" stroke="rgba(8,160,248,0.06)" strokeWidth="1" />
        </pattern>
      </defs>
      {/* ocean */}
      <rect x="-200" y="-200" width="790" height="870" fill="var(--water)" />
      <rect x="-200" y="-200" width="790" height="870" fill="url(#depth)" />
      {/* swell lines */}
      <g opacity="0.5" stroke="rgba(8,160,248,0.16)" strokeWidth="1.5" fill="none">
        <path d="M340 -40 q-16 70 0 140 q16 70 0 140 q-16 70 0 140 q16 70 0 160" />
        <path d="M372 -40 q-16 70 0 140 q16 70 0 140 q-16 70 0 140 q16 70 0 160" />
      </g>
      {/* LAND */}
      <path d="M315 -40 L300 60 Q345 110 330 150 Q300 200 275 235 Q250 280 235 300
               Q280 320 295 336 Q250 372 205 400 Q235 440 250 510 L-40 510 L-40 -40 Z"
        fill="var(--land)" stroke="rgba(0,200,150,0.35)" strokeWidth="1.5" />
      <g opacity="0.5">
        <path d="M40 80 Q120 100 90 180 Q70 240 140 250" stroke="rgba(255,255,255,0.04)" strokeWidth="2" fill="none" />
        <path d="M20 320 Q90 300 120 360" stroke="rgba(255,255,255,0.04)" strokeWidth="2" fill="none" />
      </g>
      <text x="60" y="44" fontSize="11" fontWeight="600" fill="var(--muted)" letterSpacing="0.5">UBATUBA</text>
      <text x="40" y="430" fontSize="11" fontWeight="600" fill="var(--muted)" letterSpacing="0.5">CARAGUÁ</text>
      <text x="150" y="225" fontSize="9.5" fontWeight="600" fill="var(--muted)" letterSpacing="0.5">SÃO SEBASTIÃO</text>

      {showBiz && window.BUSINESSES.map((b) =>
        <g key={b.id} transform={`translate(${b.x},${b.y})`} className="gs-bizpin">
          <circle r="11" fill="#1A2238" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
          <text y="4" textAnchor="middle" fontSize="12">{b.icon}</text>
        </g>
      )}
      {window.PEAKS.map((p) =>
        <MapPin key={p.id} peak={p} selected={selectedId === p.id} onSelect={onSelect} />
      )}
    </svg>);
}

// Small direction arrow with compass label (big)
function DirArrow({ deg, color, label, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <svg width="30" height="30" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="11" fill={window.tint(color, 0.14)} />
        <g transform={`rotate(${deg + 180} 12 12)`}>
          <path d="M12 4 L12 19 M12 4 L8.5 9 M12 4 L15.5 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      </svg>
      <div>
        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: 1, letterSpacing: -0.5 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

function PeakCard({ peak, onClose, onForecast, onBusinesses }) {
  const cKey = window.personalCondition(peak, window.SURF);
  const c = window.cond(cKey);
  const windDeg = window.DIR_DEG[peak.windDir] != null ? window.DIR_DEG[peak.windDir] : 0;
  const wt = window.windType(windDeg);
  const swellDeg = window.DIR_DEG[peak.swellDir] != null ? window.DIR_DEG[peak.swellDir] : 180;
  const weather = window.WEATHER[peak.weather] || window.WEATHER.sol;
  return (
    <div className="gs-peakcard" onClick={(e) => e.stopPropagation()}>
      <div className="gs-grabber"></div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: -0.3 }}>{peak.name}</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 3 }}>{peak.type} · {peak.direction}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CondBadge condition={cKey} />
          <button className="gs-close" onClick={onClose}>✕</button>
        </div>
      </div>

      {/* tempo + temperaturas */}
      <div className="gs-weatherrow">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
          <WeatherIcon kind={peak.weather} size={20} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{weather.label}</span>
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>🌡️ Ar <strong style={{ color: "var(--text)" }}>{peak.airTemp}°</strong></span>
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>🌊 Água <strong style={{ color: "#08A0F8" }}>{peak.waterTemp}°</strong></span>
        </span>
      </div>

      {/* 1 tamanho · 2 período */}
      <div className="gs-statgrid" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <StatBox label="Tamanho" value={peak.height.toFixed(1)} unit="m" accent={c.color} />
        <StatBox label="Período" value={peak.period} unit="s" />
      </div>

      {/* 3 swell · 4 vento (direção em destaque) */}
      <div className="gs-dirgrid">
        <div className="gs-dircard">
          <div className="gs-dirhead">
            <span>Swell</span>
            <span style={{ color: "var(--muted)", fontSize: 11.5 }}>{peak.period}s</span>
          </div>
          <DirArrow deg={swellDeg} color={c.color} label={peak.swellDir} sub="" />
        </div>
        <div className="gs-dircard">
          <div className="gs-dirhead">
            <span>Vento</span>
            <span style={{ color: wt.color, fontWeight: 700, fontSize: 11.5, background: window.tint(wt.color, 0.14), padding: "2px 8px", borderRadius: 999 }}>{wt.label}</span>
          </div>
          <DirArrow deg={windDeg} color={wt.color} label={peak.windDir} sub={`${peak.wind} km/h`} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <Btn variant="blue" full onClick={onForecast}>Previsão 15 dias →</Btn>
        <Btn variant="ghost" full onClick={onBusinesses}>Locais</Btn>
      </div>
    </div>);
}

function MapScreen({ onOpenForecast, onOpenBusinesses, inviteCount, onOpenInvites, favPeakId }) {
  const favPeak = window.PEAKS.find((p) => p.id === favPeakId);
  // initial pan centers the preferred peak (viewBox center is 195,235; ~1.1px per unit)
  const initialPan = favPeak ? {
    x: Math.max(-150, Math.min(150, (195 - favPeak.x) * 1.05 * 1.35)),
    y: Math.max(-160, Math.min(160, (235 - favPeak.y) * 1.05 * 1.35)),
  } : { x: 0, y: 0 };
  const [zoom, setZoom] = useState(favPeak ? 1.35 : 1.05);
  const [pan, setPan] = useState(initialPan);
  const [dragging, setDragging] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  const drag = useRef({ down: false, x: 0, y: 0, px: 0, py: 0, moved: false });
  const selected = window.PEAKS.find((p) => p.id === selectedId);
  const alert = window.preferredAlert(window.SURF);

  const clamp = (v, m) => Math.max(-m, Math.min(m, v));
  const onDown = (e) => { drag.current = { down: true, x: e.clientX, y: e.clientY, px: pan.x, py: pan.y, moved: false }; setDragging(true); };
  const onMove = (e) => {
    if (!drag.current.down) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.current.moved = true;
    const m = 130 * zoom;
    setPan({ x: clamp(drag.current.px + dx, m), y: clamp(drag.current.py + dy, m) });
  };
  const onUp = () => { drag.current.down = false; setDragging(false); };
  const onBgClick = () => { if (!drag.current.moved) setSelectedId(null); };
  const recenter = () => { setPan(initialPan); setZoom(favPeak ? 1.35 : 1.05); };

  return (
    <div className="gs-screen-map">
      <div className="gs-mapwrap" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onClick={onBgClick}>
        <CoastMap zoom={zoom} pan={pan} dragging={dragging} selectedId={selectedId} onSelect={(id) => setSelectedId(id)} />

        {/* legend */}
        <div className="gs-legend">
          {["perfeita", "otima", "boa", "regular", "ruim", "dificil"].map((k) =>
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: window.cond(k).color }}></span>
              <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500 }}>{window.cond(k).label}</span>
            </div>
          )}
        </div>

        {/* invite notification */}
        {inviteCount > 0 && !selected &&
          <button className="gs-map-notif" onClick={(e) => { e.stopPropagation(); onOpenInvites && onOpenInvites(); }}
            onPointerDown={(e) => e.stopPropagation()}>
            <span className="gs-map-notif-ic">✉️<span className="gs-nav-badge" style={{ top: -5, right: -7 }}>{inviteCount}</span></span>
            <span>{inviteCount === 1 ? "Você tem 1 convite de surftrip" : `Você tem ${inviteCount} convites de surftrip`}</span>
            <span style={{ color: "#08A0F8", fontWeight: 700 }}>Ver →</span>
          </button>
        }

        {/* favorable-condition alert for preferred peak */}
        {alert && !alertDismissed && !selected &&
          <div className="gs-map-alert" style={{ bottom: inviteCount > 0 ? 70 : 14 }}>
            <button className="gs-map-alert-main" onClick={(e) => { e.stopPropagation(); onOpenForecast(alert.peak); }}
              onPointerDown={(e) => e.stopPropagation()}>
              <span className="gs-map-alert-ic">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#04210A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: 13 }}>⭐ Seu pico preferido</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{alert.message}</span>
              </span>
              <span style={{ color: "#00C896", fontWeight: 700, fontSize: 12.5, whiteSpace: "nowrap" }}>Ver →</span>
            </button>
            <button className="gs-map-alert-x" onClick={(e) => { e.stopPropagation(); setAlertDismissed(true); }}
              onPointerDown={(e) => e.stopPropagation()}>✕</button>
          </div>
        }

        {/* zoom + recenter */}
        <div className="gs-zoom" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
          <button onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}>＋</button>
          <div className="gs-zoomdiv"></div>
          <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}>−</button>
          <div className="gs-zoomdiv"></div>
          <button onClick={recenter} title="Recentralizar" style={{ fontSize: 15 }}>⊕</button>
        </div>

        {zoom >= 1.5 && <div className="gs-bizhint">🏨 🏄 🍴 estabelecimentos próximos</div>}

        {/* counter chip (hidden when a bottom notification is present) */}
        {!selected && !(inviteCount > 0) && !(alert && !alertDismissed) && <div className="gs-mapcount">{window.PEAKS.length} picos · Litoral Norte SP</div>}

        {selected &&
        <PeakCard peak={selected} onClose={() => setSelectedId(null)}
        onForecast={() => onOpenForecast(selected)}
        onBusinesses={() => onOpenBusinesses(selected)} />
        }
      </div>
    </div>);
}

Object.assign(window, { MapScreen });
