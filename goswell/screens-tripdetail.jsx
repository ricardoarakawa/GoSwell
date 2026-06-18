// ===== Trip detail (read-only) =====

function _tripDuration(dates) {
  const mm = String(dates).match(/(\d+)\s*[–\-]\s*(\d+)/);
  if (mm) return Math.max(1, parseInt(mm[2], 10) - parseInt(mm[1], 10) + 1);
  return 1;
}
function _crewName(id) {
  if (id === "RL") return "Você";
  const f = (window.FRIENDS || []).find((x) => x.id === id);
  return f ? f.name : id;
}

function DetailRow({ k, v }) {
  return (
    <div className="gs-kvrow">
      <span style={{ color: "var(--muted)", fontSize: 13.5 }}>{k}</span>
      <span style={{ fontWeight: 600, fontSize: 13.5 }}>{v}</span>
    </div>
  );
}

function TripDetailScreen({ trip, onClose, onForecast, onEdit }) {
  const peak = window.PEAKS.find((p) => p.id === trip.peakId) || window.PEAKS[0];
  const c = window.cond(window.personalCondition(peak, window.SURF));
  const confirmed = trip.status === "confirmada";
  const guest = trip.role === "guest";
  const dur = _tripDuration(trip.dates);
  const cur = trip.budget && window.CURRENCIES.find((x) => x.code === trip.budget.currency);
  const items = (trip.budget && trip.budget.items) || [];
  const total = items.reduce((s, i) => s + (i.value || 0) * (i.qty || 1), 0);
  const crewCount = (trip.avatars || []).length;

  return (
    <>
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onClose}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{trip.name}</div>
            {guest && <span className="gs-guest-tag">Convidada</span>}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{trip.dates} · {dur} {dur === 1 ? "dia" : "dias"}</div>
        </div>
        <span style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
          color: confirmed ? "#00C896" : "#F5A623", background: window.tint(confirmed ? "#00C896" : "#F5A623", 0.14) }}>
          {confirmed ? "Confirmada" : "Planejando"}
        </span>
      </div>

      <div className="gs-create-body">
        {/* pico */}
        <div className="gs-field">
          <div className="gs-label">Pico</div>
          <div className="gs-pickpeak">
            <div style={{ width: 40, height: 40, borderRadius: 11, background: window.tint(c.color, 0.16),
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: c.color }}>{peak.height.toFixed(1)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700 }}>{peak.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{peak.type} · {peak.direction}</div>
            </div>
            <CondBadge condition={window.personalCondition(peak, window.SURF)} size="sm" />
          </div>
        </div>

        {trip.host &&
          <div className="gs-field">
            <div className="gs-label">Organizador</div>
            <div className="gs-pickpeak" style={{ gap: 11 }}>
              <Avatar initials={trip.host.id} size={34} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 14.5, fontWeight: 700 }}>{trip.host.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>te convidou para esta trip</div></div>
            </div>
          </div>
        }

        {trip.forecast &&
          <div className="gs-field">
            <div className="gs-label">Previsão</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 13px",
              background: "rgba(0,200,150,0.08)", borderRadius: 12 }}>
              <span style={{ fontSize: 14 }}>🌊</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#00C896" }}>{trip.forecast}</span>
            </div>
          </div>
        }

        {/* quem vai */}
        <div className="gs-field">
          <div className="gs-label">Quem vai <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {crewCount}</span></div>
          <div className="gs-crew">
            {(trip.avatars || []).map((a, i) => (
              <div key={i} className="gs-crewchip" style={{ cursor: "default" }}>
                <Avatar initials={a} size={24} />
                <span>{_crewName(a)}</span>
              </div>
            ))}
            {trip.pending && trip.pending.map((p, i) => (
              <div key={"p" + i} className="gs-crewchip" style={{ cursor: "default", opacity: 0.7 }}>
                <span>{p}</span><span className="gs-crewtick" style={{ color: "#F5A623" }}>⏳</span>
              </div>
            ))}
          </div>
        </div>

        {/* orçamento */}
        {items.length > 0 &&
          <div className="gs-field">
            <div className="gs-label">Orçamento <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {cur.code}</span></div>
            <div className="gs-card" style={{ padding: 12 }}>
              {items.map((it, i) => (
                <div key={i} className="gs-kvrow">
                  <span style={{ fontSize: 13.5 }}>{it.name} <span style={{ color: "var(--muted)" }}>×{it.qty || 1}</span></span>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{window._money((it.value || 0) * (it.qty || 1), cur.sym)}</span>
                </div>
              ))}
              <div className="gs-kvrow" style={{ borderTop: "1px solid var(--border)", marginTop: 2 }}>
                <span style={{ fontWeight: 700 }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 15 }}>{window._money(total, cur.sym)}</span>
              </div>
              <div className="gs-kvrow" style={{ borderBottom: "none" }}>
                <span style={{ color: "var(--muted)", fontSize: 12.5 }}>Por pessoa ({crewCount})</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{window._money(crewCount ? total / crewCount : total, cur.sym)}</span>
              </div>
            </div>
          </div>
        }

        {/* observações */}
        {trip.note &&
          <div className="gs-field">
            <div className="gs-label">Observações</div>
            <div style={{ fontSize: 13.5, color: "var(--text)", lineHeight: 1.5, background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px" }}>{trip.note}</div>
          </div>
        }
      </div>

      <div className="gs-create-footer">
        {!guest && <button className="gs-create-cancel" onClick={() => onEdit(trip)}>Editar</button>}
        <button className="gs-create-go" onClick={() => onForecast(trip.peakId)}>Ver previsão</button>
      </div>
    </>
  );
}

Object.assign(window, { TripDetailScreen });
