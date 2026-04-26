/* ============================================================
   AUTO ORI! — Shared components, data, game logic
   All exports go to window for use in Auto ORI.html
============================================================ */

/* ── Tokens ─────────────────────────────────────────────── */
const C = {
  bg:         "#090A0C",
  surface:    "#111318",
  surfaceHi:  "#181C25",
  border:     "rgba(255,255,255,0.07)",
  borderHi:   "rgba(255,255,255,0.12)",
  text:       "#F0F2F7",
  primary:    "#C6FF3D",
  accent:     "#FF7A45",
  danger:     "#FF2D55",
};

const a = (hex, op) => {
  const n = parseInt(hex.replace("#",""), 16);
  return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${op})`;
};

const T = {
  muted:  a(C.text, 0.50),
  faint:  a(C.text, 0.30),
};

/* ── Global CSS ──────────────────────────────────────────── */
const FONT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');
*,*::before,*::after{box-sizing:border-box;}
.fd{font-family:'Unbounded',sans-serif;letter-spacing:-0.02em;}
.fb{font-family:'Manrope',sans-serif;}
.fm{font-family:'JetBrains Mono',monospace;font-feature-settings:'tnum';}
.lbl{letter-spacing:0.10em;text-transform:uppercase;}

@keyframes fadeIn    {from{opacity:0}to{opacity:1}}
@keyframes slideUp   {from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}
@keyframes slideDown {from{transform:translateY(-16px);opacity:0}to{transform:none;opacity:1}}
@keyframes sheetUp   {from{transform:translateY(100%)}to{transform:translateY(0)}}
@keyframes cardIn    {from{transform:translateX(40px) scale(.97);opacity:0}to{transform:none;opacity:1}}
@keyframes slam      {0%{transform:scale(.5) translateY(-12px);opacity:0}60%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}
@keyframes bustPulse {0%,100%{background:#090A0C}40%{background:#200810}80%{background:#130508}}
@keyframes glow      {0%,100%{text-shadow:none}50%{text-shadow:0 0 20px rgba(198,255,61,.55)}}
@keyframes danger    {0%,100%{opacity:1}50%{opacity:.55}}
@keyframes countUp   {from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes chargePip {0%{transform:scale(.7);opacity:.4}100%{transform:scale(1);opacity:1}}

.af    {animation:fadeIn 260ms ease both}
.asu   {animation:slideUp 300ms cubic-bezier(.2,.9,.25,1) both}
.asd   {animation:slideDown 300ms cubic-bezier(.2,.9,.25,1) both}
.ash   {animation:sheetUp 340ms cubic-bezier(.2,.9,.25,1) both}
.aci   {animation:cardIn 400ms cubic-bezier(.22,1,.36,1) both}
.aslam {animation:slam 420ms cubic-bezier(.34,1.56,.64,1) both}
.acu   {animation:countUp 280ms ease both}
.aglow {animation:glow 2.4s ease-in-out infinite}
.adanger{animation:danger 1.5s ease-in-out infinite}
.apip  {animation:chargePip 260ms cubic-bezier(.34,1.56,.64,1) both}
`;

/* ── Game constants ──────────────────────────────────────── */
const MM = {
  BASE:        500,
  STRIKE_THRESHOLD: 0.50,
  MAX_STRIKES: 2,
  CHECKPOINT:  5,
  MULT_CAP:    128,
};

/* ── Scoring tiers ───────────────────────────────────────── */
const TIERS = [
  { max:0.01, id:"ORI_PERFECT",   label:"ORI! PERFECT",   mult:3.0 },
  { max:0.03, id:"SUPER_PERFECT", label:"SUPER PERFECT",  mult:2.0 },
  { max:0.05, id:"PERFECT",       label:"PERFECT",        mult:1.5 },
  { max:0.10, id:"GREAT",         label:"GREAT",          mult:1.0 },
  { max:0.15, id:"SOLID",         label:"SOLID",          mult:0.7 },
  { max:0.30, id:"GOOD",          label:"GOOD",           mult:0.35},
  { max:0.50, id:"LOW_HIT",       label:"LOW HIT",        mult:0.15},
];
const getTier = (err) => TIERS.find(t => err <= t.max) || null;

/* resolveHit — NO multiplier management here; handled by App at checkpoints */
const resolveHit = (guess, actual, currentMult, currentStrikes) => {
  const err    = Math.abs(guess - actual) / actual;
  const errPct = Math.round(err * 1000) / 10;
  const errSigned = (guess - actual) / actual; // signed, for error bar

  if (err > MM.STRIKE_THRESHOLD) {
    const newStrikes = currentStrikes + 1;
    return {
      tier:"STRIKE", label:"STRIKE",
      bust: newStrikes >= MM.MAX_STRIKES,
      strikeAdded:true,
      accuracyMult:0, points:0,
      err, errPct, errSigned,
      newStrikes,
    };
  }

  const t = getTier(err);
  const points = Math.round(MM.BASE * t.mult * currentMult);
  return {
    tier:t.id, label:t.label,
    bust:false, strikeAdded:false,
    accuracyMult:t.mult, points,
    err, errPct, errSigned,
    newStrikes: currentStrikes,
  };
};

/* ── Car image helper — brand tag + lock for consistency ── */
const mkImg = (brand, lock) =>
  `https://loremflickr.com/800/500/${encodeURIComponent(brand)},car/all?lock=${lock}`;

