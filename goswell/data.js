// ===== GoSwell hardcoded data =====

// Condition system
window.CONDITIONS = {
  perfeita: { label: "Perfeita", color: "#00C896" },
  otima:    { label: "Ótima",    color: "#00A86B" },
  boa:      { label: "Boa",      color: "#08A0F8" },
  regular:  { label: "Regular",  color: "#F5A623" },
  ruim:     { label: "Ruim",     color: "#E04040" },
  dificil:  { label: "Difícil",  color: "#A855F7" },
};

// ===== Personalization engine =====
// A peak's shown condition adapts to the user's surf profile: level, ideal wave
// size, formation (cheia/tubular) and preferred swell directions.
// "Difícil" = quality waves that exceed the surfer's level/comfort.
window.LEVEL_IDX = { "Iniciante": 0, "Intermediário": 1, "Avançado": 2 };
window.isTubular = (peak) => /tub/i.test((peak && peak.direction) || "");

// opts: { height, period, wind, difficulty, tubular, swellDir }
window.personalCondFor = function (opts, surf) {
  const objKey = window.classifyCond(opts.height, opts.period, opts.wind);
  if (!surf || !surf.personalize) return objKey;
  const objQ = { ruim: 0, regular: 1, boa: 2, otima: 3, perfeita: 4 }[objKey];
  const userL = window.LEVEL_IDX[surf.level] != null ? window.LEVEL_IDX[surf.level] : 1;
  const peakL = window.LEVEL_IDX[opts.difficulty] != null ? window.LEVEL_IDX[opts.difficulty] : 1;
  const tub = !!opts.tubular;

  // how far the spot exceeds the surfer's comfort
  let challenge = Math.max(0, peakL - userL);
  if (opts.height > surf.idealMax) challenge += (opts.height - surf.idealMax) / 0.5;
  if (tub && surf.formation !== "Tubular") challenge += 1;
  if (tub && userL === 0) challenge += 1;

  // real waves but above the surfer's level → Difícil
  if (objQ >= 2 && challenge >= 2) return "dificil";

  // personal quality from how well it fits the surfer
  let pq = objQ;
  if (opts.height >= surf.idealMin && opts.height <= surf.idealMax) pq += 1;
  else if (opts.height < surf.idealMin) pq -= 1;
  if (tub && surf.formation === "Tubular") pq += 0.5;
  if (!tub && surf.formation === "Cheia") pq += 0.5;
  if (surf.dirs && surf.dirs.indexOf(opts.swellDir) >= 0) pq += 0.5;
  if (opts.period < surf.minPeriod) pq -= 0.5;
  pq -= Math.max(0, peakL - userL) * 0.5;

  pq = Math.max(0, Math.min(4, Math.round(pq)));
  return ["ruim", "regular", "boa", "otima", "perfeita"][pq];
};
window.personalCondition = function (peak, surf) {
  return window.personalCondFor({
    height: peak.height, period: peak.period, wind: peak.wind,
    difficulty: peak.difficulty, tubular: window.isTubular(peak), swellDir: peak.swellDir,
  }, surf);
};
// active personalization profile (kept in sync by the App from PROFILE.surf)
window.SURF = null;

// Power formula: P = H² × T × 0.5  (kJ/m)
window.power = (h, t) => Math.round(h * h * t * 0.5 * 10) / 10;
// Power expressed in Joules for the gauge (scaled to a 0–2000 J range)
window.powerJoules = (h, t) => Math.round(h * h * t * 18);

// Classify sea condition from height (m), period (s) and wind (km/h)
// — same legend as the map: perfeita / ótima / boa / regular / ruim
window.classifyCond = (h, t, wind) => {
  if (h >= 1.8 && t >= 13 && wind <= 15) return "perfeita";
  if (h >= 1.6 && t >= 11 && wind <= 19) return "otima";
  if (h >= 1.2 && t >= 9  && wind <= 23) return "boa";
  if (h >= 0.9 && wind <= 28) return "regular";
  return "ruim";
};

// Weather conditions (tempo) for the day summary
window.WEATHER = {
  sol:     { label: "Ensolarado",  icon: "sun" },
  parcial: { label: "Parc. nublado", icon: "partly" },
  nublado: { label: "Nublado",     icon: "cloud" },
  chuva:   { label: "Chuva",       icon: "rain" },
};

