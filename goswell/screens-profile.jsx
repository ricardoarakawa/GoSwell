// ===== Profile edit screen =====

function SegRow({ options, value, onChange }) {
  return (
    <div className="gs-seg">
      {options.map((o) =>
      <button key={o} onClick={() => onChange(o)} className={"gs-seg-btn" + (value === o ? " active" : "")}>{o}</button>
      )}
    </div>);

}

function ProfileEditScreen({ profile, theme, onThemeChange, onClose, onSave }) {
  const acc = profile.account || {};
  const surf = profile.surf || {};
  const [avatar, setAvatar] = useState(acc.avatar || "🤙");
  const [name, setName] = useState(acc.displayName || profile.name);
  const [email, setEmail] = useState(acc.email || "");
  const [google, setGoogle] = useState(!!acc.google);
  const [uploadOpen, setUploadOpen] = useState(false);
  // password (managed in a bottom sheet)
  const [hasPw, setHasPw] = useState(!!acc.hasPassword);
  const [pwSheet, setPwSheet] = useState(false);
  // surf prefs
  const [level, setLevel] = useState(surf.level || "Intermediário");
  const [board, setBoard] = useState(surf.board || "Shortboard 6'2\"");
  const [idealMin, setIdealMin] = useState(surf.idealMin || 1.5);
  const [idealMax, setIdealMax] = useState(surf.idealMax || 2.5);
  const [formation, setFormation] = useState(surf.formation || "Tubular");
  const [favPeak, setFavPeak] = useState(surf.favPeak || "maresias");
  const [peakSheet, setPeakSheet] = useState(false);
  const [personalize, setPersonalize] = useState(surf.personalize !== false);
  const [avatarSheet, setAvatarSheet] = useState(false);
  const [heroBg, setHeroBg] = useState(acc.heroBg || "ocean");
  const [bgSheet, setBgSheet] = useState(false);
  const [bgUploadOpen, setBgUploadOpen] = useState(false);

  const stepMin = (delta) => setIdealMin((v) => Math.max(0.5, Math.min(idealMax - 0.5, Math.round((v + delta) * 10) / 10)));
  const stepMax = (delta) => setIdealMax((v) => Math.max(idealMin + 0.5, Math.min(4, Math.round((v + delta) * 10) / 10)));

  const favValid = !!favPeak;
  const isImg = (v) => typeof v === "string" && v.indexOf("data:") === 0;
  const favPeakObj = window.PEAKS.find((p) => p.id === favPeak);
  const surfCtx = { ...surf, personalize, level, idealMin, idealMax, formation };

  const save = () => {
    const newSurf = { ...surf, personalize, level, board, idealMin, idealMax, formation, favPeak };
    const hasPassword = hasPw;
    const favName = (window.PEAKS.find((p) => p.id === favPeak) || {}).name || "";
    const prefs = [
    { k: "Nível", v: level },
    { k: "Prancha", v: board },
    { k: "Ondas ideais", v: `${idealMin.toFixed(1)}m – ${idealMax.toFixed(1)}m` },
    { k: "Formação", v: formation },
    { k: "Período mínimo", v: (surf.minPeriod || 10) + "s" },
    { k: "Pico preferido", v: favName }];

    // keep the preferred peak marked "Principal" in the favorites list
    const favorites = [{ name: favName, tag: "Principal" },
    ...(profile.favorites || []).filter((f) => f.name !== favName).map((f) => ({ name: f.name, tag: null }))];
    onSave({
      ...profile,
      name, subtitle: `${level} · ${board}`,
      account: { ...acc, displayName: name, email, avatar, heroBg, hasPassword, google },
      surf: newSurf, prefs, favorites
    });
  };

  // ---- avatar upload sub-screen ----
  if (uploadOpen) {
    return <AvatarUpload current={avatar} onCancel={() => setUploadOpen(false)}
    onPick={(dataUrl) => {setAvatar(dataUrl);setUploadOpen(false);}} />;
  }

  // ---- background image upload sub-screen ----
  if (bgUploadOpen) {
    return <AvatarUpload current={isImg(heroBg) ? heroBg : null} title="Imagem de fundo" subtitle="Use uma foto da sua galeria"
    rectangular onCancel={() => setBgUploadOpen(false)}
    onPick={(dataUrl) => {setHeroBg(dataUrl);setBgUploadOpen(false);}} />;
  }

  return (
    <>
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Editar perfil</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Conta, avatar e preferências de surf</div>
        </div>
      </div>

      <div className="gs-create-body">
        {/* avatar — centralizado, estilo rede social, sobre o background escolhido */}
        <div className="gs-avatar-hero" style={isImg(heroBg)
          ? { backgroundImage: `linear-gradient(180deg,rgba(8,12,24,0.12),rgba(8,12,24,0.5)), url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: window.heroBgCss(heroBg) }}>
          <div className="gs-avatar-xl">{isImg(avatar) ? <img src={avatar} alt="avatar" className="gs-avatar-img" /> : <AvatarGlyph id={avatar} size={92} />}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="gs-avatar-edit" onClick={() => setAvatarSheet(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z" /><path d="M13.5 6.5l4 4" strokeLinecap="round" /></svg>
              Alterar foto
            </button>
            <button className="gs-avatar-edit gs-bg-edit" onClick={() => setBgSheet(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" stroke="none" /><path d="M21 16l-5-5L5 20" strokeLinecap="round" /></svg>
              Alterar fundo
            </button>
          </div>
        </div>

        {/* aparência — claro / escuro */}
        <div className="gs-field">
          <div className="gs-label">Aparência</div>
          <div className="gs-theme-seg">
            <button className={"gs-theme-opt" + (theme === "light" ? " on" : "")} onClick={() => onThemeChange && onThemeChange("light")}>
              <span className="gs-theme-ic" style={{ background: "#FFFFFF", border: "1px solid rgba(18,38,68,0.15)", color: "#F5A623" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" /></svg>
              </span>
              Claro
            </button>
            <button className={"gs-theme-opt" + (theme === "dark" ? " on" : "")} onClick={() => onThemeChange && onThemeChange("dark")}>
              <span className="gs-theme-ic" style={{ background: "#0A0F1E", color: "#08A0F8" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.3 6.3 0 0 0 10.5 10.5z" /></svg>
              </span>
              Escuro
            </button>
          </div>
        </div>

        {/* nome */}
        <div className="gs-field">
          <div className="gs-label">Nome de exibição</div>
          <input className="gs-input" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} />
        </div>

        {/* email */}
        <div className="gs-field">
          <div className="gs-label">E-mail</div>
          <input className="gs-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* senha */}
        <div className="gs-field">
          <div className="gs-label">{hasPw ? "Senha" : "Criar senha"}</div>
          <button className="gs-note-add" onClick={() => setPwSheet(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            {hasPw ? "Alterar senha" : "Criar senha"}
            {hasPw && <span style={{ marginLeft: "auto", color: "#00C896", fontSize: 12.5, fontWeight: 700 }}>✓ Definida</span>}
          </button>
        </div>

        {/* google */}
        <div className="gs-field">
          <div className="gs-label">Cadastro / login social</div>
          <button className={"gs-google-btn" + (google ? " on" : "")} onClick={() => setGoogle((v) => !v)}>
            <span className="gs-google-g">G</span>
            <span style={{ flex: 1, textAlign: "left" }}>{google ? "Conta Google conectada" : "Conectar com Google"}</span>
            <span style={{ color: google ? "#00C896" : "var(--muted)", fontWeight: 700, fontSize: 12.5 }}>{google ? "✓" : "Conectar"}</span>
          </button>
        </div>

        <div className="gs-edit-divider">Preferências de surf <span>· personalizam as condições</span></div>

        {/* personalize toggle */}
        <button className="gs-toggle-row" onClick={() => setPersonalize((v) => !v)}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Condições personalizadas</div>
            <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>Adaptar picos ao seu nível e preferências</div>
          </div>
          <span className={"gs-switch" + (personalize ? " on" : "")}><span className="gs-switch-knob"></span></span>
        </button>

        <div className="gs-field">
          <div className="gs-label">Nível</div>
          <SegRow options={["Iniciante", "Intermediário", "Avançado"]} value={level} onChange={setLevel} />
        </div>

        <div className="gs-field">
          <div className="gs-label">Quiver</div>
          <input className="gs-input" value={board} onChange={(e) => setBoard(e.target.value)} />
        </div>

        <div className="gs-field">
          <div className="gs-label">Tamanho ideal das ondas</div>
          <div className="gs-range-steppers">
            <div className="gs-stepper">
              <span className="gs-stepper-lbl">Mín</span>
              <button onClick={() => stepMin(-0.1)}>−</button>
              <span className="gs-stepper-v">{idealMin.toFixed(1)}m</span>
              <button onClick={() => stepMin(0.1)}>＋</button>
            </div>
            <div className="gs-stepper">
              <span className="gs-stepper-lbl">Máx</span>
              <button onClick={() => stepMax(-0.1)}>−</button>
              <span className="gs-stepper-v">{idealMax.toFixed(1)}m</span>
              <button onClick={() => stepMax(0.1)}>＋</button>
            </div>
          </div>
        </div>

        <div className="gs-field">
          <div className="gs-label">Formação preferida</div>
          <SegRow options={["Cheia", "Tubular"]} value={formation} onChange={setFormation} />
        </div>

        <div className="gs-field">
          <div className="gs-label">Pico preferido <span style={{ color: "var(--muted)", fontWeight: 500 }}>· favorito + centro do mapa</span></div>
          <button className="gs-favpeak-select" onClick={() => setPeakSheet(true)}>
            {favPeakObj ?
            <>
                <span className="gs-favpeak-star" style={{ color: "#F5A623" }}>★</span>
                <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>{favPeakObj.name}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--muted)" }}>{favPeakObj.type} · {favPeakObj.direction}</span>
                </span>
                <span style={{ width: 9, height: 9, borderRadius: 999, background: window.cond(window.personalCondition(favPeakObj, surfCtx)).color, flexShrink: 0 }}></span>
              </> :

            <span style={{ flex: 1, textAlign: "left", color: "var(--muted)", fontWeight: 600 }}>Selecionar pico preferido</span>
            }
            <span className="gs-favpeak-cta">{favPeakObj ? "Alterar" : "Selecionar"}</span>
          </button>
          <div className="gs-favpeak-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00C896" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
            Avisamos quando este pico estiver com ótimas condições para você.
          </div>
        </div>
      </div>

      {/* avatar bottom sheet */}
      {avatarSheet &&
      <div className="gs-sheet-scrim" onClick={() => setAvatarSheet(false)}>
          <div className="gs-bottomsheet" onClick={(e) => e.stopPropagation()}>
            <div className="gs-sheet-grab"></div>
            <div className="gs-sheet-title">Editar avatar</div>
            <div className="gs-sheet-sub">Escolha uma ilustração ou envie sua foto</div>

            <div className="gs-sheet-label">Ilustrações do app</div>
            <div className="gs-illus-grid">
              {window.AVATAR_CHOICES.map((a) =>
            <button key={a} onClick={() => {setAvatar(a);setAvatarSheet(false);}}
            className={"gs-illus-opt" + (a === avatar ? " on" : "")}><AvatarGlyph id={a} size={64} /></button>
            )}
            </div>

            <button className="gs-sheet-upload" onClick={() => {setAvatarSheet(false);setUploadOpen(true);}}>
              <span className="gs-sheet-upload-ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
              </span>
              <span style={{ flex: 1, textAlign: "left" }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>Enviar uma foto</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--muted)" }}>JPG, PNG ou WEBP · até 5 MB</span>
              </span>
              <span style={{ color: "var(--muted)", fontSize: 18 }}>→</span>
            </button>
          </div>
        </div>
      }

      {/* background bottom sheet */}
      {bgSheet &&
        <div className="gs-sheet-scrim" onClick={() => setBgSheet(false)}>
          <div className="gs-bottomsheet" onClick={(e) => e.stopPropagation()}>
            <div className="gs-sheet-grab"></div>
            <div className="gs-sheet-title">Alterar background</div>
            <div className="gs-sheet-sub">Escolha um padrão de cores ou envie sua imagem</div>

            <div className="gs-sheet-label">Padrões de cores</div>
            <div className="gs-bg-grid">
              {window.HERO_BGS.map((b) =>
                <button key={b.id} onClick={() => {setHeroBg(b.id);setBgSheet(false);}}
                  className={"gs-bg-opt" + (heroBg === b.id ? " on" : "")}>
                  <span className="gs-bg-swatch" style={{ background: b.css }}></span>
                  <span className="gs-bg-name">{b.label}</span>
                </button>
              )}
            </div>

            <button className="gs-sheet-upload" onClick={() => {setBgSheet(false);setBgUploadOpen(true);}}>
              <span className="gs-sheet-upload-ic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 16l5-5 4 4 3-3 6 6" /></svg>
              </span>
              <span style={{ flex: 1, textAlign: "left" }}>
                <span style={{ display: "block", fontSize: 14, fontWeight: 700 }}>Enviar uma imagem</span>
                <span style={{ display: "block", fontSize: 12, color: "var(--muted)" }}>JPG, PNG ou WEBP · até 5 MB</span>
              </span>
              <span style={{ color: "var(--muted)", fontSize: 18 }}>→</span>
            </button>
          </div>
        </div>
      }

      {/* password bottom sheet */}
      {pwSheet &&
      <PasswordSheet hasExisting={hasPw}
      onClose={() => setPwSheet(false)}
      onConfirm={() => {setHasPw(true);setPwSheet(false);}} />
      }

      {/* pico preferido bottom sheet */}
      {peakSheet &&
      <PeakSearchSheet favPeak={favPeak} surfCtx={surfCtx}
      onClose={() => setPeakSheet(false)}
      onPick={(p) => {setFavPeak(p.id);setPeakSheet(false);}} />
      }

      <div className="gs-create-footer">
        <button className="gs-create-cancel" onClick={onClose}>Cancelar</button>
        <button className="gs-create-go" onClick={save} disabled={!favValid} style={{ opacity: favValid ? 1 : 0.5 }}>Salvar perfil</button>
      </div>
    </>);

}

// ===== Password bottom sheet (strong-password rules) =====
function PasswordSheet({ hasExisting, onClose, onConfirm }) {
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [show, setShow] = useState(false);
  const [touched, setTouched] = useState(false);

  const rules = [
  { id: "len", label: "Mais de 8 caracteres", ok: pw1.length > 8 },
  { id: "upper", label: "Pelo menos 1 letra maiúscula", ok: /[A-Z]/.test(pw1) },
  { id: "special", label: "Pelo menos 1 caractere especial", ok: /[^A-Za-z0-9]/.test(pw1) }];

  const allOk = rules.every((r) => r.ok);
  const match = pw1.length > 0 && pw1 === pw2;
  const canSave = allOk && match;

  return (
    <div className="gs-sheet-scrim" onClick={onClose}>
      <div className="gs-bottomsheet" onClick={(e) => e.stopPropagation()}>
        <div className="gs-sheet-grab"></div>
        <div className="gs-sheet-title">{hasExisting ? "Alterar senha" : "Criar senha"}</div>
        <div className="gs-sheet-sub">Crie uma senha segura para sua conta GoSwell.</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
          <div className="gs-pw-input">
            <input className="gs-ac-field" type={show ? "text" : "password"} placeholder="Nova senha"
            value={pw1} onChange={(e) => {setPw1(e.target.value);setTouched(true);}} autoFocus />
            <button className="gs-pw-eye" onClick={() => setShow((v) => !v)} type="button">{show ? "Ocultar" : "Mostrar"}</button>
          </div>
          <div className="gs-pw-input">
            <input className="gs-ac-field" type={show ? "text" : "password"} placeholder="Confirmar senha"
            value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>
        </div>

        {/* requisitos */}
        <div className="gs-pw-rules">
          {rules.map((r) =>
          <div key={r.id} className={"gs-pw-rule" + (r.ok ? " ok" : touched ? " bad" : "")}>
              <span className="gs-pw-rule-ic">{r.ok ? "✓" : "○"}</span>{r.label}
            </div>
          )}
          <div className={"gs-pw-rule" + (match ? " ok" : pw2 ? " bad" : "")}>
            <span className="gs-pw-rule-ic">{match ? "✓" : "○"}</span>As senhas coincidem
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="gs-create-cancel" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
          <button className="gs-create-go" style={{ flex: 1, opacity: canSave ? 1 : 0.5 }} disabled={!canSave} onClick={onConfirm}>
            {hasExisting ? "Salvar senha" : "Criar senha"}
          </button>
        </div>
      </div>
    </div>);

}

// ===== Pico preferido search bottom sheet =====
function PeakSearchSheet({ favPeak, surfCtx, onClose, onPick }) {
  const [query, setQuery] = useState("");
  const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const q = norm(query);
  const list = window.PEAKS.filter((p) => !q || norm(p.name).includes(q) || norm(p.type).includes(q) || norm(p.direction).includes(q));

  return (
    <div className="gs-sheet-scrim" onClick={onClose}>
      <div className="gs-bottomsheet" onClick={(e) => e.stopPropagation()}>
        <div className="gs-sheet-grab"></div>
        <div className="gs-sheet-title">Pico preferido</div>
        <div className="gs-sheet-sub">Busque e selecione seu pico favorito.</div>

        <div className="gs-ac-input" style={{ marginTop: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" strokeLinecap="round" /></svg>
          <input className="gs-ac-field" value={query} placeholder="Buscar pico…" autoFocus onChange={(e) => setQuery(e.target.value)} />
          {query && <button className="gs-ac-clear" onClick={() => setQuery("")}>✕</button>}
        </div>

        <div className="gs-peak-sheet-list gs-miniscroll">
          {list.length === 0 && <div className="gs-ac-empty">Nenhum pico encontrado</div>}
          {list.map((p) => {
            const pc = window.cond(window.personalCondition(p, surfCtx));
            const on = p.id === favPeak;
            return (
              <button key={p.id} className={"gs-peak-sheet-opt" + (on ? " on" : "")} onClick={() => onPick(p)}>
                <span className="gs-favpeak-star" style={{ color: on ? "#F5A623" : "var(--muted)" }}>{on ? "★" : "☆"}</span>
                <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{p.name}</span>
                  <span style={{ display: "block", fontSize: 11.5, color: "var(--muted)" }}>{p.type} · {p.direction}</span>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: pc.color }}></span>
                  <span style={{ fontSize: 12, color: "var(--muted)", minWidth: 32, textAlign: "right" }}>{p.height.toFixed(1)}m</span>
                </span>
              </button>);

          })}
        </div>
      </div>
    </div>);

}

// ===== Avatar upload sub-screen =====
function AvatarUpload({ current, onCancel, onPick, title, subtitle, rectangular }) {
  const fileRef = useRef(null);
  const frameRef = useRef(null);
  const natural = useRef({ w: 0, h: 0 });
  const drag = useRef({ down: false, x: 0, y: 0, px: 0, py: 0 });
  const [preview, setPreview] = useState(null); // image being positioned
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState(null);
  const [fileName, setFileName] = useState(null);

  // frame (mask) size on screen, and exported output size
  const FRAME = rectangular ? { w: 300, h: 170 } : { w: 240, h: 240 };
  const OUT = rectangular ? { w: 1100, h: 624 } : { w: 480, h: 480 };

  const coverScale = () => {
    const n = natural.current;
    if (!n.w || !n.h) return 1;
    return Math.max(FRAME.w / n.w, FRAME.h / n.h);
  };
  const dispSize = () => {
    const cs = coverScale() * scale, n = natural.current;
    return { w: n.w * cs, h: n.h * cs };
  };
  const clampPos = (p, sc) => {
    const cs = coverScale() * sc, n = natural.current;
    const dw = n.w * cs, dh = n.h * cs;
    const mx = Math.max(0, (dw - FRAME.w) / 2), my = Math.max(0, (dh - FRAME.h) / 2);
    return { x: Math.max(-mx, Math.min(mx, p.x)), y: Math.max(-my, Math.min(my, p.y)) };
  };

  const handleFile = (file) => {
    if (!file) return;
    setErr(null);
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.type)) { setErr("Formato inválido. Envie JPG, PNG ou WEBP."); return; }
    if (file.size > 5 * 1024 * 1024) { setErr("Arquivo muito grande. O limite é 5 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        natural.current = { w: img.naturalWidth, h: img.naturalHeight };
        setScale(1); setPos({ x: 0, y: 0 }); setReady(true);
      };
      img.src = reader.result;
      setPreview(reader.result); setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };
  const onChange = (e) => handleFile(e.target.files && e.target.files[0]);

  const onDown = (e) => { drag.current = { down: true, x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => {
    if (!drag.current.down) return;
    const np = { x: drag.current.px + (e.clientX - drag.current.x), y: drag.current.py + (e.clientY - drag.current.y) };
    setPos(clampPos(np, scale));
  };
  const onUp = () => { drag.current.down = false; };
  const onZoom = (v) => { const s = +v; setScale(s); setPos((p) => clampPos(p, s)); };

  // export the framed region to a data URL
  const exportCrop = () => {
    const n = natural.current;
    if (!n.w) { onPick(preview); return; }
    const cs = coverScale() * scale;
    const dw = n.w * cs, dh = n.h * cs;
    const k = OUT.w / FRAME.w; // frame px → output px
    const cnv = document.createElement("canvas");
    cnv.width = OUT.w; cnv.height = OUT.h;
    const ctx = cnv.getContext("2d");
    const left = (FRAME.w / 2 - dw / 2 + pos.x) * k;
    const top = (FRAME.h / 2 - dh / 2 + pos.y) * k;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, left, top, dw * k, dh * k);
      onPick(cnv.toDataURL("image/jpeg", 0.9));
    };
    img.src = preview;
  };

  const disp = dispSize();

  // ---------- positioning editor ----------
  if (ready && preview) {
    return (
      <>
        <div className="gs-fc-header">
          <button className="gs-back" onClick={() => { setReady(false); setPreview(null); }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Posicionar imagem</div>
            <div style={{ fontSize: 12.5, color: "var(--muted)" }}>Arraste e use o zoom para enquadrar</div>
          </div>
        </div>

        <div className="gs-create-body" style={{ alignItems: "center" }}>
          <div className="gs-crop-stage">
            <div ref={frameRef} className={"gs-crop-frame" + (rectangular ? " rect" : " round")}
              style={{ width: FRAME.w, height: FRAME.h }}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
              <img src={preview} alt="crop" draggable="false" style={{
                position: "absolute", width: disp.w, height: disp.h,
                left: FRAME.w / 2 - disp.w / 2 + pos.x, top: FRAME.h / 2 - disp.h / 2 + pos.y, userSelect: "none",
              }} />
              <div className={"gs-crop-mask" + (rectangular ? " rect" : " round")}></div>
            </div>
          </div>

          {/* zoom control */}
          <div className="gs-zoom-row">
            <button className="gs-zoom-mini" onClick={() => onZoom(Math.max(1, +(scale - 0.2).toFixed(2)))}>−</button>
            <input className="gs-zoom-slider" type="range" min="1" max="4" step="0.01" value={scale}
              onChange={(e) => onZoom(e.target.value)} />
            <button className="gs-zoom-mini" onClick={() => onZoom(Math.min(4, +(scale + 0.2).toFixed(2)))}>＋</button>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>🖐️ Arraste a imagem · zoom {scale.toFixed(1)}×</div>

          <button className="gs-note-add" onClick={() => fileRef.current && fileRef.current.click()} style={{ marginTop: 4 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="9" r="1.8" /><path d="M21 15l-5-5L5 21" /></svg>
            Trocar imagem
          </button>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display: "none" }} onChange={onChange} />
        </div>

        <div className="gs-create-footer">
          <button className="gs-create-cancel" onClick={onCancel}>Cancelar</button>
          <button className="gs-create-go" onClick={exportCrop}>Salvar alterações</button>
        </div>
      </>
    );
  }

  // ---------- initial picker ----------
  return (
    <>
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onCancel}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{title || "Enviar avatar"}</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{subtitle || "Use uma foto da sua galeria"}</div>
        </div>
      </div>

      <div className="gs-create-body" style={{ alignItems: "center" }}>
        <div className={"gs-upload-preview" + (rectangular ? " rect" : "")} onClick={() => fileRef.current && fileRef.current.click()}>
          <div className="gs-upload-placeholder">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="9" r="1.8" /><path d="M21 15l-5-5L5 21" /></svg>
            <span>Prévia da foto</span>
          </div>
        </div>

        {err && <div style={{ fontSize: 12.5, color: "#E04040", fontWeight: 600 }}>{err}</div>}

        {/* requisitos */}
        <div className="gs-upload-specs">
          <div className="gs-upload-spec"><span>Formato</span><strong>JPG, PNG ou WEBP</strong></div>
          <div className="gs-upload-spec"><span>Tamanho máx.</span><strong>5 MB</strong></div>
          <div className="gs-upload-spec"><span>Recomendado</span><strong>{rectangular ? "Paisagem (≥ 900×600)" : "Imagem quadrada (≥ 400×400)"}</strong></div>
        </div>

        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" capture="environment"
        style={{ display: "none" }} onChange={onChange} />

        <button className="gs-gallery-btn" onClick={() => fileRef.current && fileRef.current.click()}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="9" r="1.8" /><path d="M21 15l-5-5L5 21" /></svg>
          Abrir galeria
        </button>
      </div>

      <div className="gs-create-footer">
        <button className="gs-create-cancel" onClick={onCancel}>Cancelar</button>
        <button className="gs-create-go" disabled style={{ opacity: 0.5 }}>Selecione uma foto</button>
      </div>
    </>);

}

Object.assign(window, { ProfileEditScreen, AvatarUpload });