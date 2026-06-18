// ===== Chart scroll sync =====
// Keeps every time-axis chart aligned to the same hour: dragging/scrolling one
// scrolls the others so the hour at the left edge matches across all charts.
(function () {
  const subs = [];          // { el, startHour, numHours, expected }

  function register(el, startHour, numHours) {
    const entry = { el, startHour, numHours, expected: null };
    subs.push(entry);
    return () => { const i = subs.indexOf(entry); if (i >= 0) subs.splice(i, 1); };
  }

  function broadcast(fromEl) {
    const src = subs.find((s) => s.el === fromEl);
    if (!src) return;
    const smax = src.el.scrollWidth - src.el.clientWidth;
    if (smax <= 0) return;
    const frac = src.el.scrollLeft / smax;             // 0..1 within source
    const hourAtLeft = src.startHour + frac * src.numHours;
    for (const s of subs) {
      if (s.el === fromEl) continue;
      const tmax = s.el.scrollWidth - s.el.clientWidth;
      if (tmax <= 0) continue;
      let tfrac = (hourAtLeft - s.startHour) / s.numHours;
      tfrac = Math.max(0, Math.min(1, tfrac));
      const target = tfrac * tmax;
      if (Math.abs(s.el.scrollLeft - target) > 0.5) {
        s.expected = target;                            // remember so we can ignore the echo
        s.el.scrollLeft = target;
      }
    }
  }

  function onScroll(el) {
    const s = subs.find((x) => x.el === el);
    if (s && s.expected != null && Math.abs(el.scrollLeft - s.expected) <= 1) {
      s.expected = null;                                // this scroll is the echo we caused
      return;
    }
    if (s) s.expected = null;
    broadcast(el);                                      // genuine user scroll → propagate
  }

  window.GSChartSync = { register, onScroll };

  // React hook: register a scroll container by its absolute hour span
  window.useChartSync = function (ref, startHour, numHours) {
    React.useEffect(function () {
      const el = ref.current;
      if (!el) return;
      const unregister = window.GSChartSync.register(el, startHour, numHours);
      const handler = function () { window.GSChartSync.onScroll(el); };
      el.addEventListener("scroll", handler, { passive: true });
      return function () { el.removeEventListener("scroll", handler); unregister(); };
    }, [startHour, numHours]);
  };
})();