// 6 surf peaks. x/y are positions in the 390×470 map viewBox.
window.PEAKS = [
  { id: "itamambuca", name: "Itamambuca", condition: "perfeita", height: 2.2, period: 14, wind: 12, windDir: "SSE", swellDir: "SSE",
    type: "Beach break", difficulty: "Intermediário", direction: "Pico direito e esquerdo", weather: "sol", airTemp: 24, waterTemp: 21, x: 256, y: 78 },
  { id: "camburi",    name: "Camburi",    condition: "boa",      height: 1.4, period: 10, wind: 20, windDir: "SE", swellDir: "SE",
    type: "Beach break", difficulty: "Iniciante", direction: "Esquerda", weather: "parcial", airTemp: 23, waterTemp: 21, x: 292, y: 158 },
  { id: "maresias",   name: "Maresias",   condition: "otima",    height: 2.1, period: 12, wind: 18, windDir: "NW", swellDir: "SSE",
    type: "Beach break", difficulty: "Avançado", direction: "Direita tubular", weather: "sol", airTemp: 24, waterTemp: 20, x: 236, y: 238 },
  { id: "barradouna", name: "Barra do Una", condition: "boa",    height: 1.6, period: 11, wind: 16, windDir: "S", swellDir: "S",
    type: "Rivermouth", difficulty: "Intermediário", direction: "Esquerda longa", weather: "parcial", airTemp: 23, waterTemp: 21, x: 188, y: 300 },
  { id: "boicucanga", name: "Boiçucanga", condition: "ruim",     height: 0.8, period: 7,  wind: 28, windDir: "SE", swellDir: "SE",
    type: "Beach break", difficulty: "Iniciante", direction: "Mexido", weather: "nublado", airTemp: 22, waterTemp: 21, x: 250, y: 336 },
  { id: "juquei",     name: "Juqueí",     condition: "otima",    height: 1.7, period: 11, wind: 15, windDir: "NW", swellDir: "SSW",
    type: "Beach break", difficulty: "Intermediário", direction: "Pico direito", weather: "sol", airTemp: 24, waterTemp: 20, x: 158, y: 396 },
];

// 15-day forecast — always opens with "Ontem" (yesterday) as a past reference.
window.FORECAST = [
  { day: "Ontem", date: "2 Jun", h: 1.9, t: 11, dir: "SSE", wind: 16, condition: "otima",    weather: "parcial", at: 23, wt: 21, past: true },
  { day: "Hoje", date: "3 Jun",  h: 2.1, t: 12, dir: "SSE", wind: 18, condition: "otima",    weather: "sol",     at: 24, wt: 21 },
  { day: "Sex",  date: "4 Jun",  h: 1.7, t: 10, dir: "SE",  wind: 22, condition: "boa",      weather: "parcial", at: 23, wt: 21 },
  { day: "Sáb",  date: "5 Jun",  h: 0.9, t: 7,  dir: "S",   wind: 28, condition: "ruim",     weather: "chuva",   at: 20, wt: 20 },
  { day: "Dom",  date: "6 Jun",  h: 2.4, t: 14, dir: "SSW", wind: 12, condition: "perfeita", weather: "sol",     at: 25, wt: 20 },
  { day: "Seg",  date: "7 Jun",  h: 2.0, t: 12, dir: "S",   wind: 16, condition: "otima",    weather: "sol",     at: 24, wt: 20 },
  { day: "Ter",  date: "8 Jun",  h: 1.5, t: 10, dir: "SE",  wind: 19, condition: "boa",      weather: "parcial", at: 23, wt: 20 },
  { day: "Qua",  date: "9 Jun",  h: 1.1, t: 8,  dir: "SSE", wind: 24, condition: "regular",  weather: "nublado", at: 21, wt: 20 },
  { day: "Qui",  date: "10 Jun", h: 1.8, t: 11, dir: "SSE", wind: 15, condition: "otima",    weather: "sol",     at: 24, wt: 20 },
  { day: "Sex",  date: "11 Jun", h: 2.2, t: 13, dir: "S",   wind: 13, condition: "perfeita", weather: "sol",     at: 25, wt: 20 },
  { day: "Sáb",  date: "12 Jun", h: 1.4, t: 10, dir: "SW",  wind: 20, condition: "boa",      weather: "parcial", at: 22, wt: 20 },
  { day: "Dom",  date: "13 Jun", h: 0.7, t: 6,  dir: "W",   wind: 30, condition: "ruim",     weather: "chuva",   at: 19, wt: 19 },
  { day: "Seg",  date: "14 Jun", h: 1.9, t: 12, dir: "SSE", wind: 14, condition: "otima",    weather: "sol",     at: 23, wt: 19 },
  { day: "Ter",  date: "15 Jun", h: 2.3, t: 13, dir: "S",   wind: 11, condition: "perfeita", weather: "sol",     at: 24, wt: 19 },
  { day: "Qua",  date: "16 Jun", h: 1.6, t: 11, dir: "SE",  wind: 17, condition: "boa",      weather: "parcial", at: 22, wt: 19 },
  { day: "Qui",  date: "17 Jun", h: 1.2, t: 9,  dir: "SSE", wind: 22, condition: "regular",  weather: "nublado", at: 21, wt: 19 },
];

