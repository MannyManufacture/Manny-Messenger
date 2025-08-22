
const state = {
  me: null,
  contacts: [
    {id:'alina', name:'Alina Judy', avatar:'/static/avatars/user-1.svg', snippet:'I miss you, call me...', messages:[
      {from:'them', text:'Where are you?', time:'14:24'},
      {from:'me', text:'Living room…', time:'14:24'}
    ]},
    {id:'sara', name:'Sara Moira', avatar:'/static/avatars/user-2.svg', snippet:'Amazing work!', messages:[
      {from:'them', text:'Hey, I want show you some amazing photos.', time:'10:26'},
      {from:'me', text:'Nice! Show me', time:'10:27'},
      {from:'them', images:['/static/avatars/photo-1.jpg','/static/avatars/photo-2.jpg'], time:'10:28'}
    ]},
    {id:'christina', name:'Christina Lynn', avatar:'/static/avatars/user-3.svg', snippet:'Good job 🙂🙂', messages:[
      {from:'them', text:'Great job on the deck!', time:'Yesterday'},
      {from:'me', text:"Thanks! I'll push an update.", time:'Yesterday'}
    ]},
    {id:'chris', name:'Chris Marina', avatar:'/static/avatars/user-4.svg', snippet:'Hello, are you there…', messages:[
      {from:'them', text:'Hello, are you there?', time:'Now'}
    ]},
    {id:'marg', name:'Marguerite Rose', avatar:'/static/avatars/user-5.svg', snippet:'Please check my…', messages:[
      {from:'them', text:'Please check my portfolio link.', time:'Mon'},
      {from:'me', text:'On it.', time:'Mon'}
    ]},
  ],
  activeId: null
};
function byId(id){return document.getElementById(id);}
function fmtTime(t){t=Math.max(0,t|0);const m=String((t/60|0)).padStart(2,'0');const s=String((t%60)).padStart(2,'0');return `${m}:${s}`;}

function requireUsername(){
  const s=localStorage.getItem('dm_username');
  if(s){ state.me=s; renderProfileBar(); return; }
  const bd=byId('modal-backdrop');
  bd.style.display='flex';
  byId('username-accept').onclick=()=>{
    const n=(byId('username-input').value||'').trim();
    if(!n) return;
    localStorage.setItem('dm_username',n);
    state.me=n;
    bd.style.display='none';
    renderProfileBar();
  };
}
function renderProfileBar(){ byId('me-name').textContent = state.me || 'Guest'; }

function renderContacts(list=state.contacts){
  const wrap=byId('contacts'); wrap.innerHTML='';
  list.forEach(c=>{
    const row=document.createElement('div');
    row.className='contact'+(c.id===state.activeId?' active':'');
    row.dataset.id=c.id;
    row.innerHTML=`
      <img class="avatar" src="${c.avatar}" alt="">
      <div class="meta">
        <div class="name">${c.name}</div>
        <div class="snippet">${c.snippet}</div>
      </div>`;
    row.addEventListener('click',()=>{ state.activeId=c.id; renderContacts(); renderChat(); });
    wrap.appendChild(row);
  });
}

function createIcon(t){
  const i={
    play:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pause:'<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
    dl:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 20h14v-2H5v2zM12 2v12l4-4 1.41 1.41L12 17.83l-5.41-5.42L8 10l4 4V2h0z"/></svg>',
    spk:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/></svg>',
    fullscreen:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm0-4h3V7h2v5H7V7zm7 9h5v-5h-2v3h-3v2zm0-9V7h3V4h2v5h-5z"/></svg>',
    shrink:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15 14h4v2h-6v-6h2v4zm-6-4H5V8h6v6H9V10z"/></svg>'
  };
  return i[t]||'';
}

