(function(){
"use strict";
var ORIGINAL="", S=null, ETAG=null;
var app=document.getElementById("app");
var dirty=0, PW=null;
try{PW=sessionStorage.getItem("dt-admin");}catch(e){}
var SWATCH=["#3D7397","#2F7A80","#3F7A6E","#5B7A36","#6C7838","#9C7A26","#9B6230","#A3553A","#7A5C3A","#6B5B8C"];

var I={
 search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
 menu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
 close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
 edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/></svg>',
 up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 14 6-6 6 6"/></svg>',
 down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 10 6 6 6-6"/></svg>',
 del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
 left:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 6-6 6 6 6"/></svg>',
 right:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
 logo:'<svg viewBox="0 0 32 32"><path d="M2 26 12 9l5 8 3-5 10 14z" fill="#9FC1D4"/><path d="M12 9l2.6 4.2-2.6-1.4-2.4 2.1z" fill="#fff"/><path d="M2 26h28" stroke="#E8B04A" stroke-width="2.2"/></svg>'
};
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function ch(id){for(var i=0;i<S.chapters.length;i++)if(S.chapters[i].id===id)return S.chapters[i];}
function pagesOf(cid){return S.pages.filter(function(p){return p.chapter===cid;});}
function pageById(id){for(var i=0;i<S.pages.length;i++)if(S.pages[i].id===id)return S.pages[i];}
function count(p){var n=0;p.sections.forEach(function(s){n+=s.terms.length;});return n;}
function findTerm(tid){for(var a=0;a<S.pages.length;a++){var p=S.pages[a];for(var b=0;b<p.sections.length;b++){var s=p.sections[b];for(var c=0;c<s.terms.length;c++)if(s.terms[c].id===tid)return {page:p,sec:s,term:s.terms[c],idx:c};}}}
function img(u){return u||"";}
function norm(s){return String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,6);}
function toast(msg,ms){var t=document.createElement("div");t.className="toast";t.setAttribute("role","status");t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},ms||3200);}

/* ---------- shell ---------- */
var top=document.createElement("header");top.className="top";
document.body.insertBefore(top,app);
function renderTop(cur){
 var nav=S.chapters.map(function(c){var p=pagesOf(c.id)[0];return '<a href="#'+(p?p.id:"acasa")+'" style="--c:'+c.color+'" aria-current="'+(cur===c.id)+'">'+esc(c.name)+'</a>';}).join("");
 top.innerHTML='<div class="topin"><a class="brand" href="#acasa">'+I.logo+'<span><b>Dicționar toponimic</b><small>al reliefului românesc</small></span></a>'+
 '<nav class="chapnav" aria-label="Capitole">'+nav+'</nav>'+
 '<div class="tools"><button class="ib" data-act="search" aria-label="Caută">'+I.search+'</button>'+
 '<button class="adminbtn" data-act="admin" aria-pressed="'+document.body.classList.contains("admin")+'">'+I.edit+'<span>Administrare</span></button>'+
 '<button class="ib menubtn" data-act="menu" aria-label="Meniu">'+I.menu+'</button></div></div>';
}

