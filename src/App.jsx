import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// ── Firebase ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyAHf04Y7J92h6YEoFHUzHR9DN_XuFasg7c",
  authDomain: "carballeira-5c96d.firebaseapp.com",
  projectId: "carballeira-5c96d",
  storageBucket: "carballeira-5c96d.firebasestorage.app",
  messagingSenderId: "777384739686",
  appId: "1:777384739686:web:411e0b20db6dddd2467ea7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Paleta ──────────────────────────────────────────────
const C = {
  night:  "#151c10",
  bark:   "#3d2a1a",
  soil:   "#5c3d20",
  moss:   "#4a5e2f",
  leaf:   "#7a9a4a",
  cream:  "#f0e8d8",
  fog:    "#c8bea8",
  gold:   "#c9a040",
  rust:   "#b8502a",
  sky:    "#6a90a8",
  ink:    "#1e2a14",
};

// ── Datos iniciales ──────────────────────────────────────
const INIT_TREES = [
  { id:1,  name:"Carballo 1",        zone:"Alta",  age:80, health:90, hollow:false, vines:true,  notes:"Vigoroso, tronco groso.", photos:[] },
  { id:2,  name:"Carballo 2 — O Oco",zone:"Alta",  age:80, health:45, hollow:true,  vines:true,  notes:"Tronco oco. Bubo ou falcón crían aquí cada primavera.", photos:[] },
  { id:3,  name:"Carballo 3",        zone:"Alta",  age:80, health:85, hollow:false, vines:true,  notes:"Boa copa, enredadeiras moderadas.", photos:[] },
  { id:4,  name:"Carballo 4",        zone:"Media", age:80, health:80, hollow:false, vines:false, notes:"Sen incidencias.", photos:[] },
  { id:5,  name:"Carballo 5",        zone:"Media", age:80, health:75, hollow:false, vines:false, notes:"Zona húmida, musgo abundante.", photos:[] },
  { id:6,  name:"Carballo 6",        zone:"Media", age:80, health:88, hollow:false, vines:false, notes:"Crecemento equilibrado.", photos:[] },
  { id:7,  name:"Carballo 7",        zone:"Media", age:80, health:92, hollow:false, vines:false, notes:"O máis alto da carballeira.", photos:[] },
  { id:8,  name:"Carballo 8",        zone:"Baixa", age:80, health:70, hollow:false, vines:true,  notes:"Algunhas ramas secas.", photos:[] },
  { id:9,  name:"Carballo 9",        zone:"Baixa", age:80, health:78, hollow:false, vines:false, notes:"Loureiros ao redor podados.", photos:[] },
  { id:10, name:"Carballo 10",       zone:"Baixa", age:80, health:83, hollow:false, vines:false, notes:"Preto do manzano.", photos:[] },
];

const INIT_SPECIES = [
  { id:"s1", name:"Manzano",        emoji:"🍎", notes:"Manzá vermella pequena. Produción anual moderada.", status:"Bo estado", photos:[] },
  { id:"s2", name:"Nísperero",      emoji:"🌿", notes:"Empeza a dar nísperos. Crecemento lento.", status:"Xove",      photos:[] },
  { id:"s3", name:"Camelios (×2)",  emoji:"🌸", notes:"Dous exemplares. Florecen en inverno.",          status:"Bo estado", photos:[] },
  { id:"s4", name:"Loureiros",      emoji:"🍃", notes:"Varios, con anos. Podados regularmente.",         status:"Controlados",photos:[] },
  { id:"s5", name:"Flor de cebola", emoji:"🌱", notes:"Aparece de forma natural.",                      status:"Silvestre", photos:[] },
  { id:"s6", name:"Herbas",         emoji:"🌾", notes:"Destrozadas na limpeza anual.",                  status:"Ciclo anual",photos:[] },
  { id:"s7", name:"Enredadeiras",   emoji:"🌿", notes:"Soben polos troncos. Vixiar crecemento.",        status:"⚠️ Vixiar", photos:[] },
];

const INIT_FAUNA = [
  { id:"f1", name:"Bubo / Falcón", emoji:"🦉", date:"Primavera", notes:"Crían no oco do Carballo 2.", photos:[] }
];

// ── Firebase helpers ─────────────────────────────────────
async function loadFromFirebase(key, def) {
  try {
    const snap = await getDoc(doc(db, "carballeira", key));
    if (snap.exists()) return snap.data().value;
    return def;
  } catch { return def; }
}

async function saveToFirebase(key, val) {
  try {
    await setDoc(doc(db, "carballeira", key), { value: val });
  } catch (e) { console.error("Firebase save error:", e); }
}

