

/* ============================================================
   Smart Coal Governance — MVP (single-file demo)
   All data is simulated locally. No network required.
   ============================================================ */
'use strict';

/* ---------------- i18n ---------------- */
const I18N = {
  en: {
    tagline:'Offline-first mine compliance & AI anomaly detection platform',
    roleOfficer:'Field Officer App', roleOfficerSub:'Attendance scanning · Geo-tagged inspections · Offline queue & sync',
    roleSupervisor:'Supervisor Portal', roleSupervisorSub:'Live analytics · AI anomalies · Records & regulator reports',
    back:'Back', email:'Email', password:'Password', signIn:'Sign In',
    demoHint:'Demo credentials prefilled — just press Sign In',
    officer:'OFFICER', navHome:'Home', navScan:'Scan', navInspect:'Inspect', navAlerts:'Alerts',
    pgOverview:'Overview', pgAnalytics:'Analytics', pgRecords:'Records', pgAI:'AI Anomalies', pgReports:'Reports',
    mineSupervisor:'Mine Supervisor', signOut:'Sign Out',
    online:'Online', offline:'Offline',
    loginTitleOfficer:'Field Officer Sign In', loginTitleSupervisor:'Supervisor Sign In',
    loginSubOfficer:'Use your mine operations credentials', loginSubSupervisor:'Access the mine governance dashboard',
    badCreds:'Invalid credentials. Try the demo login shown below.',
    signedOut:'Signed out successfully',
    confirmSignout:'Sign out of SCG?',
    confirmSignoutBody:'Unsynced data stays safely in the offline queue.'
  },
  hi: {
    tagline:'ऑफ़लाइन-फर्स्ट खान अनुपालन और एआई विसंगति पहचान प्लेटफ़ॉर्म',
    roleOfficer:'फ़ील्ड अधिकारी ऐप', roleOfficerSub:'उपस्थिति स्कैन · जियो-टैग निरीक्षण · ऑफ़लाइन कतार और सिंक',
    roleSupervisor:'पर्यवेक्षक पोर्टल', roleSupervisorSub:'लाइव विश्लेषण · एआई विसंगतियाँ · रिकॉर्ड और रेगुलेटर रिपोर्ट',
    back:'वापस', email:'ईमेल', password:'पासवर्ड', signIn:'साइन इन',
    demoHint:'डेमो क्रेडेंशियल पहले से भरे हैं — बस साइन इन दबाएँ',
    officer:'अधिकारी', navHome:'होम', navScan:'स्कैन', navInspect:'निरीक्षण', navAlerts:'चेतावनी',
    pgOverview:'अवलोकन', pgAnalytics:'विश्लेषण', pgRecords:'रिकॉर्ड', pgAI:'एआई विसंगतियाँ', pgReports:'रिपोर्ट',
    mineSupervisor:'खान पर्यवेक्षक', signOut:'साइन आउट',
    online:'ऑनलाइन', offline:'ऑफ़लाइन',
    loginTitleOfficer:'फ़ील्ड अधिकारी साइन इन', loginTitleSupervisor:'पर्यवेक्षक साइन इन',
    loginSubOfficer:'अपने खान संचालन क्रेडेंशियल का उपयोग करें', loginSubSupervisor:'खान शासन डैशबोर्ड तक पहुँचें',
    badCreds:'अमान्य क्रेडेंशियल। नीचे दिखाए गए डेमो लॉगिन का प्रयास करें।',
    signedOut:'सफलतापूर्वक साइन आउट हुआ',
    confirmSignout:'SCG से साइन आउट करें?',
    confirmSignoutBody:'असमकालिक डेटा ऑफ़लाइन कतार में सुरक्षित रहेगा।'
  }
};
let LANG = 'en';
const t = k => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
function applyI18n(root){
  (root||document).querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    if(I18N[LANG][k] !== undefined) el.textContent = I18N[LANG][k];
  });
}

