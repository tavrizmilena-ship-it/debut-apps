import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase.js";
import { ref, onValue, set, get } from "firebase/database";

/* ═══════════════════════════════════════════
   SUMMER CAPSULE 2026 — Милена
   Данные хранятся в Firebase — надёжно всё лето.
═══════════════════════════════════════════ */

const C = {
  cream:"#fdf8f0", sand:"#f5ead8", sand2:"#ede0c8",
  gold:"#e8b96a", gold2:"#c8922a",
  blush:"#f2cfc4", sky:"#c8dff0", sage:"#c8d8b8", white:"#fffcf7",
  ink:"#2c2418", ink2:"#5a4e3a", ink3:"#8a7a62",
  glass:"rgba(255,252,247,0.82)",
};
const SERIF = "'Playfair Display', Georgia, serif";
const SANS  = "'DM Sans', system-ui, sans-serif";
const DB_KEY = "capsule";

/* ── Firebase helpers ── */
async function loadFromFirebase() {
  try {
    const snap = await get(ref(db, DB_KEY));
    return snap.exists() ? snap.val() : null;
  } catch { return null; }
}
async function saveToFirebase(data) {
  try { await set(ref(db, DB_KEY), data); } catch {}
}

function freshData() {
  return { memories:[], journal:[], checks:{}, mood:{}, letter:"", letterSealed:false };
}

const dayKey = () => new Date().toISOString().slice(0,10);
function dayOfSummer() {
  const diff = Math.floor((new Date() - new Date(2026,5,1)) / 86400000) + 1;
  return Math.max(1, Math.min(92, diff));
}

const MOODS = [
  {id:"sunny",    emoji:"☀️", label:"солнечный"},
  {id:"calm",     emoji:"🌊", label:"спокойный"},
  {id:"tender",   emoji:"🌸", label:"нежный"},
  {id:"electric", emoji:"⚡", label:"насыщенный"},
  {id:"pensive",  emoji:"🌙", label:"задумчивый"},
  {id:"hot",      emoji:"🔥", label:"огненный"},
];
const EMOTIONS = [
  {id:"happy",    emoji:"😊", label:"happy",    color:"#fde8a0"},
  {id:"calm",     emoji:"🌊", label:"calm",      color:"#c8dff0"},
  {id:"nostalgic",emoji:"🌅", label:"nostalgic", color:"#f5ddb0"},
  {id:"romantic", emoji:"🌸", label:"romantic",  color:"#f2cfc4"},
  {id:"chaotic",  emoji:"⚡", label:"chaotic",   color:"#d4e8c8"},
];
const CHECKLIST = [
  {id:"c1", text:"watch a sunrise",                  emoji:"🌅",cat:"adventures"},
  {id:"c2", text:"swim in open water",               emoji:"🌊",cat:"adventures"},
  {id:"c3", text:"go somewhere without a plan",      emoji:"🗺", cat:"adventures"},
  {id:"c4", text:"spend a full day outside",         emoji:"☀️",cat:"adventures"},
  {id:"c5", text:"watch sunset from somewhere new",  emoji:"🧡",cat:"adventures"},
  {id:"c6", text:"have a picnic",                    emoji:"🧺",cat:"adventures"},
  {id:"c7", text:"take a night walk",                emoji:"🌙",cat:"adventures"},
  {id:"c8", text:"have a no-phone evening",          emoji:"📵",cat:"self-care"},
  {id:"c9", text:"sleep before midnight for a week", emoji:"😴",cat:"self-care"},
  {id:"c10",text:"read a book outside",              emoji:"📖",cat:"self-care"},
  {id:"c11",text:"cook something new",               emoji:"🍋",cat:"self-care"},
  {id:"c12",text:"take a long bath with candles",    emoji:"🕯", cat:"self-care"},
  {id:"c13",text:"create a summer playlist",         emoji:"🎵",cat:"creativity"},
  {id:"c14",text:"take 100 photos in one day",       emoji:"📷",cat:"creativity"},
  {id:"c15",text:"make something with your hands",   emoji:"🎨",cat:"creativity"},
  {id:"c16",text:"write a poem or a letter",         emoji:"✉️",cat:"creativity"},
  {id:"c17",text:"film a summer day vlog",           emoji:"🎬",cat:"creativity"},
  {id:"c18",text:"have a long dinner with friends",  emoji:"🥂",cat:"friends"},
  {id:"c19",text:"go on a spontaneous trip",         emoji:"🚗",cat:"friends"},
  {id:"c20",text:"deep conversation until 3am",      emoji:"🌃",cat:"friends"},
  {id:"c21",text:"tell someone something important", emoji:"💛",cat:"friends"},
  {id:"c22",text:"learn one new skill",              emoji:"⚡",cat:"growth"},
  {id:"c23",text:"write a letter to yourself",       emoji:"💌",cat:"growth"},
  {id:"c24",text:"do something that scares you",     emoji:"🔥",cat:"growth"},
  {id:"c25",text:"start something you've been postponing",emoji:"🌱",cat:"growth"},
];
const PROMPTS = [
  "Что сделало сегодня летним?","Опиши день одним цветом.",
  "Что ты хочешь помнить через год?","Кто дал тебе энергию сегодня?",
  "Опиши запах или звук сегодняшнего дня.","Что тебя удивило?",
  "За что ты благодарна этому дню?","Если бы этот день был кадром — что на нём?",
  "Напиши о моменте, который хочешь сохранить.","Что ты откладывала — и почему?",
];

