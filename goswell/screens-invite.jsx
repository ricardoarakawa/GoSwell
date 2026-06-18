// ===== Invite friends screen (send via WhatsApp / e-mail) =====

function InviteScreen({ trip, onClose, onSend }) {
  const [picked, setPicked] = useState([]);
  const [channel, setChannel] = useState("whatsapp");
  const [custom, setCustom] = useState("");
  const [phonePicked, setPhonePicked] = useState([]);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState("");

  const toggle = (id) => setPicked((cur) => cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  const _initials = (name) => { const n = (name || "").trim(); if (!n) return "?"; const p = n.split(/\s+/); return (p[0][0] + (p[1] ? p[1][0] : "")).toUpperCase(); };
  const togglePhone = (c) => setPhonePicked((cur) => {
    const k = c.phone.replace(/\D/g, "");
    return cur.some((p) => p.phone.replace(/\D/g, "") === k) ? cur.filter((p) => p.phone.replace(/\D/g, "") !== k) : [...cur, { name: c.name, phone: c.phone }];
  });
  const contactList = (window.PHONE_CONTACTS || []).filter((cc) => {
    const q = contactSearch.trim().toLowerCase(); if (!q) return true;
    return cc.name.toLowerCase().includes(q) || cc.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
  });

  const msg = `🤙 Bora pra ${trip.name}? Surftrip ${trip.dates}` +
    (trip.forecast ? ` — previsão: ${trip.forecast}.` : ".") +
    ` Marquei pelo GoSwell, bora fechar a crew!`;

  const contacts = [
    ...window.FRIENDS.filter((f) => picked.includes(f.id)).map((f) => ({ id: f.id, label: f.name })),
    ...phonePicked.map((c) => ({ id: "ph-" + c.phone, label: c.name || c.phone })),
    ...(custom.trim() ? [{ id: "custom", label: custom.trim() }] : []),
  ];
  const canSend = contacts.length > 0;

  const doSend = () => {
    try {
      if (channel === "whatsapp") {
        window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
      } else {
        window.open("mailto:?subject=" + encodeURIComponent("Convite: " + trip.name) + "&body=" + encodeURIComponent(msg), "_blank");
      }
    } catch (e) { /* prototype: ignore popup block */ }
    onSend(trip, contacts);
  };

  return (
    <>
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Convidar amigos</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{trip.name} · {trip.dates}</div>
        </div>
      </div>

      <div className="gs-create-body">
        {/* canal */}
        <div className="gs-field">
          <div className="gs-label">Enviar por</div>
          <div className="gs-channel-row">
            <button className={"gs-channel" + (channel === "whatsapp" ? " on wa" : "")} onClick={() => setChannel("whatsapp")}>
              <span style={{ fontSize: 18 }}>💬</span> WhatsApp
            </button>
            <button className={"gs-channel" + (channel === "email" ? " on mail" : "")} onClick={() => setChannel("email")}>
              <span style={{ fontSize: 18 }}>✉️</span> E-mail
            </button>
          </div>
        </div>

        {/* amigos */}
        <div className="gs-field">
          <div className="gs-label">Da sua crew <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {picked.length} selecionados</span></div>
          <div className="gs-crew">
            {window.FRIENDS.map((f) => (
              <button key={f.id} onClick={() => toggle(f.id)} className={"gs-crewchip" + (picked.includes(f.id) ? " on" : "")}>
                <Avatar initials={f.id} size={24} />
                <span>{f.name}</span>
                <span className="gs-crewtick">{picked.includes(f.id) ? "✓" : "+"}</span>
              </button>
            ))}
          </div>
        </div>

        {/* contatos do celular */}
        <div className="gs-field">
          <div className="gs-label">Dos seus contatos <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {phonePicked.length} selecionados</span></div>
          <div className="gs-crew">
            {phonePicked.map((c) =>
            <div key={c.phone} className="gs-crewchip on gs-crewphone">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M10.5 18.5h3" /></svg>
              <span>{c.name || c.phone}</span>
              <button className="gs-crewphone-x" onClick={() => togglePhone(c)} aria-label="Remover">✕</button>
            </div>
            )}
            <button className={"gs-crew-add" + (contactsOpen ? " open" : "")} onClick={() => setContactsOpen((v) => !v)} aria-expanded={contactsOpen}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2.5" width="11" height="19" rx="2.5" /><path d="M8.5 18.5h4" /><path d="M20 5.5v5M22.5 8h-5" /></svg>
              <span>Buscar nos contatos</span>
              {contactsOpen && <span className="gs-crew-add-x" aria-hidden="true">✕</span>}
            </button>
          </div>
          {contactsOpen &&
          <div className="gs-invite-panel">
            <div className="gs-contacts-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="var(--muted)" strokeWidth="2" /><path d="M20 20l-3.5-3.5" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" /></svg>
              <input value={contactSearch} placeholder="Buscar nos contatos…" onChange={(e) => setContactSearch(e.target.value)} />
            </div>
            <div className="gs-contacts-list gs-miniscroll">
              {contactList.length === 0 ?
              <div className="gs-contacts-empty">Nenhum contato encontrado</div> :
              contactList.map((cc) => {
                  const on = phonePicked.some((p) => p.phone.replace(/\D/g, "") === cc.phone.replace(/\D/g, ""));
                  return (
                    <button key={cc.phone} className="gs-contact-row" onClick={() => togglePhone(cc)}>
                      <Avatar initials={_initials(cc.name)} size={32} />
                      <span className="gs-contact-info">
                        <span className="gs-contact-name">{cc.name}</span>
                        <span className="gs-contact-phone">{cc.phone}</span>
                      </span>
                      <span className="gs-contact-act">{on ? "✓" : "+"}</span>
                    </button>);

                })}
            </div>
          </div>}
        </div>

        {/* contato avulso */}
        <div className="gs-field">
          <div className="gs-label">Outro contato <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {channel === "whatsapp" ? "telefone ou nome" : "e-mail ou nome"}</span></div>
          <input className="gs-input" value={custom} onChange={(e) => setCustom(e.target.value)}
            placeholder={channel === "whatsapp" ? "Ex.: +55 11 9 9999-9999" : "Ex.: amigo@email.com"} />
        </div>

        {/* preview */}
        <div className="gs-field">
          <div className="gs-label">Mensagem</div>
          <div className="gs-msg-preview">{msg}</div>
        </div>
      </div>

      <div className="gs-create-footer">
        <button className="gs-create-cancel" onClick={onClose}>Cancelar</button>
        <button className="gs-create-go" onClick={doSend} disabled={!canSend} style={{ opacity: canSend ? 1 : 0.5 }}>
          {channel === "whatsapp" ? "Enviar pelo WhatsApp" : "Enviar por e-mail"}
        </button>
      </div>
    </>
  );
}

Object.assign(window, { InviteScreen });