/* ---------- views ---------- */
function renderHome(){
 renderTop(null);
 var total=0;S.pages.forEach(function(p){total+=count(p);});
 var cards=S.chapters.map(function(c){
  var ps=pagesOf(c.id),n=0,ims=[];ps.forEach(function(p){n+=count(p);p.sections.forEach(function(s){var t=s.terms[0];if(t&&ims.length<4&&img(t.img))ims.push(img(t.img));});});
  ps.forEach(function(p){p.sections.forEach(function(s){s.terms.forEach(function(t){if(ims.length<4&&img(t.img)&&ims.indexOf(img(t.img))<0)ims.push(img(t.img));});});});
  return '<a class="chcard" style="--c:'+c.color+'" href="#'+(ps[0]?ps[0].id:"acasa")+'"><div class="mos">'+ims.map(function(u){return '<img src="'+u+'" alt="">';}).join("")+'</div><div class="b"><h2>'+esc(c.name)+'</h2><p>'+n+' de termeni</p><div class="pg">'+ps.map(function(p){return '<span>Pagina '+p.num+'</span>';}).join("")+'</div></div></a>';
 }).join("");
 app.innerHTML='<div class="homehero"><div class="in"><div class="kick">Atlas ilustrat</div><h1>Dicționar toponimic<br>al reliefului românesc</h1><p>Termenii populari prin care românii numesc formele de relief și apele, explicați și ilustrați. '+total+' de termeni în '+S.chapters.length+' capitole.</p><button class="searchfield" data-act="search">'+I.search+'Caută un termen, de exemplu „strungă”</button></div></div><main><div class="chgrid">'+cards+'</div></main>';
}
function cardHTML(t,n,s){
 var u=img(t.img);
 return '<article class="card" id="'+t.id+'" style="--c:'+s.color+'"><button class="pic" data-act="zoom" data-t="'+t.id+'" aria-label="Mărește: '+esc(t.name)+'">'+(u?'<img src="'+u+'" alt="'+esc(t.name)+'" loading="lazy">':'<span class="noimg">fără imagine</span>')+'</button>'+
 '<div class="txt"><span class="num">'+n+'</span><h3>'+esc(t.name)+'</h3>'+(t.alias?'<p class="alias">sau '+esc(t.alias)+'</p>':'')+'<p class="def">'+esc(t.def)+'</p></div>'+
 '<div class="ac cardtools"><button data-act="up" data-t="'+t.id+'" aria-label="Mută mai sus">'+I.up+'</button><button data-act="down" data-t="'+t.id+'" aria-label="Mută mai jos">'+I.down+'</button><button data-act="edit" data-t="'+t.id+'" aria-label="Editează">'+I.edit+'</button><button class="del" data-act="del" data-t="'+t.id+'" aria-label="Șterge">'+I.del+'</button></div></article>';
}
function renderPage(p){
 var c=ch(p.chapter);renderTop(c.id);
 var sib=pagesOf(c.id);
 var seg=sib.map(function(x){return '<a href="#'+x.id+'" aria-current="'+(x.id===p.id)+'">Pagina '+x.num+'</a>';}).join("");
 var chips=p.sections.map(function(s,i){return '<a href="#'+p.id+'-'+(i+1)+'"><i style="background:'+s.color+'"></i>'+esc(s.title)+'</a>';}).join("");
 var legend=p.sections.map(function(s,i){return '<a href="#'+p.id+'-'+(i+1)+'"><i style="background:'+s.color+'"></i>'+esc(s.title)+'<b>'+s.terms.length+'</b></a>';}).join("");
 var n=0;
 var secs=p.sections.map(function(s,i){
  var cards=s.terms.map(function(t){n++;return cardHTML(t,n,s);}).join("");
  return '<section class="sec" id="'+p.id+'-'+(i+1)+'"><div class="band" style="background:'+s.color+'"><span class="bidx">'+(i+1)+'</span><h2>'+esc(s.title)+(s.sub?'<span>'+esc(s.sub)+'</span>':'')+'</h2><span class="cnt">'+s.terms.length+' termeni</span>'+
  '<span class="ac bandtools"><button data-act="secup" data-s="'+s.id+'" aria-label="Mută secțiunea mai sus">'+I.up+'</button><button data-act="secedit" data-s="'+s.id+'" aria-label="Editează secțiunea">'+I.edit+'</button><button data-act="secdel" data-s="'+s.id+'" aria-label="Șterge secțiunea">'+I.del+'</button></span></div>'+
  '<div class="grid">'+cards+'<button class="ac addcard" data-act="add" data-s="'+s.id+'">'+I.plus+'Adaugă termen</button></div></section>';
 }).join("");
 app.innerHTML='<div class="sub" style="--c:'+c.color+'"><div class="subin"><div class="seg">'+seg+'</div><nav class="chips" aria-label="Secțiuni">'+chips+'</nav></div></div>'+
 '<div class="hero"><div class="heroin"><div><div class="kick">Dicționar toponimic al reliefului românesc</div><h1>'+esc(c.name)+'</h1><div class="meta">Pagina '+p.num+' din '+sib.length+' &nbsp;|&nbsp; '+count(p)+' de termeni</div></div><nav class="legend" aria-label="Categorii">'+legend+'</nav></div></div>'+
 '<main>'+secs+'<button class="ac addsec" data-act="addsec" data-p="'+p.id+'">'+I.plus+'Adaugă secțiune</button></main>';
}