export default function App() {
  const [data,  setData]  = useState(null);
  const [tab,   setTab]   = useState("dash");
  const [toast, setToast] = useState(null);
  const saveTimer  = useRef(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    // realtime listener
    const unsubscribe = onValue(ref(db, DB_KEY), (snap) => {
      setData(snap.exists() ? snap.val() : freshData());
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!data) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveToFirebase(data), 600);
  }, [data]);

  const flash = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const update = useCallback((fn) => setData(prev => {
    const next = JSON.parse(JSON.stringify(prev));
    fn(next);
    return next;
  }), []);

  if (!data) return (
    <div style={{minHeight:"100vh",background:C.cream,display:"grid",placeItems:"center"}}>
      <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:22,color:C.ink3}}>Loading your summer…</div>
    </div>
  );

  const tabs = [
    {id:"dash",icon:"🌤",label:"Лето"},
    {id:"gallery",icon:"📷",label:"Архив"},
    {id:"check",icon:"✨",label:"Список"},
    {id:"journal",icon:"✍️",label:"Дневник"},
    {id:"letter",icon:"✉️",label:"Письмо"},
    {id:"stats",icon:"🌸",label:"Статы"},
  ];

  return (
    <div style={{minHeight:"100vh",background:C.cream,fontFamily:SANS,color:C.ink,position:"relative"}}>
      <Styles/>
      <Blobs/>
      <nav style={{position:"sticky",top:0,zIndex:40,background:"rgba(253,248,240,0.88)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(232,185,106,0.22)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",gap:8,flexWrap:"wrap"}}>
        <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:16,color:C.ink,padding:"14px 0",flexShrink:0}}>
          Summer <span style={{color:C.gold2}}>Capsule</span> 2026
        </div>
        <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{all:"unset",cursor:"pointer",padding:"9px 13px",borderRadius:999,fontSize:12.5,fontWeight:tab===t.id?500:400,background:tab===t.id?C.gold:"transparent",color:tab===t.id?"#fff":C.ink3,transition:"all .3s"}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </nav>
      <div style={{maxWidth:860,margin:"0 auto",padding:"0 18px 100px"}}>
        {tab==="dash"    && <Dashboard data={data} update={update} flash={flash} setTab={setTab}/>}
        {tab==="gallery" && <Gallery   data={data} update={update} flash={flash}/>}
        {tab==="check"   && <Checklist data={data} update={update} flash={flash}/>}
        {tab==="journal" && <Journal   data={data} update={update} flash={flash}/>}
        {tab==="letter"  && <Letter    data={data} update={update} flash={flash}/>}
        {tab==="stats"   && <Stats     data={data}/>}
      </div>
      {toast && (
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:C.ink,color:C.cream,padding:"11px 22px",borderRadius:999,fontSize:13.5,boxShadow:"0 8px 32px rgba(0,0,0,.22)",zIndex:100,whiteSpace:"nowrap",animation:"fadeUp .4s ease both"}}>
          {toast}
        </div>
      )}
    </div>
  );
}