/* ── Car data ────────────────────────────────────────────── */
const MAIN_POOL = [
  { brand:"PEUGEOT",    model:"208",       year:2019, mileage:45000, actual:14200, min:4000,  max:30000, imageUrl:mkImg("peugeot",  101) },
  { brand:"RENAULT",    model:"CLIO V",    year:2021, mileage:28000, actual:15800, min:6000,  max:32000, imageUrl:mkImg("renault",  102) },
  { brand:"CITROËN",    model:"C3",        year:2018, mileage:72000, actual:9400,  min:3000,  max:22000, imageUrl:mkImg("citroen",  103) },
  { brand:"VOLKSWAGEN", model:"GOLF 7",    year:2020, mileage:51000, actual:18900, min:6000,  max:38000, imageUrl:mkImg("volkswagen",104) },
  { brand:"DACIA",      model:"SANDERO",   year:2022, mileage:12000, actual:11800, min:4000,  max:24000, imageUrl:mkImg("dacia",    105) },
  { brand:"RENAULT",    model:"MEGANE IV", year:2019, mileage:62000, actual:14500, min:5000,  max:30000, imageUrl:mkImg("renault",  106) },
  { brand:"PEUGEOT",    model:"3008",      year:2020, mileage:38000, actual:22400, min:9000,  max:42000, imageUrl:mkImg("peugeot",  107) },
  { brand:"CITROËN",    model:"C4",        year:2021, mileage:24000, actual:17200, min:6000,  max:34000, imageUrl:mkImg("citroen",  108) },
  { brand:"FORD",       model:"FIESTA",    year:2017, mileage:88000, actual:8900,  min:3000,  max:20000, imageUrl:mkImg("ford",     109) },
  { brand:"OPEL",       model:"CORSA",     year:2020, mileage:31000, actual:13500, min:5000,  max:26000, imageUrl:mkImg("opel",     110) },
  { brand:"TOYOTA",     model:"YARIS",     year:2019, mileage:47000, actual:12800, min:4000,  max:25000, imageUrl:mkImg("toyota",   111) },
  { brand:"BMW",        model:"SERIE 1",   year:2018, mileage:65000, actual:18500, min:7000,  max:38000, imageUrl:mkImg("bmw",      112) },
  { brand:"MERCEDES",   model:"CLASSE A",  year:2019, mileage:42000, actual:22800, min:9000,  max:45000, imageUrl:mkImg("mercedes", 113) },
  { brand:"AUDI",       model:"A3",        year:2020, mileage:35000, actual:24900, min:10000, max:48000, imageUrl:mkImg("audi",     114) },
  { brand:"FIAT",       model:"500",       year:2018, mileage:54000, actual:9200,  min:3000,  max:20000, imageUrl:mkImg("fiat",     115) },
  { brand:"SEAT",       model:"IBIZA",     year:2020, mileage:28000, actual:14100, min:5000,  max:28000, imageUrl:mkImg("seat",     116) },
  { brand:"SKODA",      model:"FABIA",     year:2019, mileage:41000, actual:11900, min:4000,  max:24000, imageUrl:mkImg("skoda",    117) },
  { brand:"HYUNDAI",    model:"i20",       year:2021, mileage:18000, actual:15400, min:6000,  max:30000, imageUrl:mkImg("hyundai",  118) },
  { brand:"KIA",        model:"PICANTO",   year:2020, mileage:22000, actual:10800, min:4000,  max:22000, imageUrl:mkImg("kia",      119) },
  { brand:"MINI",       model:"COOPER",    year:2019, mileage:37000, actual:18900, min:7000,  max:36000, imageUrl:mkImg("mini",     120) },
  { brand:"VOLVO",      model:"XC40",      year:2021, mileage:26000, actual:32400, min:14000, max:58000, imageUrl:mkImg("volvo",    121) },
  { brand:"PEUGEOT",    model:"2008",      year:2020, mileage:32000, actual:18200, min:7000,  max:36000, imageUrl:mkImg("peugeot",  122) },
  { brand:"RENAULT",    model:"CAPTUR II", year:2021, mileage:24000, actual:19400, min:8000,  max:38000, imageUrl:mkImg("renault",  123) },
  { brand:"DACIA",      model:"DUSTER",    year:2019, mileage:48000, actual:13800, min:5000,  max:28000, imageUrl:mkImg("dacia",    124) },
  { brand:"VOLKSWAGEN", model:"POLO",      year:2019, mileage:38000, actual:14700, min:5000,  max:28000, imageUrl:mkImg("volkswagen",125) },
  { brand:"VOLKSWAGEN", model:"T-ROC",     year:2021, mileage:22000, actual:26800, min:11000, max:50000, imageUrl:mkImg("volkswagen",126) },
];

/* ── Leaderboard ─────────────────────────────────────────── */
const LB_NAMES = [
  "Lea M.","Karim B.","Samira A.","Thomas D.","Amelie F.",
  "Julien R.","Nour K.","Mathis V.","Chloe P.","Erwan L.",
  "Camille D.","Hugo B.","Ines M.","Maxime C.","Sophie T.",
  "Lucas G.","Emma N.","Nathan P.","Alice R.","Antoine S.",
];
const MAIN_LEADERBOARD = (() => {
  const arr = [];
  let s = 24500;
  for (let i = 0; i < 20; i++) {
    arr.push({ r:i+1, n:LB_NAMES[i], s });
    s -= 80 + ((i * 23) % 120);
  }
  return arr;
})();

const RECENT_RUNS = [
  { id:"M-118", date:"19 avr", score:12400, percentile:18 },
  { id:"M-117", date:"18 avr", score:8200,  percentile:34 },
  { id:"M-116", date:"17 avr", score:5840,  percentile:52 },
  { id:"M-115", date:"16 avr", score:14100, percentile:12 },
  { id:"M-114", date:"15 avr", score:7680,  percentile:38 },
];

/* ── Helpers ─────────────────────────────────────────────── */
const fmtEUR = (n) =>
  new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
const fmtNum = (n) => new Intl.NumberFormat("fr-FR").format(n);
const computeRank = (score) => {
  if (score >= 20000) return Math.max(1, Math.round(100 - (score-20000)/200));
  if (score >= 10000) return Math.round(2000 - (score-10000)*0.19);
  if (score >= 3000)  return Math.round(5000 - (score-3000)*0.43);
  return Math.round(9000 - score*1.3);
};
const computePct = (rank) => Math.max(1, Math.round((rank/9847)*100));
const pickNext = (prev) => {
  let idx = Math.floor(Math.random() * MAIN_POOL.length);
  if (idx === prev) idx = (idx+1) % MAIN_POOL.length;
  return idx;
};
const midGuess = (car) => Math.round(((car.min+car.max)/2)/100)*100;
const xpForBank = (banked, cars) => Math.round(banked/100) + cars*10;

/* ── Hooks ───────────────────────────────────────────────── */
const { useState, useEffect, useRef, useCallback } = React;

