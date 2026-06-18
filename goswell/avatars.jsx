// ===== GoSwell avatar illustrations — surf/skate counterculture busts =====
// Screenprint style: bold black outlines, flat retro fills. 70s peace&love +
// 90s Dogtown rebellion, across ages and genders.

const A_BLACK = "#1A160F";

// id -> flat background + short label
window.ILLUS_DEF = {
  seventies: { bg: "#F2B33D", halo: "#F7C863", label: "Hippie 70s" },
  dogtown:   { bg: "#239A8C", halo: "#37B0A1", label: "Dogtown" },
  flower:    { bg: "#EE6C4D", halo: "#F2856B", label: "Flower" },
  punk:      { bg: "#8A5BA6", halo: "#9E72B7", label: "Punk" },
  oldsalt:   { bg: "#4E97C4", halo: "#67ABD4", label: "Veterano" },
  skull:     { bg: "#D8443A", halo: "#E45F55", label: "Skull" },
  grom:      { bg: "#4AA050", halo: "#5FB565", label: "Grom" },
  shades:    { bg: "#EFE3C8", halo: "#F7EFDC", label: "Z-Boy" },
};
window.AVATAR_CHOICES = ["seventies", "dogtown", "flower", "punk", "oldsalt", "skull", "grom", "shades"];

// Profile hero backgrounds (gradients + screenprint patterns). id "ocean" is the default.
window.HERO_BGS = [
  { id: "ocean",  label: "Oceano",  css: "linear-gradient(150deg,#08A0F8 0%,#1A4F9E 45%,#0A2A4A 100%)" },
  { id: "sunset", label: "Sunset",  css: "linear-gradient(150deg,#FFB347 0%,#EE6C4D 50%,#D8443A 100%)" },
  { id: "teal",   label: "Maré",    css: "linear-gradient(150deg,#3FD0B8 0%,#239A8C 50%,#0E5A52 100%)" },
  { id: "dusk",   label: "Crepúsculo", css: "linear-gradient(150deg,#A06BFF 0%,#6C3FB0 50%,#2A1A4A 100%)" },
  { id: "dawn",   label: "Amanhecer", css: "linear-gradient(150deg,#FF8FB1 0%,#FF6B6B 45%,#C2456E 100%)" },
  { id: "night",  label: "Noite",   css: "linear-gradient(150deg,#1E2A44 0%,#111726 60%,#070B14 100%)" },
  { id: "stripe", label: "Retrô",   css: "repeating-linear-gradient(120deg,#EE6C4D 0 22px,#F2B33D 22px 44px,#239A8C 44px 66px,#08A0F8 66px 88px)" },
  { id: "lime",   label: "Lima",    css: "linear-gradient(150deg,#9BE15D 0%,#4AA050 50%,#1F6B3A 100%)" },
];
window.heroBgCss = function (val) {
  if (typeof val === "string" && val.indexOf("data:") === 0) return null; // image handled separately
  const found = window.HERO_BGS.find((b) => b.id === val);
  return (found || window.HERO_BGS[0]).css;
};