function Dashboard({data,update,flash,setTab}){
  const today=dayKey(), todayMood=data.mood?.[today], last=data.memories?.[0];
  const setMood=(id)=>{update(d=>{if(!d.mood)d.mood={};d.mood[today]=id;});flash("Настроение сохранено ✦");};
  return(
    <div style={{paddingTop:48}}>
      <div style={{textAlign:"center",marginBottom:36}}>
        <div style={{fontSize:12,letterSpacing:".28em",textTransform:"uppercase",color:C.gold2,marginBottom:14}}>
          {new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}
        </div>
        <h1 style={{fontFamily:SERIF,fontStyle:"italic",fontSize:"clamp(52px,10vw,88px)",lineHeight:.9,margin:0,color:C.ink}}>
          Summer<br/><span style={{color:C.gold2}}>Capsule</span>
        </h1>
        <p style={{fontFamily:SERIF,fontStyle:"italic",fontSize:18,color:C.ink3,margin:"14px 0 24px"}}>Прожить лето как историю своей жизни.</p>
        <div style={{display:"inline-flex",alignItems:"baseline",gap:8,background:C.sand,borderRadius:999,padding:"10px 24px"}}>
          <span style={{fontFamily:SERIF,fontSize:32,color:C.gold2,lineHeight:1}}>{dayOfSummer()}</span>
          <span style={{fontSize:13,color:C.ink3}}>день лета 2026</span>
        </div>
      </div>
      <Card style={{marginBottom:16}}>
        <Label>Как ощущается этот день?</Label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {MOODS.map(m=>(
            <button key={m.id} onClick={()=>setMood(m.id)} style={{all:"unset",cursor:"pointer",padding:"8px 15px",borderRadius:999,border:`1.5px solid ${todayMood===m.id?C.gold:"rgba(90,78,58,.15)"}`,background:todayMood===m.id?C.gold:"transparent",color:todayMood===m.id?"#fff":C.ink2,fontSize:13.5,transition:"all .3s",display:"flex",alignItems:"center",gap:6}}>
              <span>{m.emoji}</span><span>{m.label}</span>
            </button>
          ))}
        </div>
        {todayMood&&<div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:14,color:C.ink3,marginTop:12,textAlign:"center"}}>сегодня ты чувствуешь себя {MOODS.find(m=>m.id===todayMood)?.emoji} {MOODS.find(m=>m.id===todayMood)?.label}</div>}
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:24}}>
        {[{icon:"📷",label:"Add Memory",tab:"gallery"},{icon:"✨",label:"Summer Checklist",tab:"check"},{icon:"✍️",label:"Write Thought",tab:"journal"},{icon:"✉️",label:"Letter to Sep",tab:"letter"}].map(q=>(
          <button key={q.tab} onClick={()=>setTab(q.tab)} style={{all:"unset",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:10,padding:"20px 14px",borderRadius:22,background:C.glass,border:"1px solid rgba(232,185,106,.22)",boxShadow:"0 4px 18px rgba(80,60,30,.08)",transition:"transform .3s,box-shadow .3s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow="0 10px 30px rgba(80,60,30,.14)";}}
            onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 18px rgba(80,60,30,.08)";}}>
            <span style={{fontSize:26}}>{q.icon}</span>
            <span style={{fontSize:12.5,fontWeight:500,color:C.ink2,textAlign:"center"}}>{q.label}</span>
          </button>
        ))}
      </div>
      <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:20,color:C.ink,marginBottom:12}}>Последнее воспоминание</div>
      <div style={{borderRadius:22,overflow:"hidden",background:C.glass,border:"1px solid rgba(232,185,106,.22)",boxShadow:"0 4px 20px rgba(80,60,30,.08)"}}>
        {last?.photo?<img src={last.photo} alt="" style={{width:"100%",maxHeight:240,objectFit:"cover",display:"block"}}/>
          :<div style={{height:180,background:`linear-gradient(135deg,${C.sand},${C.blush})`,display:"grid",placeItems:"center"}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>📷</div><div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:15,color:C.ink3}}>Твоё первое летнее воспоминание ждёт тебя</div></div>
          </div>}
        <div style={{padding:"18px 22px"}}>
          <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:17,color:C.ink2,marginBottom:5}}>{last?.caption||"Начни собирать своё лето"}</div>
          <div style={{fontSize:12.5,color:C.ink3}}>{last?`${last.date||""}${last.place?" · "+last.place:""}` : "Добавь первое фото →"}</div>
        </div>
      </div>
    </div>
  );
}