function useCountUp(target, duration, trigger) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (trigger == null) return;
    let start = null; let raf;
    const tick = (t) => {
      if (!start) start = t;
      const p = Math.min(1,(t-start)/duration);
      setV(Math.round(target*(1-Math.pow(1-p,3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, target, duration]);
  return v;
}

/* ── Price Ruler (input only) ────────────────────────────── */
function PriceRuler({ min, max, value, onChange, disabled=false }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const pct = ((value-min)/(max-min))*100;

  const getVal = useCallback((cx) => {
    const r = trackRef.current.getBoundingClientRect();
    return Math.round((min + Math.max(0,Math.min(1,(cx-r.left)/r.width))*(max-min))/100)*100;
  }, [min,max]);

  const onDown = (e) => { if(disabled) return; onChange(getVal(e.clientX)); setDragging(true); e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId); };
  const onMove = (e) => { if(!dragging) return; onChange(getVal(e.clientX)); };
  const onUp   = () => setDragging(false);

  return (
    <div style={{display:"flex",alignItems:"center",gap:10,userSelect:"none",width:"100%"}}>
      <span className="fm" style={{color:T.faint,fontSize:10,width:52,textAlign:"right",flexShrink:0}}>{fmtEUR(min)}</span>
      <div ref={trackRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
        style={{flex:1,height:48,position:"relative",cursor:disabled?"default":"pointer",touchAction:"none"}}>
        {/* Ticks */}
        <div style={{position:"absolute",top:"50%",left:0,right:0,display:"flex",justifyContent:"space-between",transform:"translateY(-50%)",pointerEvents:"none"}}>
          {Array.from({length:11},(_,i)=>(
            <div key={i} style={{width:1,height:i%5===0?16:6,background:i%5===0?a(C.text,.18):a(C.text,.07)}}/>
          ))}
        </div>
        <div style={{position:"absolute",top:"50%",left:0,right:0,height:2,transform:"translateY(-50%)",background:C.border,borderRadius:2,pointerEvents:"none"}}/>
        {!disabled && (
          <div style={{position:"absolute",top:"50%",left:0,height:3,transform:"translateY(-50%)",width:`${pct}%`,background:a(C.primary,.6),borderRadius:2,transition:dragging?"none":"width 80ms",pointerEvents:"none"}}/>
        )}
        {!disabled && (
          <div style={{position:"absolute",top:"50%",left:`${pct}%`,width:dragging?28:22,height:dragging?28:22,transform:"translate(-50%,-50%)",background:C.primary,borderRadius:"50%",boxShadow:dragging?`0 0 0 10px ${a(C.primary,.15)}`:`0 0 0 5px ${a(C.primary,.12)}`,transition:dragging?"none":"width 150ms cubic-bezier(.34,1.56,.64,1),height 150ms cubic-bezier(.34,1.56,.64,1)",pointerEvents:"none"}}/>
        )}
      </div>
      <span className="fm" style={{color:T.faint,fontSize:10,width:52,textAlign:"left",flexShrink:0}}>{fmtEUR(max)}</span>
    </div>
  );
}

/* ── Price Error Bar (reveal only) ───────────────────────── */
function PriceErrorBar({ actual, guess, animate }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setActive(true), 220);
    return () => clearTimeout(t);
  }, [animate]);

  // Track spans -50% … +50% error
  const RANGE   = 0.50;
  const errSigned = (guess - actual) / actual;          // signed ratio
  const errPctNum = Math.round(Math.abs(errSigned)*1000)/10;
  const clamped   = Math.max(-RANGE, Math.min(RANGE, errSigned));
  // Map [-RANGE, +RANGE] → [0%, 100%] on the track
  // Real price is always at 50%
  const finalGuessPct = 50 + (clamped / RANGE) * 50;
  const guessPct      = active ? finalGuessPct : 50;
  const isOver        = errSigned > 0;
  const sign          = isOver ? "+" : "-";
  const errLabel      = `${sign}${errPctNum}%`;

  // Gradient: green around 0%, shifts to red/orange at edges
  const gradientLeft  = Math.min(50, guessPct);
  const gradientRight = Math.max(50, guessPct);
  const gapWidth      = gradientRight - gradientLeft;

  // Dashed bracket dimensions (below track)
  const leftDash  = Math.min(50, guessPct);
  const rightDash = Math.max(50, guessPct);

  // Tick labels
  const ticks = [
    {pct:0,  label:"-50%"},
    {pct:25, label:"-25%"},
    {pct:50, label:"0%"},
    {pct:75, label:"+25%"},
    {pct:100,label:"+50%"},
  ];

  return (
    <div style={{padding:"0 6px"}}>
      {/* Price labels with arrows */}
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        {/* PRIX RÉEL — always at 50% = center, show left side */}
        <div style={{width:"50%",textAlign:"center",paddingRight:4}}>
          <div className="lbl" style={{fontSize:9,color:T.muted,fontFamily:"Manrope,sans-serif",letterSpacing:"0.09em"}}>PRIX RÉEL</div>
          <div className="fm" style={{fontSize:20,fontWeight:700,color:C.primary,lineHeight:1.1,marginTop:2}}>{fmtEUR(actual)}</div>
        </div>
        {/* TON PRIX */}
        <div style={{width:"50%",textAlign:"center",paddingLeft:4}}>
          <div className="lbl" style={{fontSize:9,color:T.muted,fontFamily:"Manrope,sans-serif",letterSpacing:"0.09em"}}>TON PRIX</div>
          <div className="fm" style={{fontSize:20,fontWeight:700,color:C.danger,lineHeight:1.1,marginTop:2}}>{fmtEUR(guess)}</div>
        </div>
      </div>

      {/* Down arrows pointing at dots */}
      <div style={{position:"relative",height:14,marginBottom:0}}>
        {/* Real arrow — always center */}
        <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",color:C.primary,fontSize:12,lineHeight:1}}>▼</div>
        {/* Guess arrow — animates */}
        <div style={{
          position:"absolute",
          left:`${guessPct}%`,
          transform:"translateX(-50%)",
          color:C.danger,fontSize:11,lineHeight:1,
          transition:active?"left 600ms cubic-bezier(.34,1.56,.64,1)":"none",
        }}>▼</div>
      </div>

      {/* ── Track ── */}
      <div style={{position:"relative",height:44}}>
        {/* Base track */}
        <div style={{position:"absolute",top:"50%",left:0,right:0,height:2,background:a(C.text,.1),transform:"translateY(-50%)",borderRadius:2}}/>

        {/* Gradient fill between real and guess */}
        {active && (
          <div style={{
            position:"absolute",top:"50%",height:3,borderRadius:2,
            left:`${gradientLeft}%`,width:`${gapWidth}%`,
            background:`linear-gradient(to ${isOver?"right":"left"}, ${C.primary}, ${C.accent}, ${C.danger})`,
            transform:"translateY(-50%)",
            transition:"left 600ms cubic-bezier(.34,1.56,.64,1), width 600ms cubic-bezier(.34,1.56,.64,1)",
          }}/>
        )}

        {/* Real price dot — green, center */}
        <div style={{
          position:"absolute",top:"50%",left:"50%",
          width:16,height:16,borderRadius:"50%",
          background:C.primary,transform:"translate(-50%,-50%)",
          boxShadow:`0 0 12px ${a(C.primary,.6)}`,zIndex:2,
        }}/>

        {/* Guess dot — red, animates from center */}
        <div style={{
          position:"absolute",top:"50%",
          left:`${guessPct}%`,
          width:14,height:14,borderRadius:"50%",
          background:C.danger,transform:"translate(-50%,-50%)",
          boxShadow:`0 0 10px ${a(C.danger,.5)}`,
          transition:active?"left 600ms cubic-bezier(.34,1.56,.64,1)":"none",
          zIndex:3,
        }}/>

        {/* Tick marks */}
        {ticks.map(({pct,label})=>(
          <div key={pct} style={{position:"absolute",top:0,left:`${pct}%`,transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",pointerEvents:"none"}}>
            <div style={{height:label==="0%"?14:8,width:1,background:label==="0%"?a(C.text,.3):a(C.text,.12),marginTop:label==="0%"?0:3}}/>
          </div>
        ))}
      </div>

      {/* Dashed bracket below track */}
      {active && gapWidth > 2 && (
        <div style={{position:"relative",height:28}}>
          {/* Left vertical dashed */}
          <div style={{position:"absolute",left:`${leftDash}%`,top:0,width:1,height:18,background:`repeating-linear-gradient(to bottom, ${a(C.accent,.6)} 0px, ${a(C.accent,.6)} 4px, transparent 4px, transparent 8px)`,transition:"left 600ms cubic-bezier(.34,1.56,.64,1)"}}/>
          {/* Right vertical dashed */}
          <div style={{position:"absolute",left:`${rightDash}%`,top:0,width:1,height:18,background:`repeating-linear-gradient(to bottom, ${a(C.accent,.6)} 0px, ${a(C.accent,.6)} 4px, transparent 4px, transparent 8px)`,transition:"left 600ms cubic-bezier(.34,1.56,.64,1)"}}/>
          {/* Horizontal connector */}
          <div style={{position:"absolute",top:18,left:`${leftDash}%`,width:`${gapWidth}%`,height:1,background:a(C.accent,.4),transition:"left 600ms cubic-bezier(.34,1.56,.64,1), width 600ms cubic-bezier(.34,1.56,.64,1)"}}/>
        </div>
      )}

      {/* Tick labels row */}
      <div style={{position:"relative",height:16,marginBottom:8}}>
        {ticks.map(({pct,label})=>(
          <div key={pct} style={{
            position:"absolute",left:`${pct}%`,transform:"translateX(-50%)",
            fontFamily:"JetBrains Mono, monospace",fontSize:9,fontWeight:500,
            color:label==="0%"?a(C.text,.5):a(C.text,.25),
            whiteSpace:"nowrap",
          }}>{label}</div>
        ))}
      </div>

      {/* Pill badge */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,marginTop:2}}>
        <div style={{
          padding:"8px 22px",borderRadius:999,
          background:a(C.text,.07),border:`1px solid ${a(C.text,.12)}`,
        }}>
          <span className="fm" style={{fontSize:22,fontWeight:700,color:isOver?C.accent:C.primary}}>{errLabel}</span>
        </div>
        <div className="lbl" style={{fontSize:9,color:T.faint,fontFamily:"Manrope,sans-serif"}}>D'ÉCART</div>
      </div>
    </div>
  );
}

