// ===== Create Surftrip screen =====

// month label from a "5 Jun" string
function _dayNum(dateStr) {return parseInt(dateStr, 10);}
function _month(dateStr) {return dateStr.replace(/^\d+\s*/, "");}

const GS_MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const GS_MONTH_IDX = { Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5, Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11 };
const GS_WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"];
const GS_YEAR = 2026;
function _strip(d) {return new Date(d.getFullYear(), d.getMonth(), d.getDate());}
function _addDays(d, n) {const x = new Date(d);x.setDate(x.getDate() + n);return x;}
function _diffDays(a, b) {return Math.round((_strip(b) - _strip(a)) / 86400000);}
function _sameDay(a, b) {return a && b && _diffDays(a, b) === 0;}
function _firstOfMonth(d) {return new Date(d.getFullYear(), d.getMonth(), 1);}
function _fDate(f) {return new Date(GS_YEAR, GS_MONTH_IDX[_month(f.date)] != null ? GS_MONTH_IDX[_month(f.date)] : 5, _dayNum(f.date));}
// "today" follows the forecast's first ("Hoje") day so the 15-day window is never wrongly disabled
const GS_TODAY = _fDate(window.FORECAST[0]);
function _condForDate(date) {return window.FORECAST.find((f) => _sameDay(_fDate(f), date));}
function _fmtRange(s, e) {
  const sd = s.getDate(),ed = e.getDate(),sm = GS_MONTHS[s.getMonth()],em = GS_MONTHS[e.getMonth()];
  return sm === em ? `${sd}–${ed} ${sm}` : `${sd} ${sm} – ${ed} ${em}`;
}

// Month calendar with range selection
function MonthCalendar({ month, start, end, onPick, onPrev, onNext, canPrev }) {
  const first = _firstOfMonth(month);
  const lead = first.getDay();
  const daysIn = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));

  return (
    <div className="gs-cal">
      <div className="gs-cal-head">
        <button className="gs-cal-nav" onClick={onPrev} disabled={!canPrev} style={{ opacity: canPrev ? 1 : 0.35 }}>‹</button>
        <span className="gs-cal-title">{GS_MONTHS[month.getMonth()]} {month.getFullYear()}</span>
        <button className="gs-cal-nav" onClick={onNext}>›</button>
      </div>
      <div className="gs-cal-grid">
        {GS_WEEKDAYS.map((w, i) => <div key={"w" + i} className="gs-cal-wd">{w}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={"b" + i}></div>;
          const past = _diffDays(GS_TODAY, d) < 0;
          const isStart = _sameDay(d, start);
          const isEnd = _sameDay(d, end);
          const inRange = _diffDays(start, d) > 0 && _diffDays(d, end) > 0;
          const cd = _condForDate(d);
          let cls = "gs-cal-cell";
          if (past) cls += " disabled";
          if (inRange) cls += " range";
          if (isStart || isEnd) cls += " edge" + (isStart ? " start" : "") + (isEnd ? " end" : "");
          return (
            <button key={"d" + i} className={cls} disabled={past} onClick={() => onPick(d)}>
              {d.getDate()}
              {cd && !isStart && !isEnd && <span className="gs-cal-dot" style={{ background: window.cond(cd.condition).color }}></span>}
            </button>);

        })}
      </div>
    </div>);

}