function Gallery({data,update,flash}){
  const [showForm,setShowForm]=useState(false);
  const [caption,setCaption]=useState("");
  const [place,setPlace]=useState("");
  const [date,setDate]=useState(dayKey());
  const [emotion,setEmotion]=useState("");
  const [photo,setPhoto]=useState(null);
  const [detail,setDetail]=useState(null);
  const fileRef=useRef();
  const onFile=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setPhoto(ev.target.result);r.readAsDataURL(f);};
  const save=()=>{
    update(d=>{if(!d.memories)d.memories=[];d.memories.unshift({id:Date.now().toString(),photo,caption,place,date,emotion,ts:Date.now()});});
    setShowForm(false);setCaption("");setPlace("");setDate(dayKey());setEmotion("");setPhoto(null);
    flash("Воспоминание сохранено ✦");
  };
  const del=(id)=>{update(d=>{d.memories=d.memories.filter(m=>m.id!==id);});setDetail(null);flash("Удалено");};
  const mems=data.memories||[];
  return(
    <div style={{paddingTop:36}}>
      <SectionHead title="Memory Gallery" sub="Каждое фото — кадр из твоего фильма этого лета."/>
      {!showForm&&(
        <button onClick={()=>setShowForm(true)} style={{all:"unset",cursor:"pointer",display:"block",width:"100%",border:"2px dashed rgba(232,185,106,.45)",borderRadius:22,padding:"28px",textAlign:"center",marginBottom:24,background:"rgba(255,252,247,.5)",transition:"all .3s"}}
          onMouseEnter={e=>e.currentTarget.style.background=C.sand}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,252,247,.5)"}>
          <div style={{fontSize:30,marginBottom:8}}>✦</div>
          <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:15,color:C.ink3}}>Capture this moment — добавить воспоминание</div>
        </button>
      )}
      {showForm&&(
        <Card style={{marginBottom:24}}>
          <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:19,color:C.ink,marginBottom:18}}>A small moment, but it matters ✦</div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={onFile}/>
          {!photo
            ?<div onClick={()=>fileRef.current.click()} style={{border:"2px dashed rgba(232,185,106,.4)",borderRadius:14,padding:"22px",textAlign:"center",cursor:"pointer",marginBottom:16,transition:"border-color .3s"}}
               onMouseEnter={e=>e.currentTarget.style.borderColor=C.gold}
               onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(232,185,106,.4)"}>
              <div style={{fontSize:26,marginBottom:6}}>📷</div>
              <div style={{fontSize:13.5,color:C.ink3}}>Нажми чтобы добавить фото</div>
            </div>
            :<div style={{position:"relative",marginBottom:16}}>
              <img src={photo} alt="" style={{width:"100%",maxHeight:220,objectFit:"cover",borderRadius:14}}/>
              <button onClick={()=>setPhoto(null)} style={{all:"unset",cursor:"pointer",position:"absolute",top:8,right:8,background:"rgba(0,0,0,.5)",color:"#fff",borderRadius:999,width:28,height:28,display:"grid",placeItems:"center",fontSize:13}}>✕</button>
            </div>
          }
          <div style={{display:"grid",gap:12,marginBottom:14}}>
            <Field placeholder="Что это за момент?" value={caption} onChange={setCaption} label="Подпись"/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <Field type="date" value={date} onChange={setDate} label="Дата"/>
              <Field placeholder="Где это было?" value={place} onChange={setPlace} label="Место"/>
            </div>
          </div>
          <Label>Эмоция</Label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
            {EMOTIONS.map(e=>(
              <button key={e.id} onClick={()=>setEmotion(e.id)} style={{all:"unset",cursor:"pointer",padding:"7px 14px",borderRadius:999,border:`1.5px solid ${emotion===e.id?C.gold:"rgba(90,78,58,.18)"}`,background:emotion===e.id?C.gold:"transparent",color:emotion===e.id?"#fff":C.ink2,fontSize:13,transition:"all .3s"}}>{e.emoji} {e.label}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:10}}>
            <Btn primary onClick={save}>Сохранить ✦</Btn>
            <Btn onClick={()=>{setShowForm(false);setPhoto(null);}}>Отмена</Btn>
          </div>
        </Card>
      )}
      {mems.length===0
        ?<div style={{textAlign:"center",padding:"48px 20px",fontFamily:SERIF,fontStyle:"italic",fontSize:17,color:C.ink3}}>Здесь будут жить твои летние воспоминания ✦</div>
        :<div style={{columns:"220px",columnGap:14}}>
          {mems.map((m,i)=>{
            const emo=EMOTIONS.find(e=>e.id===m.emotion);
            return(
              <div key={m.id} onClick={()=>setDetail(m)} style={{breakInside:"avoid",marginBottom:14,background:C.white,borderRadius:18,overflow:"hidden",cursor:"pointer",boxShadow:"0 4px 18px rgba(80,60,30,.09)",transition:"transform .3s,box-shadow .3s"}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px) rotate(.4deg)";e.currentTarget.style.boxShadow="0 12px 32px rgba(80,60,30,.15)";}}
                onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 18px rgba(80,60,30,.09)";}}>
                {m.photo?<img src={m.photo} alt="" style={{width:"100%",display:"block",maxHeight:200,objectFit:"cover"}}/>
                  :<div style={{height:110,background:`linear-gradient(135deg,${C.sand},${C.blush})`,display:"grid",placeItems:"center",fontSize:28}}>🌅</div>}
                <div style={{padding:"11px 14px 13px"}}>
                  {m.caption&&<div style={{fontSize:13.5,color:C.ink2,lineHeight:1.4,marginBottom:5}}>{m.caption}</div>}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
                    <span style={{fontSize:11,color:C.ink3}}>{m.date}{m.place?" · "+m.place:""}</span>
                    {emo&&<span style={{fontSize:11,padding:"3px 9px",borderRadius:999,background:emo.color}}>{emo.emoji} {emo.label}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      }
      {detail&&(
        <Modal title={detail.caption||"Воспоминание"} onClose={()=>setDetail(null)}>
          {detail.photo&&<img src={detail.photo} alt="" style={{width:"100%",borderRadius:14,marginBottom:14,maxHeight:320,objectFit:"cover"}}/>}
          <div style={{fontSize:13,color:C.ink3,marginBottom:16}}>{detail.date}{detail.place?" · "+detail.place:""}{detail.emotion?" · "+EMOTIONS.find(e=>e.id===detail.emotion)?.label:""}</div>
          <Btn onClick={()=>del(detail.id)} style={{background:"rgba(220,80,80,.1)",color:"#c05050",border:"1px solid rgba(220,80,80,.2)"}}>🗑 Удалить</Btn>
        </Modal>
      )}
    </div>
  );
}

function Checklist({data,update,flash}){
  const [cat,setCat]=useState("all");
  const cats=["all","adventures","self-care","creativity","friends","growth"];
  const catLabels={all:"Все 🌸",adventures:"🏕 Adventures","self-care":"🌸 Self-care",creativity:"🎨 Creativity",friends:"🫂 Friends",growth:"🌱 Growth"};
  const toggle=(id)=>{update(d=>{if(!d.checks)d.checks={};d.checks[id]=!d.checks[id];});if(!data.checks?.[id])flash("✨ Unlocked!");};
  const checks=data.checks||{};
  const visible=cat==="all"?CHECKLIST:CHECKLIST.filter(c=>c.cat===cat);
  const doneCount=CHECKLIST.filter(c=>checks[c.id]).length;
  const pct=Math.round(doneCount/CHECKLIST.length*100);
  return(
    <div style={{paddingTop:36}}>
      <SectionHead title="Summer Checklist" sub="92 дня — бесконечно много возможностей."/>
      <Card style={{marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:C.ink3,marginBottom:8}}>
          <span>Выполнено</span><span style={{fontWeight:500,color:C.ink2}}>{doneCount} / {CHECKLIST.length}</span>
        </div>
        <div style={{height:7,background:C.sand2,borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${C.gold},${C.blush})`,borderRadius:4,transition:"width .5s ease"}}/>
        </div>
      </Card>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:20}}>
        {cats.map(c=>(
          <button key={c} onClick={()=>setCat(c)} style={{all:"unset",cursor:"pointer",padding:"7px 16px",borderRadius:999,border:`1.5px solid ${cat===c?C.sky:"rgba(90,78,58,.15)"}`,background:cat===c?C.sky:"transparent",color:C.ink2,fontSize:13,transition:"all .3s"}}>{catLabels[c]}</button>
        ))}
      </div>
      <div style={{display:"grid",gap:10}}>
        {visible.map(item=>{
          const done=!!checks[item.id];
          return(
            <button key={item.id} onClick={()=>toggle(item.id)} style={{all:"unset",cursor:"pointer",display:"flex",alignItems:"center",gap:14,padding:"13px 18px",borderRadius:14,background:done?"rgba(200,216,184,.25)":C.glass,border:`1px solid ${done?"rgba(150,190,130,.35)":"rgba(90,78,58,.1)"}`,transition:"all .3s",opacity:done?.65:1}}>
              <div style={{width:22,height:22,borderRadius:7,flexShrink:0,border:`2px solid ${done?C.sage:"rgba(90,78,58,.25)"}`,background:done?C.sage:"transparent",display:"grid",placeItems:"center",transition:"all .35s"}}>
                {done&&<svg width="11" height="9" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 11 9"><polyline points="1,4.5 4,8 10,1"/></svg>}
              </div>
              <span style={{fontSize:17}}>{item.emoji}</span>
              <div style={{flex:1,textAlign:"left"}}>
                <div style={{fontSize:14.5,color:done?C.ink3:C.ink2,textDecoration:done?"line-through":"none"}}>{item.text}</div>
                <div style={{fontSize:11,color:C.ink3,marginTop:2,letterSpacing:".06em",textTransform:"uppercase"}}>{item.cat}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Journal({data,update,flash}){
  const [text,setText]=useState("");
  const [mood,setMood]=useState("");
  const prompt=PROMPTS[new Date().getDate()%PROMPTS.length];
  const save=()=>{
    if(!text.trim())return;
    update(d=>{if(!d.journal)d.journal=[];d.journal.unshift({id:Date.now().toString(),text:text.trim(),mood,date:new Date().toLocaleDateString("ru-RU",{day:"numeric",month:"long"}),ts:Date.now()});});
    setText("");setMood("");flash("Страница сохранена ✦");
  };
  const del=(id)=>{update(d=>{d.journal=d.journal.filter(e=>e.id!==id);});};
  const entries=data.journal||[];
  return(
    <div style={{paddingTop:36}}>
      <SectionHead title="Journal" sub="Что сделало сегодня летним?"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
        <div style={{background:`linear-gradient(135deg,${C.sand},${C.blush})`,borderRadius:22,padding:"20px 22px"}}>
          <div style={{fontSize:11,letterSpacing:".2em",textTransform:"uppercase",color:C.ink3,marginBottom:8}}>Prompt дня</div>
          <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:17,color:C.ink,lineHeight:1.45}}>{prompt}</div>
        </div>
        <Card style={{display:"flex",flexDirection:"column",gap:10}}>
          <Label>Настроение</Label>
          <select value={mood} onChange={e=>setMood(e.target.value)} style={{width:"100%",background:C.white,border:"1.5px solid rgba(90,78,58,.14)",borderRadius:12,padding:"11px 14px",fontFamily:SANS,fontSize:14,color:C.ink,outline:"none",cursor:"pointer"}}>
            <option value="">выбери…</option>
            {MOODS.map(m=><option key={m.id} value={m.id}>{m.emoji} {m.label}</option>)}
          </select>
        </Card>
      </div>
      <Card style={{marginBottom:24}}>
        <Label>Что произошло сегодня?</Label>
        <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Напиши — даже несколько строк. Потом будешь рада что написала." rows={5}
          style={{width:"100%",background:"rgba(255,252,247,.7)",border:"1.5px solid rgba(90,78,58,.13)",borderRadius:14,padding:"13px 16px",fontFamily:SANS,fontSize:15,color:C.ink,outline:"none",resize:"vertical",lineHeight:1.65,transition:"border-color .3s"}}
          onFocus={e=>e.target.style.borderColor=C.gold}
          onBlur={e=>e.target.style.borderColor="rgba(90,78,58,.13)"}/>
        <div style={{marginTop:14}}><Btn primary onClick={save}>Сохранить ✦</Btn></div>
      </Card>
      {entries.length===0
        ?<div style={{textAlign:"center",padding:"32px",fontFamily:SERIF,fontStyle:"italic",fontSize:17,color:C.ink3}}>Здесь будут жить страницы твоего лета ✦</div>
        :entries.map(e=>{
          const m=MOODS.find(x=>x.id===e.mood);
          return(
            <div key={e.id} style={{background:C.white,borderRadius:18,padding:"18px 22px",marginBottom:14,boxShadow:"0 4px 18px rgba(80,60,30,.08)",borderLeft:`3px solid ${C.gold}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10,flexWrap:"wrap",gap:6}}>
                <span style={{fontSize:12,color:C.ink3,letterSpacing:".05em"}}>{e.date}</span>
                {m&&<span style={{fontSize:12,padding:"3px 11px",borderRadius:999,background:C.sand}}>{m.emoji} {m.label}</span>}
              </div>
              <div style={{fontSize:15,color:C.ink2,lineHeight:1.65,whiteSpace:"pre-wrap"}}>{e.text}</div>
              <div style={{marginTop:10,textAlign:"right"}}>
                <button onClick={()=>del(e.id)} style={{all:"unset",cursor:"pointer",fontSize:12,color:C.ink3,padding:"3px 8px",borderRadius:6,transition:"background .2s"}}
                  onMouseEnter={ev=>ev.currentTarget.style.background=C.sand}
                  onMouseLeave={ev=>ev.currentTarget.style.background="transparent"}>удалить</button>
              </div>
            </div>
          );
        })
      }
    </div>
  );
}

