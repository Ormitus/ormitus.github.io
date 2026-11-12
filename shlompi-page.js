// The same logo bridges the hero and every case study.
(() => {
 const root=document.documentElement,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let firstVisit=true;
 try{firstVisit=sessionStorage.getItem('shlompi-intro-seen')!=='true';sessionStorage.setItem('shlompi-intro-seen','true')}catch{}
 const introDuration=firstVisit&&!reduced.matches?4000:0;
 const introReady=new Promise(resolve=>setTimeout(resolve,introDuration));
 let progress=0,ticker,departure,finished=false;
 const set=value=>{progress=value;root.style.setProperty('--loader-progress',String(value))};
 const show=(slow=false)=>{clearInterval(ticker);finished=false;set(.06);root.dataset.loading='true';const started=performance.now();ticker=setInterval(()=>set(slow&&introDuration?Math.min(.94,.06+.88*(performance.now()-started)/introDuration):Math.min(.9,progress+(.92-progress)*.13)),120)};
 const hide=()=>{if(finished)return;finished=true;clearInterval(ticker);set(1);setTimeout(()=>{delete root.dataset.loading},reduced.matches?0:180)};
 const limit=(promise,ms)=>Promise.race([promise,new Promise(resolve=>setTimeout(resolve,ms))]);
 show(firstVisit);
 const failsafe=setTimeout(hide,Math.max(8000,introDuration+2000));
 document.addEventListener('DOMContentLoaded',async()=>{
  const images=[...document.images].filter(image=>image.loading!=='lazy'&&image.getBoundingClientRect().top<innerHeight);
  const imageReady=image=>image.complete?Promise.resolve():new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true})});
  const portraitReady=document.querySelector('#portrait-stage')?new Promise(resolve=>{
   const ready=()=>['ready','fallback'].includes(root.dataset.motionVideo)||document.body.classList.contains('fallback');
   if(ready()){resolve();return}
   const observer=new MutationObserver(()=>{if(ready()){observer.disconnect();resolve()}});
   observer.observe(root,{attributes:true});observer.observe(document.body,{attributes:true});
   setTimeout(()=>{observer.disconnect();resolve()},5500);
  }):Promise.resolve();
  await Promise.all([introReady,limit(Promise.allSettled([document.fonts.ready,portraitReady,...images.map(imageReady)]),6000)]);
  clearTimeout(failsafe);hide();
  document.querySelectorAll('.site-nav>a:not(.wordmark),.case-contents summary,.chapter-nav a,.hero-caption a,.media figcaption a,footer a').forEach(link=>link.classList.add('whisker-link'));
 },{once:true});
 window.shlompiNavigate=href=>{if(departure)return;show();departure=setTimeout(()=>location.assign(href),reduced.matches?0:160)};
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[href]');
  if(!link||event.defaultPrevented||event.button||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
  const url=new URL(link.href);
  if(url.origin!==location.origin||url.pathname===location.pathname)return;
  event.preventDefault();window.shlompiNavigate(url.href);
 });
 addEventListener('pageshow',event=>{if(event.persisted){clearTimeout(departure);departure=null;clearInterval(ticker);finished=true;delete root.dataset.loading}});
})();