function createPlayer({type, src, name}){
  const wrapper=document.createElement('div'); wrapper.className='player';
  if(type==='audio'){ wrapper.classList.add('audio','controls-stack'); } else { wrapper.classList.add('video'); }
  const media=document.createElement(type==='video'?'video':'audio');
  media.src=src; media.preload='metadata'; media.playsInline=true; media.style.background=type==='audio'?'black':'';
  wrapper.appendChild(media);

  const overlay=document.createElement('div'); overlay.className='overlay-tap';
  overlay.innerHTML=`<div class="flash">${createIcon('play')}</div>`;
  wrapper.appendChild(overlay);
  const flash=overlay.querySelector('.flash');
  function flashIcon(kind){ flash.innerHTML=createIcon(kind); flash.classList.add('show'); setTimeout(()=>flash.classList.remove('show'), 350); }

  const top=document.createElement('div'); top.className='top-actions';
  const btnDl=document.createElement('button'); btnDl.className='icon-btn dl-btn'; btnDl.title='Download'; btnDl.innerHTML=createIcon('dl');
  const onDownloadClick=()=>{
    let w=window.open('about:blank');
    const run=(doc)=>{ const a=doc.createElement('a'); a.href=src; a.download=(name || (type==='video'?'video.mp4':'audio.mp3')); a.textContent='Downloading…'; doc.body.appendChild(a); a.click(); };
    if(w && w.document){ w.document.body.style.background='black'; w.document.body.style.color='white'; run(w.document); }
    else{ run(document); }
  };
  btnDl.addEventListener('click', onDownloadClick);
  if(type!=='audio'){ top.appendChild(btnDl); wrapper.appendChild(top); }


  const controls=document.createElement('div'); controls.className='controls';
  controls.innerHTML = `
    <button class="btn btn-play">${createIcon('play')}</button>
    <div class="grow">
      <input class="bar" type="range" min="0" max="100" step="1" value="0">
      <div class="time"><span class="cur">00:00</span> / <span class="dur">00:00</span></div>
    </div>`;
  wrapper.appendChild(controls);

  const hoverCtl=document.createElement('div'); hoverCtl.className='hover-ctl';
  hoverCtl.innerHTML = `
    <div class="ctl-group">
      <div class="icon-btn spk" title="Volume">${createIcon('spk')}</div>
      <div class="vol"><input class="vol-range" type="range" min="0" max="1" step="0.01" value="0.8"></div>
    </div>
    ${type==='audio' ? `<div class="icon-btn dl-btn" title="Download">${createIcon('dl')}</div>` : ``}
    ${type==='video' ? `<div class="icon-btn btn-full" title="Fullscreen">${createIcon('fullscreen')}</div>` : ``}`;
  wrapper.appendChild(hoverCtl);

  const btnPlay=controls.querySelector('.btn-play');
  const bar=controls.querySelector('.bar');
  function updateBarBg(){ const pct=Math.max(0,Math.min(100,parseFloat(bar.value)||0)); bar.style.background=`linear-gradient(90deg,#00cfd3 0%, #00cfd3 ${pct}%, rgba(255,255,255,.15) ${pct}%)`; }
  function checkOverlap(){ try{ const barRect=bar.getBoundingClientRect(); const timeRect=controls.querySelector('.time').getBoundingClientRect(); const overlap=!(barRect.right<timeRect.left||barRect.left>timeRect.right||barRect.bottom<timeRect.top||barRect.top>timeRect.bottom); wrapper.classList.toggle('controls-stack', overlap || wrapper.classList.contains('audio')); }catch(e){} }
  window.addEventListener('resize', checkOverlap);
  const curEl=controls.querySelector('.cur');
  const durEl=controls.querySelector('.dur');
  const volR=hoverCtl.querySelector('.vol-range');
  const btnFull=hoverCtl.querySelector('.btn-full');
  const btnSpk=hoverCtl.querySelector('.spk');
  const btnDlHover=hoverCtl.querySelector('.dl-btn'); if(btnDlHover){ btnDlHover.addEventListener('click', onDownloadClick); }
  let volOpen=false;
  function setVolOpen(v){ volOpen=v; if(volOpen){ hoverCtl.classList.add('open'); } else { hoverCtl.classList.remove('open'); } }
  btnSpk.addEventListener('click', ()=> setVolOpen(!volOpen));

  let durationKnown=false;
  media.addEventListener('loadedmetadata', ()=>{ updateBarBg(); checkOverlap();
    if(isFinite(media.duration)){ durEl.textContent=fmtTime(media.duration); durationKnown=true; }
  });
  media.addEventListener('timeupdate', ()=>{ updateBarBg(); checkOverlap();
    if(durationKnown && isFinite(media.duration)){
      curEl.textContent=fmtTime(media.currentTime);
      bar.value=(media.currentTime/media.duration)*100 || 0;
    }
  });
  bar.addEventListener('input', ()=>{ updateBarBg();
    if(durationKnown && isFinite(media.duration)){
      media.currentTime = media.duration * (bar.value/100);
    }
  });
  function togglePlay(){
    if(media.paused){ media.play(); btnPlay.innerHTML=createIcon('pause'); flashIcon('play'); }
    else{ media.pause(); btnPlay.innerHTML=createIcon('play'); flashIcon('pause'); }
  }
  btnPlay.addEventListener('click', togglePlay);
  media.addEventListener('click', togglePlay);
  volR.addEventListener('input', ()=>{ media.volume=parseFloat(volR.value); });

  let fs=false;
  if(btnFull) btnFull.addEventListener('click', async ()=>{
    if(!fs){ if(wrapper.requestFullscreen) await wrapper.requestFullscreen(); btnFull.innerHTML=createIcon('shrink'); fs=true; }
    else{ if(document.fullscreenElement) await document.exitFullscreen(); btnFull.innerHTML=createIcon('fullscreen'); fs=false; }
  });
  /* FS_CLASS_TOGGLE */
document.addEventListener('fullscreenchange', ()=>{
    const fsEl=document.fullscreenElement;
    document.querySelectorAll('.player').forEach(p=>p.classList.remove('is-fullscreen'));
    if(fsEl && fsEl.classList && fsEl.classList.contains('player')){ fsEl.classList.add('is-fullscreen'); }

    if(!document.fullscreenElement){ btnFull.innerHTML=createIcon('fullscreen'); fs=false; }
  });

  return wrapper;
}