function Letter({data,update,flash}){
  const [text,setText]=useState(data.letter||"");
  const sealed=data.letterSealed;
  const canRead=sealed&&new Date()>=new Date(2026,8,1);
  const save=()=>{update(d=>{d.letter=text;});flash("Письмо сохранено ✦");};
  const seal=()=>{if(!window.confirm("Запечатать письмо до 1 сентября?"))return;update(d=>{d.letter=text;d.letterSealed=true;});flash("Письмо запечатано 🔒");};
  return(
    <div style={{paddingTop:36}}>
      <SectionHead title="Letter to September" sub="Письмо себе в будущее — откроется 1 сентября."/>
      <div style={{display:"flex",justifyContent:"center"}}>
        <div style={{width:"100%",maxWidth:480,background:"linear-gradient(160deg,#fdf4e0,#f8e8c8)",borderRadius:6,boxShadow:"0 12px 48px rgba(80,60,20,.18)",padding:"52px 32px 36px",position:"relative",border:"1px solid rgba(212,151,60,.3)"}}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:76,background:"linear-gradient(160deg,#f5e0b0,#f0d090)",clipPath:"polygon(0 0,50% 72%,100% 0)",borderRadius:"6px 6px 0 0"}}/>
          <div style={{position:"absolute",top:44,left:"50%",transform:"translateX(-50%)",width:42,height:42,borderRadius:"50%",background:`radial-gradient(${C.gold},${C.gold2})`,display:"grid",placeItems:"center",fontSize:17,boxShadow:"0 4px 12px rgba(212,151,60,.4)",zIndex:2}}>✦</div>
          <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:21,color:C.ink,marginBottom:6,marginTop:8,textAlign:"center"}}>Дорогая Милена,</div>
          <div style={{fontSize:13,color:C.ink3,textAlign:"center",marginBottom:22,lineHeight:1.6}}>
            {sealed?(canRead?"Сентябрь наступил. Вот что ты написала этим летом 💛":"Письмо запечатано до 1 сентября 2026"):"Напиши своей сентябрьской себе."}
          </div>
          {sealed&&!canRead
            ?<div style={{background:"rgba(232,185,106,.12)",border:"1.5px dashed rgba(232,185,106,.5)",borderRadius:14,padding:"20px",textAlign:"center",fontFamily:SERIF,fontStyle:"italic",fontSize:16,color:C.ink3,marginBottom:16}}>🔒 Запечатано до 1 сентября 2026</div>
            :<textarea value={text} onChange={e=>setText(e.target.value)} disabled={sealed&&!canRead}
               placeholder={"Это лето я хочу прожить так, чтобы…\n\nЯ хочу помнить…\n\nК сентябрю я хочу…"} rows={7}
               style={{width:"100%",background:"rgba(255,252,247,.8)",border:"1.5px solid rgba(212,151,60,.25)",borderRadius:12,padding:"14px 16px",fontFamily:SERIF,fontStyle:"italic",fontSize:16,color:C.ink,outline:"none",resize:"none",lineHeight:1.7,marginBottom:16,opacity:sealed?.6:1}}/>
          }
          {!sealed&&<div style={{display:"flex",gap:10,flexWrap:"wrap"}}><Btn primary onClick={save}>Сохранить</Btn><Btn onClick={seal}>🔒 Запечатать</Btn></div>}
          <div style={{fontSize:11.5,color:C.ink3,marginTop:14,textAlign:"center",fontStyle:"italic"}}>Opens automatically on September 1st ✦</div>
        </div>
      </div>
    </div>
  );
}

