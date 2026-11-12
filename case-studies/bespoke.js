const viewer=document.querySelector('.art-viewer');
const artwork=[...document.querySelectorAll('.art-open')];
let returnFocus,artIndex=0;
const bar=document.createElement('div');bar.className='art-viewer-bar';
bar.innerHTML='<p class="art-viewer-caption"></p><nav aria-label="Artwork navigation"><button type="button" data-art-prev aria-label="Previous artwork">Previous</button><output aria-label="Artwork number"></output><button type="button" data-art-next aria-label="Next artwork">Next</button></nav>';
viewer.append(bar);
function showArtwork(index){
 artIndex=(index+artwork.length)%artwork.length;
 const source=artwork[artIndex].querySelector('img');
 const target=viewer.querySelector('img:not(.art-overlay-image)');
 const oldWrap=viewer.querySelector('.art-overlay-wrap');
 if(oldWrap){oldWrap.replaceWith(target)}
 target.src=source.src;target.alt=source.alt;
 const overlay=artwork[artIndex].dataset.artOverlay;
 if(overlay){const wrap=document.createElement('div');wrap.className='art-overlay-wrap';target.replaceWith(wrap);wrap.append(target);const img=document.createElement('img');img.className='art-overlay-image';img.src=overlay;img.alt='';wrap.append(img)}
 bar.querySelector('p').textContent=source.alt;
 bar.querySelector('output').textContent=`${artIndex+1} / ${artwork.length}`;
}
artwork.forEach((button,index)=>button.addEventListener('click',()=>{
 returnFocus=button;showArtwork(index);viewer.showModal();document.body.style.overflow='hidden';
}));
bar.querySelector('[data-art-prev]').addEventListener('click',()=>showArtwork(artIndex-1));
bar.querySelector('[data-art-next]').addEventListener('click',()=>showArtwork(artIndex+1));
viewer.addEventListener('keydown',event=>{
 if(event.key==='ArrowLeft'){event.preventDefault();showArtwork(artIndex-1)}
 if(event.key==='ArrowRight'){event.preventDefault();showArtwork(artIndex+1)}
});
viewer.querySelector('.art-close').addEventListener('click',()=>viewer.close());
viewer.addEventListener('close',()=>{document.body.style.overflow='';returnFocus?.focus({preventScroll:true})});
viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close()});
const contents=document.querySelector('.case-contents');
if(contents){
 const closeContents=()=>{contents.open=false};
 contents.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeContents));
 document.addEventListener('click',event=>{if(!contents.contains(event.target))closeContents()});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&contents.open){closeContents();contents.querySelector('summary').focus()}
 });
}