function CreateTripScreen({ peak, startDay, trip, onCancel, onCreate }) {
  const editing = !!trip;
  const forecast = window.FORECAST;

  // derive crew/name/note + a start Date and duration from an existing trip
  const parseTripStart = () => {
    const mm = String(trip.dates).match(/(\d+)\s*[–\-]\s*(\d+)\s*([A-Za-zçÇ]+)/);
    if (mm) {
      const s = parseInt(mm[1], 10),e = parseInt(mm[2], 10),mon = mm[3];
      const sd = new Date(GS_YEAR, GS_MONTH_IDX[mon] != null ? GS_MONTH_IDX[mon] : 5, s);
      return { sd, dur: Math.max(1, e - s + 1) };
    }
    return { sd: _fDate(forecast[0]), dur: 2 };
  };

  const initStart = editing ? parseTripStart().sd : startDay ? _fDate(startDay) : _fDate(forecast[0]);
  const initDur = editing ? parseTripStart().dur : 2;

  const [name, setName] = useState(editing ? trip.name : `${peak.name} Trip`);
  const [start, setStart] = useState(initStart);
  const [end, setEnd] = useState(_addDays(initStart, initDur - 1));
  const [picking, setPicking] = useState(null); // 'end' while choosing range end
  const [calMonth, setCalMonth] = useState(_firstOfMonth(initStart));
  const [showCal, setShowCal] = useState(false);
  const _initPhone = editing ? (trip.phoneInvites || []) : [];
  const _phoneInits = new Set(_initPhone.map((p) => p.initials));
  const [crew, setCrew] = useState(editing ? (trip.avatars || []).filter((a) => a !== "RL" && !_phoneInits.has(a)) : ["TF"]);
  const [phoneInvites, setPhoneInvites] = useState(_initPhone);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteMode, setInviteMode] = useState("number");
  const [phoneVal, setPhoneVal] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [note, setNote] = useState(editing ? trip.note || "" : "");
  const [showNote, setShowNote] = useState(editing && !!(trip.note && trip.note.trim()));
  const [budget, setBudget] = useState(editing && trip.budget ? trip.budget : { currency: "BRL", items: [] });
  const [showBudget, setShowBudget] = useState(false);
  const calWrapRef = useRef(null);

  // fechar o calendário ao clicar fora dele
  useEffect(() => {
    if (!showCal) return;
    const onDocDown = (e) => {
      if (calWrapRef.current && !calWrapRef.current.contains(e.target)) setShowCal(false);
    };
    document.addEventListener("pointerdown", onDocDown);
    return () => document.removeEventListener("pointerdown", onDocDown);
  }, [showCal]);

  const budgetTotal = budget.items.reduce((s, i) => s + (i.value || 0) * (i.qty || 1), 0);
  const budgetCur = window.CURRENCIES.find((x) => x.code === budget.currency) || window.CURRENCIES[0];

  const duration = _diffDays(start, end) + 1;
  const condDay = _condForDate(start);
  const c = condDay ? window.cond(condDay.condition) : window.cond(peak.condition);
  const datesLabel = _fmtRange(start, end);

  const curDur = () => _diffDays(start, end) + 1;
  const pickChip = (f) => {const ns = _fDate(f);setStart(ns);setEnd(_addDays(ns, curDur() - 1));setCalMonth(_firstOfMonth(ns));setPicking(null);};
  const setDur = (n) => setEnd(_addDays(start, n - 1));
  const calPick = (d) => {
    if (picking === "end" && _diffDays(start, d) >= 0) {setEnd(d);setPicking(null);} else
    {setStart(d);setEnd(d);setPicking("end");}
  };
  const canPrev = _diffDays(_firstOfMonth(GS_TODAY), calMonth) > 0;

  const toggleCrew = (id) => setCrew((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);

  // ---- convidar por celular (número manual ou contatos do aparelho) ----
  const _initials = (name, phone) => {
    const n = (name || "").trim();
    if (n) { const p = n.split(/\s+/); return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase(); }
    const d = (phone || "").replace(/\D/g, ""); return d.slice(-2) || "?";
  };
  const addPhoneInvite = (name, phone) => {
    const norm = (phone || "").replace(/\D/g, "");
    setPhoneInvites((cur) => {
      if (norm && cur.some((p) => p.phone.replace(/\D/g, "") === norm)) return cur;
      return [...cur, { id: "ph" + Date.now() + Math.random().toString(36).slice(2, 5),
        name: (name || "").trim(), phone: (phone || "").trim(), initials: _initials(name, phone) }];
    });
  };
  const removePhoneInvite = (id) => setPhoneInvites((cur) => cur.filter((p) => p.id !== id));
  const phoneDigits = phoneVal.replace(/\D/g, "");
  const canAddPhone = phoneDigits.length >= 10;
  const submitPhone = () => { if (!canAddPhone) return; addPhoneInvite("", phoneVal); setPhoneVal(""); };
  const contactList = (window.PHONE_CONTACTS || []).filter((cc) => {
    const q = contactSearch.trim().toLowerCase(); if (!q) return true;
    return cc.name.toLowerCase().includes(q) || cc.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
  });
  const crewCount = 1 + crew.length + phoneInvites.length;

  const submit = () => {
    const built = {
      name: name.trim() || `${peak.name} Trip`,
      dates: datesLabel,
      avatars: ["RL", ...crew, ...phoneInvites.map((p) => p.initials)],
      forecast: condDay ? `${condDay.day}: ${condDay.h.toFixed(1)}m ${window.cond(condDay.condition).label.toLowerCase()}` : null,
      peakId: peak.id,
      note: note.trim(),
      budget,
      phoneInvites
    };
    if (editing) onCreate({ ...trip, ...built });else
    onCreate({ id: "t" + Date.now(), status: "planejando", extra: 0, chat: [], ...built });
  };

  return (
    <div className="gs-screen">
      {showBudget ?
      <BudgetScreen tripName={name.trim() || `${peak.name} Trip`} crewCount={crewCount}
      initial={budget} onClose={() => setShowBudget(false)}
      onSave={(b) => {setBudget(b);setShowBudget(false);}} /> :

      <React.Fragment>
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onCancel}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{editing ? "Editar surftrip" : "Nova surftrip"}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{editing ? "Atualize os detalhes da viagem" : "Monte a viagem com a sua crew"}</div>
        </div>
      </div>

      <div className="gs-create-body">
        {/* pico */}
        <div className="gs-field">
          <div className="gs-label">Pico</div>
          <div className="gs-pickpeak">
            <div style={{ width: 40, height: 40, borderRadius: 11, background: window.tint(window.cond(peak.condition).color, 0.16),
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: window.cond(peak.condition).color }}>{peak.height.toFixed(1)}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15.5, fontWeight: 700 }}>{peak.name}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{peak.type} · {peak.direction}</div>
            </div>
            <CondBadge condition={peak.condition} size="sm" />
          </div>
        </div>

        {/* nome */}
        <div className="gs-field">
          <div className="gs-label">Nome da trip</div>
          <input className="gs-input" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Maresias com a crew" maxLength={40} />
        </div>

        {/* quando */}
        <div className="gs-field">
          <div className="gs-label">Quando</div>
          <div className="gs-daypick">
            {forecast.map((f, i) => {
                const fc = window.cond(f.condition);
                const active = _sameDay(_fDate(f), start);
                return (
                  <button key={i} onClick={() => pickChip(f)} className="gs-daypick-chip"
                  style={{ borderColor: active ? "#08A0F8" : "var(--border)", background: active ? "rgba(8,160,248,0.1)" : "transparent" }}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: f.day === "Hoje" ? "#00C896" : "var(--muted)" }}>{f.day}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{_dayNum(f.date)}</span>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: fc.color }}></span>
                </button>);

              })}
          </div>

          {/* compact range bar — calendar icon + chosen range + days */}
          <div className="gs-cal-wrap" ref={calWrapRef}>
          <button className={"gs-rangebar" + (showCal ? " open" : "")} onClick={() => setShowCal((v) => !v)}>
            <span className="gs-rangebar-ic">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3.5" y="5" width="17" height="16" rx="2.5" /><path d="M3.5 9.5h17M8 3v3M16 3v3" />
              </svg>
            </span>
            <span className="gs-rangebar-main">
              <span style={{ fontSize: 14, fontWeight: 700 }}>{datesLabel}</span>
              <span style={{ fontSize: 11.5, color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {duration} {duration === 1 ? "dia" : "dias"}
                {condDay && <><span style={{ width: 6, height: 6, borderRadius: 999, background: c.color }}></span><span style={{ color: c.color, fontWeight: 600 }}>{c.label}</span></>}
              </span>
            </span>
            <span className={"gs-rangebar-chev" + (showCal ? " open" : "")}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </button>

          {showCal &&
            <div style={{ marginTop: 8 }}>
              <div className="gs-dur-quick">
                {[1, 2, 3, 5, 7].map((n) =>
                <button key={n} onClick={() => setDur(n)} className={"gs-dur-chip" + (duration === n ? " active" : "")}>{n}d</button>
                )}
              </div>
              <MonthCalendar month={calMonth} start={start} end={end} onPick={calPick}
              onPrev={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              onNext={() => setCalMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              canPrev={canPrev} />
            </div>
            }
          </div>
        </div>

        {/* orçamento */}
        <div className="gs-field">
          {budget.items.length > 0 && (
            <div className="gs-label">Orçamento da viagem</div>
          )}
          <button className="gs-budget-row" onClick={() => setShowBudget(true)}>
            <span className="gs-budget-ic">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="6" width="19" height="13" rx="2.5"/><path d="M2.5 10h19M6 15h3"/>
              </svg>
            </span>
            <span className="gs-budget-main">
              <span style={{ fontSize: 14.5, fontWeight: 700 }}>
                {budget.items.length ? window._money(budgetTotal, budgetCur.sym) : "Adicionar orçamento"}
              </span>
              <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
                {budget.items.length ? `${budget.items.length} ${budget.items.length === 1 ? "item" : "itens"} · ${budgetCur.code}` : "Combustível, hospedagem, comida…"}
              </span>
            </span>
            <span className="gs-rangebar-chev">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
            </span>
          </button>
        </div>

        {/* quem vai */}
        <div className="gs-field">
          <div className="gs-label">Quem vai <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {crewCount}</span></div>
          <div className="gs-crew">
            <div className="gs-crewchip gs-crewme">
              <span>Você</span>
            </div>
            {window.FRIENDS.map((f) => {
                const on = crew.includes(f.id);
                return (
                  <button key={f.id} onClick={() => toggleCrew(f.id)}
                  className={"gs-crewchip" + (on ? " on" : "")}>
                  <span>{f.name}</span>
                  <span className="gs-crewtick">{on ? "✓" : "+"}</span>
                </button>);

              })}
            {phoneInvites.map((p) =>
            <div key={p.id} className="gs-crewchip on gs-crewphone">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></svg>
              <span>{p.name || p.phone}</span>
              <button className="gs-crewphone-x" onClick={() => removePhoneInvite(p.id)} aria-label="Remover">✕</button>
            </div>
            )}
            <button className={"gs-crew-add" + (inviteOpen ? " open" : "")} onClick={() => setInviteOpen((v) => !v)} aria-expanded={inviteOpen}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2.5" width="11" height="19" rx="2.5" /><path d="M8.5 18.5h4" /><path d="M20 5.5v5M22.5 8h-5" /></svg>
              <span>Convidar por celular</span>
              {inviteOpen && <span className="gs-crew-add-x" aria-hidden="true">✕</span>}
            </button>
          </div>

          {inviteOpen &&
          <div className="gs-invite-panel">
            <div className="gs-seg" style={{ marginBottom: 12 }}>
              <button className={"gs-seg-btn" + (inviteMode === "number" ? " active" : "")} onClick={() => setInviteMode("number")}>Digitar número</button>
              <button className={"gs-seg-btn" + (inviteMode === "contacts" ? " active" : "")} onClick={() => setInviteMode("contacts")}>Meus contatos</button>
            </div>
            {inviteMode === "number" ?
            <React.Fragment>
              <div className="gs-phone-add">
                <div className="gs-phone-input">
                  <span>+55</span>
                  <input value={phoneVal} inputMode="tel" placeholder="(11) 99999-9999"
                    onChange={(e) => setPhoneVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") submitPhone(); }} />
                </div>
                <button className="gs-phone-go" disabled={!canAddPhone} onClick={submitPhone}>Adicionar</button>
              </div>
              <div className="gs-invite-hint">Enviaremos o convite da trip por WhatsApp para esse número.</div>
            </React.Fragment> :
            <div>
              <div className="gs-contacts-search">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--muted)" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" /></svg>
                <input value={contactSearch} placeholder="Buscar nos contatos…" onChange={(e) => setContactSearch(e.target.value)} />
              </div>
              <div className="gs-contacts-list gs-miniscroll">
                {contactList.length === 0 ?
                <div className="gs-contacts-empty">Nenhum contato encontrado</div> :
                contactList.map((cc) => {
                    const added = phoneInvites.some((p) => p.phone.replace(/\D/g, "") === cc.phone.replace(/\D/g, ""));
                    return (
                      <button key={cc.phone} className="gs-contact-row" disabled={added}
                        onClick={() => addPhoneInvite(cc.name, cc.phone)}>
                        <Avatar initials={_initials(cc.name)} size={32} />
                        <span className="gs-contact-info">
                          <span className="gs-contact-name">{cc.name}</span>
                          <span className="gs-contact-phone">{cc.phone}</span>
                        </span>
                        <span className="gs-contact-act">{added ? "✓" : "+"}</span>
                      </button>);

                  })}
              </div>
            </div>}
          </div>}
        </div>

        {/* observações */}
        <div className="gs-field">
          {showNote ? (
            <textarea className="gs-textarea" rows={3} value={note} autoFocus onChange={(e) => setNote(e.target.value)}
              onBlur={() => { if (!note.trim()) setShowNote(false); }}
              placeholder="Combine carona, prancha extra, horário de saída…"></textarea>
          ) : (
            <button className="gs-note-add" onClick={() => setShowNote(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Adicionar observação
            </button>
          )}
        </div>
      </div>

      {/* footer */}
      <div className="gs-create-footer">
        <button className="gs-create-cancel" onClick={onCancel}>Cancelar</button>
        <button className="gs-create-go" onClick={submit} style={{ backgroundSize: "contain" }}>{editing ? "Salvar alterações" : "Criar surftrip"}</button>
      </div>
      </React.Fragment>
      }
    </div>);

}

Object.assign(window, { CreateTripScreen });