/* ---------- routing ---------- */
var curPage=null;
function route(){
 var h=decodeURIComponent(location.hash.slice(1));
 if(!h||h==="acasa"){curPage=null;renderHome();window.scrollTo(0,0);return;}
 var m=h.match(/^(p\d+)(?:-(\d+))?$/);
 if(m&&pageById(m[1])){
  var same=curPage===m[1];curPage=m[1];if(!same||!m[2])renderPage(pageById(m[1]));
  if(m[2]){var el=document.getElementById(h);if(el)el.scrollIntoView();}else if(!same)window.scrollTo(0,0);
  return;
 }
 if(/^t/.test(h)){var f=findTerm(h);if(f){if(curPage!==f.page.id){curPage=f.page.id;renderPage(f.page);}var e=document.getElementById(h);if(e){e.scrollIntoView({block:"center"});e.classList.remove("flash");void e.offsetWidth;e.classList.add("flash");}return;}}
 curPage=null;renderHome();
}
function rerender(){var y=window.scrollY;if(curPage)renderPage(pageById(curPage));else renderHome();window.scrollTo(0,y);}
addEventListener("hashchange",route);

/* ---------- drawer ---------- */
var drawer=document.createElement("dialog");drawer.className="drawer";document.body.appendChild(drawer);
function openDrawer(){
 drawer.innerHTML='<div class="dh"><b class="osw" style="font-size:20px;letter-spacing:.05em;text-transform:uppercase">Cuprins</b><button class="ib" data-act="closedrawer" aria-label="Închide">'+I.close+'</button></div><nav>'+
 '<a class="chh" href="#acasa">Acasă</a>'+
 S.chapters.map(function(c){return '<a class="chh" href="#'+(pagesOf(c.id)[0]||{}).id+'"><i style="background:'+c.color+'"></i>'+esc(c.name)+'</a>'+pagesOf(c.id).map(function(p){return '<a class="pgl" href="#'+p.id+'">Pagina '+p.num+'</a>'+p.sections.map(function(s,i){return '<a class="scl" href="#'+p.id+'-'+(i+1)+'">'+esc(s.title)+'</a>';}).join("");}).join("");}).join("")+'</nav>';
 drawer.showModal();
}
drawer.addEventListener("click",function(e){if(e.target===drawer||e.target.closest("a")||e.target.closest('[data-act="closedrawer"]'))drawer.close();});

/* ---------- search ---------- */
var sd=document.createElement("dialog");sd.className="search";document.body.appendChild(sd);
sd.innerHTML='<div class="sh">'+I.search+'<input type="search" placeholder="Caută în toți termenii…" aria-label="Caută" autocomplete="off"><button class="ib" style="color:var(--muted)" data-act="closesearch" aria-label="Închide">'+I.close+'</button></div><div class="res" role="listbox"></div>';
var sin=sd.querySelector("input"),sres=sd.querySelector(".res"),sel=0,hits=[];
function doSearch(){
 var q=norm(sin.value.trim());hits=[];
 S.pages.forEach(function(p){var c=ch(p.chapter);p.sections.forEach(function(s){s.terms.forEach(function(t){
  var nm=norm(t.name+" "+t.alias),df=norm(t.def),sc=0;
  if(!q)return; if(nm.indexOf(q)===0)sc=3;else if(nm.indexOf(q)>0)sc=2;else if(df.indexOf(q)>=0)sc=1;
  if(sc)hits.push({t:t,p:p,c:c,sc:sc});});});});
 hits.sort(function(a,b){return b.sc-a.sc||a.t.name.localeCompare(b.t.name,"ro");});hits=hits.slice(0,40);sel=0;
 if(!q){sres.innerHTML='<div class="empty">Scrie un termen sau un cuvânt din definiție.</div>';return;}
 if(!hits.length){sres.innerHTML='<div class="empty">Niciun rezultat pentru „'+esc(sin.value)+'”.</div>';return;}
 sres.innerHTML=hits.map(function(h,i){return '<button class="r" role="option" aria-selected="'+(i===0)+'" data-act="go" data-t="'+h.t.id+'" style="--c:'+h.c.color+'"><img src="'+img(h.t.img)+'" alt=""><span style="min-width:0"><b>'+esc(h.t.name)+'</b><small>'+esc(h.t.def)+'</small></span><span class="tag">'+esc(h.c.name)+' '+h.p.num+'</span></button>';}).join("");
}
sin.addEventListener("input",doSearch);
sin.addEventListener("keydown",function(e){
 var rs=sres.querySelectorAll(".r");if(!rs.length)return;
 if(e.key==="ArrowDown"||e.key==="ArrowUp"){e.preventDefault();rs[sel].setAttribute("aria-selected","false");sel=(sel+(e.key==="ArrowDown"?1:-1)+rs.length)%rs.length;rs[sel].setAttribute("aria-selected","true");rs[sel].scrollIntoView({block:"nearest"});}
 if(e.key==="Enter"){e.preventDefault();rs[sel].click();}
});
sd.addEventListener("click",function(e){if(e.target===sd)sd.close();});
function openSearch(){sin.value="";doSearch();sd.showModal();setTimeout(function(){sin.focus();},30);}
addEventListener("keydown",function(e){if((e.key==="k"&&(e.metaKey||e.ctrlKey))||(e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName)&&!document.querySelector("dialog[open]"))){e.preventDefault();openSearch();}});