function personaArt(id) {
  switch (id) {
    // 70s hippie dude — long hair, headband, mustache, mellow
    case "seventies":
      return (
        <g stroke={A_BLACK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M24 46 Q19 84 32 102 L68 102 Q81 84 76 46 Q76 18 50 18 Q24 18 24 46Z" fill="#7A4F2E" />
          <path d="M21 102 Q24 78 41 74 L59 74 Q76 78 79 102Z" fill="#E2533B" />
          <path d="M44 64 h12 v11 q-6 4 -12 0Z" fill="#D99E68" />
          <path d="M31 45 Q31 69 50 69 Q69 69 69 45 Q69 25 50 25 Q31 25 31 45Z" fill="#E8B07A" />
          <path d="M28 47 Q26 26 50 24 Q74 26 72 47 Q63 34 50 34 Q37 34 28 47Z" fill="#7A4F2E" />
          <path d="M29 42 Q50 34 71 42 L71 49 Q50 41 29 49Z" fill="#D8443A" />
          <path d="M39 50 q4 -3.5 8 0" />
          <path d="M53 50 q4 -3.5 8 0" />
          <path d="M50 50 l0 6" />
          <path d="M40 60 Q50 67 60 60 Q50 57 40 60Z" fill="#5A3A20" />
          <path d="M44 64 Q50 67 56 64" />
        </g>
      );
    // 90s Dogtown skater — snapback cap, defiant smirk
    case "dogtown":
      return (
        <g stroke={A_BLACK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M19 102 Q22 76 41 71 L59 71 Q78 76 81 102Z" fill="#33373F" />
          <path d="M44 62 h12 v11 q-6 4 -12 0Z" fill="#D99E68" />
          <path d="M32 47 Q32 69 50 69 Q68 69 68 47 Q68 37 50 37 Q32 37 32 47Z" fill="#E8B07A" />
          <circle cx="31" cy="50" r="4" fill="#E8B07A" />
          <circle cx="69" cy="50" r="4" fill="#E8B07A" />
          <path d="M27 40 Q27 17 50 17 Q73 17 73 40 Q50 31 27 40Z" fill="#D8443A" />
          <path d="M25 40 Q43 35 50 37 L46 43 Q35 41 27 45Z" fill="#A82A24" />
          <path d="M38 47 q5 -2 9 0" stroke={A_BLACK} strokeWidth="3.4" />
          <path d="M53 47 q5 -2 9 0" stroke={A_BLACK} strokeWidth="3.4" />
          <circle cx="43" cy="52" r="1.8" fill={A_BLACK} stroke="none" />
          <circle cx="57" cy="52" r="1.8" fill={A_BLACK} stroke="none" />
          <path d="M43 60 Q51 64 59 58" />
        </g>
      );
    // 70s surfer girl — long blonde hair, flower, freckles
    case "flower":
      return (
        <g stroke={A_BLACK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M22 44 Q17 86 30 102 L70 102 Q83 86 78 44 Q78 16 50 16 Q22 16 22 44Z" fill="#EBC55C" />
          <path d="M24 102 Q26 80 43 76 L57 76 Q74 80 76 102Z" fill="#F2E7CE" />
          <path d="M44 64 h12 v11 q-6 4 -12 0Z" fill="#F0C49A" />
          <path d="M32 46 Q32 70 50 70 Q68 70 68 46 Q68 27 50 27 Q32 27 32 46Z" fill="#F0C49A" />
          <path d="M30 48 Q27 26 50 24 Q73 26 70 48 Q61 33 50 33 Q39 33 30 48Z" fill="#EBC55C" />
          <g stroke="none">
            <circle cx="68" cy="40" r="3.4" fill="#F2E7CE" />
            <circle cx="74" cy="44" r="3.4" fill="#F2E7CE" />
            <circle cx="72" cy="50" r="3.4" fill="#F2E7CE" />
            <circle cx="66" cy="48" r="3.4" fill="#F2E7CE" />
            <circle cx="70" cy="44" r="2.6" fill="#EE6C4D" />
          </g>
          <circle cx="43" cy="49" r="2.2" fill={A_BLACK} stroke="none" />
          <circle cx="58" cy="49" r="2.2" fill={A_BLACK} stroke="none" />
          <path d="M40 45 q3 -2 6 -0.5" />
          <path d="M55 45 q3 -2.5 6 -0.5" />
          <g stroke="none" fill="#D98A5A">
            <circle cx="38" cy="56" r="1.1" /><circle cx="42" cy="58" r="1.1" />
            <circle cx="62" cy="56" r="1.1" /><circle cx="58" cy="58" r="1.1" />
          </g>
          <path d="M44 60 Q50 65 56 60" />
        </g>
      );
    // 90s skater girl — beanie + round black shades, attitude
    case "punk":
      return (
        <g stroke={A_BLACK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M24 102 Q22 70 36 64 L40 74 L50 66 L60 74 L64 64 Q78 70 76 102Z" fill="#2C2A33" />
          <path d="M30 48 L24 70 L33 66Z" fill="#5A3A2E" />
          <path d="M70 48 L76 70 L67 66Z" fill="#5A3A2E" />
          <path d="M44 62 h12 v10 q-6 4 -12 0Z" fill="#E0A877" />
          <path d="M33 48 Q33 68 50 68 Q67 68 67 48 Q67 40 50 40 Q33 40 33 48Z" fill="#EFBE89" />
          <path d="M28 42 Q28 24 50 24 Q72 24 72 42 Q50 35 28 42Z" fill="#F2B33D" />
          <path d="M28 41 Q50 34 72 41 L72 47 Q50 40 28 47Z" fill="#E0982C" />
          <circle cx="42" cy="50" r="6" fill={A_BLACK} />
          <circle cx="60" cy="50" r="6" fill={A_BLACK} />
          <path d="M48 50 h6" />
          <path d="M44 61 Q52 64 59 60" />
        </g>
      );
    // Grizzled veteran — bucket hat, big beard
    case "oldsalt":
      return (
        <g stroke={A_BLACK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M22 102 Q24 80 40 76 L60 76 Q76 80 78 102Z" fill="#C9743C" />
          <path d="M33 44 Q33 52 38 56 Q34 86 50 90 Q66 86 62 56 Q67 52 67 44 Q67 30 50 30 Q33 30 33 44Z" fill="#D7D1C2" />
          <path d="M35 46 Q35 40 50 40 Q65 40 65 46 Q65 52 60 54 Q55 50 50 50 Q45 50 40 54 Q35 52 35 46Z" fill="#E0A877" />
          <path d="M26 40 Q26 26 50 26 Q74 26 74 40 Q50 33 26 40Z" fill="#6E7A4B" />
          <path d="M22 40 Q50 31 78 40 L78 46 Q50 38 22 46Z" fill="#586139" />
          <path d="M40 45 q4 2 7 0" />
          <path d="M53 45 q4 2 7 0" />
          <circle cx="43.5" cy="47" r="1.7" fill={A_BLACK} stroke="none" />
          <circle cx="56.5" cy="47" r="1.7" fill={A_BLACK} stroke="none" />
        </g>
      );
    // Dogtown skeleton — backwards cap, long red hair, teeth grin
    case "skull":
      return (
        <g stroke={A_BLACK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M60 34 Q88 40 92 66 Q80 58 66 60 Q78 66 80 82 Q66 70 58 66Z" fill="#9A3B22" />
          <path d="M24 100 Q30 84 44 84 L58 84 Q70 84 74 100Z" fill="#E8E2D4" />
          <path d="M32 50 Q32 74 50 78 Q68 74 68 50 Q68 30 50 30 Q32 30 32 50Z" fill="#F2EEE2" />
          <path d="M37 74 Q37 84 50 84 Q63 84 63 74 Q58 78 50 78 Q42 78 37 74Z" fill="#F2EEE2" />
          <path d="M27 36 Q27 18 50 18 Q73 18 73 36 Q50 28 27 36Z" fill="#3F7A3A" />
          <path d="M27 36 Q50 28 73 36 L73 42 Q50 34 27 42Z" fill="#2E5C2B" />
          <rect x="44" y="36" width="12" height="7" rx="2" fill="#2E5C2B" stroke="none" />
          <path d="M37 50 Q40 45 46 50 Q40 55 37 50Z" fill={A_BLACK} stroke="none" />
          <path d="M54 50 Q60 45 63 50 Q57 55 54 50Z" fill={A_BLACK} stroke="none" />
          <path d="M48 56 l-3 6 h6Z" fill={A_BLACK} stroke="none" />
          <path d="M40 68 h20 M44 68 v6 M50 68 v6 M56 68 v6" strokeWidth="2.2" />
        </g>
      );
    // Young grom — cap, freckles, zinc nose, big stoked smile
    case "grom":
      return (
        <g stroke={A_BLACK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M24 102 Q26 80 41 76 L59 76 Q74 80 76 102Z" fill="#2D8BD4" />
          <path d="M45 66 h10 v9 q-5 3 -10 0Z" fill="#E8B07A" />
          <path d="M34 50 Q34 72 50 72 Q66 72 66 50 Q66 42 50 42 Q34 42 34 50Z" fill="#F0C088" />
          <circle cx="34" cy="53" r="3.6" fill="#F0C088" />
          <circle cx="66" cy="53" r="3.6" fill="#F0C088" />
          <path d="M30 44 Q30 26 50 26 Q70 26 70 44 Q50 36 30 44Z" fill="#EE6C4D" />
          <path d="M28 44 Q44 39 52 41 L48 47 Q36 45 30 49Z" fill="#C84A2E" />
          <circle cx="43" cy="52" r="2.3" fill={A_BLACK} stroke="none" />
          <circle cx="57" cy="52" r="2.3" fill={A_BLACK} stroke="none" />
          <path d="M47 54 q3 4 6 0" fill="#F2E7CE" />
          <path d="M42 62 Q50 70 58 62" fill="#B5302A" />
          <path d="M44 64 Q50 67 56 64" stroke="#F2E7CE" strokeWidth="2" />
          <g stroke="none" fill="#D98A5A">
            <circle cx="39" cy="59" r="1.1" /><circle cx="43" cy="61" r="1.1" />
            <circle cx="61" cy="59" r="1.1" /><circle cx="57" cy="61" r="1.1" />
          </g>
        </g>
      );
    // Z-Boy minimalist — bandana, round shades, long hair (b/w line on cream)
    case "shades":
      return (
        <g stroke={A_BLACK} strokeWidth="3.2" strokeLinejoin="round" strokeLinecap="round" fill="none">
          <path d="M30 50 Q24 76 40 100 L66 100 Q66 72 58 60Z" fill={A_BLACK} />
          <path d="M58 52 Q82 56 88 72 Q74 64 60 66Z" fill={A_BLACK} />
          <path d="M44 64 h10 v9 q-5 3 -10 0Z" fill="#E7D9BC" />
          <path d="M34 48 Q34 70 50 70 Q66 70 66 48 Q66 34 50 34 Q34 34 34 48Z" fill="#E7D9BC" />
          <path d="M30 38 Q30 24 50 24 Q70 24 70 38 Q50 31 30 38Z" fill="#E7D9BC" />
          <path d="M28 36 Q50 29 72 36 L72 41 Q50 34 28 41Z" fill={A_BLACK} stroke="none" />
          <circle cx="42" cy="49" r="6" fill={A_BLACK} />
          <circle cx="60" cy="49" r="6" fill={A_BLACK} />
          <path d="M48 49 h6" />
          <path d="M43 60 Q51 63 58 59" />
        </g>
      );
    default:
      return null;
  }
}

// Renders an avatar value: data-URL photo, persona id, or legacy fallback.
function AvatarGlyph({ id }) {
  if (typeof id === "string" && id.indexOf("data:") === 0) {
    return <img src={id} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
  }
  const def = window.ILLUS_DEF[id];
  if (!def) {
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#08A0F8,#00C896)", fontSize: 22 }}>{typeof id === "string" ? id : "🌊"}</div>
    );
  }
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block" }} preserveAspectRatio="xMidYMid slice">
      <rect width="100" height="100" fill={def.bg} />
      <circle cx="50" cy="42" r="33" fill={def.halo} />
      {personaArt(id)}
    </svg>
  );
}

Object.assign(window, { AvatarGlyph, personaArt });
