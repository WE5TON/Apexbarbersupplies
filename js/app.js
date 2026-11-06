// Supply verified listing and profile URLs before launch.
const destinations = {amazon:'', clipper:'', trimmer:'', instagram:''};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const menuButton = document.querySelector('.menu-toggle');
const menuDialog = document.querySelector('#navigation-dialog');
menuButton.addEventListener('click', () => {
  menuDialog.showModal();
  menuButton.setAttribute('aria-expanded','true');
});
function closeMenu(){menuDialog.close();}
document.querySelector('.menu-close').addEventListener('click',closeMenu);
menuDialog.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
menuDialog.addEventListener('close',()=>menuButton.setAttribute('aria-expanded','false'));
const motion = document.querySelector('#motion-toggle');
let paused = reducedMotion.matches;
function updateMotion(){
  document.body.classList.toggle('motion-paused',paused);
  motion.setAttribute('aria-pressed',String(paused));
  motion.innerHTML=paused?'Resume motion <span>▶</span>':'Pause motion <span>Ⅱ</span>';
}
updateMotion();
motion.addEventListener('click',()=>{paused=!paused;updateMotion();});
reducedMotion.addEventListener('change',event=>{paused=event.matches;updateMotion();});
if('IntersectionObserver' in window && !reducedMotion.matches){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.07});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
  document.documentElement.classList.add('motion-ready');
}
function animateOnce(element,className){
  if(paused||reducedMotion.matches)return;
  element.classList.remove(className);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    element.classList.add(className);
    element.addEventListener('animationend',()=>element.classList.remove(className),{once:true});
  }));
}
// Load the alternate editions before crossfading; preserve the current scene on failure.
const colourCards = [...document.querySelectorAll('.product-card')];
const manualColours = new WeakMap();
const changingColours = new WeakSet();
const pendingColours = new WeakMap();
function selectColour(card, colour) {
  if (changingColours.has(card)) { pendingColours.set(card,colour); return; }
  const current = card.querySelector('.swatch.selected');
  if (current?.dataset.colour === colour) return;
  changingColours.add(card);
  const product = card.dataset.product;
  const visual = card.querySelector('.product-visual');
  const baseImage = visual.querySelector('.studio-shot');
  const next = new Image();
  const finish = () => {
    changingColours.delete(card);
    const pending = pendingColours.get(card);
    pendingColours.delete(card);
    if (pending) selectColour(card,pending);
  };
  next.onload = () => {
    next.alt = '';
    next.setAttribute('aria-hidden','true');
    next.className = 'colour-overlay';
    const commit = () => {
      baseImage.src = next.src;
      baseImage.alt = `${colour === 'orange' ? 'Orange' : 'Blue'} APEX PRO ${product} and matching packaging on a stone plinth`;
      next.remove(); finish();
    };
    card.querySelectorAll('.swatch').forEach(button => {
      const selected = button.dataset.colour === colour;
      button.classList.toggle('selected',selected);
      button.setAttribute('aria-pressed',String(selected));
    });
    card.querySelector('.edition').textContent = `${colour === 'orange' ? 'Orange' : 'Blue'} edition`;
    if (paused || reducedMotion.matches) { commit(); return; }
    visual.append(next);
    requestAnimationFrame(() => requestAnimationFrame(() => next.classList.add('show')));
    next.addEventListener('transitionend', commit, {once:true});
    // Complete even if the tab becomes hidden during a transition.
    setTimeout(() => { if (next.isConnected) commit(); },1400);
  };
  next.onerror = finish;
  next.src = `./assets/images/stone-glow/${product}-${colour}.webp`;
}
colourCards.forEach(card => {
  const preload = new Image();
  preload.src = `./assets/images/stone-glow/${card.dataset.product}-blue.webp`;
  card.querySelectorAll('.swatch').forEach(button => button.addEventListener('click', () => {
    manualColours.set(card,Date.now() + 12000);
    selectColour(card,button.dataset.colour);
  }));
  setInterval(() => {
    const bounds = card.getBoundingClientRect();
    const onScreen = bounds.bottom > 0 && bounds.top < innerHeight;
    if (!onScreen || document.hidden || document.querySelector('dialog[open]') || paused || reducedMotion.matches || (manualColours.get(card) || 0) > Date.now()) return;
    selectColour(card,card.querySelector('.swatch.selected')?.dataset.colour === 'orange' ? 'blue' : 'orange');
  },6000);
});
const dialog=document.querySelector('#link-dialog');
document.querySelectorAll('[data-destination]').forEach(button=>button.addEventListener('click',()=>{
  const name=button.dataset.destination;
  const url=destinations[name]||(name!=='instagram'?destinations.amazon:'');
  if(url){window.open(url,'_blank','noopener,noreferrer');return;}
  if(menuDialog.open)menuDialog.close();
  const social=name==='instagram';
  document.querySelector('#dialog-title').textContent=social?'Follow APEX on Instagram.':'Coming soon to Amazon.';
  document.querySelector('#dialog-copy').textContent=social?'We’ll add our Instagram link here soon, with product updates and news from APEX.':'We’re preparing the APEX PRO launch. You’ll find the Amazon links here as soon as the products are available.';
  dialog.showModal();
}));
document.querySelectorAll('.dialog-close').forEach(button=>button.addEventListener('click',()=>{
  dialog.close();
  if(button.classList.contains('button')) document.querySelector('#collection').scrollIntoView({behavior:reducedMotion.matches?'instant':'smooth'});
}));
dialog.addEventListener('click',event=>{
  if(event.target!==dialog)return;
  const r=dialog.getBoundingClientRect();
  if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();
});
document.querySelectorAll('.faq details').forEach(item=>item.addEventListener('toggle',()=>{
  if(item.open)document.querySelectorAll('.faq details').forEach(other=>{if(other!==item)other.open=false;});
}));
document.querySelector('#year').textContent=new Date().getFullYear();
let pendingFrame=0;
function paintProgress(){
  pendingFrame=0;
  const max=document.documentElement.scrollHeight-innerHeight;
  document.documentElement.style.setProperty('--page-progress',max>0?scrollY/max:0);
}
window.addEventListener('scroll',()=>{if(!pendingFrame)pendingFrame=requestAnimationFrame(paintProgress);},{passive:true});
paintProgress();
// Only paint depth effects when they can be seen; keep touch devices stable.
const hero = document.querySelector('.hero');
let heroVisible = true;
new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; }).observe(hero);
let depthFrame = 0;
function paintDepth() {
  depthFrame = 0;
  if (paused || reducedMotion.matches || !heroVisible) return;
  hero.style.setProperty('--hero-y', `${Math.min(scrollY * .16, 110)}px`);
}
addEventListener('scroll', () => {
  if (!depthFrame && heroVisible) depthFrame = requestAnimationFrame(paintDepth);
}, {passive:true});
if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
  hero.addEventListener('pointermove', event => {
    if (paused || reducedMotion.matches) return;
    hero.style.setProperty('--pointer-x', `${(event.clientX / innerWidth - .5) * 18}px`);
  }, {passive:true});
  hero.addEventListener('pointerleave', () => hero.style.setProperty('--pointer-x','0px'));
}
const equipmentDialog = document.querySelector('#equipment-dialog');
const productInfo = {
  clipper: {
    name:'Clipper', kicker:'CUT / BLEND / FADE',
    description:'For bulk removal, blending and fades. The DLC-coated taper blade and adjustable click lever give you control as you work through the cut.',
    heading:'Built for the main work.',
    features:[['DLC-coated taper blade','The taper blade has a DLC coating to help reduce heat and friction while cutting.'],['Adjustable click lever','The lever clicks into set positions so you can adjust the blade as you blend.'],['Battery and speed display','Check the battery level and RPM on the front LED display.']]
  },
  trimmer: {
    name:'Trimmer', kicker:'OUTLINE / EDGE / DETAIL',
    description:'For sharp outlines and the finishing touches. The wide, DLC-coated T-blade is made for edges, beard lines and detail work.',
    heading:'Made for the finishing touches.',
    features:[['DLC-coated precision T-blade','The wide T-blade has a DLC coating to help reduce friction during use.'],['Outlines, edges and beard lines','Finish the cut, shape the outline and tidy the details with a dedicated T-blade trimmer.'],['Two motor speeds','Choose between 7,000 and 7,500 RPM. The front LED display shows the speed and battery level.']]
  }
};
let popupTool = 'clipper';
let popupColour = 'orange';
function renderPopup() {
  const info = productInfo[popupTool];
  equipmentDialog.dataset.tool = popupTool;
  equipmentDialog.dataset.colour = popupColour;
  document.querySelector('#popup-title').replaceChildren(document.createTextNode('APEX PRO'),document.createElement('br'),document.createTextNode(info.name+'.'));
  document.querySelector('#popup-kicker').textContent = info.kicker;
  document.querySelector('#popup-description').textContent = info.description;
  document.querySelector('#popup-feature-heading').textContent = info.heading;
  document.querySelector('#popup-kit-tool').textContent = 'APEX PRO '+info.name;
  document.querySelector('#popup-kit-title').textContent = 'Included with your '+info.name.toLowerCase();
  const image = document.querySelector('#popup-image');
  image.src = `./assets/images/stone-glow/${popupTool}-${popupColour}.webp`;
  image.alt = `${popupColour==='orange'?'Orange':'Blue'} APEX PRO ${popupTool} and matching retail packaging on a stone plinth`;
  document.querySelector('#popup-edition').textContent = `${popupColour==='orange'?'Orange':'Blue'} edition`;
  document.querySelectorAll('[data-popup-colour]').forEach(button => {
    const selected = button.dataset.popupColour === popupColour;
    button.classList.toggle('selected',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
  const features = document.querySelector('#popup-features');
  features.replaceChildren(...info.features.map(([title,copy],index) => {
    const article = document.createElement('article');
    const number = document.createElement('span'); number.textContent = '0'+(index+1);
    const heading = document.createElement('h4'); heading.textContent = title;
    const text = document.createElement('p'); text.textContent = copy;
    article.append(number,heading,text); return article;
  }));
  document.querySelectorAll('.compare-portraits img').forEach(image => {
    const tool = image.closest('[data-popup-tool]').dataset.popupTool;
    image.src = `./assets/images/stone-glow/${tool}-${popupColour}.webp`;
    image.alt = `${popupColour} APEX PRO ${tool} with retail packaging`;
  });
}
function showPopupView(view) {
  const compare = view === 'compare';
  document.querySelector('#product-overview').hidden = compare;
  document.querySelector('#specifications').hidden = !compare;
  document.querySelectorAll('.popup-nav [data-popup-view]').forEach(button => {
    const selected = button.dataset.popupView === view;
    button.classList.toggle('active',selected);
    button.setAttribute('aria-pressed',String(selected));
  });
  equipmentDialog.setAttribute('aria-labelledby',compare?'compare-title':'popup-title');
  equipmentDialog.setAttribute('aria-label',compare?'Compare APEX PRO clipper and trimmer':'APEX PRO '+productInfo[popupTool].name+' details');
  equipmentDialog.scrollTop = 0;
}
function openEquipment(tool='clipper',target) {
  if (menuDialog.open) menuDialog.close();
  popupTool = tool || 'clipper';
  popupColour = document.querySelector(`[data-product="${popupTool}"] .swatch.selected`)?.dataset.colour || 'orange';
  renderPopup();
  showPopupView(target==='#specifications'?'compare':'overview');
  equipmentDialog.showModal();
  if (target==='#buying') document.querySelector('#buying').scrollIntoView({behavior:'instant'});
}
document.querySelectorAll('[data-explore]').forEach(button => button.addEventListener('click',() => openEquipment(button.dataset.explore)));
document.querySelectorAll('[data-open-compare]').forEach(button => button.addEventListener('click',() => openEquipment('clipper','#specifications')));
document.querySelectorAll('[data-open-equipment]').forEach(link => link.addEventListener('click',event => {event.preventDefault();openEquipment('clipper',link.getAttribute('href'));}));
document.querySelectorAll('[data-popup-view]').forEach(button => button.addEventListener('click',() => showPopupView(button.dataset.popupView)));
document.querySelectorAll('[data-popup-colour]').forEach(button => button.addEventListener('click',() => {popupColour=button.dataset.popupColour;renderPopup();}));
document.querySelectorAll('[data-popup-tool]').forEach(button => button.addEventListener('click',() => {popupTool=button.dataset.popupTool;renderPopup();showPopupView('overview');}));
document.querySelector('.equipment-close').addEventListener('click',() => equipmentDialog.close());