/* ---------- lightbox ---------- */
var lb=document.createElement("dialog");lb.className="lb";document.body.appendChild(lb);var lbList=[],lbI=0;
function showLb(){var t=lbList[lbI],f=findTerm(t.id);lb.innerHTML='<div class="box"><img src="'+img(t.img)+'" alt="'+esc(t.name)+'"><div class="cap" style="--c:'+f.sec.color+'"><h3>'+esc(t.name)+(t.alias?' <span style="font-weight:400;font-size:.6em;text-transform:none;font-style:italic">sau '+esc(t.alias)+'</span>':'')+'</h3><p>'+esc(t.def)+'</p></div></div><div class="nav"><button data-act="lbprev">'+I.left+'Înapoi</button><button data-act="lbclose">Închide</button><button data-act="lbnext">Înainte'+I.right+'</button></div>';}
function openLb(tid){var f=findTerm(tid);lbList=[];f.page.sections.forEach(function(s){lbList=lbList.concat(s.terms);});lbI=lbList.indexOf(f.term);showLb();lb.showModal();}
lb.addEventListener("click",function(e){if(e.target===lb)lb.close();});
lb.addEventListener("keydown",function(e){if(e.key==="ArrowRight"){lbI=(lbI+1)%lbList.length;showLb();}if(e.key==="ArrowLeft"){lbI=(lbI-1+lbList.length)%lbList.length;showLb();}});

