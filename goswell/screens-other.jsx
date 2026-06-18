// ===== Businesses, Trips, Produtos, Perfil =====

function BusinessCard({ b }) {
  return (
    <div className="gs-card gs-pad" style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
      <div className="gs-bizicon">{b.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div style={{ fontSize: 15.5, fontWeight: 700 }}>{b.name}</div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 999,
            color: b.open ? "#00C896" : "#E04040", background: window.tint(b.open ? "#00C896" : "#E04040", 0.13), whiteSpace: "nowrap" }}>
            {b.open ? "Aberto" : "Fechado"}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 3, display: "flex", gap: 9, alignItems: "center" }}>
          <span>{b.cat}</span>
          <span>· {b.dist}</span>
          <span style={{ color: "#F5A623", whiteSpace: "nowrap" }}>★ {b.rating}</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 11 }}>
          <Btn variant="ghost" size="sm" onClick={() => {}}>Ver fotos</Btn>
          <Btn variant="whats" size="sm" onClick={() => {}}>WhatsApp</Btn>
        </div>
      </div>
    </div>);

}

function BusinessesScreen({ peak, onBack }) {
  return (
    <div className="gs-screen">
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onBack}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Estabelecimentos</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Próximos a {peak.name}</div>
        </div>
      </div>
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {window.BUSINESSES.map((b) => <BusinessCard key={b.id} b={b} />)}
      </div>
    </div>);

}

// ---------- Trips ----------
// Incoming invite card — "Surftrip convidada"
function InviteCard({ inv, onAccept, onDecline, onForecast }) {
  const viaLabel = inv.via === "email" ? "por e-mail" : "pelo WhatsApp";
  return (
    <div className="gs-card gs-pad gs-invite-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{inv.name}</div>
            <span className="gs-invite-tag">✉️ Convite</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
            {inv.dates} · de <strong style={{ color: "var(--text)" }}>{inv.host.name}</strong> {viaLabel}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          {inv.avatars.map((a, i) =>
          <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}><Avatar initials={a} size={28} ring /></div>
          )}
        </div>
      </div>

      {inv.note && <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 9, lineHeight: 1.4 }}>“{inv.note}”</div>}

      {inv.forecast &&
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11, padding: "9px 12px",
        background: "rgba(0,200,150,0.08)", borderRadius: 10 }}>
          <span style={{ fontSize: 13 }}>🌊</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#00C896" }}>{inv.forecast}</span>
        </div>
      }

      <div style={{ display: "flex", gap: 9, marginTop: 13 }}>
        <Btn variant="neg" full onClick={() => onDecline(inv)}>Recusar</Btn>
        <Btn variant="green" full onClick={() => onAccept(inv)}>Aceitar convite</Btn>
      </div>
    </div>);

}