function renderChat(){
  const area=byId('messages');
  const headerName=byId('chat-name');
  const contact=state.contacts.find(x=>x.id===state.activeId);
  area.innerHTML='';
  if(!contact){
    headerName.textContent='';
    const sys=document.createElement('div'); sys.className='system'; sys.textContent='No channels were picked'; area.appendChild(sys);
    return;
  }
  headerName.textContent=contact.name;

  contact.messages.forEach(m=>{
    const side=m.from==='me'?'msg-right':'msg-left';
    const row=document.createElement('div'); row.className=`msg ${side}`;
    const avatar=document.createElement('img'); avatar.className='avatar'; const _meSrc=(localStorage.getItem('meAvatar')||'/static/avatars/me.svg'); avatar.src = m.from==='me'? _meSrc : contact.avatar; row.appendChild(avatar);

    if(m.images){ m.images.forEach(src=>{ const img=document.createElement('img'); img.className='thumb'; img.src=src; img.title='Click to view'; img.addEventListener('click', ()=> openLightbox(src)); row.appendChild(img); }); }
    if(m.media){ row.appendChild(createPlayer(m.media)); }
    if(m.file){ const a=document.createElement('a'); a.className='file-attach'; a.href=m.file.href; a.download=m.file.name; a.target='_blank'; a.innerHTML=`<span class="ico">📄</span><span class="label">${m.file.name}</span>`; row.appendChild(a);}
    if(m.text){ const b=document.createElement('div'); b.className='bubble'; b.textContent=m.text; row.appendChild(b); }

    const t=document.createElement('div'); t.className='time'; t.textContent=m.time; row.appendChild(t);
    area.appendChild(row);
  });
  area.scrollTop=area.scrollHeight;
}