/* ---------- editor ---------- */
var ed=document.createElement("dialog");ed.className="ed";document.body.appendChild(ed);
var pendingImg=null;
function resizeImage(file,cb){
 var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(im.width,im.height),cv=document.createElement("canvas");cv.width=cv.height=640;var x=cv.getContext("2d");x.fillStyle="#F7EAD0";x.fillRect(0,0,640,640);x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,640,640);cv.toBlob(function(b){cb(b,URL.createObjectURL(b));},"image/jpeg",0.85);};im.onerror=function(){toast("Imaginea nu a putut fi citită.");};im.src=fr.result;};fr.readAsDataURL(file);
}
function openTermEditor(t,secId){
 var isNew=!t;pendingImg=null;
 ed.innerHTML='<form method="dialog"><h3>'+(isNew?"Termen nou":"Editează termenul")+'</h3>'+
 '<label for="f-name">Denumire</label><input type="text" id="f-name" required value="'+esc(isNew?"":t.name)+'">'+
 '<label for="f-alias">Variantă (opțional)</label><input type="text" id="f-alias" value="'+esc(isNew?"":t.alias)+'" placeholder="de exemplu Zănoagă">'+
 '<label for="f-def">Definiție</label><textarea id="f-def" required>'+esc(isNew?"":t.def)+'</textarea>'+
 '<label>Ilustrație</label><div class="imgrow"><div class="prev">'+(!isNew&&img(t.img)?'<img src="'+img(t.img)+'" alt="">':'fără imagine')+'</div><label class="filebtn">'+I.plus+'Alege imagine<input type="file" accept="image/*"></label></div>'+
 '<div class="acts"><button type="button" class="ghost" data-act="edcancel">Renunță</button><button type="submit" class="pri">'+(isNew?"Adaugă":"Salvează")+'</button></div></form>';
 ed.querySelector('input[type=file]').addEventListener("change",function(e){var f=e.target.files[0];if(!f)return;resizeImage(f,function(b,u){pendingImg=b;ed.querySelector(".prev").innerHTML='<img src="'+u+'" alt="">';});});
 ed.querySelector("form").onsubmit=function(e){
  e.preventDefault();
  var nm=ed.querySelector("#f-name").value.trim(),al=ed.querySelector("#f-alias").value.trim(),df=ed.querySelector("#f-def").value.trim();
  if(!nm||!df){toast("Completează denumirea și definiția.");return;}
  var sb=ed.querySelector(".pri");
  function finish(url){
   if(isNew){var s=findSec(secId);t={id:uid("t"),name:nm,alias:al,def:df,img:url||""};s.terms.push(t);}
   else{t.name=nm;t.alias=al;t.def=df;if(url)t.img=url;}
   change();ed.close();rerender();
   if(isNew)setTimeout(function(){location.hash=t.id;},30);
  }
  if(pendingImg){sb.disabled=true;sb.textContent="Se încarcă imaginea…";uploadImage(pendingImg).then(finish).catch(function(err){sb.disabled=false;sb.textContent="Salvează";if(err.message!=="auth")toast("Imaginea nu a putut fi încărcată.");});}
  else finish(null);
 };
 ed.showModal();
}
function findSec(sid){for(var a=0;a<S.pages.length;a++){var p=S.pages[a];for(var b=0;b<p.sections.length;b++)if(p.sections[b].id===sid)return p.sections[b];}}
function pageOfSec(sid){for(var a=0;a<S.pages.length;a++){if(S.pages[a].sections.some(function(s){return s.id===sid;}))return S.pages[a];}}
function openSecEditor(s,pid){
 var isNew=!s;
 ed.innerHTML='<form method="dialog"><h3>'+(isNew?"Secțiune nouă":"Editează secțiunea")+'</h3>'+
 '<label for="f-st">Titlu</label><input type="text" id="f-st" required value="'+esc(isNew?"":s.title)+'">'+
 '<label for="f-ss">Subtitlu (opțional)</label><input type="text" id="f-ss" value="'+esc(isNew?"":s.sub)+'" placeholder="de exemplu partea I">'+
 '<label>Culoare</label><div class="swatches">'+SWATCH.map(function(c,i){var on=isNew?i===0:(s.color===c);return '<label style="background:'+c+'"><input type="radio" name="col" value="'+c+'"'+(on?" checked":"")+'><span></span></label>';}).join("")+'</div>'+
 '<div class="acts"><button type="button" class="ghost" data-act="edcancel">Renunță</button><button type="submit" class="pri">'+(isNew?"Adaugă":"Salvează")+'</button></div></form>';
 ed.querySelector("form").onsubmit=function(e){
  e.preventDefault();var st=ed.querySelector("#f-st").value.trim(),ss=ed.querySelector("#f-ss").value.trim(),c=(ed.querySelector("input[name=col]:checked")||{}).value||SWATCH[0];
  if(!st){toast("Completează titlul.");return;}
  if(isNew){pageById(pid).sections.push({id:uid("s"),title:st,sub:ss,color:c,terms:[]});}else{s.title=st;s.sub=ss;s.color=c;}
  change();ed.close();rerender();
 };
 ed.showModal();
}
ed.addEventListener("click",function(e){if(e.target.closest('[data-act="edcancel"]'))ed.close();});

