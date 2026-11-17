/* KADENRA demo site. No network calls; the only stored data is the demo bag in localStorage. */
(function(){
"use strict";
var KEY="kadenra-demo-bag";
var root=document.documentElement.getAttribute("data-root")||"";
function $(s,c){return (c||document).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))}
function readBag(){try{var b=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(b)?b:[]}catch(e){return []}}
function writeBag(b){try{localStorage.setItem(KEY,JSON.stringify(b))}catch(e){}updateCount()}
function count(){return readBag().reduce(function(n,i){return n+(i.qty||0)},0)}
function updateCount(){var n=count();$$("[data-bag-count]").forEach(function(el){el.textContent=n})}
function toast(msg){var t=$("#toast");if(!t)return;t.textContent=msg;t.classList.add("show");clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove("show")},2600)}
function eur(n){return "\u20ac"+n}
window.KADENRA={toast:toast};
// mobile menu
var mb=$(".menu-btn"),dr=$("#drawer");
if(mb&&dr){mb.addEventListener("click",function(){var o=dr.classList.toggle("open");mb.setAttribute("aria-expanded",o);document.body.classList.toggle("lock",o);if(o){var f=$("a",dr);f&&f.focus()}});
 document.addEventListener("keydown",function(e){if(e.key==="Escape"&&dr.classList.contains("open")){dr.classList.remove("open");mb.setAttribute("aria-expanded","false");document.body.classList.remove("lock");mb.focus()}})}
// demo forms: never submitted anywhere
$$("form[data-demo]").forEach(function(f){f.addEventListener("submit",function(e){e.preventDefault();var kind=f.getAttribute("data-demo");
 $$("input,textarea,select",f).forEach(function(i){if(!i.disabled&&i.type!=="hidden")i.value=i.defaultValue||""});
 var out=$("[data-out]",f);var msg=f.getAttribute("data-msg")||"Thanks. This is a demo, so nothing was sent.";
 if(out){out.textContent=msg;out.hidden=false}else toast(msg)})});
// promo film: click to play with sound
$$("[data-film]").forEach(function(box){var v=$("video",box),b=$(".play",box);if(!v||!b)return;
 b.addEventListener("click",function(){v.muted=false;v.controls=true;b.hidden=true;var p=v.play();if(p&&p.catch)p.catch(function(){v.muted=true;v.play()});v.focus()});
 v.addEventListener("ended",function(){b.hidden=false;v.controls=false})});
// product page
var pdp=$("[data-pdp]");
if(pdp){var sel={size:null,colour:$("[data-colour][aria-pressed=true]",pdp).getAttribute("data-colour")};
 $$("[data-thumb]",pdp).forEach(function(t){t.addEventListener("click",function(){var m=$("[data-main]",pdp);m.src=t.getAttribute("data-thumb");m.alt=t.getAttribute("data-alt");$$("[data-thumb]",pdp).forEach(function(x){x.setAttribute("aria-pressed",x===t)})})});
 $$("[data-size]",pdp).forEach(function(b){b.addEventListener("click",function(){sel.size=b.getAttribute("data-size");$$("[data-size]",pdp).forEach(function(x){x.setAttribute("aria-pressed",x===b)});$("[data-size-label]",pdp).textContent="EU "+sel.size;$("[data-size-err]",pdp).hidden=true})});
 $$("[data-colour]",pdp).forEach(function(b){b.addEventListener("click",function(){sel.colour=b.getAttribute("data-colour");$$("[data-colour]",pdp).forEach(function(x){x.setAttribute("aria-pressed",x===b)});$("[data-colour-label]",pdp).textContent=sel.colour})});
 $("[data-add]",pdp).addEventListener("click",function(){if(!sel.size){$("[data-size-err]",pdp).hidden=false;return}
  var d=pdp.dataset,b=readBag(),f=null;b.forEach(function(i){if(i.slug===d.slug&&i.size===sel.size)f=i});
  if(f)f.qty++;else b.push({slug:d.slug,name:d.name,price:+d.price,size:sel.size,colour:sel.colour,img:d.img,qty:1});
  writeBag(b);toast(d.name+", EU "+sel.size+" added to your demo bag.")})}
// shop filters
var shop=$("[data-shop]");
if(shop){var st={family:"all",tier:"all",sort:"featured",q:""};var tiles=$$("[data-tile]",shop),grid=$("[data-grid]",shop);
 var qs=new URLSearchParams(location.search);if(qs.get("family"))st.family=qs.get("family");if(qs.get("q"))st.q=qs.get("q").toLowerCase();
 var qi=$("[data-q]",shop);if(qi&&st.q)qi.value=qs.get("q");
 function apply(){var vis=tiles.filter(function(t){var ok=(st.family==="all"||t.dataset.family===st.family)&&(st.tier==="all"||t.dataset.tier===st.tier)&&(!st.q||t.dataset.search.indexOf(st.q)>-1);t.hidden=!ok;return ok});
  var key={featured:function(a,b){return a.dataset.n-b.dataset.n},"price-asc":function(a,b){return a.dataset.price-b.dataset.price},"price-desc":function(a,b){return b.dataset.price-a.dataset.price},weight:function(a,b){return a.dataset.weight-b.dataset.weight},name:function(a,b){return a.dataset.name.localeCompare(b.dataset.name)}}[st.sort];
  tiles.slice().sort(key).forEach(function(t){grid.appendChild(t)});$("[data-count]",shop).textContent=vis.length+(vis.length===1?" style":" styles");
  $$("[data-f-family]",shop).forEach(function(c){c.setAttribute("aria-pressed",c.getAttribute("data-f-family")===st.family)});$("[data-empty]",shop).hidden=vis.length>0}
 $$("[data-f-family]",shop).forEach(function(c){c.addEventListener("click",function(){st.family=c.getAttribute("data-f-family");apply()})});
 $("[data-f-tier]",shop).addEventListener("change",function(e){st.tier=e.target.value;apply()});
 $("[data-sort]",shop).addEventListener("change",function(e){st.sort=e.target.value;apply()});
 if(qi)qi.addEventListener("input",function(){st.q=qi.value.trim().toLowerCase();apply()});
 apply()}
