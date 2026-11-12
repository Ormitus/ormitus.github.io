const viewer=document.querySelector('.art-viewer');
document.querySelectorAll('.art-open').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img');viewer.querySelector('img').src=source.src;viewer.querySelector('img').alt=source.alt;viewer.showModal()}));
viewer.querySelector('.art-close').addEventListener('click',()=>viewer.close());