/* ---------- admin state ---------- */
var bar=document.createElement("div");bar.className="pending";bar.setAttribute("role","region");bar.setAttribute("aria-label","Modificări");document.body.appendChild(bar);
function renderBar(msg){
 bar.innerHTML='<span class="msg">'+(msg||(dirty?dirty+(dirty===1?" modificare nepublicată":" modificări nepublicate"):"Mod administrare: modificările apar după „Publică”."))+'</span>'+
 '<button class="ghost" data-act="logout">Ieșire</button><button class="ghost" data-act="discard"'+(dirty?"":" disabled")+'>Renunță</button><button class="pri" data-act="publish"'+(dirty?"":" disabled")+'>Publică</button>';
}
function change(){dirty++;renderBar();}
addEventListener("beforeunload",function(e){if(dirty){e.preventDefault();e.returnValue="";}});
function api(path,opts){opts=opts||{};opts.headers=opts.headers||{};if(PW)opts.headers["x-admin-password"]=PW;return fetch(path,opts);}
function logout(msg){PW=null;try{sessionStorage.removeItem("dt-admin");}catch(e){}document.documentElement.classList.remove("can-edit");document.body.classList.remove("admin");if(msg)toast(msg);rerender();}
function doPublish(){
 renderBar("Se salvează…");bar.querySelectorAll("button").forEach(function(b){b.disabled=true;});
 api("/api/data",{method:"PUT",headers:{"content-type":"application/json"},body:JSON.stringify({data:S,etag:ETAG})}).then(function(r){
  return r.json().catch(function(){return {};}).then(function(j){
   if(r.ok){ETAG=j.etag;ORIGINAL=JSON.stringify(S);dirty=0;renderBar();toast("Publicat. Modificările sunt vizibile pentru toți.");return;}
   if(r.status===401){renderBar();logout("Sesiunea de administrare a expirat. Autentifică-te din nou.");return;}
   if(r.status===409){renderBar("Altcineva a salvat între timp. Reîncarcă pagina pentru a vedea versiunea nouă.");return;}
   if(r.status===413){renderBar();toast("Conținutul e prea mare pentru a fi salvat.");return;}
   renderBar();toast("Salvarea nu a reușit. Încearcă din nou.");
  });
 }).catch(function(){renderBar();toast("Nu există conexiune cu serverul.");});
}
function uploadImage(blob){
 return api("/api/upload",{method:"POST",headers:{"content-type":"image/jpeg"},body:blob}).then(function(r){
  if(r.status===401){logout("Sesiunea de administrare a expirat.");throw new Error("auth");}
  if(!r.ok)throw new Error("upload");return r.json();}).then(function(j){return j.url;});
}
function moveIn(arr,i,d){var j=i+d;if(j<0||j>=arr.length)return false;var x=arr[i];arr[i]=arr[j];arr[j]=x;return true;}

/* ---------- events ---------- */
document.addEventListener("click",function(e){
 var b=e.target.closest("[data-act]");if(!b)return;var a=b.dataset.act;
 if(a==="search"){openSearch();}
 else if(a==="closesearch"){sd.close();}
 else if(a==="menu"){openDrawer();}
 else if(a==="go"){sd.close();location.hash=b.dataset.t;}
 else if(a==="zoom"){if(img(findTerm(b.dataset.t).term.img))openLb(b.dataset.t);}
 else if(a==="lbprev"){lbI=(lbI-1+lbList.length)%lbList.length;showLb();}
 else if(a==="lbnext"){lbI=(lbI+1)%lbList.length;showLb();}
 else if(a==="lbclose"){lb.close();}
 else if(a==="admin"){var on=!document.body.classList.contains("admin");document.body.classList.toggle("admin",on);b.setAttribute("aria-pressed",on);renderBar();if(on&&!curPage)toast("Deschide o pagină pentru a edita termenii.");}
 else if(a==="edit"){openTermEditor(findTerm(b.dataset.t).term);}
 else if(a==="add"){openTermEditor(null,b.dataset.s);}
 else if(a==="del"){var f=findTerm(b.dataset.t);if(confirm("Ștergi termenul „"+f.term.name+"”?")){f.sec.terms.splice(f.idx,1);change();rerender();}}
 else if(a==="up"||a==="down"){var g=findTerm(b.dataset.t);if(moveIn(g.sec.terms,g.idx,a==="up"?-1:1)){change();rerender();}}
 else if(a==="secedit"){openSecEditor(findSec(b.dataset.s));}
 else if(a==="addsec"){openSecEditor(null,b.dataset.p);}
 else if(a==="secdel"){var s=findSec(b.dataset.s),p=pageOfSec(b.dataset.s);if(confirm("Ștergi secțiunea „"+s.title+"” și cei "+s.terms.length+" termeni din ea?")){p.sections.splice(p.sections.indexOf(s),1);change();rerender();}}
 else if(a==="secup"){var s2=findSec(b.dataset.s),p2=pageOfSec(b.dataset.s);if(moveIn(p2.sections,p2.sections.indexOf(s2),-1)){change();rerender();}}
 else if(a==="discard"){if(confirm("Renunți la toate modificările nepublicate?")){S=JSON.parse(ORIGINAL);dirty=0;renderBar();rerender();}}
 else if(a==="publish"){doPublish();}
 else if(a==="logout"){if(dirty&&!confirm("Ai modificări nepublicate. Ieși oricum?"))return;if(dirty){S=JSON.parse(ORIGINAL);dirty=0;}logout("Ai ieșit din administrare.");}
});

