// Enhance the complete static journey with an accessible, keyboard-operated reader.
document.querySelectorAll('[data-journey-reader]').forEach(reader=>{
 const tabs=[...reader.querySelectorAll('[data-journey-step]')];
 const panels=[...reader.querySelectorAll('.journey-panel')];
 const nav=reader.querySelector('.journey-selector');nav.setAttribute('role','tablist');
 const vertical=matchMedia('(min-width:601px)');
 function orientation(){nav.setAttribute('aria-orientation',vertical.matches?'vertical':'horizontal')}
 orientation();vertical.addEventListener('change',orientation);
 function select(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index});if(focus)tabs[index].focus({preventScroll:true})}
 tabs.forEach((tab,i)=>{
  tab.id=`${panels[i].id}-tab`;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panels[i].id);
  panels[i].setAttribute('role','tabpanel');panels[i].setAttribute('aria-labelledby',tab.id);panels[i].tabIndex=0;
  tab.addEventListener('click',()=>select(i));
  tab.addEventListener('keydown',event=>{
   let next=i;const prev=vertical.matches?'ArrowUp':'ArrowLeft',forward=vertical.matches?'ArrowDown':'ArrowRight';
   if(event.key===forward)next=(i+1)%tabs.length;else if(event.key===prev)next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;
   event.preventDefault();select(next,true);
  });
 });
 reader.classList.add('is-interactive');select(0);
 reader.addEventListener('journey-select',e=>{const i=panels.indexOf(e.detail);if(i>=0)select(i)});
});

// Native anchors also open any documentation enclosing their target.
function revealTarget(hash,scroll=false){
 let target;try{target=document.getElementById(decodeURIComponent(hash.slice(1)))}catch{return}
 if(!target)return;
 for(let parent=target;parent;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
 const panel=target.closest('.journey-panel');if(panel)panel.closest('[data-journey-reader]').dispatchEvent(new CustomEvent('journey-select',{detail:panel}));
 if(scroll)requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));
}
if(location.hash)revealTarget(location.hash,true);
addEventListener('hashchange',()=>revealTarget(location.hash,true));
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>revealTarget(link.hash)));

const chapterLinks=[...document.querySelectorAll('.chapter-nav a')];
const targets=chapterLinks.map(link=>document.getElementById(link.hash.slice(1))).filter(Boolean);
let queued=false;
function updateReading(){
 queued=false;const height=document.documentElement.scrollHeight-innerHeight;
 document.documentElement.style.setProperty('--reading-progress',String(height>0?Math.max(0,Math.min(1,scrollY/height)):0));
 let active=null;
 for(const target of targets){if(target.getClientRects().length&&target.getBoundingClientRect().top<=innerHeight*.35)active=target.id}
 chapterLinks.forEach(link=>{if(link.hash==='#'+active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
}
function queueReading(){if(!queued){queued=true;requestAnimationFrame(updateReading)}}
addEventListener('scroll',queueReading,{passive:true});addEventListener('resize',queueReading);document.addEventListener('toggle',queueReading,true);queueReading();
