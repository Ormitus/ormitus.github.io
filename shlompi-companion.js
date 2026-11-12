(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let host,face,eyes,sprites,timer;
 const load=src=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=src});
 const raster=image=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=272;
  canvas.getContext('2d').drawImage(image,0,0,256,272);return canvas;
 };
 const prepare=async()=>{
  const [open,closed]=await Promise.all([load('/assets/shlompi-motion/hover/001.webp'),load('/assets/shlompi-blink.webp')]);
  const canvas=raster(open),context=canvas.getContext('2d'),data=context.getImageData(0,0,256,272);
  const shut=raster(closed).getContext('2d').getImageData(0,0,256,272).data;
  const pixels=data.data,visited=new Uint8Array(256*272),queue=[];
  const enqueue=index=>{if(index<0||index>=visited.length||visited[index])return;visited[index]=1;const p=index*4;if(Math.min(pixels[p],pixels[p+1],pixels[p+2])>235)queue.push(index)};
  for(let x=0;x<256;x++){enqueue(x);enqueue(271*256+x)}
  for(let y=0;y<272;y++){enqueue(y*256);enqueue(y*256+255)}
  // Remove only white connected to the background; keep eye catchlights.
  for(let i=0;i<queue.length;i++){
   const index=queue[i],p=index*4,x=index%256;
   const alpha=Math.min(1,(255-Math.min(pixels[p],pixels[p+1],pixels[p+2]))/18);
   for(let c=0;c<3;c++)pixels[p+c]=alpha?Math.max(0,(pixels[p+c]-255*(1-alpha))/alpha):0;
   pixels[p+3]=Math.round(alpha*255);
   if(x)enqueue(index-1);if(x<255)enqueue(index+1);enqueue(index-256);enqueue(index+256);
  }
  context.putImageData(data,0,0);const neutral=canvas.toDataURL('image/webp',.96);
  for(let y=0;y<272;y++)for(let x=0;x<256;x++){
   const u=x/256,v=1-y/272;
   const d=Math.min(Math.hypot((u-.341)/.078,(v-.606)/.073),Math.hypot((u-.664)/.078,(v-.606)/.073));
   const f=Math.max(0,Math.min(1,(1-d)/.3)),weight=f*f*(3-2*f),p=(y*256+x)*4;
   for(let c=0;c<3;c++)pixels[p+c]=pixels[p+c]*(1-weight)+shut[p+c]*weight;
  }
  context.putImageData(data,0,0);
  return {neutral,closed:canvas.toDataURL('image/webp',.96)};
 };
 const blink=()=>{
  if(!eyes||!host?.classList.contains('is-settled')||reduced.matches||document.hidden)return;
  eyes.animate([{opacity:0,offset:0},{opacity:1,offset:.28},{opacity:1,offset:.42},{opacity:0,offset:1}],{duration:260});
 };
 const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>{blink();schedule()},3300+Math.random()*2100)};
 const settle=async()=>{
  if(!host)return;
  try{
   const images=await sprites;
   if(face.src!==images.neutral&&!reduced.matches){
    eyes.src=images.neutral;await eyes.decode();
    await eyes.animate([{opacity:0},{opacity:1}],{duration:300,fill:'forwards'}).finished;
    face.src=images.neutral;await face.decode();eyes.getAnimations().forEach(animation=>animation.cancel());
   }else face.src=images.neutral;
   eyes.src=images.closed;host.classList.add('is-ready','is-settled');schedule();
  }catch{host.classList.add('is-ready')}
 };
 window.shlompiCompanion={
  async mount(entry){
   host=document.querySelector('.case-companion');if(!host)return;
   face=host.querySelector('.companion-base');eyes=host.querySelector('.companion-eyes');
   sprites=prepare();
   host.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')blink()});
   if(entry?.portrait?.src){face.src=entry.portrait.src;host.classList.add('is-ready');await face.decode()}
   else {try{const images=await sprites;face.src=images.neutral;eyes.src=images.closed;host.classList.add('is-ready','is-settled');schedule()}catch{}}
  },
  settle,
  capture(){
   if(!host?.classList.contains('is-ready'))return null;
   const rect=host.querySelector('.companion-face').getBoundingClientRect();
   return {src:face.src,rect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height}};
  },
 };
})();