/* ---------- login ---------- */
function openLogin(){
 ed.innerHTML='<form method="dialog"><h3>Administrare</h3><label for="f-pw">Parola de administrator</label><input type="password" id="f-pw" autocomplete="current-password"><p class="lerr" style="color:#B3392F;font-weight:600;margin-top:10px;min-height:1.2em"></p><div class="acts"><button type="button" class="ghost" data-act="edcancel">Renunță</button><button type="submit" class="pri">Intră</button></div></form>';
 var f=ed.querySelector("form");
 f.onsubmit=function(e){e.preventDefault();var pw=ed.querySelector("#f-pw").value;if(!pw)return;var sb=ed.querySelector(".pri");sb.disabled=true;
  fetch("/api/login",{method:"POST",headers:{"x-admin-password":pw}}).then(function(r){sb.disabled=false;
   if(r.ok){PW=pw;try{sessionStorage.setItem("dt-admin",pw);}catch(err){}ed.close();enableAdmin(true);}
   else if(r.status===401){ed.querySelector(".lerr").textContent="Parola nu este corectă.";}
   else{ed.querySelector(".lerr").textContent="Serverul nu răspunde. Încearcă din nou.";}
  }).catch(function(){sb.disabled=false;ed.querySelector(".lerr").textContent="Nu există conexiune cu serverul.";});};
 ed.showModal();setTimeout(function(){var i=ed.querySelector("#f-pw");if(i)i.focus();},30);
}
function enableAdmin(on){document.documentElement.classList.add("can-edit");document.body.classList.toggle("admin",!!on);renderBar();rerender();if(on)toast(curPage?"Mod administrare activ.":"Mod administrare activ. Deschide o pagină pentru a edita.");}
var footer=document.createElement("footer");footer.style.cssText="text-align:center;padding:28px 16px 40px;color:var(--muted);font-size:14px";
footer.innerHTML='Dicționar toponimic al reliefului românesc &nbsp;·&nbsp; <a href="#admin" style="color:var(--muted)">Administrare</a>';
document.body.appendChild(footer);

/* ---------- start ---------- */
function start(data,etag){
 S=data;ETAG=etag;ORIGINAL=JSON.stringify(S);
 if(PW)document.documentElement.classList.add("can-edit");
 if(location.hash==="#admin"){history.replaceState(null,"",location.pathname);route();if(PW)enableAdmin(true);else openLogin();}
 else route();
 renderBar();
}
var _route=route;route=function(){if(location.hash==="#admin"){history.replaceState(null,"",location.pathname+(curPage?"#"+curPage:""));if(PW)enableAdmin(true);else openLogin();return;}_route();};
removeEventListener("hashchange",_route);addEventListener("hashchange",function(){route();});
app.innerHTML='<div style="padding:80px 20px;text-align:center;color:var(--muted)">Se încarcă dicționarul…</div>';
fetch("/api/data",{cache:"no-store"}).then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){
 if(j&&j.data)return start(j.data,j.etag);
 return fetch("/data.json").then(function(r){return r.json();}).then(function(d){start(d,null);});
}).catch(function(){
 fetch("/data.json").then(function(r){return r.json();}).then(function(d){start(d,null);}).catch(function(){app.innerHTML='<div style="padding:80px 20px;text-align:center">Dicționarul nu a putut fi încărcat.</div>';});
});
})();
