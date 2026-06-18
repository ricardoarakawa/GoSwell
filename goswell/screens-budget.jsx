// ===== Budget screen (Orçamento da viagem) =====

function _money(n, sym) {
  return sym + " " + (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function QtyStepper({ value, onChange }) {
  return (
    <div className="gs-qty">
      <button onClick={() => onChange(Math.max(1, value - 1))} aria-label="menos">−</button>
      <span>{value}</span>
      <button onClick={() => onChange(value + 1)} aria-label="mais">＋</button>
    </div>
  );
}

function BudgetItemRow({ item, sym, onChange, onRemove }) {
  const sub = (item.value || 0) * (item.qty || 1);
  return (
    <div className="gs-bud-item">
      <div className="gs-bud-item-top">
        <input className="gs-bud-name" value={item.name} placeholder="Nome do item"
          onChange={(e) => onChange({ ...item, name: e.target.value })} />
        <button className="gs-bud-del" onClick={onRemove} aria-label="remover">✕</button>
      </div>
      <div className="gs-bud-item-bot">
        <QtyStepper value={item.qty} onChange={(q) => onChange({ ...item, qty: q })} />
        <span className="gs-bud-x">×</span>
        <div className="gs-val-wrap">
          <span className="gs-val-sym">{sym}</span>
          <input className="gs-val-input" type="number" min="0" step="0.01"
            value={item.value === 0 ? "" : item.value} placeholder="0,00"
            onChange={(e) => onChange({ ...item, value: parseFloat(e.target.value) || 0 })} />
        </div>
        <span className="gs-bud-sub">{_money(sub, sym)}</span>
      </div>
    </div>
  );
}

function BudgetScreen({ tripName, crewCount, initial, onClose, onSave }) {
  const [currency, setCurrency] = useState(initial.currency || "BRL");
  const [items, setItems] = useState(initial.items && initial.items.length ? initial.items : []);
  const cur = window.CURRENCIES.find((x) => x.code === currency) || window.CURRENCIES[0];
  const brl = window.CURRENCIES[0];

  const addSuggestion = (s) => {
    setItems((cur) => cur.some((i) => i.name === s.name)
      ? cur
      : [...cur, { id: "i" + Date.now() + Math.random(), name: s.name, qty: 1, value: 0 }]);
  };
  const addCustom = () => setItems((cur) => [...cur, { id: "i" + Date.now() + Math.random(), name: "", qty: 1, value: 0 }]);
  const updateItem = (id, next) => setItems((cur) => cur.map((i) => (i.id === id ? next : i)));
  const removeItem = (id) => setItems((cur) => cur.filter((i) => i.id !== id));

  const total = items.reduce((s, i) => s + (i.value || 0) * (i.qty || 1), 0);
  const totalBRL = total * cur.rate;
  const perPerson = crewCount > 0 ? total / crewCount : total;

  return (
    <>
      <div className="gs-fc-header">
        <button className="gs-back" onClick={onClose}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>Orçamento da viagem</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)" }}>{tripName}</div>
        </div>
      </div>

      <div className="gs-create-body">
        {/* moeda */}
        <div className="gs-field">
          <div className="gs-label">Moeda da viagem</div>
          <div className="gs-cur-row">
            {window.CURRENCIES.map((m) => (
              <button key={m.code} onClick={() => setCurrency(m.code)}
                className={"gs-cur-chip" + (m.code === currency ? " on" : "")}>
                <span style={{ fontWeight: 800 }}>{m.sym}</span>
                <span style={{ fontSize: 11 }}>{m.code}</span>
              </button>
            ))}
          </div>
          {currency !== "BRL" && (
            <div className="gs-cur-note">🌐 Trip internacional · 1 {cur.code} ≈ {_money(cur.rate, brl.sym)}</div>
          )}
        </div>

        {/* sugestões */}
        <div className="gs-field">
          <div className="gs-label">Sugestões <span style={{ color: "var(--muted)", fontWeight: 500 }}>· toque para adicionar</span></div>
          <div className="gs-sugg-row">
            {window.BUDGET_SUGGESTIONS.map((s) => {
              const added = items.some((i) => i.name === s.name);
              return (
                <button key={s.name} onClick={() => addSuggestion(s)} disabled={added}
                  className={"gs-sugg-chip" + (added ? " added" : "")}>
                  <span>{s.icon}</span>{s.name}{added ? " ✓" : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* itens */}
        <div className="gs-field">
          <div className="gs-label">Itens <span style={{ color: "var(--muted)", fontWeight: 500 }}>· {items.length}</span></div>
          {items.length === 0 && (
            <div className="gs-bud-empty">Nenhum item ainda. Toque numa sugestão acima ou adicione um item.</div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {items.map((it) => (
              <BudgetItemRow key={it.id} item={it} sym={cur.sym}
                onChange={(n) => updateItem(it.id, n)} onRemove={() => removeItem(it.id)} />
            ))}
          </div>
          <button className="gs-bud-add" onClick={addCustom}>＋ Adicionar item personalizado</button>
        </div>
      </div>

      {/* footer com total fixado */}
      <div className="gs-bud-foot">
        <div className="gs-bud-foot-totals">
          <div className="gs-bud-foot-col">
            <span className="gs-bud-foot-lbl">Total</span>
            <span className="gs-bud-foot-total">{_money(total, cur.sym)}</span>
            {currency !== "BRL" && <span className="gs-bud-foot-conv">≈ {_money(totalBRL, brl.sym)}</span>}
          </div>
          <div className="gs-bud-foot-col" style={{ alignItems: "flex-end" }}>
            <span className="gs-bud-foot-lbl">Por pessoa ({crewCount})</span>
            <span className="gs-bud-foot-pp">{_money(perPerson, cur.sym)}</span>
          </div>
        </div>
        <div className="gs-create-footer" style={{ borderTop: "none", background: "none", backdropFilter: "none" }}>
          <button className="gs-create-cancel" onClick={onClose}>Voltar</button>
          <button className="gs-create-go" onClick={() => onSave({ currency, items })}>Salvar orçamento</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { BudgetScreen, _money: _money });