function wireSearch(){
  const input=byId('search');
  input.addEventListener('input', ()=>{
    const q=input.value.toLowerCase();
    renderContacts(state.contacts.filter(c=>c.name.toLowerCase().includes(q)));
  });
}
function pushMessage(obj){
  if(!state.activeId) return;
  const contact=state.contacts.find(x=>x.id===state.activeId);
  contact.messages.push(Object.assign({from:'me', time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}, obj));
  renderChat();
}
function handleFiles(files){
  if(!files || !files.length) return;
  const imgs=[];
  Array.from(files).forEach(f=>{
    const url=URL.createObjectURL(f);
    const ext=(f.name.split('.').pop()||'').toLowerCase();
    if(['png','jpg','jpeg','gif','webp'].includes(ext)){
      imgs.push(url);
      return;
    }
    if(['mp4','webm','mov','m4v'].includes(ext)){
      if(fb && fb.db){ sendOnlineMessage({media:{type:'video', src:url, name:f.name}}); } else { pushMessage({media:{type:'video', src:url, name:f.name}}); }
      return;
    }
    if(['mp3','wav','ogg','m4a'].includes(ext)){
      if(fb && fb.db){ sendOnlineMessage({media:{type:'audio', src:url, name:f.name}}); } else { pushMessage({media:{type:'audio', src:url, name:f.name}}); }
      return;
    }
    if(['pdf','docx','txt','zip','rar'].includes(ext)){
      if(fb && fb.db){ sendOnlineMessage({file:{name:f.name, href:url}}); } else { pushMessage({file:{name:f.name, href:url}}); }
      return;
    }
    if(fb && fb.db){ sendOnlineMessage({file:{name:f.name, href:url}}); } else { pushMessage({file:{name:f.name, href:url}}); }
  });
  if(imgs.length){ if(fb && fb.db){ sendOnlineMessage({images:imgs}); } else { pushMessage({images:imgs}); } }
}
function wireComposer(){
  const fileBtn=byId('clip');
  const fileInput=byId('file-input');
  fileBtn.addEventListener('click', ()=> fileInput.click());
  fileInput.addEventListener('change', e=>{ handleFiles(e.target.files); e.target.value=''; });

  byId('send').addEventListener('click', sendMessage);
  byId('input').addEventListener('keydown', e=>{
    if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
  });
  function sendMessage(){
    if(!state.activeId) return;
    const textEl=byId('input');
    const text=textEl.value.trim();
    if(!text) return;
    pushMessage({text}); textEl.value='';
  }

  document.addEventListener('paste', e=>{
    const items=e.clipboardData && e.clipboardData.items; if(!items) return;
    const files=[];
    for(const it of items){ if(it.kind==='file'){ const f=it.getAsFile(); if(f) files.push(f); } }
    if(files.length){ e.preventDefault(); handleFiles(files); }
  });

  ['dragover','dragenter'].forEach(evt=> window.addEventListener(evt, e=>{ e.preventDefault(); byId('messages').classList.add('drop-hint'); }));
  ['dragleave','drop'].forEach(evt=> window.addEventListener(evt, e=>{ byId('messages').classList.remove('drop-hint'); }));
  window.addEventListener('drop', e=>{ e.preventDefault(); handleFiles(e.dataTransfer.files); });
}

// --- Image lightbox (click to fullscreen) ---
let _lbEl=null, _lbImg=null;
function ensureLightbox(){
  if(_lbEl) return _lbEl;
  _lbEl=document.createElement('div');
  _lbEl.className='lightbox';
  _lbEl.innerHTML = '<img class="lightbox-img" alt="preview">';
  document.body.appendChild(_lbEl);
  _lbImg=_lbEl.querySelector('.lightbox-img');
  _lbEl.addEventListener('click', ()=> closeLightbox());
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLightbox(); });
  return _lbEl;
}
function openLightbox(src){
  ensureLightbox();
  _lbImg.src = src;
  _lbEl.classList.add('open');
}
function closeLightbox(){
  if(_lbEl){ _lbEl.classList.remove('open'); _lbImg.src=''; }
}
// ONLINE DATA LAYER (Firebase) ----------------------------------------------
let fb = { app:null, auth:null, db:null, storage:null, user:null, unsubChats:null, unsubMsgs:null };

