const DB_NAME = "myfit-tracker-db";
const STORE = "workouts";
const LIBRARY = "exerciseLibrary";
const DEFAULT_LIBRARY = {"Cardio":["Treadmill","Elliptical","Cycling","Walking","Running","Rowing"],"Strength":["Push-ups","Squats","Deadlift","Bench press","Lat pulldown","Dumbbell press"],"Chest":["Bench press","Incline dumbbell press","Chest fly"],"Back":["Lat pulldown","Seated cable row","Deadlift"],"Shoulders":["Shoulder press","Lateral raise","Front raise"],"Biceps":["Biceps curl","Hammer curl"],"Triceps":["Triceps pushdown","Overhead triceps extension"],"Legs":["Squats","Leg press","Lunges","Leg curl"],"Core":["Plank","Crunches","Leg raises"],"Flexibility":["Hamstring stretch","Shoulder stretch","Yoga"],"Other":["Dead hang"]};
let db;
let deferredInstallPrompt = null;

const $ = (id) => document.getElementById(id);
const today = () => new Date().toISOString().slice(0,10);

function openDB(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,2);
    request.onupgradeneeded=()=>{const d=request.result;if(!d.objectStoreNames.contains(STORE))d.createObjectStore(STORE,{keyPath:"id"});if(!d.objectStoreNames.contains(LIBRARY))d.createObjectStore(LIBRARY,{keyPath:"key"});};
    request.onsuccess=()=>{db=request.result;resolve(db);};
    request.onerror=()=>reject(request.error);
  });
}
function allWorkouts(){
  return new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readonly").objectStore(STORE).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});
}
function putWorkout(item){
  return new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readwrite").objectStore(STORE).put(item);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});
}
function deleteWorkout(id){
  return new Promise((resolve,reject)=>{const r=db.transaction(STORE,"readwrite").objectStore(STORE).delete(id);r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});
}
function uid(){return "w_"+Date.now()+"_"+Math.random().toString(36).slice(2,8);}
function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);}
function formatDate(s){if(!s)return "Date not set";const [y,m,d]=s.split("-");return `${d}-${m}-${y}`;}
function timeDuration(start,end){
  if(!start||!end)return null;
  const [sh,sm]=start.split(":").map(Number),[eh,em]=end.split(":").map(Number);
  let mins=(eh*60+em)-(sh*60+sm);if(mins<0)mins+=1440;
  return mins;
}
function durationText(mins){if(mins===null)return "Not set";return `${Math.floor(mins/60)}h ${mins%60}m`;}