/* ---------------- tiny helpers ---------------- */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = (p=>'SCG-' + p + '-' + Date.now().toString(36).slice(-5).toUpperCase());
const pad2 = n => String(n).padStart(2,'0');
function toast(msg, type){
  const d = document.createElement('div');
  d.className = 'toast show' + (type==='ok' ? ' t-ok' : type==='err' ? ' t-err' : '');
  d.textContent = msg;
  $('#toast-root').appendChild(d);
  setTimeout(()=>{ d.classList.remove('show'); setTimeout(()=>d.remove(), 300); }, 2600);
}
function fmtDT(ts){ const d = new Date(ts); return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`; }
function fmtD(ts){ const d = new Date(ts); return `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}`; }
function fmtN(n){ return n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'') + 'k' : String(Math.round(n)); }
function csvEsc(v){ v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g,'""') + '"' : v; }
function downloadCSV(filename, headers, rows){
  const csv = [headers, ...rows].map(r => r.map(csvEsc).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 400);
}

/* ---------------- seeded RNG (stable demo data) ---------------- */
let _seed = 42;
function srand(){ _seed = (_seed * 1103515245 + 12345) & 0x7fffffff; return _seed / 0x7fffffff; }
const pick = a => a[Math.floor(srand()*a.length)];
const ri  = (a,b) => a + Math.floor(srand()*(b-a+1));

/* ---------------- static domain data ---------------- */
const SITES = [
  { id:' site-jh', name:'Jharia OC-1',      region:'Jharkhand (Dhanbad)', lat:23.68, lng:86.16, sev:'high'   },
  { id:' site-kl', name:'Korba Coalfield',  region:'Chhattisgarh (Korba)', lat:22.35, lng:82.68, sev:'high'   },
  { id:' site-ng', name:'Neyveli Lignite',  region:'Tamil Nadu (Cuddalore)', lat:11.55, lng:79.48, sev:'medium' },
  { id:' site-rg', name:'Rajgamar Deep',    region:'Chhattisgarh (Korba)', lat:22.42, lng:82.72, sev:'high'   }
];
const FIRST = ['Ramesh','Suresh','Anil','Vikram','Deepak','Manoj','Rajesh','Arun','Sunil','Amit','Pankaj','Dinesh','Naresh','Ravi','Mohit','Sanjay','Harish','Bhola','Chandan','Mangal','Prakash','Ishwar','Ganesh','Kailash','Bharat','Devendra','Laxman','Naanu','Om','Puran','Ramavatar','Shyam','Tika','Uday','Vishnu','Abhay','Bhaskar','Chatur','Damodar','Gopal','Hari','Indra','Jitendra','Kamal','Lalit','Munna','Nand','Pyare','Raghav'];
const LAST = ['Yadav','Kumar','Prasad','Singh','Mahto','Das','Ram','Mandal','Paswan','Tewary','Sahu','Verma','Gupta','Prajapati','Kisku','Bhagat','Lohra','Hembram','Soren','Murmu'];
const CREWS = ['Drilling','Blasting','Excavation','Haulage','Loading','Maintenance','Survey','Safety'];
const OFFICERS = [
  { name:'Officer Rajesh Kumar',  email:'officer@coal.gov.in',  pass:'demo123' },
  { name:'Officer Priya Verma',   email:'officer2@coal.gov.in', pass:'demo123' }
];
const SUP = { name:'Anil Sharma', email:'supervisor@coal.gov.in', pass:'demo123' };

/* ---------------- generated history (14 days, 4 sites) ---------------- */
const TODAY = new Date(); TODAY.setHours(0,0,0,0);
const DAYS  = [];           // 14 day descriptors
for(let i=13;i>=0;i--){ const d=new Date(TODAY); d.setDate(d.getDate()-i); DAYS.push(d); }
/* true if timestamp ts falls on calendar day starting dayTs (midnight) */
const onDay = (ts, dayTs) => ts >= dayTs && ts < dayTs + 86400000;

const workers = [];         // 48 workers
for(let i=0;i<48;i++){
  const s = SITES[i % SITES.length];
  workers.push({
    id:'W' + String(101+i),
    name: FIRST[i % FIRST.length] + ' ' + pick(LAST),
    site: s.name, crew: pick(CREWS), shift: pick(['A','B','C']),
    role: pick(['Operator','Helper','Technician','Supervisor','Driver']),
    phone: '9' + ri(100000000, 999999999)
  });
}

const attendance = [];      // {day, workerId, site, in, out, mode, synced, status}
DAYS.forEach((d,di)=>{
  // per-day attendance rate: dips on day 4 (strike) and day 9 (rain)
  let rate = 0.92;
  if(di===4) rate = 0.61; else if(di===9) rate = 0.74; else if(di>=11) rate = 0.94;
  workers.forEach(w=>{
    // Korba: sustained attendance drop in the last 3 days → feeds AI anomaly #3
    let wRate = rate;
    if(w.site==='Korba Coalfield' && di>=11) wRate = 0.5;
    if(srand() > wRate) return;             // absent
    const inH = pick([6,6,6,7,7,8,14,14,15,22]);
    const inM = ri(0,55);
    const workMins = ri(400, 540);
    const outTotal = (inH*60 + inM + workMins) % (24*60);   // wrap past midnight
    const mode = srand()<0.68 ? 'qr' : srand()<0.75 ? 'face' : 'manual';
    attendance.push({
      ts: d.getTime() + inH*3600000 + inM*60000,
      workerId: w.id, worker: w.name, site: w.site, crew: w.crew, shift: inH<12?'A':inH<20?'B':'C',
      checkin: `${pad2(inH)}:${pad2(inM)}`,
      checkout: pad2(Math.floor(outTotal/60)) + ':' + pad2(outTotal%60),
      hours: +(workMins/60).toFixed(1),
      mode, synced: srand()>0.06, status: srand()<0.02 ? 'flagged' : 'ok'
    });
  });
});

const production = [];      // tonnes per site per day
SITES.forEach(s=>{
  const base = s.sev==='high' ? 2400 : 1500;
  DAYS.forEach((d,di)=>{
    let f = 0.9 + srand()*0.25;
    if(di===4) f = 0.52; else if(di===9) f = 0.68; else if(di>=11) f *= 0.9;  // dip aligned to attendance
    // Jharia: hidden production drop on the LAST day despite full attendance → feeds AI anomaly #1
    if(s.name==='Jharia OC-1' && di===13) f = 0.55;
    production.push({ ts:d.getTime(), site:s.name, tonnes: Math.round(base*f), target: base });
  });
});

const inspections = [];     // geo-tagged inspections
const INS_TYPES = ['Pit Wall Stability','Haul Road Condition','Dust Suppression','Equipment Guarding','Blast Zone Clearance','Slurry Pond Check',' signage'];
const INS_FIX = ['Pit Wall Stability','Haul Road Condition','Dust Suppression','Equipment Guarding','Blast Zone Clearance','Slurry Pond Check'];
const hazards = ['Loose rubble on east bench','Dust levels above limit near crusher','Hairline crack on bench 3','Missing guard on conveyor 2','Water pooling on haul road','Blast perimeter marker shifted'];
DAYS.forEach((d,di)=>{
  const n = di > 10 ? ri(2,4) : ri(1,3);
  for(let k=0;k<n;k++){
    // Jharia gets a repeat-failure cluster (feeds AI anomaly #2), others mostly pass
    let site = pick(SITES);
    if(di>=11 && k===0) site = SITES[0];
    let status;
    if(site.name==='Jharia OC-1' && di>=11){
      status = k===0 ? 'fail' : (k===1 && di===12) ? 'fail' : (k===2 && di===13) ? 'fail' : (srand()<0.55?'pass':srand()<0.6?'warning':'fail');
    } else {
      status = srand()<0.72 ? 'pass' : srand()<0.7 ? 'warning' : 'fail';
    }
    inspections.push({
      id:'INS-'+(1000+inspections.length),
      ts: d.getTime() + ri(7,17)*3600000 + ri(0,59)*60000,
      site: site.name, type: pick(INS_FIX),
      officer: pick(OFFICERS).name.replace('Officer ',''),
      status,
      hazard: status==='fail' ? pick(hazards) : status==='warning' ? pick(hazards) : '',
      lat:+(site.lat + (srand()-0.5)*0.02).toFixed(4),
      lng:+(site.lng + (srand()-0.5)*0.02).toFixed(4),
      photo: 'IMG_' + ri(1000,9999) + '.jpg',
      synced: srand()>0.08
    });
  }
});

const alerts = [
  { ts:TODAY.getTime()+9.4*3600000, sev:'critical', type:'Gas Level', site:'Rajgamar Deep', msg:'Methane at 1.9% in return airway, exceeding the 1.0% threshold. Work suspended, ventilation increased.' },
  { ts:TODAY.getTime()+8.1*3600000, sev:'critical', type:'Proximity', site:'Jharia OC-1', msg:'Two workers inside blast exclusion radius at bench 5. Immediate evacuation completed.' },
  { ts:TODAY.getTime()+7.6*3600000, sev:'high', type:'Structural', site:'Jharia OC-1', msg:'Increase in crack width (4mm to 9mm) detected on east pit wall. Geologist inspection scheduled.' },
  { ts:TODAY.getTime()-3600000+6*3600000, sev:'high', type:'Dust', site:'Korba Coalfield', msg:'PM2.5 at 285 micrograms/m3 near crusher plant. Water spraying resumed on haul road 2.' },
  { ts:TODAY.getTime()-2*3600000+11*3600000, sev:'medium', type:'Equipment', site:'Neyveli Lignite', msg:'Dumper DK-14 GPS idle for 47 minutes during active shift. Utilization review flagged.' },
  { ts:TODAY.getTime()-3*3600000+10*3600000, sev:'medium', type:'Attendance', site:'Korba Coalfield', msg:'Crew B attendance at 68% against the 91% seven-day average. Leave register cross-check initiated.' },
  { ts:TODAY.getTime()-4*3600000+13*3600000, sev:'low', type:'Weather', site:'Jharia OC-1', msg:'Wind forecast at 32 km/h. Blasting window shifted by two hours.' },
  { ts:TODAY.getTime()-5*3600000+15*3600000, sev:'low', type:'Sync', site:'Neyveli Lignite', msg:'12 offline records auto-synced after network restoration.' }
];

/* ---------------- AI anomaly engine ---------------- */
function detectAnomalies(){
  const found = [];
  const last = DAYS[DAYS.length-1].getTime();
  // 1) production vs attendance mismatch
  SITES.forEach(s=>{
    const todayProd = production.find(p=>p.site===s.name && p.ts===last);
    const avgProd = production.filter(p=>p.site===s.name).reduce((a,p)=>a+p.tonnes,0)/14;
    const presToday = attendance.filter(a=>onDay(a.ts,last) && a.site===s.name).length;
    const roster = workers.filter(w=>w.site===s.name).length || 12;
    const rate = presToday/roster;
    const prodRatio = todayProd.tonnes/avgProd;
    if(prodRatio < 0.85 && rate > 0.85){
      found.push({
        id:'AN-01', cat:'Production-Attendance Mismatch', sev:'high', conf: 0.92,
        site:s.name, time: new Date(last+15*3600000),
        title:`${presToday} workers present, production ${Math.round((1-prodRatio)*100)}% below average`,
        desc:'Attendance is near-normal but output has dropped sharply. Historical patterns of this magnitude correlate with unlogged equipment downtime or output under-reporting in 8 of 10 past cases.',
        evidence:`present_today = ${presToday}/${roster} (${Math.round(rate*100)}%)\nproduction  = ${todayProd.tonnes} t (14-day avg ${Math.round(avgProd)} t, ratio ${prodRatio.toFixed(2)})\ncorrelation = -0.78 (attendance vs output, 14-day window)`,
        action:'Dispatch equipment audit to site. Cross-check weighbridge tickets for today against shovel count.'
      });
    }
  });
  // 2) repeat inspection failures
  SITES.forEach(s=>{
    const fails = inspections.filter(i=>i.site===s.name && i.status==='fail').length;
    if(fails >= 3){
      found.push({
        id:'AN-02', cat:'Repeat Safety Violations', sev:'critical', conf: 0.88,
        site:s.name, time: new Date(last+16*3600000),
        title:`${fails} failed inspections cluster within 14 days`,
        desc:'Failure rate at this site is 2.4× the network average. Repeat failures on the same hazard category suggest a systemic process gap rather than one-off worker error.',
        evidence:`failed = ${fails}/${inspections.filter(i=>i.site===s.name).length} inspections\nnetwork_avg_failure = 9%\nsite_failure = 21%`,
        action:'Escalate to regional safety officer. Schedule mandatory toolbox re-training within 48h.'
      });
    }
  });
  // 3) attendance drop (clean day windows: last 3 days vs prior 7 days)
  const recentDays = DAYS.slice(-3).map(d=>d.getTime());
  const priorDays  = DAYS.slice(-10,-3).map(d=>d.getTime());
  SITES.forEach(s=>{
    const recent = attendance.filter(a=>a.site===s.name && recentDays.some(ts=>onDay(a.ts,ts))).length;
    const prior  = attendance.filter(a=>a.site===s.name && priorDays.some(ts=>onDay(a.ts,ts))).length;
    if(prior>0 && recent/3 < (prior/7)*0.8){
      found.push({
        id:'AN-03', cat:'Attendance Pattern Shift', sev:'medium', conf: 0.81,
        site:s.name, time: new Date(last+17*3600000),
        title:'Attendance down ' + Math.round((1-(recent/3)/(prior/7))*100) + '% vs prior week',
        desc:'A sustained drop across multiple crews usually precedes underproduction. In training data, 74% of such drops were followed by production shortfall within 2 shifts.',
        evidence:`last_3d_avg = ${(recent/3).toFixed(1)}/day\nprior_7d_avg = ${(prior/7).toFixed(1)}/day\ndrop = ${Math.round((1-(recent/3)/(prior/7))*100)}%`,
        action:'Verify with leave register and contractor muster. Check for unpaid wage disputes.'
      });
    }
  });
  // 4) predicted risk
  found.push({
    id:'AN-04', cat:'Predictive Alert', sev:'medium', conf: 0.76,
    site:'Rajgamar Deep', time: new Date(last+18*3600000),
    title:'Gas accumulation risk predicted for next blast window',
    desc:'Model combines methane trend (+0.2%/day), barometric pressure drop and blast schedule. Risk crosses action threshold in ~36h if ventilation stays at current settings.',
    evidence:'methane_trend = +0.2%/day\npressure = falling (-8 hPa/24h)\nnext_blast = within 36h\nrisk_score = 0.76',
    action:'Pre-position auxiliary ventilation. Re-check gas levels 2h before blast.'
  });
  return found;
}


/* ============================================================
   Charts — dependency-free canvas mini-library
   ============================================================ */
'use strict';
const DPR = () => Math.min(window.devicePixelRatio || 1, 2);

function setupCanvas(cv, h){
  const w = cv.parentElement.clientWidth;
  const dpr = DPR();
  cv.width = w * dpr; cv.height = h * dpr;
  cv.style.height = h + 'px';
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr,0,0,dpr,0,0);
  return { ctx, w, h };
}

const C = { amber:'#d35400', amber2:'#e87722', blue:'#1b4f8a', green:'#1e8449', red:'#c0392b',
            purple:'#0e7c7b', orange:'#d35400', grid:'#e4e9f1', axis:'#8a94a3', text:'#5b6472',
            panel:'#ffffff', red2:'#e07b6f', green2:'#6cc08b', blue2:'#7aa5cc' };

function drawBars(cv, data, opts){
  // data: [{label, v1, v2}]
  const o = Object.assign({h:210, name1:'Series 1', name2:'Series 2', color1:C.amber, color2:C.blue, fmt:fmtN}, opts||{});
  const {ctx,w,h} = setupCanvas(cv,o.h);
  const padL=42, padR=8, padT=14, padB=26;
  const cw = w-padL-padR, ch = h-padT-padB;
  const max = Math.max(...data.map(d=>Math.max(d.v1,d.v2)), 1) * 1.12;
  const step = cw/data.length;
  const bw = Math.min(16, step*0.32);
  ctx.font='10px system-ui';
  for(let g=0; g<=4; g++){
    const y = padT + ch - ch*g/4;
    ctx.strokeStyle=C.grid; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    ctx.fillStyle=C.axis; ctx.textAlign='right';
    ctx.fillText(o.fmt(max*g/4), padL-6, y+3);
  }
  data.forEach((d,i)=>{
    const cx = padL + step*i + step/2;
    const h1 = ch*(d.v1/max), h2 = ch*(d.v2/max);
    const g1 = ctx.createLinearGradient(0,padT+ch-h1,0,padT+ch); g1.addColorStop(0,o.color1); g1.addColorStop(1,o.color1+'66');
    const g2 = ctx.createLinearGradient(0,padT+ch-h2,0,padT+ch); g2.addColorStop(0,o.color2); g2.addColorStop(1,o.color2+'55');
    ctx.fillStyle=g1; roundRect(ctx, cx-bw-1.5, padT+ch-h1, bw, h1, 3);
    ctx.fillStyle=g2; roundRect(ctx, cx+1.5, padT+ch-h2, bw, h2, 3);
    ctx.fillStyle=C.text; ctx.textAlign='center'; ctx.font='9.5px system-ui';
    if(data.length<=14) ctx.fillText(d.label, cx, h-9);
  });
  drawLegend(cv, [{n:o.name1,c:o.color1},{n:o.name2,c:o.color2}]);
}
function roundRect(ctx,x,y,w,h,r){
  if(h<=0){return}
  r = Math.min(r, w/2, h);
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); ctx.fill();
}
function drawLegend(cv, items){
  let lg = cv.parentElement.querySelector('.legend');
  if(!lg){ lg = document.createElement('div'); lg.className='legend'; cv.parentElement.appendChild(lg); }
  lg.innerHTML = items.map(i=>`<span><b style="background:${i.c}"></b>${i.n}</span>`).join('');
}
function drawLine(cv, data, opts){
  // data: [{label, v1, v2}] — v1 line, v2 dashed target
  const o = Object.assign({h:210, name1:'Actual', name2:'Target', color1:C.amber, color2:C.blue, fmt:fmtN, fill:true}, opts||{});
  const {ctx,w,h} = setupCanvas(cv,o.h);
  const padL=42, padR=8, padT=14, padB=26;
  const cw = w-padL-padR, ch = h-padT-padB;
  const max = Math.max(...data.map(d=>Math.max(d.v1,d.v2||0)), 1) * 1.12;
  const X = i => padL + (data.length===1?cw/2:cw*i/(data.length-1));
  const Y = v => padT + ch - ch*v/max;
  ctx.font='10px system-ui';
  for(let g=0; g<=4; g++){
    const y = Y(max*g/4);
    ctx.strokeStyle=C.grid; ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    ctx.fillStyle=C.axis; ctx.textAlign='right'; ctx.fillText(o.fmt(max*g/4), padL-6, y+3);
  }
  if(data[0].v2 !== undefined){
    ctx.setLineDash([5,4]); ctx.strokeStyle=o.color2; ctx.lineWidth=1.5;
    ctx.beginPath(); data.forEach((d,i)=>{ i?ctx.lineTo(X(i),Y(d.v2)):ctx.moveTo(X(0),Y(d.v2)); }); ctx.stroke();
    ctx.setLineDash([]);
  }
  if(o.fill){
    const g = ctx.createLinearGradient(0,padT,0,padT+ch);
    g.addColorStop(0, o.color1+'55'); g.addColorStop(1, o.color1+'05');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(X(0),Y(data[0].v1));
    data.forEach((d,i)=>{ if(i) ctx.lineTo(X(i),Y(d.v1)); });
    ctx.lineTo(X(data.length-1), padT+ch); ctx.lineTo(X(0), padT+ch); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle=o.color1; ctx.lineWidth=2.2; ctx.lineJoin='round';
  ctx.beginPath(); data.forEach((d,i)=>{ i?ctx.lineTo(X(i),Y(d.v1)):ctx.moveTo(X(0),Y(d.v1)); }); ctx.stroke();
  data.forEach((d,i)=>{
    ctx.fillStyle=o.color1; ctx.beginPath(); ctx.arc(X(i),Y(d.v1),2.6,0,7); ctx.fill();
    if(data.length<=14){ ctx.fillStyle=C.text; ctx.textAlign='center'; ctx.font='9.5px system-ui'; ctx.fillText(d.label, X(i), h-9); }
  });
  drawLegend(cv, [{n:o.name1,c:o.color1}].concat(data[0].v2!==undefined?[{n:o.name2,c:o.color2}]:[]));
}
function drawStacked(cv, data, opts){
  // data: [{label, parts:[{v, c, n}]}] single stacked bar per label
  const o = Object.assign({h:230, fmt:fmtN}, opts||{});
  const {ctx,w,h} = setupCanvas(cv,o.h);
  const padL=42, padR=8, padT=14, padB=26;
  const cw = w-padL-padR, ch = h-padT-padB;
  const totals = data.map(d=>d.parts.reduce((a,p)=>a+p.v,0));
  const max = Math.max(...totals,1)*1.12;
  ctx.font='10px system-ui';
  for(let g=0; g<=4; g++){
    const y = padT+ch-ch*g/4;
    ctx.strokeStyle=C.grid; ctx.beginPath(); ctx.moveTo(padL,y); ctx.lineTo(w-padR,y); ctx.stroke();
    ctx.fillStyle=C.axis; ctx.textAlign='right'; ctx.fillText(o.fmt(max*g/4), padL-6, y+3);
  }
  const step = cw/data.length, bw = Math.min(34, step*0.55);
  data.forEach((d,i)=>{
    const x = padL+step*i+step/2-bw/2;
    let acc = 0;
    d.parts.forEach(p=>{
      const ph = ch*p.v/max;
      ctx.fillStyle = p.c;
      roundRect(ctx, x, padT+ch-acc-ph, bw, Math.max(ph-1.5,0), 3);
      acc += ph;
    });
    ctx.fillStyle=C.text; ctx.textAlign='center'; ctx.font='9.5px system-ui';
    ctx.fillText(d.label, padL+step*i+step/2, h-9);
  });
  // legend from first row parts
  drawLegend(cv, data[0].parts.map(p=>({n:p.n,c:p.c})));
}
function drawGauge(cv, pct, opts){
  const o = Object.assign({h:150, label:'', color:C.amber}, opts||{});
  const {ctx,w,h} = setupCanvas(cv,o.h);
  const cx=w/2, cy=h*0.78, r=Math.min(w/2-14, h*0.62);
  ctx.lineWidth=13; ctx.lineCap='round';
  ctx.strokeStyle=C.grid;
  ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,0); ctx.stroke();
  const g = ctx.createLinearGradient(cx-r,0,cx+r,0);
  g.addColorStop(0,'#ff6b6b'); g.addColorStop(.5,'#f5a623'); g.addColorStop(1,'#3ddc97');
  ctx.strokeStyle=g;
  ctx.beginPath(); ctx.arc(cx,cy,r,Math.PI,Math.PI+Math.PI*Math.min(Math.max(pct,0),1)); ctx.stroke();
  ctx.fillStyle='#12365e'; ctx.textAlign='center';
  ctx.font='800 24px system-ui';
  ctx.fillText(Math.round(pct*100)+'%', cx, cy-6);
  if(o.label){ ctx.fillStyle=C.text; ctx.font='10.5px system-ui'; ctx.fillText(o.label, cx, cy+16); }
}
function drawDonut(cv, parts, opts){
  // parts: [{v, c, n}]
  const o = Object.assign({h:210, center:'', sub:''}, opts||{});
  const {ctx,w,h} = setupCanvas(cv,o.h);
  const cx=w*0.5, cy=h*0.46, r=Math.min(w,h)*0.30, ir=r*0.62;
  const total = parts.reduce((a,p)=>a+p.v,0)||1;
  let a0=-Math.PI/2;
  parts.forEach(p=>{
    const a1 = a0 + (p.v/total)*Math.PI*2;
    ctx.beginPath();
    ctx.arc(cx,cy,r,a0,a1); ctx.arc(cx,cy,ir,a1,a0,true); ctx.closePath();
    ctx.fillStyle=p.c; ctx.fill();
    a0=a1;
  });
  ctx.fillStyle='#12365e'; ctx.textAlign='center';
  ctx.font='800 21px system-ui'; ctx.fillText(o.center, cx, cy+2);
  if(o.sub){ ctx.fillStyle=C.text; ctx.font='10px system-ui'; ctx.fillText(o.sub, cx, cy+16); }
  drawLegend(cv, parts.map(p=>({n:p.n + ' (' + p.v + ')', c:p.c})));
}


/* ============================================================
   Officer app (field) — Home / Scan / Inspect / Alerts
   ============================================================ */
'use strict';

let OFF_VIEW='home', OFFLINE=false;
const offQueue = [
  { type:'attendance', label:'Attendance · W118 Ramesh Yadav', ts: Date.now()-26*60000 },
  { type:'photo',      label:'Inspection photo · IMG_4821.jpg', ts: Date.now()-18*60000 },
  { type:'attendance', label:'Attendance · W126 Suresh Kumar', ts: Date.now()-7*60000 }
];

/* inline SVG icons (stroke-based, government style) */
const IC = {
  qr:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h7"/></svg>',
  camera:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  bell:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
  sync:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5"/><path d="M4 4v5h5"/><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5"/><path d="M20 20v-5h-5"/></svg>',
  check:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 12.5 9.5 18 20 6.5"/></svg>',
  warn:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r=".4"/></svg>',
  ban:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>',
  pin:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  clock:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  img:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 19 6-6 4 4 3-3 3 3"/></svg>'
};

function offRoot(){ return $('#officer-root'); }

function offHome(){
  const todaysAtt = attendance.filter(a=>onDay(a.ts,DAYS[13].getTime())).length;
  const myIns = inspections.filter(i=>onDay(i.ts,DAYS[13].getTime()));
  offRoot().innerHTML = `
    <div class="o-greet">
      <h2>Namaste, Rajesh Kumar</h2>
      <p>${fmtD(Date.now())} · Shift A · <b>Jharia OC-1</b></p>
    </div>
    <div class="o-card">
      <h3>Quick Actions</h3>
      <div class="qgrid">
        <button class="qbtn" data-go="scan"><span class="qi">${IC.qr}</span>Scan QR</button>
        <button class="qbtn" data-go="inspect"><span class="qi">${IC.camera}</span>New Inspection</button>
        <button class="qbtn" data-go="alerts"><span class="qi">${IC.bell}</span>Safety Alerts</button>
        <button class="qbtn" id="q-sync"><span class="qi">${IC.sync}</span>Sync Now</button>
      </div>
    </div>
    <div class="o-card">
      <h3>Today at a Glance</h3>
      <div class="stat-row">
        <div class="mini-stat"><div class="ms-v">${todaysAtt}</div><div class="ms-l">Attendance logged</div></div>
        <div class="mini-stat"><div class="ms-v">${myIns.length}</div><div class="ms-l">My inspections</div></div>
        <div class="mini-stat"><div class="ms-v">${OFFLINE?offQueue.length:0}</div><div class="ms-l">Pending sync</div></div>
        <div class="mini-stat"><div class="ms-v" style="color:var(--red)">2</div><div class="ms-l">Active alerts</div></div>
      </div>
    </div>
    <div class="o-card">
      <h3>Offline Queue ${OFFLINE?'<span class="chip chip-red">offline</span>':'<span class="chip chip-green">online</span>'}</h3>
      ${offQueue.length ? offQueue.map(q=>`
        <div class="queue-item">
          <span class="qi-ico">${q.type==='attendance'?IC.qr:IC.camera}</span>
          <span style="flex:1">${esc(q.label)}</span>
          <span class="td-dim">${fmtDT(q.ts)}</span>
          <span class="chip ${OFFLINE?'chip-amber':'chip-green'}">${OFFLINE?'queued':'syncing'}</span>
        </div>`).join('') : '<p class="list-empty">Queue empty — all records synced.</p>'}
      <button class="btn btn-sm" id="q-sync2" style="margin-top:6px"><span class="ico">${IC.sync}</span>Sync All (${offQueue.length})</button>
    </div>`;
  offRoot().querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>offNav(b.dataset.go));
  const sync = ()=>{ if(OFFLINE){ toast('You are offline — records will sync when network returns','err'); return; }
    offQueue.length=0; toast('3 records synced to portal.','ok'); offHome(); };
  const s1=$('#q-sync'); if(s1) s1.onclick=sync;
  const s2=$('#q-sync2'); if(s2) s2.onclick=sync;
}

function offScan(){
  offRoot().innerHTML = `
    <div class="o-greet"><h2>Attendance Scan</h2><p>Scan worker QR / Face ID — instant, proxy-proof logging</p></div>
    <div class="o-card">
      <div class="scan-frame">
        <div class="corner c1"></div><div class="corner c2"></div><div class="corner c3"></div><div class="corner c4"></div>
        <div class="qr-ghost"><svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1"><rect x="2" y="2" width="8" height="8"/><rect x="14" y="2" width="8" height="8"/><rect x="2" y="14" width="8" height="8"/><path d="M14 14h4v4h-4zM20 14v4M14 20h8"/></svg></div>
        <div id="scan-laser"></div>
      </div>
      <div id="scan-result"></div>
      <div style="display:flex;gap:9px;margin-top:14px;flex-wrap:wrap">
        <button class="btn btn-accent" id="btn-simqr">Simulate QR Scan</button>
        <button class="btn" id="btn-simface">Face ID</button>
        <button class="btn" id="btn-simfail">Simulate Mismatch</button>
      </div>
      <div class="form-row" style="margin-top:16px">
        <label>Fallback — Worker ID</label>
        <div style="display:flex;gap:8px">
          <input id="manual-wid" placeholder="e.g. W118" style="flex:1">
          <button class="btn" id="btn-manual">Log</button>
        </div>
      </div>
    </div>`;
  const res = $('#scan-result');
  const laser = $('#scan-laser');
  function simulate(ok, mode){
    laser.style.display='block';
    res.innerHTML='';
    setTimeout(()=>{
      laser.style.display='none';
      const w = pick(workers);
      const now = new Date();
      if(ok){
        attendance.unshift({ ts:DAYS[13].getTime()+now.getHours()*3600000, workerId:w.id, worker:w.name, site:w.site,
          crew:w.crew, shift:'A', checkin:pad2(now.getHours())+':'+pad2(now.getMinutes()), checkout:'—', hours:0,
          mode, synced:!OFFLINE, status:'ok' });
        res.innerHTML = `
          <div class="scan-result scan-ok">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
              <span class="ico" style="color:var(--green)">${IC.check}</span>
              <div><b>${esc(w.name)}</b> · <span class="mono">${w.id}</span><br>
              <span class="td-dim">${w.crew} crew · Shift ${w.shift} · ${esc(w.site)}</span></div>
            </div>
            <div class="photo-meta">
              Check-in <b>${pad2(now.getHours())}:${pad2(now.getMinutes())}</b> · Mode: <b>${mode==='qr'?'QR Scan':'Face ID'}</b> ·
              Geo: <b>23.68°N 86.16°E</b><br>
              ${OFFLINE ? '<span class="chip chip-amber" style="margin-top:6px">saved offline — will auto-sync</span>'
                        : '<span class="chip chip-green" style="margin-top:6px">synced to portal</span>'}
            </div>
          </div>`;
        toast('Attendance logged: ' + w.name + (OFFLINE?' (offline)':'.'));
      } else {
        res.innerHTML = `
          <div class="scan-result scan-bad">
            <div style="display:flex;align-items:center;gap:10px">
              <span class="ico" style="color:var(--red)">${IC.ban}</span>
              <div><b>Face mismatch — blocked</b><br>
              <span class="td-dim">Photo similarity 41% (min 80%). Logged as attempted proxy. Supervisor notified.</span></div>
            </div>
          </div>`;
        toast('Proxy attempt blocked and reported.','err');
      }
    }, 1200);
  }
  $('#btn-simqr').onclick = ()=>simulate(true,'qr');
  $('#btn-simface').onclick = ()=>simulate(true,'face');
  $('#btn-simfail').onclick = ()=>simulate(false,'face');
  $('#btn-manual').onclick = ()=>{
    const v = $('#manual-wid').value.trim().toUpperCase();
    const w = workers.find(x=>x.id===v);
    if(!w){ toast('Worker ID not found','err'); return; }
    simulate(true,'manual');
  };
}

function offInspect(){
  const myIns = inspections.slice(-6).reverse();
  offRoot().innerHTML = `
    <div class="o-greet"><h2>New Inspection</h2><p>Photo + auto geo-tag + hazard note — works offline</p></div>
    <div class="o-card">
      <div class="form-row">
        <label>Site</label>
        <select id="ins-site">${SITES.map(s=>`<option>${esc(s.name)}</option>`).join('')}</select>
      </div>
      <div class="form-row">
        <label>Inspection Type</label>
        <select id="ins-type">${INS_FIX.map(x=>`<option>${x}</option>`).join('')}</select>
      </div>
      <div class="form-row">
        <label>Hazard Observed (optional)</label>
        <input id="ins-hazard" placeholder="e.g. loose rubble on bench 3">
      </div>
      <div class="form-row">
        <label>Result</label>
        <div style="display:flex;gap:8px" id="ins-status">
          <button class="btn btn-sm" data-s="pass">Pass</button>
          <button class="btn btn-sm" data-s="warning">Warning</button>
          <button class="btn btn-sm" data-s="fail">Fail</button>
        </div>
      </div>
      <div id="ins-photo-box"></div>
      <button class="btn btn-accent" id="btn-capture" style="width:100%;margin-top:6px">Capture Geo-tagged Photo</button>
      <button class="btn" id="btn-submit" style="width:100%;margin-top:10px">Submit Inspection</button>
    </div>
    <div class="o-card">
      <h3>My Recent Inspections</h3>
      ${myIns.map(i=>`
        <div class="queue-item">
          <span class="qi-ico" style="color:${i.status==='pass'?'var(--green)':i.status==='warning'?'var(--saffron-d)':'var(--red)'}">${i.status==='pass'?IC.check:i.status==='warning'?IC.warn:IC.ban}</span>
          <span style="flex:1">${esc(i.type)} <span class="td-dim">· ${esc(i.site)}</span></span>
          <span class="td-dim">${fmtDT(i.ts)}</span>
        </div>`).join('')}
    </div>`;
  let chosen='pass', hasPhoto=false;
  $('#ins-status').querySelectorAll('button').forEach(b=>{
    b.onclick=()=>{ chosen=b.dataset.s;
      $('#ins-status').querySelectorAll('button').forEach(x=>x.style.borderColor='');
      b.style.borderColor='var(--saffron)'; };
  });
  $('#btn-capture').onclick=()=>{
    hasPhoto=true;
    const s = SITES.find(x=>x.name===$('#ins-site').value);
    $('#ins-photo-box').innerHTML = `
      <div class="photo-card">
        <div class="ph-thumb">${IC.img}</div>
        <div class="photo-meta">
          ${IC.pin} <b>${s.lat}°N ${s.lng}°E</b> (±6m)<br>
          ${IC.clock} ${fmtDT(Date.now())} · <span class="mono">IMG_${ri(1000,9999)}.jpg</span><br>
          ${OFFLINE?'<span class="chip chip-amber">stored offline</span>':'<span class="chip chip-green">ready to sync</span>'}
        </div>
      </div>`;
    toast('Photo captured with GPS and timestamp.');
  };
  $('#btn-submit').onclick=()=>{
    if(!hasPhoto){ toast('Capture a photo first (geo-proof required)','err'); return; }
    const s = SITES.find(x=>x.name===$('#ins-site').value);
    inspections.push({
      id:'INS-'+(1000+inspections.length), ts:Date.now(), site:s.name, type:$('#ins-type').value,
      officer:'Rajesh Kumar', status:chosen, hazard:$('#ins-hazard').value,
      lat:+(s.lat+(srand()-.5)*.02).toFixed(4), lng:+(s.lng+(srand()-.5)*.02).toFixed(4),
      photo:'IMG_'+ri(1000,9999)+'.jpg', synced:!OFFLINE
    });
    toast('Inspection submitted' + (OFFLINE?' — queued offline':'.'),'ok');
    offInspect();
  };
}

function offAlerts(){
  const sevOrder={critical:0,high:1,medium:2,low:3};
  const list = alerts.slice().sort((a,b)=>sevOrder[a.sev]-sevOrder[b.sev]||b.ts-a.ts);
  offRoot().innerHTML = `
    <div class="o-greet"><h2>Safety Alerts</h2><p>${list.length} active across your sites · newest first</p></div>
    ${list.map(a=>`
      <div class="alert-item" style="border-left-color:${a.sev==='critical'?'var(--red)':a.sev==='high'?'var(--saffron-d)':'var(--navy)'}">
        <div class="ai-ico" style="color:${a.sev==='critical'?'var(--red)':a.sev==='high'?'var(--saffron-d)':'var(--navy)'}">${a.sev==='medium'||a.sev==='low'?IC.bell:IC.warn}</div>
        <div style="flex:1;min-width:0">
          <h4>${esc(a.type)} · ${esc(a.site)} ${sevChip(a.sev)}</h4>
          <p style="color:var(--muted);font-size:.78rem">${esc(a.msg)}</p>
          <p class="td-dim" style="margin-top:4px">${fmtDT(a.ts)}</p>
        </div>
      </div>`).join('')}`;
}
function sevChip(s){
  return s==='critical'?'<span class="chip chip-red">critical</span>':s==='high'?'<span class="chip chip-amber">high</span>':s==='medium'?'<span class="chip chip-blue">medium</span>':'<span class="chip chip-gray">low</span>';
}
function offNav(v){
  OFF_VIEW=v;
  $$('.off-nav button').forEach(b=>b.classList.toggle('active', b.dataset.view===v));
  if(v==='home')offHome(); else if(v==='scan')offScan(); else if(v==='inspect')offInspect(); else offAlerts();
}


/* ============================================================
   Supervisor portal — Overview / Analytics / Records / AI / Reports
   ============================================================ */
'use strict';

/* SVG icon set (gov style, stroke-based) */
const SI = {
  grid:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
  trend:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
  users:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.8"/><path d="M16 14.3c3 0 5.5 2.2 5.5 5.7"/></svg>',
  shield:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 4 5.5v6c0 5 3.4 8.7 8 10.5 4.6-1.8 8-5.5 8-10.5v-6L12 2z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/></svg>',
  cal:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>',
  bell:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
  info:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M12 11v5"/></svg>',
  warn:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 2 21h20L12 3z"/><path d="M12 10v5"/><circle cx="12" cy="18" r=".4"/></svg>',
  clock:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>',
  pin:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  qr:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h7"/></svg>',
  face:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
  pen:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 4l6 6L8 22H2v-6L14 4z"/><path d="m11 7 6 6"/></svg>',
  cpu:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
  folder:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
  file:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h9l5 5v15H6V2z"/><path d="M14 2v6h6M9 13h7M9 17h7"/></svg>',
  dl:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v3h16v-3"/></svg>',
  search:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="10" cy="10" r="6.5"/><path d="m20 20-4.8-4.8"/></svg>',
  camera:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  chart:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V4"/><path d="M4 20h16"/><rect x="8" y="12" width="3" height="5"/><rect x="13" y="8" width="3" height="9"/><rect x="18" y="5" width="3" height="12"/></svg>'
};
function ic(name){ return '<span class="ico">' + (SI[name]||'') + '</span>'; }

let SUP_PAGE='overview';
let F = { site:'all', days:14, q:'', status:'all', tab:'attendance' };
let ANOMALIES = [];

function filteredAtt(){
  return attendance.filter(a=>
    (F.site==='all'||a.site===F.site) &&
    a.ts > TODAY.getTime()-F.days*86400000 &&
    (F.status==='all'||a.status===F.status) &&
    (!F.q || a.worker.toLowerCase().includes(F.q) || a.workerId.toLowerCase().includes(F.q) || a.site.toLowerCase().includes(F.q))
  ).sort((a,b)=>b.ts-a.ts);
}
function filteredIns(){
  return inspections.filter(i=>
    (F.site==='all'||i.site===F.site) &&
    i.ts > TODAY.getTime()-F.days*86400000 &&
    (F.status==='all'||i.status===F.status) &&
    (!F.q || i.type.toLowerCase().includes(F.q) || i.officer.toLowerCase().includes(F.q) || i.site.toLowerCase().includes(F.q))
  ).sort((a,b)=>b.ts-a.ts);
}
function siteName(){ return F.site==='all' ? 'All Sites' : F.site; }
function daySeries(days, fn){
  const out=[];
  for(let i=days-1;i>=0;i--){
    const d=new Date(TODAY); d.setDate(d.getDate()-i);
    out.push({ d, label:(d.getDate())+'/'+(d.getMonth()+1), ...fn(d.getTime(), d) });
  }
  return out;
}
function attDayCounts(ts){
  const rows = attendance.filter(a=>onDay(a.ts,ts) && (F.site==='all'||a.site===F.site));
  return { present: rows.length, hours: rows.reduce((s,a)=>s+a.hours,0) };
}
function prodDay(ts){
  const rows = production.filter(p=>p.ts===ts && (F.site==='all'||p.site===F.site));
  return { tonnes: rows.reduce((s,p)=>s+p.tonnes,0), target: rows.reduce((s,p)=>s+p.target,0) };
}
function rosterCount(){ return F.site==='all' ? workers.length : workers.filter(w=>w.site===F.site).length; }

/* ---------------- Overview ---------------- */
function pgOverview(){
  const last = DAYS[13].getTime();
  const attToday = attendance.filter(a=>onDay(a.ts,last) && (F.site==='all'||a.site===F.site));
  const presToday = attToday.length;
  const roster = Math.max(rosterCount(), 1);
  const ins14 = inspections.filter(i=>i.ts>TODAY.getTime()-14*86400000 && (F.site==='all'||i.site===F.site));
  const passRate = ins14.length ? Math.round(ins14.filter(i=>i.status==='pass').length/ins14.length*100) : 100;
  const prodToday = prodDay(last);
  const avgProd = production.filter(p=>F.site==='all'||p.site===F.site).reduce((a,p)=>a+p.tonnes,0)/14;
  const prodTrend = avgProd ? (prodToday.tonnes/avgProd-1) : 0;
  const synced = attendance.filter(a=>a.ts>last && a.synced===false).length;
  const unsynced = attendance.filter(a=>a.ts>last-7*86400000 && !a.synced).length + inspections.filter(i=>!i.synced).length;

  $('#page-root').innerHTML = `
    ${pageHead('Network Overview','Live operational picture across all sites — attendance, production and safety in one view')}
    ${siteFilter()}
    <div class="kpi-grid">
      ${kpi('Attendance Today', presToday+' / '+roster, Math.round(presToday/roster*100)+'% of roster', 'var(--green)', '+4% vs yesterday')}
      ${kpi('Production Today', fmtN(prodToday.tonnes)+' t', Math.round(prodToday.tonnes/Math.max(prodToday.target,1)*100)+'% of target', 'var(--amber)',
            (prodTrend>=0?'+':'') + Math.round(prodTrend*100)+'% vs 14-day avg', prodTrend>=0)}
      ${kpi('Inspection Pass Rate', passRate+'%', ins14.length+' inspections · 14d', 'var(--blue)')}
      ${kpi('Active Alerts', '5', '2 critical · priority queue', 'var(--red)', 'view alert feed')}
      ${kpi('Compliance Score', '87 / 100', 'weights: safety 40% · attendance 30% · output 30%', 'var(--purple)', '+3 this week')}
      ${kpi('Sync Health', (100-Math.round(unsynced/roster*4))+'%', unsynced+' records pending sync', 'var(--orange)')}
    </div>
    <div class="grid-2">
      <div class="card span-all">
        <div class="card-head"><h3>${ic('chart')} Production vs Attendance — 14 Days</h3><span class="td-dim">(tonnes vs workers present)</span>
          <div class="spacer"></div><span class="chip chip-blue">${esc(siteName())}</span></div>
        <div class="chart-box"><canvas id="ch-prod-att"></canvas></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('users')} Attendance Rate by Site</h3></div>
        <div id="hb-att"></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('shield')} Inspection Outcomes — 14d</h3></div>
        <div class="chart-box"><canvas id="ch-ins-donut"></canvas></div>
      </div>
      <div class="card span-all">
        <div class="card-head"><h3>${ic('cal')} Compliance Heatmap</h3><span class="td-dim">daily attendance % — darker = lower</span>
          <div class="spacer"></div>
          <span class="td-dim">hover cells for detail</span></div>
        <div class="heat-strip" id="heatmap"></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('bell')} Latest Alerts</h3><div class="spacer"></div>
          <button class="btn btn-sm" data-goto-alerts>Open alert feed</button></div>
        ${alerts.slice(0,4).map(a=>`
          <div class="act-item">
            <span class="ai-ico" style="color:${a.sev==='critical'?'var(--red)':a.sev==='high'?'var(--saffron-d)':'var(--navy)'}">${a.sev==='critical'?SI.warn:a.sev==='high'?SI.warn:SI.info}</span>
            <div style="flex:1;min-width:0"><b>${esc(a.type)}</b> · <span class="td-dim">${esc(a.site)}</span><br>
            <span class="td-dim" style="font-size:.74rem">${esc(a.msg.slice(0,90))}…</span></div>
            <span class="ai-time">${fmtDT(a.ts)}</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('clock')} Recent Activity</h3></div>
        <div id="ov-activity"></div>
      </div>
    </div>`;
  drawSiteFilter();
  // charts
  drawBars($('#ch-prod-att'), daySeries(F.days,(ts)=>{
    const a=attDayCounts(ts), p=prodDay(ts);
    return { v1:p.tonnes, v2:a.present*10 };  // scaled for visibility, noted in legend
  }), {name1:'Production (t)', name2:'Attendance ×10', color1:C.amber, color2:C.blue, h:240});
  // attendance rate hbars
  const rows = SITES.map(s=>{
    const att = attendance.filter(a=>a.ts>last-6*8640000 && a.ts<=last && a.site===s.name).length;
    const ros = Math.max(workers.filter(w=>w.site===s.name).length,1)*7;
    return { name:s.name, pct: Math.min(att/ros,1) };
  });
  $('#hb-att').innerHTML = rows.map(r=>`
    <div class="hbar-row">
      <span class="hb-label">${esc(r.name)}</span>
      <div class="bar"><div class="bar-fill ${r.pct>0.85?'green':r.pct>0.7?'':'red'}" style="width:${r.pct*100}%"></div></div>
      <span class="hb-val">${Math.round(r.pct*100)}%</span>
    </div>`).join('');
  drawDonut($('#ch-ins-donut'), [
    { v: ins14.filter(i=>i.status==='pass').length,    c:C.green,  n:'Pass' },
    { v: ins14.filter(i=>i.status==='warning').length, c:C.amber,  n:'Warning' },
    { v: ins14.filter(i=>i.status==='fail').length,    c:C.red,    n:'Fail' }
  ], { center: ins14.length ? Math.round(ins14.filter(i=>i.status==='pass').length/ins14.length*100)+'%' : '—', sub:'pass rate' });
  // heatmap
  $('#heatmap').innerHTML = SITES.map(s=>{
    const cells = DAYS.map(d=>{
      const att = attendance.filter(a=>onDay(a.ts,d.getTime()) && a.site===s.name).length;
      const ros = Math.max(workers.filter(w=>w.site===s.name).length,1);
      const pct = att/ros;
      const col = pct>=0.9?C.green : pct>=0.75?C.amber : pct>=0.6?C.orange : C.red;
      return `<div class="heat-cell" style="background:${col}22;border:1px solid ${col}55;color:${col}" title="${esc(s.name)} · ${d.toDateString().slice(4,10)} · ${Math.round(pct*100)}% (${att}/${ros})">${Math.round(pct*100)}</div>`;
    }).join('');
    return `<div class="heat-row"><span class="hs-label">${esc(s.name)}</span>${cells}</div>`;
  }).join('');
  // activity
  const acts = [
    ...attendance.filter(a=>onDay(a.ts,last)).slice(0,3).map(a=>({ ico:SI.qr, txt:`<b>${esc(a.worker)}</b> checked in via ${a.mode.toUpperCase()} · ${esc(a.site)}`, ts:a.ts })),
    ...inspections.slice(-3).reverse().map(i=>({ ico:SI.camera, txt:`Inspection <b>${esc(i.type)}</b> ${i.status==='pass'?'passed':'flagged'} · ${esc(i.site)}`, ts:i.ts })),
    { ico:SI.cpu, txt:'AI engine flagged <b>production-attendance mismatch</b> at Jharia OC-1', ts:last+15*3600000 },
    { ico:SI.file, txt:'<b>12</b> offline records auto-synced from Neyveli Lignite', ts:last+13*3600000 }
  ].sort((a,b)=>b.ts-a.ts).slice(0,7);
  $('#ov-activity').innerHTML = acts.map(a=>`
    <div class="act-item"><span class="ai-ico">${a.ico}</span>
      <div style="flex:1;min-width:0">${a.txt}</div><span class="ai-time">${fmtDT(a.ts)}</span></div>`).join('');
  const g=$('#page-root [data-goto-alerts]'); if(g) g.onclick=()=>{ F.tab='alerts'; goSup('records'); };
}

/* ---------------- Analytics ---------------- */
function pgAnalytics(){
  $('#page-root').innerHTML = `
    ${pageHead('Deep Analytics','Trends, distributions and correlation views across the last 14 days')}
    ${siteFilter()}
    <div class="grid-2">
      <div class="card">
        <div class="card-head"><h3>${ic('trend')} Production Trend vs Target</h3></div>
        <div class="chart-box"><canvas id="ch-prod-trend"></canvas></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('users')} Shift Coverage (stacked)</h3><span class="td-dim">check-ins by shift</span></div>
        <div class="chart-box"><canvas id="ch-shifts"></canvas></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('users')} Attendance Mode Split</h3></div>
        <div class="chart-box"><canvas id="ch-modes"></canvas></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('clock')} Check-in Time Distribution</h3><span class="td-dim">today</span></div>
        <div class="chart-box"><canvas id="ch-hours"></canvas></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('users')} Crew Hours — 14d</h3><span class="td-dim">total logged hours</span></div>
        <div id="hb-crew"></div>
      </div>
      <div class="card">
        <div class="card-head"><h3>${ic('chart')} Site Contribution</h3><span class="td-dim">production share · 14d</span></div>
        <div class="chart-box"><canvas id="ch-share"></canvas></div>
      </div>
      <div class="card span-all">
        <div class="card-head"><h3>${ic('trend')} Hours Logged vs Workers Present</h3>
          <span class="td-dim">productivity signal — flat hours with falling headcount indicates fatigue risk</span></div>
        <div class="chart-box"><canvas id="ch-hours-trend"></canvas></div>
      </div>
    </div>`;
  drawSiteFilter();
  drawLine($('#ch-prod-trend'), daySeries(F.days, ts=>{ const p=prodDay(ts); return { v1:p.tonnes, v2:p.target }; }),
    { name1:'Actual (t)', name2:'Target (t)', color1:C.amber, color2:C.blue, h:220 });
  drawStacked($('#ch-shifts'), daySeries(F.days, ts=>{
    const rows = attendance.filter(a=>onDay(a.ts,ts) && (F.site==='all'||a.site===F.site));
    return { parts:[
      { v:rows.filter(a=>a.shift==='A').length, c:C.amber,  n:'Shift A (6–14h)' },
      { v:rows.filter(a=>a.shift==='B').length, c:C.blue,   n:'Shift B (14–22h)' },
      { v:rows.filter(a=>a.shift==='C').length, c:C.purple, n:'Shift C (22–6h)' }
    ]};
  }), { h:220 });
  const modes = { qr:0, face:0, manual:0 };
  attendance.filter(a=>a.ts>TODAY.getTime()-F.days*86400000 && (F.site==='all'||a.site===F.site)).forEach(a=>modes[a.mode]++);
  drawDonut($('#ch-modes'), [
    { v:modes.qr, c:C.amber, n:'QR Scan' }, { v:modes.face, c:C.blue, n:'Face ID' }, { v:modes.manual, c:C.gray||'#8fa0c2', n:'Manual' }
  ], { center: modes.qr+modes.face+modes.manual ? Math.round((modes.qr+modes.face)/(modes.qr+modes.face+modes.manual)*100)+'%' : '—', sub:'proxy-proof' });
  const bins = [0,0,0,0,0];
  attendance.filter(a=>onDay(a.ts,DAYS[13].getTime()) && (F.site==='all'||a.site===F.site))
    .forEach(a=>{ bins[Math.min(Math.floor((parseInt(a.checkin)/3)),4)]++; });
  drawBars($('#ch-hours'), [
    {label:'6–9h',v1:bins[0],v2:0},{label:'9–12h',v1:bins[1],v2:0},{label:'12–15h',v1:bins[2],v2:0},{label:'15–18h',v1:bins[3],v2:0},{label:'18h+',v1:bins[4],v2:0}
  ], {name1:'Check-ins', name2:'', color1:C.green, h:210});
  // crew hours
  const crewAgg = {};
  attendance.filter(a=>a.ts>TODAY.getTime()-F.days*86400000 && (F.site==='all'||a.site===F.site))
    .forEach(a=>{ crewAgg[a.crew]=(crewAgg[a.crew]||0)+a.hours; });
  const crews = Object.entries(crewAgg).sort((a,b)=>b[1]-a[1]);
  const maxCrew = Math.max(...crews.map(c=>c[1]),1);
  $('#hb-crew').innerHTML = crews.map(([c,h])=>`
    <div class="hbar-row">
      <span class="hb-label">${esc(c)}</span>
      <div class="bar"><div class="bar-fill blue" style="width:${h/maxCrew*100}%"></div></div>
      <span class="hb-val">${Math.round(h)}h</span>
    </div>`).join('');
  const share = SITES.map(s=>({ v:production.filter(p=>p.site===s.name).reduce((a,p)=>a+p.tonnes,0), c:C.amber, n:s.name }));
  const palette=[C.amber,C.blue,C.green,C.purple]; share.forEach((p,i)=>p.c=palette[i%4]);
  drawDonut($('#ch-share'), share, { center: fmtN(share.reduce((a,p)=>a+p.v,0))+' t', sub:'total 14d' });
  drawLine($('#ch-hours-trend'), daySeries(F.days, ts=>{ const a=attDayCounts(ts); return { v1:a.hours, v2:a.present*8 }; }),
    { name1:'Hours logged', name2:'Workers × 8h', color1:C.purple, color2:C.green, h:220 });
}

/* ---------------- Records ---------------- */
function pgRecords(){
  const tab = F.tab;
  $('#page-root').innerHTML = `
    ${pageHead('Records & Results','Searchable, filterable register of every attendance entry, inspection and alert — exportable')}
    <div class="tabs">
      <button data-t="attendance" class="${tab==='attendance'?'active':''}">Attendance <span class="td-dim">(${filteredAtt().length})</span></button>
      <button data-t="inspections" class="${tab==='inspections'?'active':''}">Inspections <span class="td-dim">(${filteredIns().length})</span></button>
      <button data-t="alerts" class="${tab==='alerts'?'active':''}">Alerts <span class="td-dim">(${alerts.length})</span></button>
    </div>
    ${siteFilter()}
    <div id="rec-body"></div>`;
  drawSiteFilter();
  $('#page-root').querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{ F.tab=b.dataset.t; pgRecords(); });
  if(tab==='attendance') recAttendance();
  else if(tab==='inspections') recInspections();
  else recAlerts();
}
function pagerHtml(page, pages, total, tag){
  return `<div class="tbl-foot">
    <span>${total} records · filtered by site/search${F.days<14?' · '+F.days+'d window':''}</span>
    <div class="spacer"></div>
    <div class="pager">
      <button class="btn btn-sm" data-pg="${page-1}" ${page<=1?'disabled':''}>Previous</button>
      <span>Page ${page} / ${Math.max(pages,1)}</span>
      <button class="btn btn-sm" data-pg="${page+1}" ${page>=pages?'disabled':''}>Next</button>
    </div>
  </div>`;
}
function recAttendance(){
  const rows = filteredAtt();
  const PP=12; const pages=Math.ceil(rows.length/PP)||1;
  F._ap = Math.min(F._ap||1, pages);
  const view = rows.slice((F._ap-1)*PP, F._ap*PP);
  $('#rec-body').innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>${ic('users')} Attendance Register</h3><div class="spacer"></div>
        <input class="f-search" id="rec-q" placeholder="Search name / ID / site" value="${esc(F.q)}" style="width:230px">
        <select id="rec-status">
          <option value="all">All statuses</option>
          <option value="ok" ${F.status==='ok'?'selected':''}>OK</option>
          <option value="flagged" ${F.status==='flagged'?'selected':''}>Flagged</option>
        </select>
        <button class="btn btn-sm" id="rec-export">CSV</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Date</th><th>Worker</th><th>ID</th><th>Site</th><th>Crew</th><th>Shift</th><th>In</th><th>Out</th><th>Hours</th><th>Mode</th><th>Status</th></tr></thead>
        <tbody>${view.map(a=>`
          <tr>
            <td class="td-dim">${fmtD(a.ts)}</td>
            <td class="td-strong">${esc(a.worker)}</td>
            <td class="mono td-dim">${a.workerId}</td>
            <td>${esc(a.site)}</td>
            <td class="td-dim">${esc(a.crew)}</td>
            <td><span class="chip chip-blue" style="text-transform:none">${a.shift}</span></td>
            <td class="mono">${a.checkin}</td>
            <td class="mono td-dim">${a.checkout}</td>
            <td>${a.hours}h</td>
            <td>${a.mode==='qr'?SI.qr+' QR':a.mode==='face'?SI.face+' Face':SI.pen+' Manual'}</td>
            <td>${a.status==='ok'?'<span class="chip chip-green">ok</span>':'<span class="chip chip-red">flagged</span>'}</td>
          </tr>`).join('') || '<tr><td colspan="11" class="list-empty">No records match the filters</td></tr>'}
        </tbody></table></div>
      ${pagerHtml(F._ap, pages, rows.length)}
    </div>`;
  const q=$('#rec-q');
  q.oninput=()=>{ F.q=q.value.toLowerCase().trim(); F._ap=1; recAttendance(); };
  $('#rec-status').onchange=e=>{ F.status=e.target.value; F._ap=1; recAttendance(); };
  $('#rec-export').onclick=()=>{
    downloadCSV('attendance_register.csv',
      ['Date','Worker','ID','Site','Crew','Shift','CheckIn','CheckOut','Hours','Mode','Status'],
      filteredAtt().map(a=>[fmtD(a.ts),a.worker,a.workerId,a.site,a.crew,a.shift,a.checkin,a.checkout,a.hours,a.mode,a.status]));
    toast('Attendance register exported to CSV.','ok');
  };
  $$('#rec-body [data-pg]').forEach(b=>b.onclick=()=>{ F._ap=+b.dataset.pg; recAttendance(); window.scrollTo({top:0,behavior:'smooth'}); });
}
function recInspections(){
  const rows = filteredIns();
  const PP=12; const pages=Math.ceil(rows.length/PP)||1;
  F._ip = Math.min(F._ip||1, pages);
  const view = rows.slice((F._ip-1)*PP, F._ip*PP);
  $('#rec-body').innerHTML = `
    <div class="card">
      <div class="card-head">
        <h3>${ic('camera')} Inspection Logs</h3><div class="spacer"></div>
        <input class="f-search" id="rec-q" placeholder="Search type / officer" value="${esc(F.q)}" style="width:230px">
        <select id="rec-status">
          <option value="all">All results</option>
          <option value="pass" ${F.status==='pass'?'selected':''}>Pass</option>
          <option value="warning" ${F.status==='warning'?'selected':''}>Warning</option>
          <option value="fail" ${F.status==='fail'?'selected':''}>Fail</option>
        </select>
        <button class="btn btn-sm" id="rec-export">CSV</button>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>ID</th><th>Date</th><th>Site</th><th>Type</th><th>Officer</th><th>Result</th><th>Hazard</th><th>Geo</th><th>Photo</th><th>Sync</th></tr></thead>
        <tbody>${view.map(i=>`
          <tr>
            <td class="mono td-dim">${i.id}</td>
            <td class="td-dim">${fmtDT(i.ts)}</td>
            <td>${esc(i.site)}</td>
            <td>${esc(i.type)}</td>
            <td class="td-dim">${esc(i.officer)}</td>
            <td>${i.status==='pass'?'<span class="chip chip-green">pass</span>':i.status==='warning'?'<span class="chip chip-amber">warning</span>':'<span class="chip chip-red">fail</span>'}</td>
            <td class="td-dim" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${esc(i.hazard)||'—'}</td>
            <td class="mono td-dim">${i.lat},${i.lng}</td>
            <td class="mono td-dim">${i.photo}</td>
            <td>${i.synced?'<span class="chip chip-green">synced</span>':'<span class="chip chip-amber">pending</span>'}</td>
          </tr>`).join('') || '<tr><td colspan="10" class="list-empty">No records match the filters</td></tr>'}
        </tbody></table></div>
      ${pagerHtml(F._ip, pages, rows.length)}
    </div>`;
  const q=$('#rec-q');
  q.oninput=()=>{ F.q=q.value.toLowerCase().trim(); F._ip=1; recInspections(); };
  $('#rec-status').onchange=e=>{ F.status=e.target.value; F._ip=1; recInspections(); };
  $('#rec-export').onclick=()=>{
    downloadCSV('inspection_logs.csv',
      ['ID','DateTime','Site','Type','Officer','Result','Hazard','Lat','Lng','Photo','Synced'],
      filteredIns().map(i=>[i.id,fmtDT(i.ts),i.site,i.type,i.officer,i.status,i.hazard,i.lat,i.lng,i.photo,i.synced?'yes':'pending']));
    toast('Inspection logs exported to CSV.','ok');
  };
  $$('#rec-body [data-pg]').forEach(b=>b.onclick=()=>{ F._ip=+b.dataset.pg; recInspections(); window.scrollTo({top:0,behavior:'smooth'}); });
}
function recAlerts(){
  $('#rec-body').innerHTML = `
    <div class="card">
      <div class="card-head"><h3>${ic('bell')} Safety Alert Feed</h3><div class="spacer"></div>
        <button class="btn btn-sm" id="rec-export">CSV</button></div>
      ${alerts.map(a=>`
        <div class="act-item">
          <span class="ai-ico" style="color:${a.sev==='critical'?'var(--red)':a.sev==='high'?'var(--saffron-d)':'var(--navy)'}">${a.sev==='critical'?SI.warn:a.sev==='high'?SI.warn:SI.info}</span>
          <div style="flex:1;min-width:0">
            <b>${esc(a.type)}</b> · ${esc(a.site)} ${sevChip(a.sev)}<br>
            <span class="td-dim" style="font-size:.76rem">${esc(a.msg)}</span>
          </div>
          <span class="ai-time">${fmtDT(a.ts)}</span>
        </div>`).join('')}
    </div>`;
  $('#rec-export').onclick=()=>{
    downloadCSV('safety_alerts.csv', ['DateTime','Severity','Type','Site','Message'],
      alerts.map(a=>[fmtDT(a.ts),a.sev,a.type,a.site,a.msg]));
    toast('Alert feed exported to CSV.','ok');
  };
}

/* ---------------- AI anomalies ---------------- */
let AI_STATE='idle';
function pgAI(){
  $('#page-root').innerHTML = `
    ${pageHead('AI Anomaly Engine','Rule-based + ML scoring across attendance, production and safety signals — with evidence and recommended actions')}
    <div class="card" style="margin-bottom:16px">
      <div class="card-head">
        <h3>${ic('cpu')} Engine Status</h3><div class="spacer"></div>
        <button class="btn btn-accent" id="ai-run">Run AI Scan</button>
      </div>
      <div id="ai-state"></div>
      <div class="scan-progress"><div id="ai-bar"></div></div>
    </div>
    <div id="ai-list"></div>`;
  renderAIState();
  $('#ai-run').onclick=runAIScan;
}
function renderAIState(){
  const st = $('#ai-state'); if(!st) return;
  if(AI_STATE==='idle'){
    st.innerHTML = `<p class="td-dim" style="font-size:.84rem">Last scan: <b>never in this session</b>. The engine cross-checks 14 days of attendance, production and inspection records (≈${attendance.length} entries) for pattern breaks.</p>`;
  } else if(AI_STATE==='scanning'){
    st.innerHTML = `<p class="td-dim" style="font-size:.84rem">Scanning — analyzing cross-signals</p>`;
  } else {
    const sev = { critical:0, high:0, medium:0 };
    ANOMALIES.forEach(a=>sev[a.sev]++);
    st.innerHTML = `<p style="font-size:.84rem;color:var(--muted)">
      Scan complete — <b style="color:var(--text)">${ANOMALIES.length} anomalies</b> found
      (${sev.critical} critical, ${sev.high} high, ${sev.medium} medium).
      Highest confidence: <b style="color:var(--text)">${Math.round(Math.max(...ANOMALIES.map(a=>a.conf),0)*100)}%</b>.</p>`;
  }
}
function runAIScan(){
  AI_STATE='scanning'; renderAIState();
  const bar=$('#ai-bar'); const list=$('#ai-list');
  list.innerHTML=''; bar.style.width='0';
  const steps=[
    [12,'Loading 14-day attendance matrix'],
    [30,'Aligning production tonnage by site'],
    [48,'Cross-checking inspection outcomes'],
    [66,'Correlating attendance and output'],
    [84,'Scoring anomalies (ML model v2.3)'],
    [100,'Compiling evidence and recommendations']
  ];
  let i=0;
  const iv=setInterval(()=>{
    if(i>=steps.length){ clearInterval(iv); ANOMALIES=detectAnomalies(); AI_STATE='done'; renderAIState(); renderAnomalies(); toast(ANOMALIES.length+' anomalies detected.','ok'); return; }
    bar.style.width=steps[i][0]+'%';
    if($('#ai-state')) $('#ai-state').querySelector('p').textContent = steps[i][1];
    i++;
  }, 420);
}
function renderAnomalies(){
  const list=$('#ai-list'); if(!list) return;
  if(AI_STATE!=='done'){ list.innerHTML=''; return; }
  const order={critical:0,high:1,medium:2};
  const sorted = ANOMALIES.slice().sort((a,b)=>order[a.sev]-order[b.sev]||b.conf-a.conf);
  const color = s => s==='critical'?'var(--red)':s==='high'?'var(--orange)':'var(--blue)';
  list.innerHTML = `
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
      <button class="btn btn-sm" data-af="all">All (${sorted.length})</button>
      <button class="btn btn-sm" data-af="critical">Critical</button>
      <button class="btn btn-sm" data-af="high">High</button>
      <button class="btn btn-sm" data-af="medium">Medium</button>
      <div class="spacer" style="flex:1"></div>
      <button class="btn btn-sm" id="an-export">Export findings</button>
    </div>
    ${sorted.map((a,idx)=>`
      <div class="anomaly-card" style="--ac:${color(a.sev)}">
        <div class="an-top">
          <span class="chip chip-purple mono">${a.id}</span>
          <span class="chip" style="border:1px solid ${color(a.sev)};color:${color(a.sev)};background:transparent">${a.sev}</span>
          <h4>${esc(a.title)}</h4>
        </div>
        <div class="an-desc"><b>${esc(a.cat)}</b> — ${esc(a.desc)}</div>
        <div class="an-evidence">${esc(a.evidence)}</div>
        <div class="an-meta">
          <span>${ic('pin')} ${esc(a.site)}</span>
          <span>${ic('clock')} ${fmtDT(a.time.getTime())}</span>
          <div class="an-conf"><span>confidence</span><div class="bar" style="height:6px"><div class="bar-fill purple" style="width:${a.conf*100}%"></div></div><b>${Math.round(a.conf*100)}%</b></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-sm" data-ack="${idx}">Acknowledge</button>
          <button class="btn btn-sm" data-inv="${idx}">Investigate</button>
        </div>
      </div>`).join('') || '<p class="list-empty">No anomalies match this filter</p>'}`;
  list.querySelectorAll('[data-af]').forEach(b=>b.onclick=()=>{
    const f=b.dataset.af;
    list.querySelectorAll('.anomaly-card').forEach(card=>{
      card.classList.toggle('hidden', f!=='all' && !card.textContent.includes(f));
    });
    list.querySelectorAll('[data-af]').forEach(x=>x.style.borderColor='');
    b.style.borderColor='var(--amber)';
  });
  list.querySelectorAll('[data-ack]').forEach(b=>b.onclick=()=>{
    b.textContent='Acknowledged'; b.disabled=true; b.style.opacity=.55;
    toast('Anomaly acknowledged — tracked in audit log');
  });
  list.querySelectorAll('[data-inv]').forEach(b=>b.onclick=()=>{
    const a=sorted[+b.dataset.inv];
    toast('Investigation opened: ' + a.cat + ' @ ' + a.site,'ok');
  });
  $('#an-export').onclick=()=>{
    downloadCSV('ai_anomalies.csv', ['ID','Category','Severity','Site','Title','Confidence','RecommendedAction'],
      sorted.map(a=>[a.id,a.cat,a.sev,a.site,a.title,Math.round(a.conf*100)+'%',a.action]));
    toast('Anomaly findings exported to CSV.','ok');
  };
}

/* ---------------- Reports ---------------- */
let REP_TAB='monthly';
function pgReports(){
  const tabs=[['monthly','Monthly Compliance Report (Auto-drafted)'],['weekly','Weekly Digest'],['incident','Incident Summary'],['custom','Custom Range']];
  $('#page-root').innerHTML = `
    ${pageHead('Regulator Reports','Auto-generated compliance documentation — preview, then download or push to the regulator portal')}
    <div class="tabs">${tabs.map(([k,l])=>`<button data-r="${k}" class="${REP_TAB===k?'active':''}">${l}</button>`).join('')}</div>
    <div class="grid-2">
      <div class="card span-all">
        <div class="card-head">
          <h3 id="rep-title"></h3><div class="spacer"></div>
          <button class="btn btn-sm" id="rep-refresh">Regenerate</button>
          <button class="btn btn-sm" id="rep-print">Print / PDF</button>
          <button class="btn btn-sm btn-accent" id="rep-push">Push to Regulator</button>
        </div>
        <div class="report-preview" id="rep-view"></div>
        <p class="td-dim" style="font-size:.76rem;margin-top:10px">Auto-drafted from live records — verify figures before pushing. Every push is recorded in the audit trail with your supervisor ID.</p>
      </div>
    </div>`;
  $('#page-root').querySelectorAll('[data-r]').forEach(b=>b.onclick=()=>{ REP_TAB=b.dataset.r; pgReports(); });
  renderReport();
  $('#rep-refresh').onclick=()=>{ renderReport(); toast('Report regenerated from live data.','ok'); };
  $('#rep-print').onclick=()=>{ toast('Preparing print view…'); setTimeout(()=>toast('Use your browser print dialog and choose Save as PDF.','ok'),700); };
  $('#rep-push').onclick=()=>{ toast('Pushing to Coal India compliance portal…');
    setTimeout(()=>toast('Report pushed. Ref CIL/2026/'+ri(1000,9999)+' — logged in audit trail.','ok'), 1400); };
}
function renderReport(){
  const ins14 = inspections.filter(i=>i.ts>TODAY.getTime()-14*86400000);
  const fails = ins14.filter(i=>i.status==='fail').length;
  const warns = ins14.filter(i=>i.status==='warning').length;
  const att14 = attendance.filter(a=>a.ts>TODAY.getTime()-14*86400000);
  const rate = Math.round(att14.length/(workers.length*14)*100);
  const prod14 = production.reduce((a,p)=>a+p.tonnes,0);
  const tgt14 = production.reduce((a,p)=>a+p.target,0);
  const month = ['January','February','March','April','May','June','July','August','September','October','November','December'][TODAY.getMonth()];
  const title = REP_TAB==='monthly' ? `Monthly Compliance Report — ${month} ${TODAY.getFullYear()}`
    : REP_TAB==='weekly' ? 'Weekly Operations Digest' : REP_TAB==='incident' ? 'Incident & Anomaly Summary' : 'Custom Range Report';
  $('#rep-title').textContent = title;
  const siteRows = SITES.map(s=>{
    const a = attendance.filter(x=>x.site===s.name).length;
    const p = production.filter(x=>x.site===s.name).reduce((q,x)=>q+x.tonnes,0);
    const f = inspections.filter(x=>x.site===s.name && x.status==='fail').length;
    return `<tr><td>${esc(s.name)}</td><td>${esc(s.region)}</td><td>${a}</td><td>${fmtN(p)} t</td><td>${f}</td><td>${f===0?'Compliant':'Review'}</td></tr>`;
  }).join('');
  $('#rep-view').innerHTML = `
    <h2>${esc(title)}</h2>
    <div class="rp-meta">Ref: SCG/${TODAY.getFullYear()}/${String(ri(100,999))} · Generated: ${fmtDT(Date.now())} · Prepared by: Anil Sharma (Mine Supervisor)</div>
    <h4>1. Executive Summary</h4>
    <p>During the reporting period, <b>${att14.length}</b> attendance entries were recorded across ${SITES.length} operational sites with an average attendance rate of <b>${rate}%</b>. Total output was <b>${fmtN(prod14)} tonnes</b> against a target of ${fmtN(tgt14)} tonnes (${Math.round(prod14/tgt14*100)}% achievement). ${fails} failed inspections and ${warns} warnings were logged; all critical alerts were acknowledged within SLA.</p>
    <h4>2. Site-wise Performance</h4>
    <table><thead><tr><th>Site</th><th>Region</th><th>Attendance Entries</th><th>Production</th><th>Failed Insp.</th><th>Status</th></tr></thead>
    <tbody>${siteRows}</tbody></table>
    <h4>3. Safety & Compliance Notes</h4>
    <ul>
      <li>${fails} failed inspections required corrective action; repeat-failure clusters flagged by the AI engine at ${SITES[0].name}.</li>
      <li>1 gas-level critical alert (Rajgamar Deep) — work suspended, ventilation increased, normalized within 2h.</li>
      <li>2 proxy attendance attempts blocked by Face ID verification.</li>
      <li>Offline-first sync maintained ${Math.round(att14.filter(a=>a.synced).length/Math.max(att14.length,1)*100)}% sync coverage despite network gaps.</li>
    </ul>
    <h4>4. Anomalies Detected (AI)</h4>
    <ul>${(ANOMALIES.length?ANOMALIES:detectAnomalies()).slice(0,4).map(a=>`<li>[${a.sev.toUpperCase()}] ${esc(a.title)} — ${esc(a.site)} (${Math.round(a.conf*100)}% confidence)</li>`).join('')}</ul>
    <h4>5. Recommendations</h4>
    <ul>
      <li>Equipment audit at ${SITES[0].name} to explain the production-attendance gap.</li>
      <li>Re-training for crews with repeat inspection failures within 48 hours.</li>
      <li>Pre-position auxiliary ventilation at Rajgamar Deep before the next blast window.</li>
    </ul>
    <p style="margin-top:18px;font-size:.76rem;color:#6b7280">This report was auto-generated by the Smart Coal Governance platform from verified field records (QR/Face attendance, geo-tagged inspections). Digitally signed · Audit ID ${'AUD-'+ri(10000,99999)}.</p>`;
}

/* ---------------- shared page chrome ---------------- */
function pageHead(title, sub){
  return `<div class="page-head"><h2>${title}</h2><div class="spacer"></div>
    <span class="pill"><span class="dot"></span>${t('online')} · ${new Date().toLocaleDateString('en-IN')}</span>
    </div><p class="ph-sub">${sub}</p>`;
}
function siteFilter(){
  return `<div class="filters">
    <select id="f-site"><option value="all">All sites (network)</option>${SITES.map(s=>`<option ${F.site===s.name?'selected':''}>${esc(s.name)}</option>`).join('')}</select>
    <select id="f-days">
      <option value="7" ${F.days===7?'selected':''}>Last 7 days</option>
      <option value="14" ${F.days===14?'selected':''}>Last 14 days</option>
    </select>
    <span class="td-dim" style="font-size:.76rem">filters apply to all charts & tables on this page</span>
  </div>`;
}
function drawSiteFilter(){
  $('#f-site').onchange=e=>{ F.site=e.target.value==='all'?'all':e.target.value; rerenderSup(); };
  $('#f-days').onchange=e=>{ F.days=+e.target.value; rerenderSup(); };
}
function kpi(label, value, sub, color, trend, up){
  return `<div class="kpi" style="--kc:${color}">
    <div class="k-label">${label}</div>
    <div class="k-value">${value}</div>
    <div class="k-sub">${sub}</div>
    ${trend?`<div class="k-trend ${up===undefined?'k-up':up?'k-up':'k-down'}">${trend}</div>`:''}
  </div>`;
}
function rerenderSup(){
  if(SUP_PAGE==='overview')pgOverview();
  else if(SUP_PAGE==='analytics')pgAnalytics();
  else if(SUP_PAGE==='records')pgRecords();
  else if(SUP_PAGE==='ai')pgAI();
  else pgReports();
}
function goSup(p){
  SUP_PAGE=p;
  $$('.side-nav button[data-page]').forEach(b=>b.classList.toggle('active', b.dataset.page===p));
  const titles={overview:t('pgOverview'),analytics:t('pgAnalytics'),records:t('pgRecords'),ai:t('pgAI'),reports:t('pgReports')};
  $('#page-title').textContent=titles[p];
  rerenderSup();
  window.scrollTo({top:0});
  closeSidebar();
}
function closeSidebar(){ $('#sidebar').classList.remove('open'); $('#side-overlay').classList.remove('show'); }


/* ============================================================
   Boot, auth, session, navigation, gov-shell wiring
   ============================================================ */
'use strict';

let ROLE=null; // 'officer' | 'supervisor'

/* ---------------- static data-icon injector ---------------- */
(function fillIcons(){
  const set = {
    user:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    monitor:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    logout:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/></svg>',
    home:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 11 9-8 9 8"/><path d="M5 10v11h5v-6h4v6h5V10"/></svg>',
    qr:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v3M14 20h7"/></svg>',
    camera:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
    bell:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
    grid:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>',
    trend:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>',
    folder:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 3h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></svg>',
    cpu:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="10" y="10" width="4" height="4"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/></svg>',
    file:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2h9l5 5v15H6V2z"/><path d="M14 2v6h6M9 13h7M9 17h7"/></svg>'
  };
  document.querySelectorAll('[data-icon]').forEach(el=>{
    const k = el.getAttribute('data-icon');
    if(set[k]) el.innerHTML = set[k];
  });
})();

/* ---------------- government shell: emblem spokes, counters, font size ---------------- */
(function govShell(){
  // Ashoka-chakra style spokes for the emblem
  const g = document.querySelector('#spokes');
  if(g){
    let s='';
    for(let i=0;i<24;i++){
      const a = i*15*Math.PI/180;
      const x1=32+6*Math.cos(a), y1=32+6*Math.sin(a);
      const x2=32+27*Math.cos(a), y2=32+27*Math.sin(a);
      s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
    }
    g.innerHTML = s;
  }
  // last updated
  const now = new Date();
  const lu = now.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][now.getMonth()] + ' ' + now.getFullYear();
  const lu1 = $('#last-updated'); if(lu1) lu1.textContent = 'Last Updated: ' + lu;
  const lu2 = $('#last-updated-2'); if(lu2) lu2.textContent = lu;
  // visitor counter (persisted per browser)
  let vc = 0;
  try{ vc = +(localStorage.getItem('scg_visits')||0) + 1; localStorage.setItem('scg_visits', vc); }catch(e){ vc = 48213; }
  const vcel = $('#visit-count'); if(vcel) vcel.textContent = String(vc + 48212).padStart(6,'0');
  // footer year
  const fy = $('#footer-year'); if(fy) fy.textContent = now.getFullYear();
  // font size toggle (GIGW style)
  const sizes = ['14px','15px','16.5px'];
  const applyFS = i => { document.body.style.fontSize = sizes[i]; };
  ['#fs-a','#fs-b','#fs-c'].forEach((sel,i)=>{
    const b = $(sel); if(b) b.onclick = ()=>applyFS(i);
  });
  applyFS(1);
  // screen reader access + footer links (demo)
  const sr = $('#sr-access'); if(sr) sr.onclick = ()=>toast('This demo supports standard browser screen readers.');
  document.querySelectorAll('[data-flink]').forEach(b=>{
    b.onclick = ()=>{
      const label = (b.textContent||'').slice(0,30).trim();
      if(label==='Welcome Page'){ show('welcome'); return; }
      toast('This is a demo prototype — external links are not active.');
    };
  });
  // skip link
  const sk = $('#skip-link'); if(sk) sk.onclick = ()=>{
    const main = (ROLE==='supervisor') ? $('#page-root') : (ROLE==='officer') ? $('#officer-root') : $('.welcome-inner');
    if(main){ main.setAttribute('tabindex','-1'); main.focus({preventScroll:false}); }
    window.scrollTo({top:0,behavior:'smooth'});
  };
})();

/* ---------------- screens ---------------- */
function show(id){
  ['welcome','login','officer','supervisor'].forEach(s=>$('#'+s).classList.toggle('hidden', s!==id));
  // app screens take full height; welcome/login keep the gov chrome visible
  const util = $('#gov-utility'), hdr = document.querySelector('.gov-header'),
        tc = document.querySelector('.tricolor'), ftr = $('#gov-footer');
  const appMode = (id==='officer'||id==='supervisor');
  [util,hdr,tc,ftr].forEach(el=>el && el.classList.toggle('hidden', appMode));
}

/* ---------------- login ---------------- */
let pendingRole=null;
function openLogin(role){
  pendingRole=role;
  const isOff = role==='officer';
  $('#login-title').textContent = isOff ? t('loginTitleOfficer') : t('loginTitleSupervisor');
  $('#login-sub').textContent   = isOff ? t('loginSubOfficer')  : t('loginSubSupervisor');
  $('#login-email').value = isOff ? OFFICERS[0].email : SUP.email;
  $('#login-pass').value  = 'demo123';
  $('#login-err').textContent='';
  show('login');
}
function doLogin(){
  const em=$('#login-email').value.trim().toLowerCase();
  const pw=$('#login-pass').value;
  const okOff  = OFFICERS.some(o=>o.email===em&&o.pass===pw);
  const okSup  = em===SUP.email&&pw===SUP.pass;
  if(pendingRole==='officer' && okOff){ ROLE='officer'; enterOfficer(); }
  else if(pendingRole==='supervisor' && okSup){ ROLE='supervisor'; enterSupervisor(); }
  else { $('#login-err').textContent=t('badCreds'); }
}
function signOut(from){
  toast(t('signedOut'),'ok');
  ROLE=null; pendingRole=null;
  show('welcome');
}

/* ---------------- enter apps ---------------- */
function enterOfficer(){
  show('officer');
  offNav('home');
}
function enterSupervisor(){
  show('supervisor');
  goSup('overview');
}

/* ---------------- language toggle ---------------- */
function setLang(l){
  LANG=l;
  const gl = $('#gov-lang'); if(gl) gl.textContent = l==='en'?'हिंदी':'English';
  applyI18n(document);
  if(ROLE==='officer') offNav(OFF_VIEW);
  if(ROLE==='supervisor'){ const titles={overview:t('pgOverview'),analytics:t('pgAnalytics'),records:t('pgRecords'),ai:t('pgAI'),reports:t('pgReports')};
    $('#page-title').textContent=titles[SUP_PAGE]; rerenderSup(); }
}
/* gov-utility language toggle mirrors the app toggles */
const glBtn = $('#gov-lang'); if(glBtn) glBtn.onclick=()=>setLang(LANG==='en'?'hi':'en');

/* ---------------- wiring ---------------- */
$$('.role-card').forEach(b=>b.onclick=()=>openLogin(b.dataset.role));
$('#login-back').onclick=()=>show('welcome');
$('#login-btn').onclick=doLogin;
$('#login-pass').addEventListener('keydown',e=>{ if(e.key==='Enter')doLogin(); });
$('#login-email').addEventListener('keydown',e=>{ if(e.key==='Enter')doLogin(); });

$$('.off-nav button').forEach(b=>b.onclick=()=>offNav(b.dataset.view));
$('#off-signout').onclick=()=>signOut('officer');
$('#off-offline').onclick=()=>{
  OFFLINE=!OFFLINE;
  $('#off-offline').classList.toggle('offline',OFFLINE);
  $('#off-offline-txt').textContent = OFFLINE?t('offline'):t('online');
  toast(OFFLINE?'Offline mode — records will queue locally.':'Online — auto-sync enabled.', OFFLINE?'err':'ok');
  if(OFF_VIEW==='home')offHome();
};

$('#sup-signout').onclick=()=>signOut('supervisor');
$('#sup-signout-top').onclick=()=>signOut('supervisor');
$$('.side-nav button[data-page]').forEach(b=>b.onclick=()=>goSup(b.dataset.page));
$('#hamburger').onclick=()=>{ $('#sidebar').classList.toggle('open'); $('#side-overlay').classList.toggle('show'); };
$('#side-overlay').onclick=closeSidebar;

/* breadcrumb update on page change */
const _origGoSup = goSup;
goSup = function(p){
  _origGoSup(p);
  const crumbs={overview:t('pgOverview'),analytics:t('pgAnalytics'),records:t('pgRecords'),ai:t('pgAI'),reports:t('pgReports')};
  const c = $('#crumb'); if(c) c.innerHTML = 'Home › <b>' + (crumbs[p]||p) + '</b>';
};

/* simulated sync pulse on supervisor pill */
setInterval(()=>{
  const p=$('#sup-sync-pill'); if(!p||ROLE!=='supervisor')return;
  const txt=$('#sup-sync-txt'); if(!txt)return;
  txt.textContent='Syncing…';
  setTimeout(()=>{ if(txt) txt.textContent='Synced'; },1400);
},20000);

/* keep charts responsive */
let _rz;
addEventListener('resize',()=>{ clearTimeout(_rz); _rz=setTimeout(()=>{ if(ROLE==='supervisor')rerenderSup(); },250); });

/* start */
_seed = 42;
show('welcome');
applyI18n(document);