function TripCard({ trip, onForecast, onEdit, onInvite, onOpen, isNew }) {
  const confirmed = trip.status === "confirmada";
  const guest = trip.role === "guest";
  return (
    <div className={"gs-card gs-pad gs-trip-clickable" + (isNew ? " gs-trip-new" : "")}
    onClick={() => onOpen && onOpen(trip)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{trip.name}</div>
            {isNew && <span style={{ fontSize: 10.5, fontWeight: 800, color: "#08A0F8", background: "rgba(8,160,248,0.15)", padding: "2px 7px", borderRadius: 999, letterSpacing: 0.3 }}>NOVA</span>}
            {guest && <span className="gs-guest-tag">Convidada</span>}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>
            {trip.dates}{guest && trip.host ? ` · de ${trip.host.name}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11.5, fontWeight: 600, padding: "4px 10px", borderRadius: 999,
            color: confirmed ? "#00C896" : "#F5A623", background: window.tint(confirmed ? "#00C896" : "#F5A623", 0.14) }}>
            {confirmed ? "Confirmada" : "Planejando"}
          </span>
          {!guest &&
          <button className="gs-trip-edit" onClick={(e) => {e.stopPropagation();onEdit && onEdit(trip);}} aria-label="Editar trip" title="Editar">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <path d="M13.5 6.5l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          }
        </div>
      </div>

      {trip.note &&
      <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 9, lineHeight: 1.4 }}>“{trip.note}”</div>
      }

      {/* avatars */}
      <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
        {trip.avatars.map((a, i) =>
        <div key={i} style={{ marginLeft: i === 0 ? 0 : -8 }}><Avatar initials={a} size={30} ring /></div>
        )}
        {trip.extra > 0 &&
        <div style={{ marginLeft: -8, width: 30, height: 30, borderRadius: 999, background: "#1A2238",
          border: "2px solid var(--bg)", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: "var(--muted)" }}>+{trip.extra}</div>
        }
      </div>

      {trip.pending && trip.pending.length > 0 &&
      <div className="gs-pending-row">⏳ Convites pendentes: {trip.pending.join(", ")}</div>
      }

      {trip.forecast &&
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, padding: "9px 12px",
        background: "rgba(0,200,150,0.08)", borderRadius: 10 }}>
          <span style={{ fontSize: 13 }}>🌊</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#00C896" }}>{trip.forecast}</span>
        </div>
      }

      {trip.budget && trip.budget.items && trip.budget.items.length > 0 && (() => {
        const curr = window.CURRENCIES.find((x) => x.code === trip.budget.currency) || window.CURRENCIES[0];
        const tot = trip.budget.items.reduce((s, i) => s + (i.value || 0) * (i.qty || 1), 0);
        return (
          <div className="gs-trip-budget">
            💰 Orçamento: {window._money(tot, curr.sym)} · {trip.budget.items.length} {trip.budget.items.length === 1 ? "item" : "itens"}
          </div>);

      })()}

      <div style={{ display: "flex", gap: 9, marginTop: 13 }} onClick={(e) => e.stopPropagation()}>
        {guest ?
        <>
            <Btn variant="whats" full onClick={() => {}}>💬 Grupo</Btn>
            <Btn variant="blue" full onClick={() => onForecast(trip.peakId)}>Ver previsão →</Btn>
          </> :

        <>
            <Btn variant="ghost" full onClick={() => onInvite && onInvite(trip)}>＋ Convidar</Btn>
            <Btn variant="blue" full onClick={() => onForecast(trip.peakId)}>Previsão →</Btn>
          </>
        }
      </div>
    </div>);

}

function TripsScreen({ trips, invites, newTripId, onGoMap, onNewTrip, onEdit, onInvite, onOpen, onAccept, onDecline, onForecast }) {
  const list = trips || window.TRIPS;
  const inv = invites || [];
  return (
    <div className="gs-screen">
      <div className="gs-page-header">
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>Minhas SurfTrips</div>
        <button className="gs-newtrip" onClick={onNewTrip || onGoMap} style={{ backgroundColor: "rgba(8, 160, 248, 0.098)", borderWidth: "1px", borderStyle: "solid", borderColor: "rgb(8, 160, 248)", color: "rgb(8, 160, 248)" }}>+ Nova trip</button>
      </div>
      <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 13 }}>
        {inv.length > 0 &&
        <div className="gs-invite-section">Convites recebidos · {inv.length}</div>
        }
        {inv.map((i) => <InviteCard key={i.id} inv={i} onAccept={onAccept} onDecline={onDecline} onForecast={onForecast} />)}

        {inv.length > 0 && <div className="gs-invite-section" style={{ marginTop: 4 }}>Suas trips</div>}

        {list.map((t) => <TripCard key={t.id} trip={t} isNew={t.id === newTripId} onEdit={onEdit} onInvite={onInvite} onOpen={onOpen} onForecast={onForecast} />)}

        <button className="gs-cta-card" onClick={onNewTrip || onGoMap}>
          <div>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "rgb(8, 160, 248)" }}>Criar nova surftrip</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 2 }}>Escolha pico, datas e convide a crew</div>
          </div>
          <span style={{ fontSize: 18, color: "#08A0F8" }}>→</span>
        </button>
      </div>
    </div>);

}

// ---------- Produtos ----------
function ProdutosScreen() {
  return (
    <div className="gs-screen" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 56, marginBottom: 18 }}>🛍️</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Em breve</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 10, maxWidth: 280, lineHeight: 1.5 }}>
          Pranchas, wetsuits e equipamentos dos melhores parceiros GoSwell.
        </div>
      </div>
    </div>);

}

// ---------- Perfil ----------
function SettingsCard({ title, children }) {
  return (
    <div className="gs-card gs-pad">
      <div className="gs-blocktitle">{title}</div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
    </div>);

}

function PerfilScreen({ profile, onEdit }) {
  const p = profile || window.PROFILE;
  const acc = p.account || {};
  const perso = p.surf && p.surf.personalize;
  return (
    <div className="gs-screen">
      <div className="gs-profile-hero" style={typeof acc.heroBg === "string" && acc.heroBg.indexOf("data:") === 0 ?
      { backgroundImage: `linear-gradient(180deg,rgba(8,12,24,0.12),rgba(8,12,24,0.58)), url(${acc.heroBg})`, backgroundSize: "cover", backgroundPosition: "center" } :
      { background: window.heroBgCss(acc.heroBg) }}>
        <div className="gs-profile-av">{typeof acc.avatar === "string" && acc.avatar.indexOf("data:") === 0 ? <img src={acc.avatar} alt="" className="gs-avatar-img" /> : <AvatarGlyph id={acc.avatar} size={78} />}</div>
        <div style={{ fontSize: 21, fontWeight: 700, marginTop: 12 }}>{acc.displayName || p.name}</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 3 }}>{p.subtitle}</div>
        <button className="gs-edit-profile" onClick={onEdit}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
            <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" /><path d="M13.5 6.5l4 4" strokeLinecap="round" />
          </svg>
          Editar perfil
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, justifyContent: "center", marginTop: 14 }}>
          {p.tags.map((t) => <span key={t} className="gs-chip">{t}</span>)}
        </div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 13, marginTop: -22 }}>
        {/* personalization status */}
        <div className="gs-perso-card">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>🎯</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700 }}>Condições personalizadas</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                {perso ? "As condições dos picos se adaptam ao seu nível e preferências." : "Mostrando condições gerais (sem personalização)."}
              </div>
            </div>
            <span className={"gs-perso-pill" + (perso ? " on" : "")}>{perso ? "Ativo" : "Inativo"}</span>
          </div>
        </div>

        <SettingsCard title="Conta">
          <div className="gs-kvrow"><span style={{ color: "var(--muted)", fontSize: 13.5 }}>Nome de exibição</span><span style={{ fontWeight: 600, fontSize: 13.5 }}>{acc.displayName || p.name}</span></div>
          <div className="gs-kvrow"><span style={{ color: "var(--muted)", fontSize: 13.5 }}>E-mail</span><span style={{ fontWeight: 600, fontSize: 13.5 }}>{acc.email}</span></div>
          <div className="gs-kvrow"><span style={{ color: "var(--muted)", fontSize: 13.5 }}>Senha</span><span style={{ fontWeight: 600, fontSize: 13.5, color: acc.hasPassword ? "#00C896" : "#F5A623" }}>{acc.hasPassword ? "Definida" : "Não definida"}</span></div>
          <div className="gs-kvrow"><span style={{ color: "var(--muted)", fontSize: 13.5 }}>Google</span><span style={{ fontWeight: 600, fontSize: 13.5, color: acc.google ? "#00C896" : "var(--muted)" }}>{acc.google ? "Conectado" : "Não conectado"}</span></div>
        </SettingsCard>

        <SettingsCard title="Preferências de surf">
          {p.prefs.map((row, i) =>
          <div key={i} className="gs-kvrow">
              <span style={{ color: "var(--muted)", fontSize: 13.5 }}>{row.k}</span>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{row.v}</span>
            </div>
          )}
        </SettingsCard>

        <SettingsCard title="Praias favoritas">
          {p.favorites.map((f, i) =>
          <div key={i} className="gs-kvrow">
              <span style={{ fontSize: 14, fontWeight: 600 }}><span style={{ color: "#F5A623" }}>★</span> {f.name}</span>
              {f.tag && <span style={{ fontSize: 11.5, fontWeight: 600, color: "#08A0F8", background: "rgba(8,160,248,0.13)", padding: "3px 9px", borderRadius: 999 }}>{f.tag}</span>}
            </div>
          )}
        </SettingsCard>

        <div className="gs-plan-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, letterSpacing: 0.4 }}>SEU PLANO</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginTop: 3 }}>GoSwell Free</div>
            </div>
            <span style={{ fontSize: 26 }}>🏄‍♂️</span>
          </div>
          <button className="gs-upgrade">Upgrade para Pro — R$19,90/mês</button>
        </div>
      </div>
    </div>);

}

Object.assign(window, { BusinessesScreen, TripsScreen, ProdutosScreen, PerfilScreen, InviteCard, TripCard });