// Hourly detail 06h–20h (template, varies by base height)
// Hourly detail — every hour across ~1.5 days (36h from 06h), each with its own
// sea condition (same legend as the map). Sea breeze stiffens wind in the afternoon.
window.buildHourly = (baseH, baseT, baseWind, baseDir, peakCtx) => {
  const baseDeg = window.DIR_DEG[baseDir] != null ? window.DIR_DEG[baseDir] : 180;
  const START = 6, COUNT = 36;
  const out = [];
  for (let i = 0; i < COUNT; i++) {
    const hr = START + i;
    const hod = ((hr % 24) + 24) % 24;
    const day = Math.floor(hr / 24); // 0 = hoje, 1 = amanhã
    // diurnal swell: a little bigger mid-morning, easing toward night
    const dayFactor = 0.82 + 0.2 * Math.sin(((hod - 4) / 24) * Math.PI * 2);
    const trend = 1 - 0.05 * day + 0.04 * Math.sin(i / 5);
    const h = Math.max(0.4, Math.round(baseH * dayFactor * trend * 10) / 10);
    const t = Math.max(5, Math.round(baseT - (1 - dayFactor) * 4));
    // wind picks up midday–late afternoon (brisa marítima)
    const breeze = hod >= 11 && hod <= 17 ? 7 : (hod >= 6 && hod <= 10 ? -3 : 0);
    const wind = Math.max(5, Math.round(baseWind + breeze + 2 * Math.sin(i / 3)));
    // swell direction drifts through the day
    const dirDeg = baseDeg + 30 * Math.sin((hr - 3) / 5.5);
    // wind bearing: terral (offshore) de manhã, maral (onshore) à tarde, cruzado na transição
    let windDeg;
    if (hod >= 13 && hod <= 18) windDeg = 135 + (i % 3 - 1) * 6;
    else if (hod >= 11 && hod <= 12) windDeg = 225 + (i % 3 - 1) * 6;
    else windDeg = 315 + (i % 3 - 1) * 6;
    const dir = window.degToCompass(dirDeg);
    const condition = window.personalCondFor({ height: h, period: t, wind: wind,
      difficulty: peakCtx && peakCtx.difficulty, tubular: peakCtx && peakCtx.tubular, swellDir: dir }, window.SURF);
    out.push({ hour: hr, hod, day, h, t, wind, dirDeg, dir, windDeg, windType: window.windType(windDeg), condition });
  }
  return out;
};

// Compass <-> degrees
window.DIR_DEG = { N:0, NNE:22.5, NE:45, ENE:67.5, E:90, ESE:112.5, SE:135, SSE:157.5,
  S:180, SSW:202.5, SW:225, WSW:247.5, W:270, WNW:292.5, NW:315, NNW:337.5 };