/* ── Car Card ─────────────────────────────────────────────── */
function CarCard({ car }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div style={{position:"relative",width:"100%",borderRadius:18,overflow:"hidden",background:C.surface,border:`1px solid ${C.border}`}}>
      {imgOk ? (
        <img src={car.imageUrl} alt={`${car.brand} ${car.model}`}
          onError={() => setImgOk(false)}
          style={{width:"100%",aspectRatio:"16/9",objectFit:"cover",display:"block"}}
        />
      ) : (
        <div style={{width:"100%",aspectRatio:"16/9",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:8}}>
          <svg width="80" height="48" viewBox="0 0 80 48" fill="none" style={{opacity:.15}}>
            <rect x="4" y="16" width="72" height="20" rx="4" stroke={C.text} strokeWidth="1.5"/>
            <path d="M12 16L20 6h40l8 10" stroke={C.text} strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="20" cy="38" r="6" stroke={C.text} strokeWidth="1.5"/>
            <circle cx="60" cy="38" r="6" stroke={C.text} strokeWidth="1.5"/>
            <rect x="26" y="8" width="11" height="7" rx="1" stroke={C.text} strokeWidth="1"/>
            <rect x="43" y="8" width="11" height="7" rx="1" stroke={C.text} strokeWidth="1"/>
          </svg>
          <span className="lbl" style={{fontSize:9,color:T.faint,fontFamily:"Manrope,sans-serif"}}>PHOTO</span>
        </div>
      )}
      {/* Gradient overlay bottom */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:"40%",background:`linear-gradient(to top, ${C.bg} 0%, transparent 100%)`,pointerEvents:"none"}}/>
    </div>
  );
}

/* ── Charge Bar ───────────────────────────────────────────── */
function ChargeBar({ charge }) {
  return (
    <div style={{display:"flex",gap:3,marginTop:5}}>
      {[0,1,2,3,4].map(i => (
        <div key={i} className={i < charge ? "apip" : ""} style={{
          flex:1,height:3,borderRadius:2,
          background: i < charge ? C.primary : a(C.text,.1),
          transition:"background 180ms",
          animationDelay:`${i*40}ms`,
        }}/>
      ))}
    </div>
  );
}