// bag page
var bagEl=$("[data-bag]");
function renderBag(){if(!bagEl)return;var b=readBag(),list=$("[data-lines]",bagEl);list.innerHTML="";var sub=0;
 b.forEach(function(i,ix){sub+=i.price*i.qty;var row=document.createElement("div");row.className="line-item";
  row.innerHTML='<img src="'+root+i.img+'" alt="" width="120" height="90"><div><h3 style="margin:0 0 4px">'+i.name+'</h3><p class="muted small" style="margin:0 0 10px">EU '+i.size+' \u00b7 '+i.colour+'</p><div class="qty"><button type="button" aria-label="Decrease quantity" data-dec>\u2212</button><span aria-live="polite">'+i.qty+'</span><button type="button" aria-label="Increase quantity" data-inc>+</button></div> <button type="button" class="link" style="background:none;border:0;cursor:pointer;margin-left:12px" data-rm>Remove</button></div><div style="font-weight:600">'+eur(i.price*i.qty)+'</div>';
  $("[data-dec]",row).onclick=function(){var x=readBag();x[ix].qty--;if(x[ix].qty<1)x.splice(ix,1);writeBag(x);renderBag()};
  $("[data-inc]",row).onclick=function(){var x=readBag();x[ix].qty++;writeBag(x);renderBag()};
  $("[data-rm]",row).onclick=function(){var x=readBag();x.splice(ix,1);writeBag(x);renderBag()};list.appendChild(row)});
 var empty=b.length===0;$("[data-empty-bag]",bagEl).hidden=!empty;$("[data-has-bag]",bagEl).hidden=empty;
 $$("[data-sub]").forEach(function(e){e.textContent=eur(sub)});$$("[data-total]").forEach(function(e){e.textContent=eur(sub)})}
renderBag();
// checkout
var co=$("[data-checkout]");
if(co){var b=readBag(),sub=0,ul=$("[data-co-lines]",co);b.forEach(function(i){sub+=i.price*i.qty;var li=document.createElement("div");li.className="row";li.innerHTML="<span>"+i.qty+" \u00d7 "+i.name+" (EU "+i.size+")</span><span>"+eur(i.price*i.qty)+"</span>";ul.appendChild(li)});
 if(!b.length){ul.innerHTML='<p class="muted small">Your demo bag is empty, so this order uses one sample pair.</p>';sub=160}
 $$("[data-sub]",co).forEach(function(e){e.textContent=eur(sub)});$$("[data-total]",co).forEach(function(e){e.textContent=eur(sub)});
 $("[data-place]",co).addEventListener("click",function(){var n="KD-DEMO-"+String(Math.floor(100000+Math.random()*899999));$("[data-order-no]").textContent=n;$("[data-co-form]").hidden=true;$("[data-co-done]").hidden=false;writeBag([]);window.scrollTo(0,0);$("[data-co-done] h1").focus()})}
// account (demo user only, nothing stored)
var acc=$("[data-account]");
if(acc){function show(on){$("[data-signed-out]",acc).hidden=on;$("[data-signed-in]",acc).hidden=!on}
 $("[data-demo-login]",acc).addEventListener("click",function(){show(true);history.replaceState(null,"","#demo-user");$("[data-signed-in] h1",acc).focus()});
 $("[data-demo-logout]",acc).addEventListener("click",function(){show(false);history.replaceState(null,"",location.pathname)});
 show(location.hash==="#demo-user")}
// store locator
var loc=$("[data-stores]");
if(loc){function pick(id){$$("[data-store]",loc).forEach(function(s){s.setAttribute("aria-current",s.getAttribute("data-store")===id)});$$("[data-pin]",loc).forEach(function(p){var on=p.getAttribute("data-pin")===id;$("circle",p).setAttribute("r",on?13:8);$("circle",p).setAttribute("fill",on?"#94502F":"#3B2F25")})}
 $$("[data-store]",loc).forEach(function(s){s.addEventListener("click",function(){pick(s.getAttribute("data-store"))});s.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();pick(s.getAttribute("data-store"))}})});
 $$("[data-pin]",loc).forEach(function(p){p.addEventListener("click",function(){pick(p.getAttribute("data-pin"));var s=$('[data-store="'+p.getAttribute("data-pin")+'"]',loc);s&&s.scrollIntoView({block:"nearest"})})});
 var ff=$("[data-store-filter]",loc);if(ff)ff.addEventListener("input",function(){var q=ff.value.trim().toLowerCase();$$("[data-store]",loc).forEach(function(s){s.hidden=q&&s.textContent.toLowerCase().indexOf(q)<0})})}
updateCount();
})();
