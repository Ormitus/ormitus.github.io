/* Progressive enhancement. Native links, dialogs and content remain the source of truth. */
(() => {
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const enter='cubic-bezier(.22,1,.36,1)',move='cubic-bezier(.25,1,.5,1)';
 let keyboard=false;
 const running=new Set(),owned=new WeakMap(),dialogState=new WeakMap();
 const allowed=()=>!reduce.matches&&!keyboard;
 document.addEventListener('keydown',()=>{keyboard=true},{capture:true});
 document.addEventListener('pointerdown',()=>{keyboard=false},{capture:true});
 document.addEventListener('pointermove',event=>{if(event.pointerType==='mouse')keyboard=false},{passive:true});
 function stop(element){owned.get(element)?.cancel();owned.delete(element)}
 function animate(element,frames,options={}){
  if(!element)return null;
  stop(element);if(!allowed())return null;
  const animation=element.animate(frames,{duration:280,easing:enter,...options});
  owned.set(element,animation);running.add(animation);
  const clean=()=>{running.delete(animation);if(owned.get(element)===animation)owned.delete(element)};
  animation.finished.then(clean,clean);return animation;
 }
 reduce.addEventListener('change',()=>{if(reduce.matches){running.forEach(a=>a.cancel());running.clear()}});
 function roll(element){
  if(element.dataset.motionRoll)return;
  element.dataset.motionRoll='true';element.classList.add('motion-roll');
  const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  let i=0;
  nodes.forEach(node=>{
   if(!node.textContent.trim()||node.parentElement.closest('[aria-hidden=true],.case-tag'))return;
   const fragment=document.createDocumentFragment();
   node.textContent.split(/(\s+)/).forEach(word=>{
    if(!word.trim()){fragment.append(document.createTextNode(word));return}
    const span=document.createElement('span');span.className='motion-word';span.style.setProperty('--word-delay',`${Math.min(i++*24,96)}ms`);
    const face=document.createElement('span');face.className='motion-face';face.textContent=word;
    const echo=document.createElement('span');echo.className='motion-echo';echo.textContent=word;echo.setAttribute('aria-hidden','true');
    span.append(face,echo);fragment.append(span);
   });node.replaceWith(fragment);
  });
 }
 const media=dialog=>dialog.querySelector('.art-overlay-wrap')||dialog.querySelector('#poster-image,img:not(.art-overlay-image)');
 function visualRect(element){
  const rect=element?.getBoundingClientRect();if(!rect)return null;
  // Viewer images fill a box with object-fit:contain. Match the artwork, not its letterboxing.
  if(element.tagName!=='IMG'||getComputedStyle(element).objectFit!=='contain'||!element.naturalWidth)return rect;
  const scale=Math.min(rect.width/element.naturalWidth,rect.height/element.naturalHeight);
  const width=element.naturalWidth*scale,height=element.naturalHeight*scale;
  const left=rect.left+(rect.width-width)/2,top=rect.top+(rect.height-height)/2;
  return {left,top,width,height,right:left+width,bottom:top+height};
 }
 function rectTransform(from,to){return `translate(${from.left+from.width/2-to.left-to.width/2}px,${from.top+from.height/2-to.top-to.height/2}px) scale(${from.width/to.width},${from.height/to.height})`}
 function usable(rect){return rect&&rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<innerHeight}
 function prepareDialog(dialog){
  if(dialog.dataset.motionPrepared)return;
  dialog.dataset.motionPrepared='true';dialog.classList.add('motion-dialog');
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeDialog(dialog)});
  dialog.addEventListener('close',()=>{stop(dialog);stop(media(dialog));delete dialog.dataset.motionClosing;dialogState.delete(dialog)});
 }
 function openDialog(dialog,trigger=document.activeElement){
  prepareDialog(dialog);
  const source=trigger?.querySelector?.('img');
  const from=visualRect(source);
  const state={trigger,source,closing:false};dialogState.set(dialog,state);
  stop(dialog);delete dialog.dataset.motionClosing;
  if(!dialog.open){if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','')}
  animate(dialog,[{opacity:0},{opacity:1}],{duration:240});
  const target=media(dialog);
  if(target){
   // Wait for dimensions before calculating the shared-image transition.
   const image=target.tagName==='IMG'?target:target.querySelector('img');
   const reveal=()=>{
    if(dialogState.get(dialog)!==state||state.closing||!dialog.open)return;
    const to=visualRect(target);
    if(usable(from)&&usable(to))animate(target,[{transform:rectTransform(from,to)},{transform:'none'}],{duration:360,easing:move});
    else animate(target,[{opacity:0,transform:'translateY(12px) scale(.985)'},{opacity:1,transform:'none'}],{duration:260});
   };
   if(image?.complete&&image.naturalWidth)reveal();
   else image?.addEventListener('load',reveal,{once:true});
  }else{
   const rect=trigger?.getBoundingClientRect?.();
   const dy=rect?Math.max(-36,Math.min(36,rect.top+rect.height/2-innerHeight/2)):20;
   animate(dialog,[{opacity:0,transform:`translateY(${dy}px) scale(.985)`},{opacity:1,transform:'none'}],{duration:300});
  }
 }
 function closeDialog(dialog){
  if(!dialog.open&&!dialog.hasAttribute('open'))return;
  const state=dialogState.get(dialog)||{};if(state.closing)return;
  state.closing=true;dialogState.set(dialog,state);dialog.dataset.motionClosing='true';
  const target=media(dialog),currentTransform=target?getComputedStyle(target).transform:'none';stop(target);
  const finish=()=>{
   if(dialogState.get(dialog)!==state||!state.closing)return;
   if(typeof dialog.close==='function')dialog.close();
   else{dialog.removeAttribute('open');dialog.dispatchEvent(new Event('close'))}
  };
  const destination=visualRect(state.source);
  if(target&&usable(destination)){
   const current=visualRect(target);
   if(usable(current))animate(target,[{transform:currentTransform},{transform:rectTransform(destination,current)}],{duration:210,easing:move});
  }
  const fade=animate(dialog,[{opacity:getComputedStyle(dialog).opacity},{opacity:0}],{duration:210});
  if(fade)fade.finished.then(finish,finish);else finish();
 }
 function changeMedia(dialog,direction=1){
  const state=dialogState.get(dialog);if(state?.closing)return;
  // After browsing, close into the selected thumbnail rather than the first artwork.
  const target=media(dialog);if(!target)return;
  const image=target.tagName==='IMG'?target:target.querySelector('img');
  const expected=image?.src;
  const reveal=()=>{if(!dialog.open||dialogState.get(dialog)?.closing||image?.src!==expected)return;animate(target,[{opacity:.35,transform:`translateX(${direction*22}px)`},{opacity:1,transform:'none'}],{duration:220})};
  if(image?.complete&&image.naturalWidth)reveal();else image?.addEventListener('load',reveal,{once:true});
 }
 function setDialogSource(dialog,trigger){const state=dialogState.get(dialog);if(state){state.source=trigger?.querySelector('img');state.trigger=trigger}}
 function setupMenu(details){
  const summary=details.querySelector('summary'),panel=details.querySelector('.chapter-nav');
  if(!summary||!panel)return;
  let revision=0;
  const close=()=>{
   if(!details.open)return;
   const current=++revision;
   const animation=animate(panel,[{opacity:getComputedStyle(panel).opacity,transform:getComputedStyle(panel).transform},{opacity:0,transform:'translateY(-5px) scale(.985)'}],{duration:130});
   const finish=()=>{if(current===revision)details.open=false};
   if(animation)animation.finished.then(finish,finish);else finish();
  };
  summary.addEventListener('click',event=>{
   event.preventDefault();
   if(details.open&&details.dataset.motionClosing!=='true'){details.dataset.motionClosing='true';close();return}
   const from=details.open?{opacity:getComputedStyle(panel).opacity,transform:getComputedStyle(panel).transform}:{opacity:0,transform:'translateY(-7px) scale(.985)'};
   ++revision;delete details.dataset.motionClosing;details.open=true;
   animate(panel,[from,{opacity:1,transform:'none'}],{duration:210});
  });
  details.addEventListener('toggle',()=>{if(!details.open)delete details.dataset.motionClosing});
  panel.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{delete details.dataset.motionClosing;close()}));
  document.addEventListener('click',event=>{if(!details.contains(event.target)){delete details.dataset.motionClosing;close()}});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&details.open){++revision;stop(panel);details.open=false;summary.focus()}});
 }
 function setupTabs(nav){
  const buttons=[...nav.querySelectorAll('button')];if(buttons.length<2)return;
  nav.classList.add('motion-tabs');
  const line=document.createElement('i');line.className='motion-tab-line';line.setAttribute('aria-hidden','true');nav.append(line);
  let previous;
  const update=(instant=false)=>{
   const selected=buttons.find(b=>b.getAttribute('aria-pressed')==='true'||b.getAttribute('aria-selected')==='true');
   if(!selected||!nav.getClientRects().length)return;
   const box=nav.getBoundingClientRect(),r=selected.getBoundingClientRect();
   nav.classList.toggle('motion-tabs-instant',instant||!allowed());
   line.style.transform=`translate(${r.left-box.left+nav.scrollLeft}px,${r.bottom-box.top+nav.scrollTop-2}px) scaleX(${r.width})`;
   line.style.opacity='1';
   if(previous&&previous!==selected){
    const index=buttons.indexOf(selected),direction=index>buttons.indexOf(previous)?1:-1;
    const container=nav.closest('[data-journey-reader],.argo-iteration')||nav.parentElement;
    const panel=[...container.querySelectorAll('.journey-panel,[data-panel],[data-family-panel]')].find(p=>!p.hidden);
    if(panel)animate(panel,[{opacity:.55,transform:`translateX(${direction*10}px)`},{opacity:1,transform:'none'}],{duration:200});
   }
   previous=selected;
  };
  new MutationObserver(()=>update()).observe(nav,{subtree:true,attributes:true,attributeFilter:['aria-selected','aria-pressed']});
  new ResizeObserver(()=>update(true)).observe(nav);
  update(true);
 }
 function revealSections(){
  if(reduce.matches)return;
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   if(!entry.isIntersecting)return;
   observer.unobserve(entry.target);
   // No invisible content waiting on JS. Only animate sections newly entering from below.
   if(entry.boundingClientRect.top>innerHeight*.35)animate(entry.target,[{opacity:.55,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:420});
  }),{threshold:0,rootMargin:'0px 0px -32px 0px'});
  document.querySelectorAll('.section-intro,.collection-heading,.chapter-intro,.chapter-head,.chapter-heading,.info-section,.symbol-copy,.closing-statement,.next-story,.next-project').forEach(el=>observer.observe(el));
 }
 function pageEntrance(){
  const root=document.documentElement;
  const reveal=()=>{
   const rows=[...document.querySelectorAll('.hero-work-list>*,main>.brand-cover,main>.hero,.info-intro')];
   rows.forEach((row,i)=>{if(row.getBoundingClientRect().top<innerHeight)animate(row,[{opacity:0},{opacity:1}],{duration:320,delay:Math.min(i*22,154)})});
  };
  if(!root.hasAttribute('data-loading')){reveal();return}
  const observer=new MutationObserver(()=>{if(!root.hasAttribute('data-loading')){observer.disconnect();reveal()}});
  observer.observe(root,{attributes:true,attributeFilter:['data-loading']});
 }
 function init(){
  document.querySelectorAll('.hero-work-list strong,.hero-contact a,.site-nav>a:not(.wordmark),.info-header nav a,.info-socials a,.text-link,.contact-email,.next-story strong,.next-project strong,footer a,.art-close,#close-gallery,.viewer-controls button,.art-viewer-bar button').forEach(roll);
  document.querySelectorAll('.case-contents').forEach(setupMenu);
  document.querySelectorAll('.journey-selector,.argo-version-toggle,.family-selector').forEach(setupTabs);
  revealSections();
  pageEntrance();
 }
 window.OrmitusMotion={openDialog,closeDialog,changeMedia,setDialogSource};
 // Deferred scripts can run before the homepage module has built its navigation.
 if(document.readyState!=='complete')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
