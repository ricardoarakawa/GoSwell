// ===== App shell + navigation =====

function App() {
  const [tab, setTab] = useState("mapa");
  const [mapView, setMapView] = useState("map"); // map | forecast | businesses
  const [peak, setPeak] = useState(window.PEAKS[2]); // default Maresias
  const [profile, setProfile] = useState(window.PROFILE);
  const [trips, setTrips] = useState(() => window.TRIPS.map((t) => ({ role: "owner", ...t })));
  const [invites, setInvites] = useState(window.INVITES);
  const [createCtx, setCreateCtx] = useState(null); // { peak, day, trip } | null
  const [inviteCtx, setInviteCtx] = useState(null);  // trip being invited-to
  const [detailTrip, setDetailTrip] = useState(null); // trip being viewed (read-only)
  const [editProfile, setEditProfile] = useState(false);
  const [newTripId, setNewTripId] = useState(null);
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("goswell-theme") || "light"; } catch (e) { return "light"; }
  });

  // apply theme to <html> + persist
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("goswell-theme", theme); } catch (e) {}
  }, [theme]);

  // keep personalization engine in sync with the live profile
  window.SURF = profile.surf;

  const goTab = (t) => { setTab(t); if (t === "mapa") setMapView("map"); };
  const openForecast = (p) => { setPeak(p); setMapView("forecast"); };
  const openBusinesses = (p) => { setPeak(p); setMapView("businesses"); };

  const openCreate = (p, day) => setCreateCtx({ peak: p, day });
  const openFavorite = (peakId) => {
    const p = window.PEAKS.find((x) => x.id === peakId);
    if (p) { setPeak(p); setTab("mapa"); setMapView("forecast"); }
  };
  const openEdit = (trip) => {
    const p = window.PEAKS.find((x) => x.id === trip.peakId) || window.PEAKS[2];
    setCreateCtx({ peak: p, trip });
  };
  const submitTrip = (trip) => {
    setTrips((cur) => {
      const isEdit = cur.some((t) => t.id === trip.id);
      setNewTripId(isEdit ? null : trip.id);
      return isEdit ? cur.map((t) => (t.id === trip.id ? trip : t)) : [{ role: "owner", ...trip }, ...cur];
    });
    setCreateCtx(null);
    setTab("trips");
  };

  // invites — receive
  const acceptInvite = (inv) => {
    setInvites((cur) => cur.filter((x) => x.id !== inv.id));
    setTrips((cur) => [{
      role: "guest", id: inv.id, name: inv.name, peakId: inv.peakId, dates: inv.dates,
      status: "confirmada", avatars: ["RL", ...(inv.avatars || [])], extra: 0,
      forecast: inv.forecast, note: inv.note, host: inv.host, chat: [],
    }, ...cur]);
    setNewTripId(inv.id);
    setTab("trips");
  };
  const declineInvite = (inv) => setInvites((cur) => cur.filter((x) => x.id !== inv.id));

  // invites — send (mark contacts as pending on the trip)
  const sendInvite = (trip, contacts) => {
    setTrips((cur) => cur.map((t) => t.id === trip.id
      ? { ...t, pending: [...(t.pending || []), ...contacts.map((c) => c.label)] }
      : t));
    setInviteCtx(null);
  };

  const notifCount = invites.length;

  let screen, key;
  if (tab === "mapa") {
    if (mapView === "forecast") {
      key = "forecast-" + peak.id;
      screen = <ForecastScreen peak={peak} onBack={() => setMapView("map")} onOrganize={(day) => openCreate(peak, day)}
        onSwitchPeak={(id) => { const p = window.PEAKS.find((x) => x.id === id); if (p) setPeak(p); }} />;
    } else if (mapView === "businesses") {
      key = "biz-" + peak.id;
      screen = <BusinessesScreen peak={peak} onBack={() => setMapView("map")} />;
    } else {
      key = "map";
      screen = <MapScreen onOpenForecast={openForecast} onOpenBusinesses={openBusinesses}
        inviteCount={notifCount} onOpenInvites={() => goTab("trips")} favPeakId={profile.surf && profile.surf.favPeak} />;
    }
  } else if (tab === "trips") {
    key = "trips";
    screen = <TripsScreen trips={trips} invites={invites} newTripId={newTripId}
      onNewTrip={() => openCreate(window.PEAKS[2], window.FORECAST[1])}
      onEdit={openEdit} onGoMap={() => goTab("mapa")}
      onInvite={(t) => setInviteCtx(t)}
      onOpen={(t) => setDetailTrip(t)}
      onAccept={acceptInvite} onDecline={declineInvite}
      onForecast={(peakId) => { const p = window.PEAKS.find((x) => x.id === peakId) || window.PEAKS[2]; setPeak(p); setTab("mapa"); setMapView("forecast"); }} />;
  } else if (tab === "produtos") {
    key = "produtos"; screen = <ProdutosScreen />;
  } else {
    key = "perfil";
    screen = <PerfilScreen profile={profile} onEdit={() => setEditProfile(true)} />;
  }

  const showHeader = !(tab === "mapa" && mapView !== "map");

  return (
    <div className="gs-phone">
      {showHeader && <TopHeader profile={profile} onOpenFavorite={openFavorite} />}
      <main className="gs-main">
        <div key={key} className="gs-fade">{screen}</div>
      </main>
      <BottomNav tab={tab} setTab={goTab} badges={{ trips: notifCount }} />

      {createCtx && (
        <div className="gs-overlay">
          <div className="gs-overlay-sheet">
            <CreateTripScreen peak={createCtx.peak} startDay={createCtx.day} trip={createCtx.trip}
              onCancel={() => setCreateCtx(null)} onCreate={submitTrip} />
          </div>
        </div>
      )}

      {inviteCtx && (
        <div className="gs-overlay">
          <div className="gs-overlay-sheet">
            <InviteScreen trip={inviteCtx} onClose={() => setInviteCtx(null)} onSend={sendInvite} />
          </div>
        </div>
      )}

      {detailTrip && (
        <div className="gs-overlay">
          <div className="gs-overlay-sheet">
            <TripDetailScreen trip={detailTrip} onClose={() => setDetailTrip(null)}
              onForecast={(peakId) => { const p = window.PEAKS.find((x) => x.id === peakId) || window.PEAKS[2]; setDetailTrip(null); setPeak(p); setTab("mapa"); setMapView("forecast"); }}
              onEdit={(t) => { setDetailTrip(null); openEdit(t); }} />
          </div>
        </div>
      )}

      {editProfile && (
        <div className="gs-overlay">
          <div className="gs-overlay-sheet">
            <ProfileEditScreen profile={profile} theme={theme} onThemeChange={setTheme} onClose={() => setEditProfile(false)}
              onSave={(p) => { setProfile(p); window.PROFILE = p; setEditProfile(false); }} />
          </div>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