function getLibrary(){return new Promise((resolve,reject)=>{const r=db.transaction(LIBRARY,"readonly").objectStore(LIBRARY).getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error);});}
async function saveLibraryItem(category,name){const key=category+"::"+name.toLowerCase();return new Promise((resolve,reject)=>{const r=db.transaction(LIBRARY,"readwrite").objectStore(LIBRARY).put({key,category,name});r.onsuccess=()=>resolve();r.onerror=()=>reject(r.error);});}
async function seedLibrary(){const existing=await getLibrary();if(existing.length)return;for(const [category,names] of Object.entries(DEFAULT_LIBRARY))for(const name of names)await saveLibraryItem(category,name);}
async function addExercise(data={}){
  const card=document.createElement("div");card.className="exercise-card";
  const categories=Object.keys(DEFAULT_LIBRARY);
  card.innerHTML=`<div class="exercise-top"><strong class="exercise-title">Exercise</strong><button class="remove-button" type="button" aria-label="Remove exercise">×</button></div>
    <div class="exercise-pickers"><label>Category<select class="exercise-category">${categories.map(c=>`<option>${c}</option>`).join("")}</select></label><label>Exercise<select class="exercise-name"></select></label><button class="library-add" type="button" aria-label="Add custom exercise">＋</button></div>
    <div class="exercise-meta"><label>Duration (min)<input class="exercise-duration" type="number" min="0" step="0.5" inputmode="decimal" placeholder="Optional" value="${data.duration??""}"></label></div>
    <div class="set-head"><span>SET</span><span>REPS</span><span>WEIGHT (KG)</span><span></span></div><div class="sets"></div><button class="add-set" type="button">＋ Add set</button>`;
  const category=card.querySelector(".exercise-category"), name=card.querySelector(".exercise-name");
  async function populate(selected){const lib=await getLibrary();const names=lib.filter(x=>x.category===category.value).map(x=>x.name).sort();name.innerHTML=names.map(n=>`<option value="${escapeAttr(n)}">${escapeAttr(n)}</option>`).join("");if(selected&&names.includes(selected))name.value=selected;}
  category.value=categories.includes(data.category)?data.category:"Strength";await populate(data.name);category.addEventListener("change",()=>populate());
  card.querySelector(".library-add").addEventListener("click",async()=>{const custom=prompt("Enter a new exercise name:");if(!custom||!custom.trim())return;await saveLibraryItem(category.value,custom.trim());await populate(custom.trim());showToast("Exercise saved to your personal list.");});
  card.querySelector(".remove-button").addEventListener("click",()=>{card.remove();renumberExercises();});card.querySelector(".add-set").addEventListener("click",()=>addSet(card.querySelector(".sets")));
  $("exerciseList").appendChild(card);const sets=data.sets?.length?data.sets:[{}];sets.forEach(x=>addSet(card.querySelector(".sets"),x));renumberExercises();
}
function addSet(container,data={}){
  const row=document.createElement("div");row.className="set-row";
  row.innerHTML=`<span class="set-number"></span><input class="set-reps" type="number" min="0" inputmode="numeric" placeholder="Reps" value="${data.reps??""}"><input class="set-weight" type="number" min="0" step="0.1" inputmode="decimal" placeholder="kg" value="${data.weight??""}"><button class="remove-set" type="button" aria-label="Remove set">×</button>`;
  row.querySelector(".remove-set").addEventListener("click",()=>{row.remove();renumberSets(container);});
  container.appendChild(row);renumberSets(container);
}
function renumberSets(container){[...container.children].forEach((r,i)=>r.querySelector(".set-number").textContent=i+1);}
function renumberExercises(){[...$("exerciseList").children].forEach((c,i)=>{const input=c.querySelector(".exercise-name");input.placeholder=`Exercise ${i+1} name`;});}
function escapeAttr(s){return String(s).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;").replaceAll(">","&gt;");}
function readForm(){
  const exercises=[...$("exerciseList").children].map(card=>({
    name:card.querySelector(".exercise-name").value.trim(),
    category:card.querySelector(".exercise-category").value,
    duration:card.querySelector(".exercise-duration").value===""?null:Number(card.querySelector(".exercise-duration").value),
    sets:[...card.querySelectorAll(".set-row")].map(r=>({reps:r.querySelector(".set-reps").value===""?null:Number(r.querySelector(".set-reps").value),weight:r.querySelector(".set-weight").value===""?null:Number(r.querySelector(".set-weight").value)}))
  }));
  return {id:uid(),date:$("workoutDate").value,inTime:$("inTime").value,outTime:$("outTime").value,bodyWeight:$("bodyWeight").value===""?null:Number($("bodyWeight").value),sessionNotes:$("sessionNotes").value.trim(),exercises,createdAt:new Date().toISOString()};
}
async function saveForm(){
  const item=readForm();
  if(!item.date){showToast("Please select the workout date.");return;}
  if(!item.exercises.length||item.exercises.every(e=>!e.name)){showToast("Add at least one exercise name.");return;}
  item.exercises=item.exercises.filter(e=>e.name);
  await putWorkout(item);resetForm();await refresh();showToast("Workout saved on this device.");
}
function resetForm(){
  $("workoutDate").value=today();$("bodyWeight").value="";$("inTime").value="";$("outTime").value="";$("sessionNotes").value="";
  $("exerciseList").innerHTML="";addExercise();updateDuration();
}
function updateDuration(){$("sessionDuration").textContent=durationText(timeDuration($("inTime").value,$("outTime").value));}
function switchTab(tab){
  ["entry","history","backup"].forEach(name=>{$(name+"Panel").hidden=name!==tab;document.querySelector(`[data-tab="${name}"]`).classList.toggle("active",name===tab);});
  if(tab==="history")renderHistory();
}
function totalSets(w){return (w.exercises||[]).reduce((n,e)=>n+(e.sets||[]).length,0);}
function renderHistory(){
  const list=$("historyList");list.innerHTML="";
  allWorkouts().then(workouts=>{
    workouts.sort((a,b)=>(b.date||"").localeCompare(a.date||"")||(b.createdAt||"").localeCompare(a.createdAt||""));
    $("historyCount").textContent=`${workouts.length} RECORDS`;
    $("emptyHistory").hidden=workouts.length>0;
    workouts.forEach(w=>{
      const names=w.exercises.map(e=>e.name).join(", ");
      const mins=timeDuration(w.inTime,w.outTime);
      const item=document.createElement("article");item.className="history-item";
      item.innerHTML=`<div class="history-item-top"><div><div class="history-date">${formatDate(w.date)}</div><div class="history-meta">${w.inTime||"—"} to ${w.outTime||"—"} · ${durationText(mins)}</div></div><span class="pill">${w.exercises.length} EXERCISES</span></div>
      <div class="history-exercises">${escapeAttr(names)}<br>${totalSets(w)} total sets${w.bodyWeight!==null&&w.bodyWeight!==undefined?" · "+w.bodyWeight+" kg body weight":""}</div>
      <div class="history-actions"><button class="text-button danger" data-delete="${escapeAttr(w.id)}">Delete</button></div>`;
      item.querySelector("[data-delete]").addEventListener("click",async()=>{if(confirm("Delete this workout record?")){await deleteWorkout(w.id);await refresh();renderHistory();showToast("Workout deleted.");}});
      list.appendChild(item);
    });
  });
}
async function refresh(){
  const workouts=await allWorkouts();$("totalWorkouts").textContent=workouts.length;
  const now=new Date(),day=now.getDay(),monday=new Date(now);monday.setDate(now.getDate()-(day===0?6:day-1));monday.setHours(0,0,0,0);
  const week=workouts.filter(w=>w.date&&new Date(w.date+"T00:00:00")>=monday).length;$("weekWorkouts").textContent=week;
  const latest=workouts.filter(w=>w.bodyWeight!==null&&w.bodyWeight!==undefined).sort((a,b)=>(b.date||"").localeCompare(a.date||""))[0];
  $("latestWeight").textContent=latest?`${latest.bodyWeight}`:"—";
}
function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function dateStamp(){return today().replaceAll("-","");}
async function backupData(){
  const workouts=await allWorkouts();
  const exerciseLibrary=await getLibrary();
  const backup={app:"MyFit Tracker",formatVersion:2,exportedAt:new Date().toISOString(),workouts,exerciseLibrary};
  downloadBlob(new Blob([JSON.stringify(backup,null,2)],{type:"application/json"}),`MyFit_Backup_${dateStamp()}.json`);
  $("backupStatus").textContent=`Backup created with ${workouts.length} workout(s).`;
}
async function restoreData(file){
  try{
    const parsed=JSON.parse(await file.text());
    if(parsed.app!=="MyFit Tracker"||!Array.isArray(parsed.workouts))throw new Error("This doesn't look like a MyFit backup file.");
    let added=0,skipped=0;
    if(Array.isArray(parsed.exerciseLibrary)){for(const x of parsed.exerciseLibrary){if(x&&x.category&&x.name)await saveLibraryItem(x.category,x.name);}}
    const existing=await allWorkouts();const ids=new Set(existing.map(w=>w.id));
    for(const w of parsed.workouts){
      if(!w.id||!w.date||!Array.isArray(w.exercises)){skipped++;continue;}
      if(ids.has(w.id)){skipped++;continue;}
      await putWorkout(w);ids.add(w.id);added++;
    }
    await refresh();renderHistory();$("backupStatus").textContent=`Restore complete: ${added} added, ${skipped} skipped (invalid or already present).`;
    showToast(`Restore complete. ${added} workout(s) added.`);
  }catch(e){showToast(e.message||"Could not read backup file.");}
  $("restoreFile").value="";
}
async function exportExcel(){
  const workouts=await allWorkouts();
  if(!workouts.length){showToast("There are no workouts to export yet.");return;}
  if(!window.XLSX){showToast("Excel export needs an internet connection the first time. Please reconnect and try again.");return;}
  const summary=[["Date","In Time","Out Time","Session Duration (minutes)","Body Weight (kg)","Exercise Count","Total Sets","Session Notes"]];
  const details=[["Date","Exercise","Category","Exercise Duration (minutes)","Set Number","Reps","Weight (kg)","Session In Time","Session Out Time"]];
  workouts.sort((a,b)=>(a.date||"").localeCompare(b.date||""));
  workouts.forEach(w=>{
    const mins=timeDuration(w.inTime,w.outTime);
    summary.push([w.date||"",w.inTime||"",w.outTime||"",mins??"",w.bodyWeight??"",w.exercises.length,totalSets(w),w.sessionNotes||""]);
    w.exercises.forEach(e=>{
      (e.sets?.length?e.sets:[{}]).forEach((s,i)=>details.push([w.date||"",e.name,e.category||"",e.duration??"",i+1,s.reps??"",s.weight??"",w.inTime||"",w.outTime||""]));
    });
  });
  const wb=XLSX.utils.book_new();
  const ws1=XLSX.utils.aoa_to_sheet(summary),ws2=XLSX.utils.aoa_to_sheet(details);
  ws1["!cols"]=[{wch:14},{wch:12},{wch:12},{wch:22},{wch:17},{wch:15},{wch:12},{wch:38}];
  ws2["!cols"]=[{wch:14},{wch:25},{wch:15},{wch:24},{wch:12},{wch:10},{wch:12},{wch:14},{wch:14}];
  XLSX.utils.book_append_sheet(wb,ws1,"Workout Summary");XLSX.utils.book_append_sheet(wb,ws2,"Exercise Details");
  XLSX.writeFile(wb,`MyFit_Workouts_${dateStamp()}.xlsx`);
  $("backupStatus").textContent=`Excel exported: ${workouts.length} workout(s).`;
}
function setup(){
  $("workoutDate").value=today();addExercise();updateDuration();
  $("addExercise").addEventListener("click",()=>addExercise());
  $("saveWorkout").addEventListener("click",saveForm);
  $("inTime").addEventListener("change",updateDuration);$("outTime").addEventListener("change",updateDuration);
  document.querySelectorAll(".tab").forEach(b=>b.addEventListener("click",()=>switchTab(b.dataset.tab)));
  $("backupBtn").addEventListener("click",backupData);
  $("restoreBtn").addEventListener("click",()=>$("restoreFile").click());
  $("restoreFile").addEventListener("change",e=>{if(e.target.files[0])restoreData(e.target.files[0]);});
  $("excelBtn").addEventListener("click",exportExcel);
  window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstallPrompt=e;$("installBtn").hidden=false;});
  $("installBtn").addEventListener("click",async()=>{if(deferredInstallPrompt){deferredInstallPrompt.prompt();deferredInstallPrompt=null;}});
  if("serviceWorker" in navigator && location.protocol!=="file:")navigator.serviceWorker.register("./service-worker.js").catch(()=>{});
}
openDB().then(async()=>{await seedLibrary();setup();refresh();}).catch(()=>showToast("Storage could not start. Please open this app in Chrome."));
