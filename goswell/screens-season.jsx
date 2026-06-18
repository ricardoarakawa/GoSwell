// ===== Best season screen (A melhor época) =====

function Stars({ rating, size = 13 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span style={{ display: "inline-flex", gap: 1, color: "#F5A623", fontSize: size, lineHeight: 1 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} style={{ color: i < full ? "#F5A623" : (i === full && half ? "#F5A623" : "var(--switch-off)") }}>
          {i === full && half ? "⯨" : "★"}
        </span>
      ))}
    </span>
  );
}

function MonthBars({ months, bestKey }) {
  const max = Math.max(...months.map((m) => m.h));
  // cor por rating (qualidade): vermelho→amarelo→verde
  const ratingColor = (r) => r >= 4 ? "#00C896" : r >= 3 ? "#7DC832" : r >= 2.5 ? "#F5A623" : "#E07A40";
  const bestIdx = { inverno: [5, 6, 7], verao: [11, 0, 1], outono: [2, 3, 4], primavera: [8, 9, 10] }[bestKey] || [];
  return (
    <div className="gs-card gs-pad">
      <div className="gs-blocktitle" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Média de ondas por mês</span>
        <span style={{ color: "var(--muted)", fontWeight: 500, fontSize: 11 }}>altura · qualidade</span>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 110 }}>
        {months.map((m) => {
          const isBest = bestIdx.includes(m.idx);
          return (
            <div key={m.idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text)" }}>{m.h.toFixed(1)}</span>
              <div style={{ width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center", height: 64 }}>
                <div style={{ width: 13, height: Math.max(5, (m.h / max) * 64), borderRadius: 4,
                  background: ratingColor(m.rating),
                  boxShadow: isBest ? "0 0 0 2px rgba(0,200,150,0.45)" : "none" }}></div>
              </div>
              <span style={{ fontSize: 9, fontWeight: isBest ? 700 : 500, color: isBest ? "#00C896" : "var(--muted)" }}>{m.m}</span>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 13, marginTop: 12, flexWrap: "wrap" }}>
        {[{ l: "Excelente", c: "#00C896" }, { l: "Boa", c: "#7DC832" }, { l: "Regular", c: "#F5A623" }, { l: "Fraca", c: "#E07A40" }].map((x) => (
          <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: x.c }}></span>
            <span style={{ fontSize: 10.5, color: "var(--muted)", fontWeight: 500 }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeasonCard({ s, best, userLevel }) {
  const isBest = s.key === best.key;
  const forMe = s.level === userLevel;
  return (
    <div className="gs-season-card" style={{ borderColor: isBest ? "rgba(0,200,150,0.5)" : "var(--border)",
      boxShadow: isBest ? "0 0 0 3px rgba(0,200,150,0.1)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>{s.icon}</span>
          <div>
            <div style={{ fontSize: 15.5, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.range}</div>
          </div>
        </div>
        {isBest && <span className="gs-season-best">Melhor época</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        <Stars rating={s.rating} />
        <span style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600 }}>{s.rating.toFixed(1)}</span>
      </div>
      <div className="gs-season-stats">
        <div><span className="gs-ss-k">Ondas</span><span className="gs-ss-v">{s.h.toFixed(1)}m</span></div>
        <div><span className="gs-ss-k">Água</span><span className="gs-ss-v">{s.wtMin}–{s.wtMax}°</span></div>
        <div><span className="gs-ss-k">Chuva</span><span className="gs-ss-v">{s.rain} d/mês</span></div>
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.45, marginTop: 10 }}>{s.vibe}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 11, flexWrap: "wrap" }}>
        <span className="gs-season-level">Ideal: {s.level}</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>🧥 {s.wetsuit}</span>
        {forMe && <span className="gs-season-foryou">★ Pro seu nível</span>}
      </div>
    </div>
  );
}

function SeasonScreen({ peak, onBack }) {
  const climate = window.buildClimate(peak);
  const userLevel = (window.PROFILE.prefs.find((p) => p.k === "Nível") || {}).v || "Intermediário";
  const best = climate.best;
  // melhor época pro nível do usuário
  const forLevel = climate.seasons.filter((s) => s.level === userLevel)
    .sort((a, b) => b.rating - a.rating)[0] || best;

  return (
    <div className="gs-screen">
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onBack}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>A melhor época</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{peak.name} · médias do ano</div>
        </div>
      </div>

      <div className="gs-create-body">
        {/* hero — melhor época */}
        <div className="gs-season-hero">
          <div className="gs-season-hero-eyebrow">Melhor época para você</div>
          <div className="gs-season-hero-main">
            <span className="gs-season-hero-ic">{best.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div className="gs-season-hero-title">{best.label}</div>
              <div className="gs-season-hero-meta">{best.range} · ~{best.h.toFixed(1)}m · água {best.wtMin}–{best.wtMax}°</div>
            </div>
            <div className="gs-season-hero-rating">
              <Stars rating={best.rating} size={14} />
              <span className="gs-season-hero-score">{best.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        <MonthBars months={climate.months} bestKey={best.key} />

        {/* recomendação pro nível */}
        <div className="gs-season-rec">
          <div style={{ fontSize: 12, fontWeight: 700, color: "#08A0F8", letterSpacing: 0.3, textTransform: "uppercase" }}>Para o seu nível · {userLevel}</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, marginTop: 7 }}>
            A melhor janela pra você é o <strong>{forLevel.label.toLowerCase()}</strong> ({forLevel.range}):
            ondas de ~{forLevel.h.toFixed(1)}m, água {forLevel.wtMin}–{forLevel.wtMax}° e {forLevel.rain} dias de chuva por mês.
          </div>
        </div>

        <div className="gs-blocktitle" style={{ margin: "2px 0 -4px" }}>Estações do ano</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {climate.seasons.map((s) => <SeasonCard key={s.key} s={s} best={best} userLevel={userLevel} />)}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SeasonScreen });