function Stats({data}){
  const checks=data.checks||{}, mems=data.memories||[], journal=data.journal||[];
  const doneCount=CHECKLIST.filter(c=>checks[c.id]).length;
  const places=new Set(mems.map(m=>m.place).filter(Boolean)).size;
  const emoCount={};
  mems.forEach(m=>{if(m.emotion)emoCount[m.emotion]=(emoCount[m.emotion]||0)+1;});
  const stats=[
    {emoji:"📷",num:mems.length,label:"воспоминаний"},
    {emoji:"✍️",num:journal.length,label:"страниц дневника"},
    {emoji:"✨",num:doneCount,label:"пунктов выполнено"},
    {emoji:"🌤",num:dayOfSummer(),label:"дней лета прожито"},
    {emoji:"📍",num:places,label:"мест посещено"},
    {emoji:"💛",num:Object.keys(data.mood||{}).length,label:"настроений записано"},
  ];
  return(
    <div style={{paddingTop:36}}>
      <SectionHead title="Summer Stats" sub="Твоё лето в цифрах — но живых."/>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:14,marginBottom:24}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:C.glass,border:"1px solid rgba(232,185,106,.22)",borderRadius:22,padding:"22px 18px",textAlign:"center",boxShadow:"0 4px 18px rgba(80,60,30,.08)"}}>
            <div style={{fontSize:28,marginBottom:10}}>{s.emoji}</div>
            <div style={{fontFamily:SERIF,fontSize:38,color:C.gold2,lineHeight:1}}>{s.num}</div>
            <div style={{fontSize:12.5,color:C.ink3,marginTop:5}}>{s.label}</div>
          </div>
        ))}
      </div>
      <Card style={{marginBottom:18}}>
        <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:19,color:C.ink,marginBottom:16}}>Эмоциональная карта</div>
        {Object.keys(emoCount).length===0
          ?<div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:14,color:C.ink3}}>Эмоции появятся когда добавишь воспоминания ✦</div>
          :<div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {Object.entries(emoCount).map(([id,n])=>{const e=EMOTIONS.find(x=>x.id===id);return e?(<div key={id} style={{background:e.color,borderRadius:14,padding:"10px 18px",textAlign:"center"}}><div style={{fontSize:20}}>{e.emoji}</div><div style={{fontSize:13,fontWeight:500,marginTop:4}}>{e.label}</div><div style={{fontSize:11,color:C.ink3}}>{n}×</div></div>):null;})}
          </div>
        }
      </Card>
      <div style={{background:`linear-gradient(135deg,${C.sand},${C.blush})`,borderRadius:22,padding:"36px 28px",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:10}}>📦</div>
        <div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:21,marginBottom:8}}>Экспорт капсулы</div>
        <div style={{fontSize:14,color:C.ink3,marginBottom:20,lineHeight:1.6,maxWidth:340,margin:"0 auto 20px"}}>Скачай своё лето — все воспоминания, дневник и статистику.</div>
        <Btn primary onClick={()=>exportSummer(data)}>📥 Скачать Summer Capsule</Btn>
      </div>
    </div>
  );
}