async function initOnline(){
  try{
    if(!window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.projectId) { document.getElementById('online-banner').style.display='block'; return; }
    fb.app = firebase.initializeApp(window.FIREBASE_CONFIG);
    fb.auth = firebase.auth();
    fb.db = firebase.firestore();
    fb.storage = firebase.storage();
    // anonymous auth
    await fb.auth.signInAnonymously();
    fb.user = fb.auth.currentUser;
    document.getElementById('online-banner').style.display='none';
    subscribeChats();
  }catch(e){
    console.warn('Online init failed, staying offline:', e);
    document.getElementById('online-banner').style.display='block';
  }
}

function subscribeChats(){
  // chats collection: {name, members:[uid], lastMessage, avatar?}
  if(fb.unsubChats) fb.unsubChats();
  fb.unsubChats = fb.db.collection('chats').where('members','array-contains', fb.user.uid)
    .orderBy('updatedAt','desc')
    .onSnapshot(snap=>{
      const contacts=[];
      snap.forEach(doc=>{
        const c=doc.data();
        contacts.push({ id:doc.id, name:c.name||'Chat', avatar:c.avatar||'/static/avatars/user-5.svg', snippet:c.lastMessage||'', messages:[] });
      });
      state.contacts = contacts;
      if(!state.activeId && contacts.length){ state.activeId = contacts[0].id; }
      renderContacts(); renderChat();
      if(state.activeId) subscribeMessages(state.activeId);
    });
}

function subscribeMessages(chatId){
  if(fb.unsubMsgs) fb.unsubMsgs();
  fb.unsubMsgs = fb.db.collection('chats').doc(chatId).collection('messages')
    .orderBy('createdAt','asc')
    .onSnapshot(snap=>{
      const msgs=[];
      snap.forEach(doc=> msgs.push(doc.data()));
      const contact = state.contacts.find(c=>c.id===chatId);
      if(contact){ contact.messages = msgs; }
      renderChat();
    });
}

async function sendOnlineMessage(payload){
  const chatId = state.activeId;
  if(!chatId) return;
  const ref = fb.db.collection('chats').doc(chatId).collection('messages');
  const now = new Date();
  await ref.add({...payload, createdAt: now, from:'me'});
  await fb.db.collection('chats').doc(chatId).set({updatedAt: now, lastMessage: extractSnippet(payload)}, {merge:true});
}

function extractSnippet(m){
  if(m.text) return m.text;
  if(m.images && m.images.length) return '[image]';
  if(m.media){ return m.media.type==='audio' ? '[audio]' : '[video]'; }
  if(m.file){ return `[file] ${m.file.name||''}`; }
  return '';
}

async function uploadToStorage(file){
  const safeName = `${Date.now()}_${file.name}`;
  const path = `uploads/${fb.user.uid}/${safeName}`;
  const task = fb.storage.ref().child(path);
  await task.put(file);
  return await task.getDownloadURL();
}


document.addEventListener('DOMContentLoaded', ()=>{ initOnline(); 
  // avatar picker
  const meAvatarEl=document.querySelector('.profile-bar .avatar');
  const avatarInput=document.getElementById('avatar-input');
  if(meAvatarEl && avatarInput){
    const saved=localStorage.getItem('meAvatar'); if(saved){ meAvatarEl.src=saved; }
    meAvatarEl.addEventListener('click', ()=> avatarInput.click());
    avatarInput.addEventListener('change', ()=>{
      const f=avatarInput.files && avatarInput.files[0]; if(!f) return;
      if(!(f.type||'').startsWith('image/')) return;
      const r=new FileReader();
      r.onload=(e)=>{ const data=e.target.result; meAvatarEl.src=data; try{ localStorage.setItem('meAvatar', data); }catch(_){} document.querySelectorAll('.msg-right img.avatar').forEach(img=> img.src=data); };
      r.readAsDataURL(f);
    });
  }

  requireUsername();
  renderContacts();
  renderChat();
  wireSearch();
  wireComposer();
});