/* ── Stat Tile ────────────────────────────────────────────── */
function StatTile({ label, value, accent }) {
  return (
    <div style={{borderRadius:14,padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}`}}>
      <div className="lbl" style={{fontSize:8,color:T.faint,fontFamily:"Manrope,sans-serif"}}>{label}</div>
      <div className="fm" style={{color:accent?C.primary:C.text,fontSize:22,fontWeight:700,lineHeight:1.1,marginTop:4}}>{value}</div>
    </div>
  );
}

/* ── Bottom Nav ───────────────────────────────────────────── */
function BottomNav({ activeTab, onChange }) {
  return (
    <div style={{display:"flex",padding:"6px 8px 12px",background:C.bg,borderTop:`1px solid ${C.border}`,flexShrink:0}}>
      {[{id:"home",label:"ACCUEIL"},{id:"profile",label:"PROFIL"}].map(({id,label}) => {
        const active = activeTab===id;
        return (
          <button key={id} onClick={() => onChange(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"8px 0",borderRadius:12,border:"none",background:"none",cursor:"pointer",color:active?C.primary:T.muted}}>
            <div style={{width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {id==="home"
                ? <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M2 7L9 2l7 5v9H12v-5H6v5H2z"/></svg>
                : <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={active?2.2:1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="6" r="3"/><path d="M2 16c0-3.3 3.1-6 7-6s7 2.7 7 6"/></svg>
              }
            </div>
            <span className="fd lbl" style={{fontSize:7,fontWeight:700,color:active?C.primary:T.muted}}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ── Game HUD ─────────────────────────────────────────────── */
function GameHUD({ carsPlayed, multiplier, charge, strikes, unbanked }) {
  const highStake = unbanked > 3000;
  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",alignItems:"center",padding:"10px 16px 8px",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
      {/* Left */}
      <div>
        <div className="lbl" style={{fontSize:8,color:T.faint,fontFamily:"Manrope,sans-serif"}}>VOITURE</div>
        <div className="fm" style={{fontSize:22,fontWeight:700,color:C.text,lineHeight:1}}>{carsPlayed+1}</div>
        {strikes>0 && (
          <div className="lbl adanger" style={{fontSize:8,color:C.accent,marginTop:2,fontFamily:"Manrope,sans-serif"}}>
            {strikes}/{MM.MAX_STRIKES} STRIKE
          </div>
        )}
      </div>
      {/* Center: combo + charge */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
        <div className="lbl" style={{fontSize:7,color:T.faint,fontFamily:"Manrope,sans-serif"}}>COMBO</div>
        <div style={{padding:"5px 14px",borderRadius:999,background:multiplier>1?a(C.primary,.1):a(C.text,.04),border:`1px solid ${multiplier>1?a(C.primary,.3):C.border}`}}>
          <span className="fm" style={{fontSize:18,fontWeight:700,color:multiplier>1?C.primary:C.text}}>x{multiplier}</span>
        </div>
        <ChargeBar charge={charge}/>
        <div className="lbl" style={{fontSize:7,color:T.faint,fontFamily:"Manrope,sans-serif"}}>{charge}/5</div>
      </div>
      {/* Right */}
      <div style={{textAlign:"right"}}>
        <div className="lbl" style={{fontSize:8,color:T.faint,fontFamily:"Manrope,sans-serif"}}>EN JEU</div>
        <div className={`fm ${highStake?"aglow":""}`} style={{fontSize:20,fontWeight:700,color:C.primary,lineHeight:1}}>{fmtNum(unbanked)}</div>
        <div className="lbl" style={{fontSize:7,color:T.faint,fontFamily:"Manrope,sans-serif"}}>pts</div>
      </div>
    </div>
  );
}

/* ── Guess Tray ───────────────────────────────────────────── */
function GuessTray({ guess, setGuess, car, onValidate }) {
  return (
    <div className="af" style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{textAlign:"center"}}>
        <div className="lbl" style={{fontSize:8,color:T.muted,fontFamily:"Manrope,sans-serif"}}>TON ESTIMATION</div>
        <div className="fm" style={{fontSize:40,fontWeight:700,color:C.primary,lineHeight:1,marginTop:4}}>{fmtEUR(guess)}</div>
      </div>
      <PriceRuler min={car.min} max={car.max} value={guess} onChange={setGuess}/>
      <button onClick={onValidate} style={{width:"100%",padding:"15px 0",borderRadius:14,background:C.primary,color:C.bg,border:"none",cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em"}}
        onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
        onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
      >JE VALIDE →</button>
    </div>
  );
}

/* ── Reveal Overlay ───────────────────────────────────────── */
const TIER_COLORS = {
  ORI_PERFECT:C.primary, SUPER_PERFECT:C.primary, PERFECT:C.primary,
  GREAT:C.text, SOLID:C.text, GOOD:T.muted, LOW_HIT:T.muted,
  STRIKE:C.accent,
};

function RevealOverlay({ car, reward, guess, onNext }) {
  const [phase, setPhase] = useState(0);
  const pts = useCountUp(reward.points, 700, phase>=2?reward.points:undefined);
  const isBust   = reward.bust;
  const isStrike = reward.tier==="STRIKE";

  useEffect(() => {
    const t1 = setTimeout(()=>setPhase(1),320);
    const t2 = setTimeout(()=>setPhase(2),650);
    const t3 = setTimeout(()=>setPhase(3),950);
    return ()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);};
  }, []);

  return (
    <div className="af" style={{position:"absolute",inset:0,zIndex:30,background:isBust?a(C.danger,.05):a(C.bg,.97),display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 22px",gap:10}}>
        {/* Verdict */}
        <div className="aslam" style={{textAlign:"center"}}>
          <div className="fd" style={{fontSize:isStrike?46:38,fontWeight:900,color:TIER_COLORS[reward.tier]||C.text,lineHeight:1,letterSpacing:"-0.03em"}}>
            {reward.label}
          </div>
          {!isStrike && (
            <div className="fb" style={{fontSize:12,color:T.muted,marginTop:5}}>{reward.errPct}% d'écart</div>
          )}
        </div>

        {/* Strike warning */}
        {isStrike && !isBust && (
          <div className="asu" style={{padding:"8px 16px",borderRadius:10,background:a(C.accent,.08),border:`1px solid ${a(C.accent,.25)}`,textAlign:"center"}}>
            <div className="fb" style={{fontSize:12,color:C.accent}}>Combo remis à ×1 · encore un strike = BUST</div>
          </div>
        )}
        {isBust && (
          <div className="asu" style={{textAlign:"center"}}>
            <div className="fd" style={{fontSize:13,color:C.danger,letterSpacing:"0.06em"}}>RUN TERMINÉ</div>
            <div className="fb" style={{fontSize:12,color:T.muted,marginTop:4}}>Tes points non encaissés sont perdus</div>
          </div>
        )}

        {/* Error bar */}
        {phase>=1 && (
          <div className="asu" style={{width:"100%",marginTop:8}}>
            <PriceErrorBar actual={car.actual} guess={guess} animate={phase>=1}/>
          </div>
        )}

        {/* Points */}
        {phase>=2 && !isStrike && !isBust && (
          <div className="acu" style={{textAlign:"center",marginTop:6}}>
            <div className="fm" style={{fontSize:30,fontWeight:700,color:C.primary,lineHeight:1}}>+{fmtNum(pts)}</div>
            <div className="fb" style={{fontSize:11,color:T.muted,marginTop:3}}>
              {MM.BASE} × {reward.accuracyMult} × x{Math.round(reward.points/MM.BASE/reward.accuracyMult)} combo
            </div>
          </div>
        )}
      </div>

      {phase>=3 && (
        <div className="asu" style={{padding:"14px 18px 24px",flexShrink:0}}>
          <button onClick={onNext} style={{width:"100%",padding:"15px 0",borderRadius:14,background:isBust?a(C.danger,.12):C.primary,color:isBust?C.danger:C.bg,border:isBust?`1px solid ${a(C.danger,.35)}`:"none",cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em"}}
            onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
            onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
          >{isBust?"VOIR LES DÉGÂTS":"SUIVANT →"}</button>
        </div>
      )}
    </div>
  );
}

/* ── Play Screen ──────────────────────────────────────────── */
function PlayScreen({ car, carsPlayed, multiplier, charge, strikes, unbanked, revealed, guess, setGuess, lastReward, onPrimary }) {
  return (
    <div style={{display:"flex",flexDirection:"column",height:"100%",position:"relative"}}>
      <GameHUD carsPlayed={carsPlayed} multiplier={multiplier} charge={charge} strikes={strikes} unbanked={unbanked}/>
      {/* Car section */}
      <div key={`${car.brand}-${car.model}-${carsPlayed}`} className="aci" style={{flex:1,padding:"12px 14px 0",minHeight:0,overflow:"hidden"}}>
        <CarCard car={car}/>
        <div style={{marginTop:14,paddingBottom:4}}>
          <div className="fd lbl" style={{fontSize:10,color:T.muted}}>{car.brand}</div>
          <h2 className="fd" style={{fontSize:28,fontWeight:900,color:C.text,lineHeight:1.0,margin:"3px 0 5px",letterSpacing:"-0.02em"}}>{car.model}</h2>
          <div className="fb" style={{fontSize:13,color:T.muted}}>{car.year} · {fmtNum(car.mileage)} km</div>
        </div>
      </div>
      {/* Guess tray */}
      <div style={{flexShrink:0,padding:"12px 14px 20px",borderTop:`1px solid ${C.border}`}}>
        <GuessTray guess={guess} setGuess={setGuess} car={car} onValidate={onPrimary}/>
      </div>
      {/* Reveal overlay */}
      {revealed && lastReward && (
        <RevealOverlay car={car} reward={lastReward} guess={guess} onNext={onPrimary}/>
      )}
    </div>
  );
}

/* ── Cashout Sheet ────────────────────────────────────────── */
function CashoutSheet({ unbanked, multiplier, strikes, carsPlayed, onBank, onContinue }) {
  const nextMult = Math.min(MM.MULT_CAP, multiplier*2);
  return (
    <div style={{position:"absolute",inset:0,zIndex:40,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
      <div className="af" onClick={onContinue} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.8)"}}/>
      <div className="ash" style={{position:"relative",borderRadius:"22px 22px 0 0",padding:"4px 18px 28px",background:C.surface,border:`1px solid ${C.border}`,borderBottom:"none"}}>
        <div style={{display:"flex",justifyContent:"center",padding:"10px 0 14px"}}>
          <div style={{width:36,height:4,borderRadius:2,background:C.borderHi}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
          <span className="fd lbl" style={{fontSize:10,fontWeight:700,color:C.primary}}>{carsPlayed} VOITURES · CHECKPOINT</span>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <span className="fd lbl" style={{fontSize:10,color:T.muted}}>x{multiplier}</span>
            {strikes>0 && <span className="fd lbl adanger" style={{fontSize:10,color:C.accent}}>{strikes}/{MM.MAX_STRIKES} STRIKE</span>}
          </div>
        </div>
        {/* Big score */}
        <div className={unbanked>5000?"aglow":""} style={{textAlign:"center",marginBottom:4}}>
          <div className="fm" style={{fontSize:58,fontWeight:700,lineHeight:1,color:C.primary}}>{fmtNum(unbanked)}</div>
          <div className="fb" style={{fontSize:11,color:T.muted,marginTop:4}}>points sécurisés si tu encaisses maintenant</div>
        </div>
        {/* Next mult info */}
        <div style={{marginTop:12,padding:"10px 14px",borderRadius:12,background:a(C.text,.03),border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span className="fb" style={{fontSize:11,color:T.muted}}>Si tu continues</span>
          <span className="fm" style={{fontSize:13,fontWeight:700,color:C.primary}}>combo → x{nextMult}</span>
        </div>
        {/* Danger */}
        <div style={{marginTop:8,padding:"10px 14px",borderRadius:12,background:a(C.accent,.06),border:`1px solid ${a(C.accent,.2)}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span className="fb" style={{fontSize:11,color:C.accent}}>Si tu bust</span>
          <span className="fm" style={{fontSize:13,fontWeight:700,color:C.accent}}>-{fmtNum(unbanked)} pts</span>
        </div>
        <div style={{marginTop:14,display:"flex",flexDirection:"column",gap:10}}>
          <button onClick={onBank} style={{width:"100%",padding:"15px 0",borderRadius:14,background:C.primary,color:C.bg,border:"none",cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em"}}
            onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
            onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
          >ENCAISSER {fmtNum(unbanked)} PTS</button>
          <button onClick={onContinue} style={{width:"100%",padding:"14px 0",borderRadius:14,background:a(C.accent,.07),color:C.accent,border:`1px solid ${a(C.accent,.3)}`,cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em"}}
            onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
            onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
          >RISQUER · x{nextMult}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Compact Leaderboard ─────────────────────────────────── */
function CompactLeaderboard({ userScore }) {
  const rank = computeRank(userScore);
  const pct  = computePct(rank);
  return (
    <div style={{borderRadius:16,overflow:"hidden",background:C.surface,border:`1px solid ${C.border}`}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderBottom:`1px solid ${C.border}`}}>
        <span className="fd lbl" style={{fontSize:9,color:T.muted,fontWeight:700}}>CLASSEMENT DU JOUR</span>
      </div>
      {MAIN_LEADERBOARD.slice(0,5).map((p,i) => (
        <div key={p.r} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",borderBottom:i<4?`1px solid ${C.border}`:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span className="fm" style={{width:18,textAlign:"right",fontSize:11,fontWeight:700,color:p.r<=3?C.primary:T.muted}}>{p.r}</span>
            <span className="fb" style={{fontSize:13,color:C.text,fontWeight:p.r<=3?700:400}}>{p.n}</span>
          </div>
          <span className="fm" style={{fontSize:13,fontWeight:700,color:C.text}}>{fmtNum(p.s)}</span>
        </div>
      ))}
      <div style={{padding:"11px 14px",background:a(C.primary,.05),borderTop:`1px solid ${a(C.primary,.15)}`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:C.primary,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span className="fm" style={{fontSize:8,fontWeight:700,color:C.bg}}>·</span>
            </div>
            <div>
              <div className="fb" style={{fontSize:13,fontWeight:700,color:C.text}}>Toi</div>
              <div className="lbl" style={{fontSize:8,color:T.muted,fontFamily:"Manrope,sans-serif"}}>Top {pct}%</div>
            </div>
          </div>
          <span className="fm" style={{fontSize:13,fontWeight:700,color:C.primary}}>{fmtNum(userScore)}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Intro / Home ─────────────────────────────────────────── */
function IntroState({ onPlay, stats }) {
  return (
    <div className="af" style={{height:"100%",overflowY:"auto",paddingBottom:16}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 18px 10px"}}>
        <div className="fd" style={{fontSize:16,fontWeight:900,color:C.text,letterSpacing:"-0.03em"}}>
          AUTO<span style={{color:C.primary}}>ORI!</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:999,border:`1px solid ${C.border}`}}>
          <svg width="10" height="10" viewBox="0 0 11 11" fill={C.primary}><path d="M5.5 1L6.7 4H10L7.3 6l1 3.3L5.5 7.5 2.2 9.3l1-3.3L.5 4h3.3z"/></svg>
          <span className="fm" style={{fontSize:11,fontWeight:700,color:C.text}}>{stats.streak}j</span>
        </div>
      </div>

      <div style={{padding:"0 14px",display:"flex",flexDirection:"column",gap:12}}>
        {/* Hero */}
        <div style={{borderRadius:20,padding:"20px",background:C.surface,border:`1px solid ${C.borderHi}`}}>
          <div className="fd lbl" style={{fontSize:9,color:T.muted}}>ESTIMATION DU MARCHÉ AUTO</div>
          <h1 className="fd" style={{fontSize:24,fontWeight:900,color:C.text,lineHeight:1.05,margin:"8px 0 6px",letterSpacing:"-0.03em"}}>
            À combien<br/>tu la mets ?
          </h1>
          {/* Mystery Lambo card */}
          <div style={{
            position:"relative", borderRadius:16, overflow:"hidden",
            border:`1px solid ${C.border}`, marginBottom:18,
            aspectRatio:"16/9",
          }}>
            {/* Real Lambo photo */}
            <img
              src="https://loremflickr.com/800/450/lamborghini/all?lock=42"
              alt="Mystery car"
              style={{width:"100%",height:"100%",objectFit:"cover",display:"block",filter:"brightness(0.28) saturate(0.6)"}}
            />
            {/* Dark vignette */}
            <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center, rgba(0,0,0,0.1) 0%, rgba(9,10,12,0.65) 100%)",pointerEvents:"none"}}/>
            {/* $$$ overlay — centered */}
            <div style={{
              position:"absolute", inset:0,
              display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              gap:6,
            }}>
              <div className="fd" style={{
                fontSize:44, fontWeight:900, color:C.primary,
                letterSpacing:"0.06em",
                textShadow:`0 0 32px ${a(C.primary,.6)}, 0 2px 8px rgba(0,0,0,0.8)`,
              }}>$$$</div>
              <div className="fd lbl" style={{fontSize:9, color:T.muted, letterSpacing:"0.14em"}}>À TOI DE JOUER</div>
            </div>
          </div>

          <p className="fb" style={{fontSize:12,color:T.muted,lineHeight:1.5,margin:"0 0 18px"}}>
            Estime le prix de marché. Accumule les combos.<br/>Encaisse avant de tout perdre.
          </p>
          {/* Stats strip */}
          <div style={{display:"flex",borderRadius:12,overflow:"hidden",border:`1px solid ${C.border}`,marginBottom:16}}>
            {[
              {label:"MEILLEUR RUN",value:fmtNum(stats.bestBankedRun),color:C.primary},
              {label:"COMBO MAX",   value:`x${stats.highestMultiplier}`,color:C.text},
              {label:"RUNS",        value:fmtNum(stats.totalRuns),      color:C.text},
            ].map(({label,value,color},i)=>(
              <div key={i} style={{flex:1,padding:"10px 6px",textAlign:"center",borderRight:i<2?`1px solid ${C.border}`:"none",background:a(C.text,.01)}}>
                <div className="lbl" style={{fontSize:7,color:T.faint,fontFamily:"Manrope,sans-serif"}}>{label}</div>
                <div className="fm" style={{fontSize:15,fontWeight:700,color,marginTop:2}}>{value}</div>
              </div>
            ))}
          </div>
          <button onClick={onPlay} style={{width:"100%",padding:"16px 0",borderRadius:14,background:C.primary,color:C.bg,border:"none",cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em"}}
            onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
            onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
          >LANCER UNE RUN →</button>
        </div>
        {/* Leaderboard */}
        <CompactLeaderboard userScore={stats.bestBankedRun}/>
      </div>
    </div>
  );
}

/* ── Profile Tab ──────────────────────────────────────────── */
function ProfileTab({ stats, recentRuns }) {
  return (
    <div className="af" style={{height:"100%",overflowY:"auto"}}>
      <div style={{padding:"18px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{width:50,height:50,borderRadius:"50%",flexShrink:0,background:a(C.primary,.1),border:`1px solid ${a(C.primary,.25)}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span className="fd" style={{fontSize:18,fontWeight:700,color:C.primary}}>R</span>
          </div>
          <div>
            <h2 className="fd" style={{fontSize:18,fontWeight:700,color:C.text,lineHeight:1.1}}>Requin Malin</h2>
            <div className="fb" style={{fontSize:11,color:T.muted,marginTop:2}}>Membre depuis avr 2026</div>
          </div>
        </div>
        <div className="lbl" style={{fontSize:9,color:T.muted,marginBottom:10,fontFamily:"Manrope,sans-serif"}}>AUTO ORI!</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
          <StatTile label="MEILLEUR RUN" value={fmtNum(stats.bestBankedRun)} accent/>
          <StatTile label="RUNS JOUÉS" value={fmtNum(stats.totalRuns)}/>
          <StatTile label="MULT. MAX" value={`x${stats.highestMultiplier}`} accent/>
          <StatTile label="PRÉCISION MOY." value={`${stats.avgPrecision}%`}/>
        </div>
        <div className="lbl" style={{fontSize:9,color:T.muted,marginBottom:10,fontFamily:"Manrope,sans-serif"}}>DERNIERS RUNS</div>
        <div style={{borderRadius:14,overflow:"hidden",background:C.surface,border:`1px solid ${C.border}`}}>
          {recentRuns.map((r,i)=>(
            <div key={r.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderBottom:i<recentRuns.length-1?`1px solid ${C.border}`:"none"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <span className="fd lbl" style={{fontSize:7,padding:"2px 6px",borderRadius:4,color:C.primary,background:a(C.primary,.1)}}>RUN</span>
                  <span className="fb" style={{fontSize:13,color:C.text}}>{r.id}</span>
                </div>
                <div className="fb" style={{fontSize:10,color:T.muted,marginTop:1}}>{r.date} · Top {r.percentile}%</div>
              </div>
              <span className="fm" style={{fontSize:14,fontWeight:700,color:C.text}}>{fmtNum(r.score)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Banked Result ────────────────────────────────────────── */
function BankedResult({ banked, prevBest, carsPlayed, highestMult, xpEarned, onRestart, onHome }) {
  const animPts = useCountUp(banked, 900, banked);
  const isRecord = banked > prevBest;
  const rank = computeRank(banked);
  const pct  = computePct(rank);
  return (
    <div className="ash" style={{position:"absolute",inset:0,background:C.bg,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 18px",overflowY:"auto"}}>
        <div className="lbl asd" style={{fontSize:9,color:T.muted,marginTop:30,fontFamily:"Manrope,sans-serif"}}>RUN ENCAISSÉ</div>
        <div className="aslam" style={{textAlign:"center",marginTop:10}}>
          <div className="fm" style={{fontSize:66,fontWeight:700,lineHeight:1,color:C.text}}>{fmtNum(animPts)}</div>
          <div className="fb" style={{fontSize:12,color:T.muted,marginTop:4}}>points sécurisés</div>
        </div>
        {isRecord && <div className="asu fd lbl" style={{fontSize:9,color:C.primary,marginTop:8}}>NOUVEAU RECORD PERSONNEL !</div>}
        <div className="asu" style={{marginTop:16,padding:"14px 22px",borderRadius:18,background:a(C.primary,.06),border:`1px solid ${a(C.primary,.18)}`,textAlign:"center",animationDelay:"200ms",width:"100%"}}>
          <div className="fd" style={{fontSize:28,fontWeight:700,color:C.primary}}>TOP {pct}%</div>
          <div className="fm" style={{fontSize:16,fontWeight:700,color:C.text,marginTop:3}}>#{fmtNum(rank)}</div>
          <div className="lbl" style={{fontSize:7,color:T.faint,marginTop:3,fontFamily:"Manrope,sans-serif"}}>AUTO ORI! · AUJOURD'HUI</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:12,width:"100%"}}>
          <StatTile label="VOITURES" value={fmtNum(carsPlayed)}/>
          <StatTile label="COMBO MAX" value={`x${highestMult}`} accent/>
        </div>
        {xpEarned>0 && (
          <div className="asu" style={{marginTop:10,width:"100%",padding:"9px 12px",borderRadius:11,background:a(C.primary,.05),border:`1px solid ${a(C.primary,.16)}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span className="fb" style={{fontSize:12,color:T.muted}}>XP gagné</span>
            <span className="fm" style={{fontSize:13,fontWeight:700,color:C.primary}}>+{fmtNum(xpEarned)} XP</span>
          </div>
        )}
      </div>
      <div style={{padding:"14px 18px 28px",flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={onRestart} style={{width:"100%",padding:"15px 0",borderRadius:14,background:C.primary,color:C.bg,border:"none",cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em"}}
          onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
        >RELANCER</button>
        <button onClick={onHome} style={{width:"100%",padding:"13px 0",borderRadius:14,background:C.surface,color:C.text,border:`1px solid ${C.borderHi}`,cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:12,letterSpacing:"0.1em"}}
          onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
        >CLASSEMENT</button>
      </div>
    </div>
  );
}

/* ── Bust Result ──────────────────────────────────────────── */
function BustResult({ lost, carsPlayed, highestMult, lastError, onRestart, onHome }) {
  const animLost = useCountUp(lost, 900, lost);
  return (
    <div className="ash" style={{position:"absolute",inset:0,background:C.bg,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",padding:"0 18px",overflowY:"auto"}}>
        <div className="lbl asd" style={{fontSize:9,color:C.accent,marginTop:30,fontFamily:"Manrope,sans-serif"}}>PARTI EN FUMÉE</div>
        <div className="aslam" style={{textAlign:"center",marginTop:10}}>
          <div className="fm" style={{fontSize:60,fontWeight:700,lineHeight:1,color:C.accent}}>-{fmtNum(animLost)}</div>
          <div className="fb" style={{fontSize:12,color:T.muted,marginTop:4}}>points non encaissés, perdus</div>
        </div>
        <div className="asu" style={{marginTop:18,textAlign:"center"}}>
          <p className="fb" style={{fontSize:13,color:T.muted,lineHeight:1.5}}>
            Dernière estimation à{" "}
            <span className="fm" style={{color:C.text,fontWeight:700}}>{Math.round(lastError*100)}%</span>
            {" "}du prix réel.
          </p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:20,width:"100%"}}>
          <StatTile label="VOITURES" value={fmtNum(carsPlayed)}/>
          <StatTile label="COMBO MAX" value={`x${highestMult}`}/>
        </div>
      </div>
      <div style={{padding:"14px 18px 28px",flexShrink:0,display:"flex",flexDirection:"column",gap:10}}>
        <button onClick={onRestart} style={{width:"100%",padding:"15px 0",borderRadius:14,background:C.primary,color:C.bg,border:"none",cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:13,letterSpacing:"0.1em"}}
          onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
        >RECOMMENCER</button>
        <button onClick={onHome} style={{width:"100%",padding:"13px 0",borderRadius:14,background:C.surface,color:C.text,border:`1px solid ${C.borderHi}`,cursor:"pointer",fontFamily:"'Unbounded',sans-serif",fontWeight:700,fontSize:12,letterSpacing:"0.1em"}}
          onPointerDown={e=>e.currentTarget.style.transform="scale(0.97)"}
          onPointerUp={e=>e.currentTarget.style.transform="scale(1)"}
        >RETOUR</button>
      </div>
    </div>
  );
}

/* ── Exports ─────────────────────────────────────────────── */
Object.assign(window, {
  C, T, a, MM, FONT_STYLES,
  MAIN_POOL, MAIN_LEADERBOARD, RECENT_RUNS,
  fmtEUR, fmtNum, resolveHit, pickNext, midGuess,
  computeRank, computePct, xpForBank,
  useCountUp,
  BottomNav, IntroState, ProfileTab,
  PlayScreen, CashoutSheet, BankedResult, BustResult,
});