function exportSummer(data){
  const mems=data.memories||[], journal=data.journal||[], checks=data.checks||{};
  const doneItems=CHECKLIST.filter(c=>checks[c.id]);
  let html=`<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/><title>Summer Capsule 2026</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400&display=swap" rel="stylesheet"/>
<style>body{font-family:'DM Sans',sans-serif;max-width:720px;margin:0 auto;padding:48px 32px;background:#fdf8f0;color:#2c2418}h1{font-family:'Playfair Display',serif;font-style:italic;font-size:56px;line-height:.9;margin-bottom:6px}h2{font-family:'Playfair Display',serif;font-style:italic;font-size:26px;color:#5a4e3a;margin:44px 0 16px;border-bottom:1px solid #e8b96a44;padding-bottom:8px}.mem{margin-bottom:28px;break-inside:avoid}.mem img{width:100%;border-radius:12px;margin-bottom:8px;max-height:400px;object-fit:cover;display:block}.entry{background:#fffcf7;border-left:3px solid #e8b96a;padding:16px 20px;border-radius:0 12px 12px 0;margin-bottom:14px}.check{display:flex;gap:10px;padding:8px 0;font-size:14px}.letter{background:linear-gradient(135deg,#f5ead8,#f8e8c8);padding:28px;border-radius:16px;font-style:italic;line-height:1.75;font-size:16px;font-family:'Playfair Display',serif}.foot{text-align:center;margin-top:60px;font-style:italic;color:#8a7a62;font-family:'Playfair Display',serif}</style></head><body>
<h1>Summer<br/>Capsule 2026</h1><p style="color:#8a7a62;font-size:14px;margin-bottom:48px">Милена · ${new Date().toLocaleDateString("ru-RU")}</p>`;
  if(mems.length){html+=`<h2>📷 Воспоминания (${mems.length})</h2>`;mems.forEach(m=>{html+=`<div class="mem">${m.photo?`<img src="${m.photo}"/>`:""}<div style="font-size:15px;margin-bottom:4px">${m.caption||"Без подписи"}</div><div style="font-size:12px;color:#8a7a62">${m.date||""}${m.place?" · "+m.place:""}${m.emotion?" · "+m.emotion:""}</div></div>`;});}
  if(journal.length){html+=`<h2>✍️ Дневник (${journal.length})</h2>`;journal.forEach(e=>{html+=`<div class="entry"><div style="font-size:12px;color:#8a7a62;margin-bottom:8px">${e.date||""}${e.mood?" · "+e.mood:""}</div><div style="white-space:pre-wrap;font-size:15px;line-height:1.65">${e.text}</div></div>`;});}
  if(doneItems.length){html+=`<h2>✨ Checklist (${doneItems.length})</h2>`;doneItems.forEach(c=>{html+=`<div class="check">✦ ${c.emoji} ${c.text}</div>`;});}
  if(data.letter){html+=`<h2>✉️ Letter to September</h2><div class="letter">${data.letter.replace(/\n/g,"<br/>")}</div>`;}
  html+=`<div class="foot">Summer 2026 · Capsule closed ✦</div></body></html>`;
  const blob=new Blob([html],{type:"text/html"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="summer-capsule-2026.html";a.click();
}

function Card({children,style}){return<div style={{background:C.glass,backdropFilter:"blur(12px)",border:"1px solid rgba(232,185,106,.2)",borderRadius:22,padding:"22px 24px",boxShadow:"0 4px 22px rgba(80,60,30,.08)",...style}}>{children}</div>;}
function Label({children}){return<div style={{fontSize:11.5,fontWeight:500,color:C.ink3,letterSpacing:".1em",textTransform:"uppercase",marginBottom:8}}>{children}</div>;}
function Field({label,value,onChange,placeholder,type}){return<div>{label&&<Label>{label}</Label>}<input type={type||"text"} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} style={{width:"100%",background:"rgba(255,252,247,.7)",border:"1.5px solid rgba(90,78,58,.13)",borderRadius:12,padding:"12px 15px",fontFamily:SANS,fontSize:14.5,color:C.ink,outline:"none",transition:"border-color .3s"}} onFocus={e=>e.target.style.borderColor=C.gold} onBlur={e=>e.target.style.borderColor="rgba(90,78,58,.13)"}/></div>;}
function Btn({children,primary,onClick,style}){return<button onClick={onClick} style={{all:"unset",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:7,padding:"11px 22px",borderRadius:999,fontSize:14,fontWeight:primary?500:400,background:primary?C.gold:"transparent",border:primary?"none":"1.5px solid rgba(90,78,58,.2)",color:primary?"#fff":C.ink2,boxShadow:primary?"0 4px 14px rgba(232,185,106,.35)":"none",transition:"all .3s",...style}} onMouseEnter={e=>{e.currentTarget.style.opacity=".85";}} onMouseLeave={e=>{e.currentTarget.style.opacity="1";}}>{children}</button>;}
function SectionHead({title,sub}){return<div style={{marginBottom:28}}><h2 style={{fontFamily:SERIF,fontStyle:"italic",fontWeight:400,fontSize:"clamp(30px,5vw,46px)",margin:0,color:C.ink,lineHeight:1.1}}>{title}</h2><p style={{fontSize:14,color:C.ink3,marginTop:6,lineHeight:1.6}}>{sub}</p></div>;}
function Modal({title,onClose,children}){return<div onClick={onClose} style={{position:"fixed",inset:0,zIndex:60,background:"rgba(44,36,24,.45)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}><div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:24,padding:"28px 28px 32px",maxWidth:520,width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(44,36,24,.25)",animation:"fadeUp .4s ease both"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div style={{fontFamily:SERIF,fontStyle:"italic",fontSize:21,color:C.ink}}>{title}</div><button onClick={onClose} style={{all:"unset",cursor:"pointer",fontSize:18,color:C.ink3,padding:"4px 8px",borderRadius:8}}>✕</button></div>{children}</div></div>;}
function Blobs(){return<div aria-hidden style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>{[{bg:"radial-gradient(#f2d4b0,#f5e4c8)",top:"-200px",right:"-150px",w:"600px",a:"drift1 22s"},{bg:"radial-gradient(#c8dff0,#dceef8)",bottom:"-100px",left:"-150px",w:"500px",a:"drift2 28s"},{bg:"radial-gradient(#f2cfc4,#f8ddd8)",top:"40%",right:"10%",w:"300px",a:"drift3 18s"}].map((b,i)=><div key={i} style={{position:"absolute",borderRadius:"50%",filter:"blur(80px)",opacity:.4,width:b.w,height:b.w,background:b.bg,...(b.top?{top:b.top}:{}), ...(b.bottom?{bottom:b.bottom}:{}), ...(b.left?{left:b.left}:{}), ...(b.right?{right:b.right}:{}),animation:b.a+" ease-in-out infinite"}}/>)}</div>;}
function Styles(){return<style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}@keyframes drift1{0%,100%{transform:translate(0,0)}50%{transform:translate(-40px,30px)}}@keyframes drift2{0%,100%{transform:translate(0,0)}50%{transform:translate(30px,-40px)}}@keyframes drift3{0%,100%{transform:translate(0,0)}50%{transform:translate(-20px,20px)}}*{box-sizing:border-box}textarea,input,select{font-family:'DM Sans',system-ui,sans-serif}`}</style>;}
