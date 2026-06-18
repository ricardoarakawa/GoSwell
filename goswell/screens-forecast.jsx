// ===== Tab 1 → Forecast =====

function DayColumn({ d, peak, selected, onClick }) {
  const tub = window.isTubular(peak);
  const diff = peak && peak.difficulty;
  // 3 momentos do dia: manhã, meio-dia, tarde — cada um com sua própria condição (personalizada)
  const periods = [
    { label: "M", hf: 0.85, wd: -4, wdeg: 315 }, // terral de manhã
    { label: "T", hf: 1.0,  wd: 0,  wdeg: 225 }, // cruzado meio-dia
    { label: "N", hf: 0.88, wd: 6,  wdeg: 135 }, // maral à tarde
  ].map(p => {
    const h = d.h * p.hf;
    const wind = Math.max(5, d.wind + p.wd);
    const condition = window.personalCondFor({ height: h, period: d.t, wind, difficulty: diff, tubular: tub, swellDir: d.dir }, window.SURF);
    return { ...p, h, wind, condition, color: window.cond(condition).color,
      barH: Math.round((h / 2.5) * 86), windType: window.windType(p.wdeg) };
  });
  const maxWind = 35; // escala fixa p/ comparar dias
  const windColor = "#48C9E0"; // cor única do vento
  return (
    <button className="gs-daycol" onClick={onClick}
      style={{ borderColor: selected ? "#08A0F8" : "var(--border)", background: selected ? "rgba(8,160,248,0.08)" : "var(--card)", opacity: d.past ? 0.6 : 1 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: d.day === "Hoje" ? "#00C896" : (d.past ? "var(--muted)" : "var(--text)") }}>{d.day}</div>
      <div style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 6 }}>{d.date}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 6 }}>
        <WeatherIcon kind={d.weather} size={15} />
        <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 600 }}>{d.at}°</span>
      </div>
      {/* ondas — M/T/N */}
      <div style={{ height: 90, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, width: "100%" }}>
        {periods.map((p, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ width: 9, height: p.barH, borderRadius: 4, background: p.color }}></div>
            <span style={{ fontSize: 8.5, color: "var(--muted)", fontWeight: 600 }}>{p.label}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8, color: "var(--text)" }}>{d.h.toFixed(1)}m</div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{d.t}s · {d.dir}</div>

      {/* vento — mesmo padrão M/T/N, no máx 1/3 da altura do gráfico de ondas */}
      <div style={{ marginTop: 9, paddingTop: 8, borderTop: "1px solid var(--border)", width: "100%" }}>
        <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 5 }}>Vento</div>
        <div style={{ height: 30, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 4, width: "100%" }}>
          {periods.map((p, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <div style={{ width: 9, height: Math.max(3, Math.round((p.wind / maxWind) * 26)), borderRadius: 3, background: windColor }}></div>
              <span style={{ fontSize: 8, color: "var(--muted)", fontWeight: 600 }}>{window.degToCompass(p.wdeg)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4, marginTop: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text)" }}>{d.wind}</span>
          <span style={{ fontSize: 9.5, color: "var(--muted)" }}>km/h</span>
        </div>
      </div>
    </button>
  );
}

function HourlyStrip({ baseH, baseT, baseWind, baseDir, peak }) {
  const hours = window.buildHourly(baseH, baseT, baseWind, baseDir, { difficulty: peak && peak.difficulty, tubular: window.isTubular(peak) });
  const max = Math.max(...hours.map(h => h.h));
  const ref = useRef(null);
  window.useChartSync(ref, 6, 36);
  const drag = useRef({ down: false, x: 0, left: 0 });
  const onDown = (e) => { drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft }; };
  const onMove = (e) => { if (!drag.current.down) return; ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const onUp = () => { drag.current.down = false; };
  return (
    <div className="gs-card gs-pad">
      <div className="gs-blocktitle" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Detalhe por hora</span>
        <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: 11 }}>← arraste · 36h →</span>
      </div>
      {/* wind legend */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        {[{ l: "Terral", c: "#00C896" }, { l: "Cruzado", c: "#F5A623" }, { l: "Maral", c: "#E04040" }].map(w => (
          <div key={w.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: w.c }}></span>
            <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500 }}>{w.l}</span>
          </div>
        ))}
      </div>
      <div className="gs-hourly" ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        {hours.map((h, idx) => {
          const now = idx === 6; // 12h de hoje = agora
          const c = window.cond(h.condition);
          const wt = h.windType;
          const newDay = h.hod === 0;
          return (
            <div key={h.hour} className="gs-hourcell"
              style={{ width: 58, background: now ? "rgba(8,160,248,0.12)" : "transparent",
                borderColor: now ? "rgba(8,160,248,0.4)" : "transparent",
                borderLeft: newDay ? "1px solid var(--border)" : "1px solid transparent",
                marginLeft: newDay ? 4 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: now ? "#08A0F8" : "var(--text)" }}>{h.hod}h</div>
              {/* swell direction arrow */}
              <svg width="18" height="18" viewBox="0 0 20 20" style={{ display: "block", margin: "4px auto 0", transform: `rotate(${h.dirDeg + 180}deg)` }}>
                <path d="M10 2 L10 17 M10 2 L6 7 M10 2 L14 7" stroke={c.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>{h.dir}</div>
              {/* height bar (condition color) */}
              <div style={{ height: 40, display: "flex", alignItems: "flex-end", justifyContent: "center", margin: "5px 0 4px" }}>
                <div style={{ width: 10, height: Math.max(4, Math.round((h.h / max) * 40)), borderRadius: 3, background: c.color }}></div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{h.h.toFixed(1)}m</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 1 }}>{h.t}s</div>
              {/* wind: arrow rotated to bearing + type chip */}
              <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid var(--border)" }}>
                <svg width="14" height="14" viewBox="0 0 20 20" style={{ display: "block", margin: "0 auto", transform: `rotate(${h.windDeg + 180}deg)` }}>
                  <path d="M10 3 L10 16 M10 3 L7 8 M10 3 L13 8" stroke={wt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
                <div style={{ fontSize: 9.5, fontWeight: 700, color: wt.color, marginTop: 2 }}>{wt.label}</div>
                <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 1 }}>{h.wind}km</div>
              </div>
              <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 5, fontWeight: 600 }}>{h.day === 0 ? "hoje" : "amanhã"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Selectable bar chart with dotted gridlines + fixed y-range. Click a bar to read its value.
function SelectableBarChart({ title, unit, data, max, divisions = 4, defaultSel = 0, palette, fmt = (v) => v, plotH = 120, syncStart = 6 }) {
  const [sel, setSel] = useState(Math.min(defaultSel, data.length - 1));
  const ref = useRef(null);
  window.useChartSync(ref, syncStart, data.length);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const onDown = (e) => { drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false }; };
  const onMove = (e) => { if (!drag.current.down) return; if (Math.abs(e.clientX - drag.current.x) > 3) drag.current.moved = true; ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const onUp = () => { drag.current.down = false; };
  const cur = data[Math.min(sel, data.length - 1)];
  const HEAD = 20;                 // headroom no topo p/ o rótulo flutuante
  const usableH = plotH - HEAD;
  const levels = [];
  for (let i = divisions; i >= 0; i--) levels.push(Math.round((max * i / divisions) * 100) / 100);
  return (
    <div className="gs-card gs-pad">
      <div className="gs-blocktitle" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{title}</span>
        <span style={{ color: palette.accent, fontWeight: 700, fontSize: 12.5 }}>
          {fmt(cur.v)} {unit} <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {cur.label}{cur.sub ? " " + cur.sub : ""}</span>
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {/* y-axis */}
        <div style={{ width: unit === "J" ? 34 : 26, height: plotH, position: "relative", flexShrink: 0 }}>
          {levels.map((l, i) => (
            <span key={i} style={{ position: "absolute", right: 2, bottom: (l / max) * usableH, transform: "translateY(50%)", fontSize: 9, color: "var(--muted)" }}>{fmt(l)}</span>
          ))}
        </div>
        {/* plot */}
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: plotH, pointerEvents: "none" }}>
            {levels.map((l, i) => (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, bottom: (l / max) * usableH, borderTop: "1px dashed rgba(255,255,255,0.1)" }}></div>
            ))}
          </div>
          <div className="gs-barscroll" ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
            {data.map((d, i) => {
              const isSel = i === sel;
              const newDay = d.label === "0h" && i !== 0;
              const barPx = Math.max(2, (d.v / max) * usableH);
              return (
                <button key={i} onClick={() => { if (!drag.current.moved) setSel(i); }}
                  style={{ flex: "0 0 auto", width: 20, background: "none", border: "none", padding: 0, cursor: "pointer",
                    borderLeft: newDay ? "1px solid var(--border)" : "1px solid transparent", marginLeft: newDay ? 3 : 0 }}>
                  <div style={{ height: plotH, position: "relative", display: "flex", justifyContent: "center", alignItems: "flex-end" }}>
                    {isSel && (
                      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", bottom: barPx + 5, whiteSpace: "nowrap", zIndex: 3,
                        fontSize: 10, fontWeight: 700, color: palette.accent, background: "var(--card-2)",
                        border: `1px solid ${palette.ring}`, borderRadius: 6, padding: "2px 5px" }}>
                        {fmt(d.v)}{unit}
                      </div>
                    )}
                    <div style={{ width: 9, height: barPx, borderRadius: 3,
                      background: isSel ? palette.accent : palette.soft,
                      boxShadow: isSel ? `0 0 0 2px ${palette.ring}` : "none" }}></div>
                  </div>
                  <div style={{ fontSize: 8.5, color: isSel ? palette.accent : "var(--muted)", fontWeight: isSel ? 700 : 500, marginTop: 4 }}>{d.shortLabel || d.label}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wind chart — same layout as the old swell chart, 36h, horizontally scrollable.
// arrows + text = wind direction · bars + text = speed · terral/cruzado/maral legend.
function WindChart({ hourly }) {
  const maxWind = Math.max(...hourly.map(h => h.wind), 30);
  const ref = useRef(null);
  window.useChartSync(ref, 6, 36);
  const drag = useRef({ down: false, x: 0, left: 0 });
  const onDown = (e) => { drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft }; };
  const onMove = (e) => { if (!drag.current.down) return; ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x); };
  const onUp = () => { drag.current.down = false; };
  return (
    <div className="gs-card gs-pad">
      <div className="gs-blocktitle" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Vento</span>
        <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: 11 }}>← arraste · 36h →</span>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        {[{ l: "Terral", c: "#00C896" }, { l: "Cruzado", c: "#F5A623" }, { l: "Maral", c: "#E04040" }].map(w => (
          <div key={w.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: w.c }}></span>
            <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500 }}>{w.l}</span>
          </div>
        ))}
      </div>
      <div className="gs-hourly" ref={ref} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
        {hourly.map((h, idx) => {
          const now = idx === 6;
          const wt = h.windType;
          const newDay = h.hod === 0;
          return (
            <div key={h.hour} className="gs-hourcell"
              style={{ width: 56, background: now ? "rgba(8,160,248,0.12)" : "transparent",
                borderColor: now ? "rgba(8,160,248,0.4)" : "transparent",
                borderLeft: newDay ? "1px solid var(--border)" : "1px solid transparent", marginLeft: newDay ? 4 : 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: now ? "#08A0F8" : "var(--text)" }}>{h.hod}h</div>
              {/* wind direction arrow (points where wind blows toward) */}
              <svg width="18" height="18" viewBox="0 0 20 20" style={{ display: "block", margin: "4px auto 0", transform: `rotate(${h.windDeg + 180}deg)` }}>
                <path d="M10 2 L10 17 M10 2 L6 7 M10 2 L14 7" stroke={wt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div style={{ fontSize: 9, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>{window.degToCompass(h.windDeg)}</div>
              {/* speed bar */}
              <div style={{ height: 40, display: "flex", alignItems: "flex-end", justifyContent: "center", margin: "5px 0 4px" }}>
                <div style={{ width: 10, height: Math.max(4, Math.round((h.wind / maxWind) * 40)), borderRadius: 3, background: wt.color }}></div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{h.wind}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 1 }}>km/h</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: wt.color, marginTop: 5, paddingTop: 5, borderTop: "1px solid var(--border)" }}>{wt.label}</div>
              <div style={{ fontSize: 9, color: "var(--muted)", marginTop: 3, fontWeight: 600 }}>{h.day === 0 ? "hoje" : "amanhã"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ForecastScreen({ peak, onBack, onOrganize, onSwitchPeak }) {
  const data = window.FORECAST;
  const todayIdx = Math.max(0, data.findIndex((x) => x.day === "Hoje"));
  const [sel, setSel] = useState(todayIdx);
  const [peakList, setPeakList] = useState(false);
  const [showSeason, setShowSeason] = useState(false);
  const scrollRef = useRef(null);
  const d = data[sel];
  const pCtx = { difficulty: peak.difficulty, tubular: window.isTubular(peak) };
  const dayCond = (x) => window.personalCondFor({ height: x.h, period: x.t, wind: x.wind, difficulty: pCtx.difficulty, tubular: pCtx.tubular, swellDir: x.dir }, window.SURF);
  const todayCond = dayCond(data[todayIdx]);
  const selCond = dayCond(d);
  const hourly = window.buildHourly(d.h, d.t, d.wind, d.dir, pCtx);
  // Potência em Joules, 36h (mesma série horária)
  const powerData = hourly.map(h => ({ v: window.powerJoules(h.h, h.t),
    label: h.hod + "h", shortLabel: h.hod + "h", sub: h.day === 0 ? "hoje" : "amanhã" }));
  // Maré, 24h
  const tideData = window.buildTide().map((v, i) => ({ v, label: i + "h", shortLabel: (i % 3 === 0 ? i + "h" : "") }));

  if (showSeason) return <SeasonScreen peak={peak} onBack={() => setShowSeason(false)} />;

  return (
    <div className="gs-screen">
      {/* forecast header */}
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onBack}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <button className="gs-peakswitch" onClick={() => setPeakList((v) => !v)}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{peak.name}</span>
            <span className={"gs-peakswitch-chev" + (peakList ? " open" : "")}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </button>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{peak.type} · {peak.direction}</div>
        </div>
        <CondBadge condition={todayCond} />
      </div>

      {/* lista de picos próximos (header expansível) */}
      {peakList && (
        <div className="gs-peaklist-pop">
          <div className="gs-peaklist-head">Trocar de pico</div>
          {window.PEAKS.map((p) => {
            const pc = window.cond(window.personalCondition(p, window.SURF));
            const active = p.id === peak.id;
            return (
              <button key={p.id} className={"gs-peaklist-row" + (active ? " active" : "")}
                onClick={() => { setPeakList(false); if (!active && onSwitchPeak) onSwitchPeak(p.id); }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: pc.color, flexShrink: 0 }}></span>
                <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <span style={{ fontSize: 14.5, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--muted)" }}>{p.direction} · {p.windDir}</span>
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: pc.color }}>{p.height.toFixed(1)}m</span>
                {active && <span className="gs-peaklist-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      <div className="gs-fc-body">
        <div className="gs-blocktitle gs-15-head" style={{ padding: "0 16px" }}>
          <span>Próximos 15 dias</span>
          <button className="gs-season-btn" onClick={() => setShowSeason(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/><circle cx="12" cy="12" r="4"/>
            </svg>
            A melhor época
          </button>
        </div>
        <div className="gs-daycols" ref={scrollRef}>
          {data.map((dd, i) => (
            <DayColumn key={i} d={dd} peak={peak} selected={i === sel} onClick={() => setSel(i)} />
          ))}
        </div>

        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{d.day}, {d.date}</span>
            {d.past && <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--muted)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: 999 }}>PASSADO</span>}
            <CondBadge condition={selCond} size="sm" />
          </div>

          {/* tempo + temperaturas do dia */}
          <div className="gs-weatherrow">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
              <WeatherIcon kind={d.weather} size={20} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{(window.WEATHER[d.weather] || {}).label}</span>
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>🌡️ Ar <strong style={{ color: "var(--text)" }}>{d.at}°</strong></span>
              <span style={{ fontSize: 12.5, color: "var(--muted)" }}>🌊 Água <strong style={{ color: "#08A0F8" }}>{d.wt}°</strong></span>
            </span>
          </div>

          <HourlyStrip baseH={d.h} baseT={d.t} baseWind={d.wind} baseDir={d.dir} peak={peak} />

          <WindChart hourly={hourly} />

          <SelectableBarChart title="Tábua de marés" unit="m" data={tideData} max={2} divisions={4} defaultSel={12}
            fmt={(v) => v.toFixed(1)} syncStart={0}
            palette={{ accent: "#00C896", soft: "rgba(8,160,248,0.34)", ring: "rgba(0,200,150,0.4)" }} />

          <SelectableBarChart title="Potência" unit="J" data={powerData} max={2000} divisions={4} defaultSel={6}
            fmt={(v) => Math.round(v)} syncStart={6}
            palette={{ accent: "#A06BFF", soft: "rgba(160,107,255,0.32)", ring: "rgba(160,107,255,0.4)" }} />
        </div>
      </div>

      {/* floating action button — adicionar surftrip */}
      <div className="gs-fab-dock">
        <button className="gs-fab" onClick={() => onOrganize(d)} aria-label="Adicionar surftrip neste pico">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span>Adicionar surftrip</span>
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { ForecastScreen });