window.degToCompass = (deg) => {
  const names = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return names[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
};

// Wind relative to the coastline (these beaches face the ocean ~SE / 135°).
// terral = offshore (limpa a onda, bom) · maral = onshore (mexe, ruim) · cruzado = lateral
window.SHORE_DEG = 135;
window.windType = (windDeg) => {
  const ang = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  if (ang(windDeg, window.SHORE_DEG) <= 50) return { key: "maral",   label: "Maral",   color: "#E04040" };
  if (ang(windDeg, (window.SHORE_DEG + 180) % 360) <= 50) return { key: "terral", label: "Terral", color: "#00C896" };
  return { key: "cruzado", label: "Cruzado", color: "#F5A623" };
};

// Full-day (00h–23h) hourly series for the Potência / Vento / Swell charts.
// Swell direction drifts through the day so the arrows visibly rotate.
window.buildDaySeries = (baseH, baseT, baseWind, baseDir) => {
  const baseDeg = window.DIR_DEG[baseDir] != null ? window.DIR_DEG[baseDir] : 180;
  const out = [];
  for (let h = 0; h < 24; h++) {
    const dayFactor = 0.82 + 0.2 * Math.sin(((h - 4) / 24) * Math.PI * 2);
    const height = Math.round(Math.max(0.4, baseH * dayFactor) * 10) / 10;
    const t = Math.max(5, Math.round(baseT - (1 - dayFactor) * 4));
    const breeze = h >= 11 && h <= 17 ? 7 : (h >= 6 && h <= 10 ? -3 : 0);
    const wind = Math.max(5, Math.round(baseWind + breeze + 2 * Math.sin(h / 3)));
    const power = window.power(height, t);
    const dirDeg = baseDeg + 30 * Math.sin((h - 3) / 5.5);
    out.push({ h, height, t, wind, power, dirDeg,
      dir: window.degToCompass(dirDeg),
      condition: window.classifyCond(height, t, wind) });
  }
  return out;
};

// Tide: 24 bars (semi-diurnal, two highs / two lows)
window.buildTide = () => {
  const arr = [];
  for (let h = 0; h < 24; h++) {
    const v = 0.7 + 0.6 * Math.sin((h / 24) * Math.PI * 4 - 0.6) + 0.05 * Math.sin(h);
    arr.push(Math.round(Math.max(0.1, v) * 100) / 100);
  }
  return arr;
};

// Nearby businesses (shown at zoom >= 1.5 and on Businesses screen)
window.BUSINESSES = [
  { id: "b1", icon: "🏨", name: "Pousada Ondas do Mar", cat: "Hospedagem", dist: "280m", rating: 4.8, open: true,  x: 222, y: 248 },
  { id: "b2", icon: "🏄", name: "Maresias Surf School", cat: "Escola de surf", dist: "320m", rating: 4.9, open: true,  x: 258, y: 226 },
  { id: "b3", icon: "🍴", name: "Bar do Véio",          cat: "Bar & Restaurante", dist: "180m", rating: 4.6, open: true,  x: 246, y: 262 },
  { id: "b4", icon: "🛹", name: "Radical Store",        cat: "Surf shop", dist: "600m", rating: 4.5, open: false, x: 274, y: 254 },
];

// Crew — amigos que podem ser convidados para uma surftrip
window.FRIENDS = [
  { id: "MK", name: "Marcos" },
  { id: "TF", name: "Thiago" },
  { id: "JP", name: "João P." },
  { id: "BR", name: "Bruna" },
  { id: "LC", name: "Lucas" },
];

// Contatos do celular (mock) — usados ao convidar alguém por telefone
window.PHONE_CONTACTS = [
  { name: "Bia Severino", phone: "(11) 99812-4470" },
  { name: "Caio Ramos", phone: "(12) 99745-1183" },
  { name: "Duda Fontes", phone: "(11) 99033-7726" },
  { name: "Felipe Aragão", phone: "(13) 98861-5092" },
  { name: "Gabriel Nunes", phone: "(11) 99657-2218" },
  { name: "Helena Prado", phone: "(12) 99124-8830" },
  { name: "Igor Brandão", phone: "(11) 99588-0143" },
  { name: "Lara Mendes", phone: "(13) 99270-6651" },
  { name: "Rafael Coelho", phone: "(11) 99412-3375" },
];

// Itens sugeridos para o orçamento de uma surftrip
window.BUDGET_SUGGESTIONS = [
  { icon: "⛽", name: "Combustível" },
  { icon: "🛣️", name: "Pedágio" },
  { icon: "🏨", name: "Hospedagem" },
  { icon: "🍽️", name: "Alimentação" },
  { icon: "🚐", name: "Transfer" },
  { icon: "✈️", name: "Passagem aérea" },
  { icon: "🚗", name: "Aluguel de carro" },
  { icon: "🛡️", name: "Seguro viagem" },
];

// Moedas para o conversor (rate = quanto vale 1 unidade em BRL)
window.CURRENCIES = [
  { code: "BRL", sym: "R$",  name: "Real",       rate: 1 },
  { code: "USD", sym: "US$", name: "Dólar",      rate: 5.42 },
  { code: "EUR", sym: "€",   name: "Euro",       rate: 5.88 },
  { code: "AUD", sym: "A$",  name: "Dólar AUS",  rate: 3.58 },
  { code: "IDR", sym: "Rp",  name: "Rupia (Bali)", rate: 0.00034 },
];

// Trips
window.TRIPS = [
  {
    id: "t1", name: "Maresias Trip", status: "confirmada", dates: "7–9 Jun", peakId: "maresias",
    avatars: ["RL", "MK", "TF"], extra: 2,
    forecast: "Dom: 2.4m perfeita",
    chat: [
      { who: "RL", me: false, text: "Bora subir sábado de madrugada? Swell tá perfeito 🤙" },
      { who: "Eu", me: true,  text: "Fechou! Levo a prancha extra pro TF" },
    ],
  },
  {
    id: "t2", name: "Itamambuca Crew", status: "planejando", dates: "20–22 Jun", peakId: "itamambuca",
    avatars: ["MK", "JP"], extra: 0,
    forecast: null, chat: [],
  },
];

// Litoral Norte SP climatology (Hemisfério Sul). Best waves in winter (S swells).
window.MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Favorable upcoming days for a peak, given the user's surf profile.
// Returns the FORECAST entries (future only) where the personalized condition is perfeita/otima.
window.favorableDays = function (peak, surf) {
  if (!peak) return [];
  const tub = window.isTubular(peak);
  return window.FORECAST.filter((d) => {
    if (d.past || d.day === "Hoje") return false;
    const k = window.personalCondFor({ height: d.h, period: d.t, wind: d.wind,
      difficulty: peak.difficulty, tubular: tub, swellDir: d.dir }, surf);
    return k === "perfeita" || k === "otima";
  });
};

// Alert payload for the preferred peak (or null if nothing favorable coming up).
window.preferredAlert = function (surf) {
  if (!surf || !surf.favPeak) return null;
  const peak = window.PEAKS.find((p) => p.id === surf.favPeak);
  if (!peak) return null;
  const days = window.favorableDays(peak, surf);
  if (!days.length) return null;
  const labels = days.slice(0, 3).map((d) => d.date);
  let when;
  if (labels.length === 1) when = labels[0];
  else when = labels.slice(0, -1).join(", ") + " e " + labels[labels.length - 1];
  return { peak, days, count: days.length,
    message: `${peak.name} está com ótimas condições para os dias ${when}` };
};


window.buildClimate = function (peak) {
  const baseH = [1.0, 1.1, 1.3, 1.5, 1.7, 1.9, 2.0, 1.9, 1.6, 1.4, 1.2, 1.0];
  const waterT = [26, 26, 25, 24, 22, 21, 20, 20, 21, 22, 24, 25];
  const airT   = [30, 30, 28, 26, 23, 22, 22, 23, 24, 26, 28, 29];
  const rain   = [15, 13, 12, 9, 7, 6, 5, 5, 8, 10, 12, 14];
  const scale = peak.height / 1.7;
  const months = window.MONTHS_PT.map((m, i) => {
    const h = Math.round(baseH[i] * scale * 10) / 10;
    let r = (h / 2.2) * 3.2 + (rain[i] < 8 ? 1.3 : 0.4) + 0.4;
    r = Math.max(1, Math.min(5, Math.round(r * 2) / 2));
    return { m, idx: i, h, wt: waterT[i], at: airT[i], rain: rain[i], rating: r };
  });

  const SEASON_META = [
    { key: "verao", label: "Verão", icon: "☀️", range: "Dez–Fev", mIdx: [11, 0, 1], level: "Iniciante",
      vibe: "Água quente e ondas menores. Mar mais cheio e dias longos — ideal para quem está começando." },
    { key: "outono", label: "Outono", icon: "🍂", range: "Mar–Mai", mIdx: [2, 3, 4], level: "Intermediário",
      vibe: "Ventos limpos de manhã e os primeiros swells consistentes. Ótimo custo-benefício e menos gente." },
    { key: "inverno", label: "Inverno", icon: "❄️", range: "Jun–Ago", mIdx: [5, 6, 7], level: "Avançado",
      vibe: "Pico das ondulações de sul: maiores e mais potentes, com terral. Água fria, pede neoprene." },
    { key: "primavera", label: "Primavera", icon: "🌸", range: "Set–Nov", mIdx: [8, 9, 10], level: "Intermediário",
      vibe: "Ventos variáveis e ondas moderadas. Água esquentando e praias ainda tranquilas." },
  ];
  const avg = (arr) => arr.reduce((s, x) => s + x, 0) / arr.length;
  const seasons = SEASON_META.map((sm) => {
    const ms = sm.mIdx.map((i) => months[i]);
    const wts = ms.map((x) => x.wt);
    return {
      ...sm,
      h: Math.round(avg(ms.map((x) => x.h)) * 10) / 10,
      wtMin: Math.min(...wts), wtMax: Math.max(...wts),
      wind: Math.round(avg(ms.map((x) => x.rain))) , // placeholder unused
      rain: Math.round(avg(ms.map((x) => x.rain))),
      rating: Math.round(avg(ms.map((x) => x.rating)) * 2) / 2,
      wetsuit: Math.min(...wts) <= 21 ? "Long john / 3.2mm" : (Math.min(...wts) <= 23 ? "Long john fino" : "Lycra / sunga"),
    };
  });
  const best = seasons.reduce((a, b) => (b.rating > a.rating ? b : a), seasons[0]);
  return { months, seasons, best };
};

// Profile
window.PROFILE = {
  name: "Rafael Lima",
  subtitle: "Intermediário · Shortboard 6'2\"",
  // account (editable on the profile edit screen)
  account: { displayName: "Rafael Lima", email: "rafael.lima@email.com", avatar: "dogtown", heroBg: "ocean", hasPassword: true, google: false },
  // machine-readable surf profile that drives personalization
  surf: { personalize: true, level: "Intermediário", board: "Shortboard 6'2\"",
    idealMin: 1.5, idealMax: 2.5, minPeriod: 10, formation: "Tubular", dirs: ["SSE", "S"], coldOk: true,
    favPeak: "maresias" },
  tags: ["Tubos", "Ondas longas", "Água fria ok", "Madrugada", "SSE/S"],
  prefs: [
    { k: "Nível", v: "Intermediário" },
    { k: "Prancha", v: "Shortboard 6'2\"" },
    { k: "Ondas ideais", v: "1.5m – 2.5m" },
    { k: "Formação", v: "Tubular" },
    { k: "Período mínimo", v: "10s" },
    { k: "Direções preferidas", v: "SSE / S" },
  ],
  favorites: [
    { name: "Maresias", tag: "Principal" },
    { name: "Itamambuca", tag: null },
    { name: "Juqueí", tag: null },
    { name: "Barra do Una", tag: null },
    { name: "Camburi", tag: null },
  ],
  notifications: [
    { k: "Swell ideal", state: "Ativo", on: true },
    { k: "Alertas de trip", state: "Ativo", on: true },
    { k: "Promoções locais", state: "Inativo", on: false },
  ],
};
// AVATAR_CHOICES is defined in avatars.jsx (illustration ids)

// Incoming surftrip invites (you were invited). Shown as "Surftrip convidada".
window.INVITES = [
  {
    id: "inv1", name: "Itamambuca no feriado", peakId: "itamambuca", dates: "13–15 Jun",
    host: { id: "MK", name: "Marcos" }, avatars: ["MK", "JP", "BR"],
    forecast: "Sex: 2.2m perfeita", note: "Aluguei uma casa pra galera, só trazer a prancha 🤙",
    via: "whatsapp",
  },
];