// ── Lightbox ─────────────────────────────────────────────
function Lightbox({ photos, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx(i => (i + 1) % photos.length);
      if (e.key === "ArrowLeft")  setIdx(i => (i - 1 + photos.length) % photos.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [photos.length, onClose]);

  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,0.92)",
      display:"flex", alignItems:"center", justifyContent:"center",
      backdropFilter:"blur(6px)",
      animation:"fadeIn .2s ease",
    }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}`}</style>
      <button onClick={onClose} style={{
        position:"absolute", top:18, right:20,
        background:"rgba(255,255,255,0.1)", color:"#fff",
        border:"1px solid rgba(255,255,255,0.2)", borderRadius:"50%",
        width:40, height:40, fontSize:20, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>×</button>
      {photos.length > 1 && (
        <div style={{
          position:"absolute", top:22, left:"50%", transform:"translateX(-50%)",
          color:C.fog, fontSize:12, background:"rgba(0,0,0,0.4)", padding:"4px 12px", borderRadius:20,
        }}>{idx + 1} / {photos.length}</div>
      )}
      {photos.length > 1 && (
        <button onClick={e => { e.stopPropagation(); prev(); }} style={{
          position:"absolute", left:12,
          background:"rgba(255,255,255,0.08)", color:"#fff",
          border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%",
          width:44, height:44, fontSize:22, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>‹</button>
      )}
      <img key={idx} src={photos[idx]} alt="" onClick={e => e.stopPropagation()} style={{
        maxWidth:"92vw", maxHeight:"85vh", objectFit:"contain", borderRadius:10,
        boxShadow:"0 8px 60px rgba(0,0,0,0.7)", animation:"scaleIn .2s ease",
      }} />
      {photos.length > 1 && (
        <button onClick={e => { e.stopPropagation(); next(); }} style={{
          position:"absolute", right:12,
          background:"rgba(255,255,255,0.08)", color:"#fff",
          border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%",
          width:44, height:44, fontSize:22, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
        }}>›</button>
      )}
      {photos.length > 1 && (
        <div style={{
          position:"absolute", bottom:18,
          display:"flex", gap:8, maxWidth:"90vw", overflowX:"auto", padding:"4px 0",
        }}>
          {photos.map((p, i) => (
            <img key={i} src={p} alt="" onClick={e => { e.stopPropagation(); setIdx(i); }} style={{
              width:52, height:52, objectFit:"cover", borderRadius:6,
              border: i === idx ? `2px solid ${C.gold}` : "2px solid transparent",
              opacity: i === idx ? 1 : 0.5, cursor:"pointer", flexShrink:0, transition:"all .2s",
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Componentes pequeños ─────────────────────────────────
function Bar({ v, h = 7 }) {
  const col = v >= 80 ? C.leaf : v >= 55 ? C.gold : C.rust;
  return (
    <div style={{ background:"#ffffff18", borderRadius:4, height:h, overflow:"hidden" }}>
      <div style={{ width:`${v}%`, background:col, height:"100%", borderRadius:4, transition:"width .5s" }} />
    </div>
  );
}

function Tag({ children, warn }) {
  return (
    <span style={{
      background: warn ? "#b8502a22" : "#4a5e2f22",
      color: warn ? C.rust : C.leaf,
      border: `1px solid ${warn ? C.rust : C.leaf}44`,
      borderRadius:20, padding:"2px 10px", fontSize:11,
    }}>{children}</span>
  );
}

function PhotoStrip({ photos, onAdd, onDel, onOpen }) {
  const ref = useRef();
  return (
    <div style={{ marginTop:10 }}>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {photos.map((p, i) => (
          <div key={i} style={{ position:"relative" }}>
            <img src={p} alt="" onClick={() => onOpen(i)} style={{
              width:72, height:72, objectFit:"cover", borderRadius:6,
              border:`1px solid ${C.soil}`, cursor:"zoom-in",
              transition:"transform .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform="scale(1.06)"}
            onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
            />
            <button onClick={() => onDel(i)} style={{
              position:"absolute", top:-5, right:-5, background:C.rust, color:"#fff",
              border:"none", borderRadius:"50%", width:18, height:18, fontSize:11,
              cursor:"pointer", lineHeight:"18px", padding:0,
            }}>×</button>
          </div>
        ))}
        <button onClick={() => ref.current.click()} style={{
          width:72, height:72, background:"#ffffff08", border:`1px dashed ${C.soil}`,
          borderRadius:6, color:C.fog, fontSize:22, cursor:"pointer",
        }}>+</button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple style={{ display:"none" }}
        onChange={e => {
          Array.from(e.target.files).forEach(f => {
            const r = new FileReader();
            r.onload = ev => onAdd(ev.target.result);
            r.readAsDataURL(f);
          });
          e.target.value = "";
        }} />
    </div>
  );
}

// ── APP ──────────────────────────────────────────────────
const TABS = ["Carballos","Flora","Fauna","Visitas","Finca"];

export default function App() {
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState("Carballos");
  const [trees, setTrees]         = useState(INIT_TREES);
  const [species, setSpecies]     = useState(INIT_SPECIES);
  const [visits, setVisits]       = useState([]);
  const [fauna, setFauna]         = useState(INIT_FAUNA);
  const [lightbox, setLightbox]   = useState(null);
  const [selTree, setSelTree]     = useState(null);
  const [selSpecies, setSelSpecies] = useState(null);
  const [selFauna, setSelFauna]   = useState(null);
  const [selVisit, setSelVisit]   = useState(null);
  const [editTree, setEditTree]   = useState(null);
  const [editSpecies, setEditSp]  = useState(null);
  const [newVisit, setNewVisit]   = useState(false);
  const [nvData, setNvData]       = useState({ date:"", weather:"", notes:"", photos:[] });
  const [newFauna, setNewFauna]   = useState(false);
  const [nfData, setNfData]       = useState({ name:"", emoji:"🦁", date:"", notes:"", photos:[] });

  // ── Cargar datos de Firebase al inicio ──
  useEffect(() => {
    async function loadAll() {
      const [t, s, v, f] = await Promise.all([
        loadFromFirebase("trees", INIT_TREES),
        loadFromFirebase("species", INIT_SPECIES),
        loadFromFirebase("visits", []),
        loadFromFirebase("fauna", INIT_FAUNA),
      ]);
      setTrees(t);
      setSpecies(s);
      setVisits(v);
      setFauna(f);
      setLoading(false);
    }
    loadAll();
  }, []);

  // ── Guardar en Firebase cuando cambian ──
  useEffect(() => { if (!loading) saveToFirebase("trees", trees); },   [trees, loading]);
  useEffect(() => { if (!loading) saveToFirebase("species", species); }, [species, loading]);
  useEffect(() => { if (!loading) saveToFirebase("visits", visits); },   [visits, loading]);
  useEffect(() => { if (!loading) saveToFirebase("fauna", fauna); },     [fauna, loading]);

  const avgHealth = Math.round(trees.reduce((s,t)=>s+t.health,0)/trees.length);
  const zoneAvg = z => { const t=trees.filter(x=>x.zone===z); return t.length?Math.round(t.reduce((s,x)=>s+x.health,0)/t.length):0; };

  function saveTree(t) { setTrees(prev=>prev.map(x=>x.id===t.id?t:x)); setSelTree(t); setEditTree(null); }
  function saveSp(s)   { setSpecies(prev=>prev.map(x=>x.id===s.id?s:x)); setSelSpecies(s); setEditSp(null); }

  function addVisit() {
    const v = { id: Date.now(), ...nvData };
    setVisits(prev => [v, ...prev]);
    setNewVisit(false);
    setNvData({ date:"", weather:"", notes:"", photos:[] });
    setSelVisit(v);
  }
  function delVisit(id) { setVisits(v=>v.filter(x=>x.id!==id)); setSelVisit(null); }
  function addFaunaEntry() {
    const f = { id: Date.now(), ...nfData };
    setFauna(prev=>[f,...prev]);
    setNewFauna(false);
    setNfData({ name:"", emoji:"🦁", date:"", notes:"", photos:[] });
  }
  function delFauna(id) { setFauna(f=>f.filter(x=>x.id!==id)); setSelFauna(null); }

  if (loading) return (
    <div style={{ minHeight:"100vh", background:C.night, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:16 }}>
      <span style={{ fontSize:48 }}>🌲</span>
      <div style={{ color:C.fog, fontSize:14, fontFamily:"'Lora',serif" }}>Cargando a Carballeira...</div>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh", background:C.night, color:C.cream,
      fontFamily:"'Lora', Georgia, serif",
      backgroundImage:"radial-gradient(ellipse at 15% 60%, #2d3d2066 0%, transparent 55%), radial-gradient(ellipse at 85% 10%, #3d2a1a44 0%, transparent 50%)",
    }}>

      {lightbox && <Lightbox photos={lightbox.photos} startIndex={lightbox.index} onClose={() => setLightbox(null)} />}

      <div style={{ padding:"24px 18px 16px", borderBottom:`1px solid ${C.bark}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:36 }}>🌲</span>
          <div>
            <h1 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:24, letterSpacing:".02em" }}>A Carballeira</h1>
            <p style={{ margin:"3px 0 0", color:C.gold, fontSize:12 }}>Cuaderno de Campo Familiar · Est. ~1945</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginTop:16, flexWrap:"wrap" }}>
          {[
            ["🌳", trees.length, "carballos"],
            ["💚", avgHealth+"%", "saúde media"],
            ["🕳️", trees.filter(t=>t.hollow).length, "ocos"],
            ["📓", visits.length, "visitas"],
            ["🦉", fauna.length, "avistamentos"],
          ].map(([e,v,l])=>(
            <div key={l} style={{ background:"#ffffff0a", border:`1px solid ${C.bark}`, borderRadius:8, padding:"6px 12px", display:"flex", gap:6, alignItems:"center" }}>
              <span style={{ fontSize:16 }}>{e}</span>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:C.gold, lineHeight:1 }}>{v}</div>
                <div style={{ fontSize:10, color:C.fog }}>{l}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"flex", borderBottom:`1px solid ${C.bark}`, overflowX:"auto" }}>
        {TABS.map(t=>(
          <button key={t} onClick={()=>{ setTab(t); setSelTree(null); setSelSpecies(null); setSelFauna(null); setSelVisit(null); setEditTree(null); setEditSp(null); setNewVisit(false); setNewFauna(false); }} style={{
            flex:1, padding:"12px 6px", background:"none", border:"none",
            borderBottom: tab===t?`2px solid ${C.gold}`:"2px solid transparent",
            color: tab===t?C.gold:C.fog, fontFamily:"'Lora',serif", fontSize:12,
            cursor:"pointer", fontWeight:tab===t?700:400, whiteSpace:"nowrap",
          }}>{t}</button>
        ))}
      </div>

      <div style={{ padding:"18px 16px", maxWidth:680, margin:"0 auto" }}>

        {/* ════ CARBALLOS ════ */}
        {tab==="Carballos" && <>
          <p style={{ color:C.fog, fontSize:12, margin:"0 0 14px" }}>Toca un carballo para ver ou editar a súa ficha.</p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8, marginBottom:16 }}>
            {trees.map(tree=>(
              <div key={tree.id} onClick={()=>{ setSelTree(selTree?.id===tree.id?null:tree); setEditTree(null); }}
                style={{ background: selTree?.id===tree.id?"#3d2a1a":"#1e2a14",
                  border:`1px solid ${selTree?.id===tree.id?C.gold:C.bark}`,
                  borderRadius:10, padding:"12px 14px", cursor:"pointer", transition:"all .2s", position:"relative" }}>
                {tree.hollow && <span style={{ position:"absolute", top:6, right:8, fontSize:14 }}>🕳️</span>}
                <div style={{ fontSize:22, marginBottom:6 }}>🌳</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:12, fontWeight:700, marginBottom:2 }}>{tree.name}</div>
                <div style={{ color:C.gold, fontSize:10, marginBottom:8 }}>Zona {tree.zone}</div>
                <Bar v={tree.health} />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                  <span style={{ fontSize:10, color:C.fog }}>Saúde</span>
                  <span style={{ fontSize:10, fontWeight:700, color: tree.health>=80?C.leaf:tree.health>=55?C.gold:C.rust }}>{tree.health}%</span>
                </div>
                {tree.photos.length>0 && <div style={{ fontSize:10, color:C.fog, marginTop:4 }}>📸 {tree.photos.length}</div>}
              </div>
            ))}
          </div>

          {selTree && !editTree && (
            <div style={{ background:"#1e2a14", border:`1px solid ${C.gold}55`, borderRadius:12, padding:18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <h2 style={{ margin:0, fontFamily:"'Playfair Display',serif", fontSize:18 }}>{selTree.name}</h2>
                  <div style={{ color:C.gold, fontSize:11, marginTop:2 }}>Zona {selTree.zone} · ~{selTree.age} anos</div>
                </div>
                <button onClick={()=>setEditTree({...selTree})} style={{ background:"transparent", color:C.gold, border:`1px solid ${C.gold}`, borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer", fontFamily:"'Lora',serif" }}>Editar</button>
              </div>
              <Bar v={selTree.health} />
              <div style={{ fontSize:11, color:C.fog, marginTop:4, marginBottom:10 }}>Saúde: {selTree.health}%</div>
              <p style={{ margin:"0 0 10px", fontSize:13, lineHeight:1.7, color:C.cream }}>{selTree.notes}</p>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                {selTree.hollow && <Tag warn>🕳️ Tronco oco</Tag>}
                {selTree.vines  && <Tag>🌿 Enredadeiras</Tag>}
              </div>
              {selTree.hollow && (
                <div style={{ background:C.ink, borderLeft:`3px solid ${C.gold}`, borderRadius:"0 8px 8px 0", padding:"10px 14px", marginBottom:12 }}>
                  <div style={{ fontSize:11, color:C.gold, marginBottom:3 }}>🦉 Fauna asociada</div>
                  <div style={{ fontSize:12, color:C.fog }}>Bubo / Falcón detectado criando neste oco. Presenza estacional (primavera).</div>
                </div>
              )}
              <div style={{ fontSize:12, color:C.gold, marginBottom:6 }}>📸 Fotos</div>
              <PhotoStrip
                photos={selTree.photos}
                onAdd={p=>{ const t={...selTree, photos:[...selTree.photos,p]}; saveTree(t); }}
                onDel={i=>{ const t={...selTree, photos:selTree.photos.filter((_,j)=>j!==i)}; saveTree(t); }}
                onOpen={i=>setLightbox({ photos:selTree.photos, index:i })}
              />
            </div>
          )}

          {editTree && (
            <div style={{ background:"#1e2a14", border:`1px solid ${C.gold}`, borderRadius:12, padding:18 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", margin:"0 0 14px", fontSize:16 }}>Editar — {editTree.name}</h3>
              <label style={{ fontSize:11, color:C.fog }}>Saúde ({editTree.health}%)</label>
              <input type="range" min={0} max={100} value={editTree.health}
                onChange={e=>setEditTree({...editTree, health:+e.target.value})}
                style={{ width:"100%", accentColor:C.gold, margin:"6px 0 14px" }} />
              <label style={{ fontSize:11, color:C.fog }}>Notas</label>
              <textarea value={editTree.notes} rows={4}
                onChange={e=>setEditTree({...editTree, notes:e.target.value})}
                style={{ width:"100%", background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:10, fontSize:13, fontFamily:"'Lora',serif", resize:"vertical", boxSizing:"border-box", marginTop:4 }} />
              <div style={{ display:"flex", gap:8, marginTop:10 }}>
                <label style={{ fontSize:11, color:C.fog, display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                  <input type="checkbox" checked={editTree.vines} onChange={e=>setEditTree({...editTree,vines:e.target.checked})} style={{ accentColor:C.gold }} /> Enredadeiras
                </label>
                <label style={{ fontSize:11, color:C.fog, display:"flex", alignItems:"center", gap:6, cursor:"pointer" }}>
                  <input type="checkbox" checked={editTree.hollow} onChange={e=>setEditTree({...editTree,hollow:e.target.checked})} style={{ accentColor:C.gold }} /> Tronco oco
                </label>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:14 }}>
                <button onClick={()=>saveTree(editTree)} style={{ background:C.leaf, color:"#fff", border:"none", borderRadius:6, padding:"8px 20px", fontSize:13, cursor:"pointer", fontFamily:"'Lora',serif", fontWeight:700 }}>Gardar</button>
                <button onClick={()=>setEditTree(null)} style={{ background:"transparent", color:C.fog, border:`1px solid ${C.bark}`, borderRadius:6, padding:"8px 16px", fontSize:13, cursor:"pointer", fontFamily:"'Lora',serif" }}>Cancelar</button>
              </div>
            </div>
          )}
        </>}

        {/* ════ FLORA ════ */}
        {tab==="Flora" && <>
          <p style={{ color:C.fog, fontSize:12, margin:"0 0 14px" }}>Outras especies presentes na finca.</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {species.map(s=>(
              <div key={s.id}>
                <div onClick={()=>{ setSelSpecies(selSpecies?.id===s.id?null:s); setEditSp(null); }}
                  style={{ background:"#1e2a14", border:`1px solid ${selSpecies?.id===s.id?C.gold:C.bark}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", display:"flex", gap:14, alignItems:"flex-start" }}>
                  <span style={{ fontSize:26 }}>{s.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700 }}>{s.name}</div>
                    <div style={{ fontSize:12, color:C.fog, marginTop:3, lineHeight:1.5 }}>{s.notes}</div>
                    <div style={{ marginTop:6, display:"flex", gap:6, flexWrap:"wrap" }}>
                      <Tag warn={s.status.includes("⚠️")}>{s.status}</Tag>
                      {s.photos.length>0 && <span style={{ fontSize:11, color:C.fog }}>📸 {s.photos.length}</span>}
                    </div>
                  </div>
                </div>
                {selSpecies?.id===s.id && !editSpecies && (
                  <div style={{ background:C.ink, border:`1px solid ${C.gold}44`, borderRadius:"0 0 10px 10px", padding:14, marginTop:-4 }}>
                    <button onClick={()=>setEditSp({...s})} style={{ background:"transparent", color:C.gold, border:`1px solid ${C.gold}`, borderRadius:6, padding:"4px 12px", fontSize:11, cursor:"pointer", fontFamily:"'Lora',serif", marginBottom:10 }}>Editar</button>
                    <div style={{ fontSize:12, color:C.gold, marginBottom:6 }}>📸 Fotos</div>
                    <PhotoStrip
                      photos={s.photos}
                      onAdd={p=>{ const ns={...s,photos:[...s.photos,p]}; saveSp(ns); }}
                      onDel={i=>{ const ns={...s,photos:s.photos.filter((_,j)=>j!==i)}; saveSp(ns); }}
                      onOpen={i=>setLightbox({ photos:s.photos, index:i })}
                    />
                  </div>
                )}
                {editSpecies?.id===s.id && (
                  <div style={{ background:C.ink, border:`1px solid ${C.gold}`, borderRadius:"0 0 10px 10px", padding:14, marginTop:-4 }}>
                    <textarea value={editSpecies.notes} rows={3}
                      onChange={e=>setEditSp({...editSpecies,notes:e.target.value})}
                      style={{ width:"100%", background:"#1e2a14", border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:10, fontSize:13, fontFamily:"'Lora',serif", resize:"vertical", boxSizing:"border-box" }} />
                    <div style={{ display:"flex", gap:8, marginTop:10 }}>
                      <button onClick={()=>saveSp(editSpecies)} style={{ background:C.leaf, color:"#fff", border:"none", borderRadius:6, padding:"7px 18px", fontSize:12, cursor:"pointer", fontFamily:"'Lora',serif" }}>Gardar</button>
                      <button onClick={()=>setEditSp(null)} style={{ background:"transparent", color:C.fog, border:`1px solid ${C.bark}`, borderRadius:6, padding:"7px 14px", fontSize:12, cursor:"pointer", fontFamily:"'Lora',serif" }}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}

        {/* ════ FAUNA ════ */}
        {tab==="Fauna" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <p style={{ color:C.fog, fontSize:12, margin:0 }}>Avistamentos de fauna na finca.</p>
            <button onClick={()=>setNewFauna(!newFauna)} style={{ background:newFauna?C.rust:C.moss, color:"#fff", border:"none", borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer", fontFamily:"'Lora',serif" }}>
              {newFauna?"Cancelar":"+ Novo"}
            </button>
          </div>
          {newFauna && (
            <div style={{ background:"#1e2a14", border:`1px solid ${C.gold}`, borderRadius:10, padding:16, marginBottom:14 }}>
              <h4 style={{ margin:"0 0 12px", fontFamily:"'Playfair Display',serif", fontSize:14, color:C.gold }}>Novo avistamento</h4>
              <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                <input value={nfData.emoji} onChange={e=>setNfData({...nfData,emoji:e.target.value})}
                  style={{ width:48, background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:8, fontSize:20, textAlign:"center" }} />
                <input placeholder="Nome da especie" value={nfData.name} onChange={e=>setNfData({...nfData,name:e.target.value})}
                  style={{ flex:1, background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:"8px 12px", fontSize:13, fontFamily:"'Lora',serif" }} />
              </div>
              <input placeholder="Data / Tempada" value={nfData.date} onChange={e=>setNfData({...nfData,date:e.target.value})}
                style={{ width:"100%", background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:"8px 12px", fontSize:13, fontFamily:"'Lora',serif", boxSizing:"border-box", marginBottom:10 }} />
              <textarea placeholder="Notas do avistamento..." value={nfData.notes} rows={3}
                onChange={e=>setNfData({...nfData,notes:e.target.value})}
                style={{ width:"100%", background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:10, fontSize:13, fontFamily:"'Lora',serif", resize:"vertical", boxSizing:"border-box", marginBottom:10 }} />
              <button onClick={addFaunaEntry} disabled={!nfData.name} style={{ background:C.leaf, color:"#fff", border:"none", borderRadius:6, padding:"8px 20px", fontSize:13, cursor:"pointer", fontFamily:"'Lora',serif", fontWeight:700 }}>Gardar</button>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {fauna.map(f=>(
              <div key={f.id}>
                <div onClick={()=>setSelFauna(selFauna?.id===f.id?null:f)}
                  style={{ background:"#1e2a14", border:`1px solid ${selFauna?.id===f.id?C.gold:C.bark}`, borderRadius:10, padding:"14px 16px", cursor:"pointer", display:"flex", gap:14, alignItems:"flex-start" }}>
                  <span style={{ fontSize:28 }}>{f.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:700 }}>{f.name}</div>
                    <div style={{ color:C.gold, fontSize:11, marginTop:2 }}>{f.date}</div>
                    <div style={{ fontSize:12, color:C.fog, marginTop:4, lineHeight:1.5 }}>{f.notes}</div>
                  </div>
                </div>
                {selFauna?.id===f.id && (
                  <div style={{ background:C.ink, border:`1px solid ${C.gold}44`, borderRadius:"0 0 10px 10px", padding:14, marginTop:-4 }}>
                    <div style={{ fontSize:12, color:C.gold, marginBottom:6 }}>📸 Fotos</div>
                    <PhotoStrip
                      photos={f.photos||[]}
                      onAdd={p=>{ const nf={...f,photos:[...(f.photos||[]),p]}; setFauna(prev=>prev.map(x=>x.id===f.id?nf:x)); setSelFauna(nf); }}
                      onDel={i=>{ const nf={...f,photos:(f.photos||[]).filter((_,j)=>j!==i)}; setFauna(prev=>prev.map(x=>x.id===f.id?nf:x)); setSelFauna(nf); }}
                      onOpen={i=>setLightbox({ photos:f.photos||[], index:i })}
                    />
                    <button onClick={()=>delFauna(f.id)} style={{ marginTop:12, background:"transparent", color:C.rust, border:`1px solid ${C.rust}44`, borderRadius:6, padding:"5px 14px", fontSize:11, cursor:"pointer", fontFamily:"'Lora',serif" }}>Eliminar rexistro</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}

        {/* ════ VISITAS ════ */}
        {tab==="Visitas" && <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <p style={{ color:C.fog, fontSize:12, margin:0 }}>Rexistro de visitas á finca.</p>
            <button onClick={()=>setNewVisit(!newVisit)} style={{ background:newVisit?C.rust:C.moss, color:"#fff", border:"none", borderRadius:6, padding:"6px 14px", fontSize:12, cursor:"pointer", fontFamily:"'Lora',serif" }}>
              {newVisit?"Cancelar":"+ Nova visita"}
            </button>
          </div>
          {newVisit && (
            <div style={{ background:"#1e2a14", border:`1px solid ${C.gold}`, borderRadius:10, padding:16, marginBottom:14 }}>
              <h4 style={{ margin:"0 0 12px", fontFamily:"'Playfair Display',serif", fontSize:14, color:C.gold }}>Nova visita</h4>
              <input type="date" value={nvData.date} onChange={e=>setNvData({...nvData,date:e.target.value})}
                style={{ width:"100%", background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:"8px 12px", fontSize:13, boxSizing:"border-box", marginBottom:10, fontFamily:"'Lora',serif" }} />
              <input placeholder="Tempo (ex: soleado, chuvia leve...)" value={nvData.weather} onChange={e=>setNvData({...nvData,weather:e.target.value})}
                style={{ width:"100%", background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:"8px 12px", fontSize:13, boxSizing:"border-box", marginBottom:10, fontFamily:"'Lora',serif" }} />
              <textarea placeholder="Que observaches? Que fixeches? Notas libres..." value={nvData.notes} rows={5}
                onChange={e=>setNvData({...nvData,notes:e.target.value})}
                style={{ width:"100%", background:C.ink, border:`1px solid ${C.bark}`, borderRadius:6, color:C.cream, padding:10, fontSize:13, fontFamily:"'Lora',serif", resize:"vertical", boxSizing:"border-box", marginBottom:10 }} />
              <div style={{ fontSize:12, color:C.gold, marginBottom:6 }}>📸 Fotos da visita</div>
              <PhotoStrip photos={nvData.photos} onAdd={p=>setNvData({...nvData,photos:[...nvData.photos,p]})} onDel={i=>setNvData({...nvData,photos:nvData.photos.filter((_,j)=>j!==i)})} onOpen={i=>setLightbox({ photos:nvData.photos, index:i })} />
              <button onClick={addVisit} disabled={!nvData.date} style={{ marginTop:14, background:C.leaf, color:"#fff", border:"none", borderRadius:6, padding:"8px 20px", fontSize:13, cursor:"pointer", fontFamily:"'Lora',serif", fontWeight:700 }}>Gardar visita</button>
            </div>
          )}
          {visits.length===0 && !newVisit && (
            <div style={{ background:"#1e2a14", border:`1px dashed ${C.bark}`, borderRadius:10, padding:24, textAlign:"center", color:C.fog, fontSize:13 }}>
              📓 Aínda non hai visitas rexistradas.<br/>
              <span style={{ fontSize:11, color:"#6a7a5a" }}>Preme "Nova visita" para comezar o diario de campo.</span>
            </div>
          )}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {visits.map(v=>(
              <div key={v.id}>
                <div onClick={()=>setSelVisit(selVisit?.id===v.id?null:v)}
                  style={{ background:"#1e2a14", border:`1px solid ${selVisit?.id===v.id?C.gold:C.bark}`, borderRadius:10, padding:"14px 16px", cursor:"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700 }}>📅 {v.date}</div>
                      {v.weather && <div style={{ color:C.gold, fontSize:11, marginTop:2 }}>☁️ {v.weather}</div>}
                    </div>
                    {v.photos?.length>0 && <span style={{ fontSize:11, color:C.fog }}>📸 {v.photos.length}</span>}
                  </div>
                  {v.notes && <p style={{ margin:"8px 0 0", fontSize:12, color:C.fog, lineHeight:1.6, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{v.notes}</p>}
                </div>
                {selVisit?.id===v.id && (
                  <div style={{ background:C.ink, border:`1px solid ${C.gold}44`, borderRadius:"0 0 10px 10px", padding:14, marginTop:-4 }}>
                    <p style={{ margin:"0 0 12px", fontSize:13, color:C.cream, lineHeight:1.8, whiteSpace:"pre-wrap" }}>{v.notes}</p>
                    {v.photos?.length>0 && (
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                        {v.photos.map((p,i)=>(
                          <img key={i} src={p} alt="" onClick={()=>setLightbox({ photos:v.photos, index:i })}
                            style={{ height:90, borderRadius:6, border:`1px solid ${C.soil}`, objectFit:"cover", cursor:"zoom-in" }} />
                        ))}
                      </div>
                    )}
                    <button onClick={()=>delVisit(v.id)} style={{ background:"transparent", color:C.rust, border:`1px solid ${C.rust}44`, borderRadius:6, padding:"5px 14px", fontSize:11, cursor:"pointer", fontFamily:"'Lora',serif" }}>Eliminar visita</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>}

        {/* ════ FINCA ════ */}
        {tab==="Finca" && <>
          <div style={{ background:"#1e2a14", borderRadius:12, padding:18, marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", margin:"0 0 14px", fontSize:16, color:C.gold }}>📐 Saúde por zona</h3>
            <div style={{ display:"flex", gap:10 }}>
              {["Alta","Media","Baixa"].map((z)=>{
                const v=zoneAvg(z);
                return (
                  <div key={z} style={{ flex:1, background:"#ffffff08", borderRadius:10, padding:"14px 10px", textAlign:"center" }}>
                    <div style={{ fontSize:26, fontFamily:"'Playfair Display',serif", fontWeight:800, color: v>=80?C.leaf:v>=55?C.gold:C.rust }}>{v}%</div>
                    <div style={{ fontSize:11, color:C.fog, marginTop:2, marginBottom:8 }}>Zona {z}</div>
                    <Bar v={v} />
                    <div style={{ fontSize:10, color:"#6a7a5a", marginTop:4 }}>{trees.filter(t=>t.zone===z).length} carballos</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background:"#1e2a14", borderRadius:12, padding:18, marginBottom:14 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", margin:"0 0 14px", fontSize:16, color:C.gold }}>🌳 A finca</h3>
            {[
              ["Tipo de terreo","Costaneira con 3 zonas planas (pala)"],
              ["Carballos","10 exemplares, ~80 anos, ~3 xeracións"],
              ["Tronco oco","Carballo 2 — fauna residente"],
              ["Enredadeiras",`${trees.filter(t=>t.vines).length} carballos afectados`],
              ["Propiedade","Familiar"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:`1px solid ${C.bark}`, fontSize:13 }}>
                <span style={{ color:C.fog }}>{k}</span>
                <span style={{ color:C.cream, textAlign:"right", maxWidth:"55%" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:"#1e2a14", borderRadius:12, padding:18 }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", margin:"0 0 14px", fontSize:16, color:C.gold }}>🔮 Perspectivas a longo prazo</h3>
            {[
              { icon:"⚠️", text:"O carballo oco (nº2) require seguimento periódico — estrutura comprometida a longo prazo." },
              { icon:"🌿", text:`As enredadeiras en ${trees.filter(t=>t.vines).length} carballos deben controlarse na próxima limpeza.` },
              { icon:"🍊", text:"O nísperero ten potencial de medrar nos próximos 5-10 anos." },
              { icon:"🦉", text:"A presenza de fauna (bubo/falcón) é indicador positivo do equilibrio ecolóxico." },
              { icon:"🌲", text:"Con mantemento regular, os carballos poden alcanzar os 300-500 anos de vida." },
            ].map((p,i)=>(
              <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom: i<4?`1px solid ${C.bark}`:"none" }}>
                <span style={{ fontSize:18 }}>{p.icon}</span>
                <span style={{ fontSize:13, color:C.fog, lineHeight:1.6 }}>{p.text}</span>
              </div>
            ))}
          </div>
        </>}

      </div>
      <div style={{ textAlign:"center", padding:"20px", color:"#3a4a2a", fontSize:11 }}>
        Cuaderno de Campo · A Carballeira Familiar · Gardado na nube ☁️
      </div>
    </div>
  );
}
