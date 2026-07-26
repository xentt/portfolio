'use strict';

/* ===== SPECIES DATA ===== */
const species = [
  {
    name: 'Inland Taipan',
    sci: 'Oxyuranus microlepidotus',
    cls: 'REPTILIA · NEUROTOXINA',
    jp: 'ナウスタアプラグダプリ',
    toxin: 'Taipoxina (Neurotoxina presináptica)',
    ld50: '0.025 mg/kg',
    antidote: 'Antiveneno polivalente',
    description: 'La taipoxina es una neurotoxina presináptica extremadamente potente. Una sola mordedura contiene suficiente veneno para matar hasta 100 humanos adultos o 250.000 ratones. El veneno actúa bloqueando la liberación de acetilcolina en las uniones neuromusculares, causando parálisis progresiva. Además contiene hemotoxinas y enzimas proteolíticas que facilitan la digestión del tejido.',
    habitat: 'Endémico de las regiones áridas del centro-este de Australia (Queensland, Australia del Sur, Nueva Gales del Sur). Habita llanuras de arcilla negra, madrigueras abandonadas y grietas rocosas. Es una especie esquiva y diurna durante el invierno, volviéndose crepuscular en verano.',
    protocol: 'Inmovilizar la extremidad con vendaje de presión. Mantener a la víctima calmada e inmóvil. Trasladar urgente a un centro médico. NO lavar la herida (ayuda a identificar la especie). El antiveneno polivalente es altamente efectivo si se administra dentro de las primeras horas.'
  },
  {
    name: 'Araña Bananera',
    sci: 'Phoneutria nigriventer',
    cls: 'ARACHNIDA · NEUROTOXINA',
    jp: 'バナナグツメグモ',
    toxin: 'Tx2-6 (Neurotoxina)',
    ld50: '0.134 mg/kg',
    antidote: 'Antiveneno Phoneutria',
    description: 'El veneno contiene péptidos neurotóxicos potentes que actúan sobre los canales de sodio y calcio voltaje-dependientes. Causa una liberación masiva de neurotransmisores produciendo dolor intenso, priapismo, y en casos severos edema pulmonar y paro cardíaco. Reconocida por el Guinness World Records como la araña más venenosa del mundo.',
    habitat: 'Originaria de América del Sur (Brasil, Colombia, Ecuador, Perú). Es una araña errante que no teje telaraña, cazando activamente en el suelo durante la noche. Su nombre proviene de su frecuente aparición en plantaciones de banano. Es extremadamente agresiva cuando se siente amenazada.',
    protocol: 'Mantener la calma, lavar la zona con agua y jabón, aplicar compresa fría y trasladar de urgencia a un hospital. NO aplicar torniquetes ni cortar la herida. El antiveneno es efectivo y ampliamente disponible en Brasil.'
  },
  {
    name: 'Escorpión Dorado',
    sci: 'Leiurus quinquestriatus',
    cls: 'ARACHNIDA · NEUROTOXINA',
    jp: 'キイロササオサシ',
    toxin: 'Clorotoxina (Neurotoxina)',
    ld50: '0.25 mg/kg',
    antidote: 'Antiveneno específico',
    description: 'El veneno es un cóctel complejo de neurotoxinas que afectan los canales iónicos. La clorotoxina bloquea los canales de cloro mientras que otras toxinas afectan los canales de sodio y potasio. Produce una tormenta neurológica que causa dolor extremo, convulsiones y fallo respiratorio.',
    habitat: 'Regiones áridas y desérticas del norte de África (Egipto, Libia, Sudán) y Medio Oriente (Israel, Jordania, Arabia Saudita, Yemen). Se esconde bajo rocas, grietas y en viviendas humanas. Es nocturno y particularmente agresivo.',
    protocol: 'Mantener a la víctima en reposo, aplicar hielo en la picadura, elevar la extremidad afectada y trasladar a un hospital. El antiveneno es efectivo pero debe administrarse temprano. Los niños y ancianos son los más vulnerables.'
  },
  {
    name: 'Medusa de Caja',
    sci: 'Chironex fleckeri',
    cls: 'CUBOZOA · PORO-FORMADORA',
    jp: 'アップキラグラゲ',
    toxin: 'Poro-formadora (Citotoxina)',
    ld50: '0.04 mg/kg',
    antidote: 'Suero antiveneno CSL',
    description: 'El veneno contiene toxinas poro-formadoras que atacan directamente el corazón, el sistema nervioso y las células de la piel. Sus cnidocitos liberan veneno que causa un dolor tan intenso que las víctimas pueden entrar en shock y morir por paro cardíaco en minutos. Cada tentáculo contiene suficiente veneno para matar a 60 adultos.',
    habitat: 'Aguas costeras del norte de Australia y el Indo-Pacífico. Más común durante los meses de verano (octubre a mayo). Su cuerpo translúcido la hace casi invisible. A diferencia de otras medusas, puede nadar activamente hasta 6 km/h y posee 24 ojos.',
    protocol: 'Aplicar vinagre (ácido acético al 5%) generosamente en los tentáculos para desactivar los nematocistos. NO usar agua dulce ni alcohol. Retirar tentáculos con pinzas. RCP inmediato si la víctima deja de respirar. El antiveneno debe administrarse lo antes posible.'
  },
  {
    name: 'Caracol Cono',
    sci: 'Conus geographus',
    cls: 'GASTROPODA · CONOTOXINA',
    jp: 'アマガシャ',
    toxin: 'omega-Conotoxina',
    ld50: '0.012 mg/kg',
    antidote: 'No existe antiveneno',
    description: 'Produce un veneno extremadamente complejo llamado conotoxina, compuesto por cientos de péptidos neurotóxicos. La omega-conotoxina bloquea los canales de calcio tipo N, impidiendo la liberación de neurotransmisores y causando parálisis total. El ziconotida (Prialt) es un analgésico derivado 1000 veces más potente que la morfina.',
    habitat: 'Común en los arrecifes de coral del Indo-Pacífico. Prefiere aguas poco profundas (hasta 20 m). Es un depredador activo que usa una probóscide con un diente en forma de arpón para inyectar veneno a sus presas.',
    protocol: 'NO existe antiveneno. El único tratamiento es de soporte: mantener funciones vitales y respiración artificial si es necesario. La hospitalización urgente es crítica. La recuperación puede tomar semanas.'
  },
  {
    name: 'Pez Piedra',
    sci: 'Synanceia verrucosa',
    cls: 'ACTINOPTERYGII · PROTEICO',
    jp: 'オニオコゼウ',
    toxin: 'Verrucotoxina (Proteica)',
    ld50: '0.36 mg/kg',
    antidote: 'Antiveneno Stonefish',
    description: 'Posee 13 espinas dorsales con glándulas de veneno que inyectan verrucotoxina, una proteína estable que causa dolor extremo, necrosis tisular y efectos cardiovasculares severos. Contiene estonustoxina, una miotoxina que causa parálisis muscular y puede llevar a insuficiencia cardíaca.',
    habitat: 'Aguas costeras tropicales del Indo-Pacífico y el norte de Australia. Es un maestro del camuflaje, pareciéndose a una roca cubierta de algas. Es un depredador de emboscada que permanece inmóvil esperando a sus presas.',
    protocol: 'Sumergir el área afectada en agua caliente (45 °C) por 30-90 minutos para desnaturalizar la toxina. El antiveneno es efectivo si se administra dentro de las primeras horas. NO aplicar hielo ni torniquete.'
  },
  {
    name: 'Pulpo de Anillos Azules',
    sci: 'Hapalochlaena lunulata',
    cls: 'CEPHALOPODA · TETRODOTOXINA',
    jp: 'ビシヤマダコ',
    toxin: 'Tetrodotoxina (TTX)',
    ld50: '0.3 mg/kg',
    antidote: 'No existe antiveneno',
    description: 'Produce tetrodotoxina (TTX), una de las neurotoxinas más potentes. La TTX bloquea los canales de sodio voltaje-dependientes, impidiendo la transmisión de impulsos nerviosos y causando parálisis completa. Es producida por bacterias simbióticas en las glándulas salivales. No existe antiveneno.',
    habitat: 'Arrecifes y pozas de marea del Océano Pacífico e Índico (desde Japón hasta Australia). Es pequeño (10-20 cm) y nocturno. Sus brillantes anillos azules aparecen cuando se siente amenazado como advertencia.',
    protocol: 'NO existe antiveneno. La única esperanza es ventilación artificial inmediata y soporte vital hasta que el cuerpo metabolice la toxina (24-48 horas). RCP esencial si el corazón se detiene. Con soporte adecuado, la recuperación completa es posible.'
  },
  {
    name: 'Rana Dardo Dorada',
    sci: 'Phyllobates terribilis',
    cls: 'AMPHIBIA · BATRACOTOXINA',
    jp: 'コウハヤクビカエル',
    toxin: 'Batracotoxina (BTX)',
    ld50: '0.002 mg/kg',
    antidote: 'No existe antiveneno',
    description: 'Produce batracotoxina (BTX), la toxina natural más potente conocida. Un solo espécimen contiene suficiente veneno para matar a 10 humanos adultos. La BTX actúa sobre los canales de sodio manteniéndolos permanentemente abiertos. Con LD50 de 0.002 mg/kg, es 20 veces más tóxica que la tetrodotoxina.',
    habitat: 'Endémica de las selvas tropicales del Pacífico colombiano (departamento del Cauca). Habita el suelo del bosque cerca de arroyos. Es diurna y se alimenta de pequeños insectos. Las ranas criadas en cautiverio no producen toxina.',
    protocol: 'La toxina puede absorberse por la piel intacta y membranas mucosas. NO existe antiveneno ni tratamiento específico. El manejo es puramente de soporte vital. 1 gramo de BTX podría matar a 10.000 personas.'
  }
];

/* ===== CONFIG ===== */
const CONFIG = {
  itemCount: 20,
  starCount: 150,
  zGap: 700,
  camSpeed: 2.8,
  colors: ['#ff003c', '#00f3ff', '#ccff00', '#ffffff']
};
CONFIG.loopSize = CONFIG.itemCount * CONFIG.zGap;

const TEXTS = ["ANIMALES", "VENENOSOS", "MORTALES", "ARCHIVO", "PELIGRO", "TOXINAS"];

/* ===== STATE ===== */
const state = {
  scroll: 0,
  velocity: 0,
  targetSpeed: 0,
  mouseX: 0,
  mouseY: 0
};

const world = document.getElementById('world');
const viewport = document.getElementById('viewport');
const items = [];

/* ===== IMAGE LOADER ===== */
const cardEls = Array.from({ length: species.length }, () => []);

function applyImageToSpecies(idx, url) {
  species[idx].img = url;
  cardEls[idx].forEach(el => {
    const img = el.querySelector('.card-img');
    if (img) {
      img.style.backgroundImage = `url(${url})`;
      img.classList.add('loaded');
    }
  });
}

function fetchSpeciesImages() {
  species.forEach((s, idx) => {
    const sciEncoded = s.sci.replace(/ /g, '_');
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${sciEncoded}`)
      .then(r => r.json())
      .then(data => {
        const url = data.thumbnail?.source || data.originalimage?.source;
        if (url) applyImageToSpecies(idx, url);
      })
      .catch(() => {});
  });
}

/* ===== INIT ITEMS ===== */
function init() {
  let si = 0;

  for (let i = 0; i < CONFIG.itemCount; i++) {
    const el = document.createElement('div');
    el.className = 'item';

    const isHeading = i % 4 === 0;

    if (isHeading) {
      const txt = document.createElement('div');
      txt.className = 'big-text';
      txt.innerText = TEXTS[Math.floor(i / 4) % TEXTS.length];
      el.appendChild(txt);
      items.push({
        el, type: 'text',
        x: 0, y: 0, rot: (Math.random() - 0.5) * 8,
        baseZ: -i * CONFIG.zGap
      });
    } else {
      const spIdx = si % species.length;
      si++;
      const s = species[spIdx];

      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.speciesIndex = spIdx;
      const randId = Math.floor(Math.random() * 9000) + 1000;
      const dataSize = (Math.random() * 80 + 20).toFixed(1);

      const clsShort = s.cls.split('·')[0].trim();
      card.innerHTML = `
        <div class="card-img"></div>
        <div class="card-header">
          <span class="card-id">VENOM_${randId}</span>
          <div class="card-dot"></div>
        </div>
        <div class="card-body">
          <h2>${s.name}</h2>
          <span class="sci-name">${s.sci}</span>
          <span class="class-badge">${clsShort}</span>
        </div>
        <div class="card-footer">
          <span>DATA: ${dataSize}MB</span>
          <span>LD50: ${s.ld50}</span>
        </div>
        <div class="card-index">${String(spIdx + 1).padStart(2, '0')}</div>
      `;

      card.addEventListener('click', (e) => {
        e.stopPropagation();
        openDetail(spIdx);
      });

      cardEls[spIdx].push(card);
      el.appendChild(card);

      const angle = (i / CONFIG.itemCount) * Math.PI * 6 + Math.random() * 0.2;
      const radius = 350 + Math.random() * 150;
      const x = Math.cos(angle) * (window.innerWidth * 0.28);
      const y = Math.sin(angle) * (window.innerHeight * 0.28);
      const rot = (Math.random() - 0.5) * 20;

      items.push({
        el, type: 'card',
        x, y, rot,
        baseZ: -i * CONFIG.zGap
      });
    }
    world.appendChild(el);
  }

  fetchSpeciesImages();

  for (let i = 0; i < CONFIG.starCount; i++) {
    const el = document.createElement('div');
    el.className = 'star';
    world.appendChild(el);
    items.push({
      el, type: 'star',
      x: (Math.random() - 0.5) * 3000,
      y: (Math.random() - 0.5) * 3000,
      baseZ: -Math.random() * CONFIG.loopSize
    });
  }

  window.addEventListener('mousemove', (e) => {
    state.mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    state.mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
}

/* ===== DETAIL OVERLAY ===== */
let currentDetailIndex = 0;
const overlay = document.getElementById('detail-overlay');
const detailClose = document.getElementById('detail-close');
const detailPrev = document.getElementById('detail-prev');
const detailNext = document.getElementById('detail-next');

function openDetail(idx) {
  currentDetailIndex = idx;
  const s = species[idx];
  const idNum = String(idx + 1).padStart(3, '0');
  document.getElementById('detail-id').textContent = `VENOM_${idNum}`;
  document.getElementById('detail-name').textContent = s.name;
  document.getElementById('detail-sci').textContent = s.sci;
  document.getElementById('detail-jp').textContent = s.jp;
  document.getElementById('d-cls').textContent = s.cls;
  document.getElementById('d-toxin').textContent = s.toxin;
  document.getElementById('d-ld50').textContent = s.ld50;
  document.getElementById('d-antidote').textContent = s.antidote;
  document.getElementById('d-description').textContent = s.description;
  document.getElementById('d-habitat').textContent = s.habitat;
  document.getElementById('d-protocol').textContent = s.protocol;
  document.getElementById('detail-counter').textContent = `${idx + 1} / ${species.length}`;
  detailPrev.disabled = idx === 0;
  detailNext.disabled = idx === species.length - 1;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  lenis.stop();
}

function closeDetail() {
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
  lenis.start();
}

detailClose.addEventListener('click', closeDetail);
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeDetail(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

detailPrev.addEventListener('click', () => {
  if (currentDetailIndex > 0) openDetail(currentDetailIndex - 1);
});
detailNext.addEventListener('click', () => {
  if (currentDetailIndex < species.length - 1) openDetail(currentDetailIndex + 1);
});

/* ===== LOADING ===== */
const loadingScreen = document.getElementById('loading-screen');
const loadingPhase = document.getElementById('loading-phase');
const instrucPhase = document.getElementById('phase-instruc');
const loadingBar = document.getElementById('loading-bar');
const loadingPct = document.getElementById('loading-pct');
let loadProgress = 0;

startLoading();
function startLoading() {
  loadProgress = 0;
  advanceLoading();
}
function advanceLoading() {
  if (loadProgress >= 100) {
    loadingBar.style.width = '100%';
    loadingPct.textContent = '100%';
    setTimeout(() => {
      loadingPhase.classList.add('hidden');
      instrucPhase.classList.remove('hidden');
    }, 400);
    return;
  }
  loadProgress += Math.random() * 8 + 3;
  if (loadProgress > 100) loadProgress = 100;
  loadingBar.style.width = loadProgress + '%';
  loadingPct.textContent = Math.round(loadProgress) + '%';
  setTimeout(advanceLoading, 80 + Math.random() * 120);
}

document.getElementById('instruc-btn').addEventListener('click', () => {
  loadingScreen.classList.add('done');
});

/* ===== LENIS ===== */
const lenis = new Lenis({
  smooth: true,
  lerp: 0.08,
  direction: 'vertical',
  gestureDirection: 'vertical',
  smoothTouch: true
});

lenis.on('scroll', ({ scroll, velocity }) => {
  state.scroll = scroll;
  state.targetSpeed = velocity;
});

/* ===== 3D RENDERING ===== */
const velReadout = document.getElementById('vel-readout');
const fpsEl = document.getElementById('fps');
const coordEl = document.getElementById('coord');
let lastTime = 0;
let frameCount = 0;
let fpsTime = 0;

function raf(time) {
  lenis.raf(time);

  const delta = time - lastTime;
  lastTime = time;

  frameCount++;
  if (time - fpsTime > 500) {
    fpsEl.innerText = Math.round(frameCount / ((time - fpsTime) / 1000));
    frameCount = 0;
    fpsTime = time;
  }

  state.velocity += (state.targetSpeed - state.velocity) * 0.1;

  velReadout.innerText = Math.abs(state.velocity).toFixed(2);
  coordEl.innerText = state.scroll.toFixed(0);

  const tiltX = state.mouseY * 4 - state.velocity * 0.4;
  const tiltY = state.mouseX * 4;

  world.style.transform = `
    rotateX(${tiltX}deg)
    rotateY(${tiltY}deg)
  `;

  const baseFov = 1000;
  const fov = baseFov - Math.min(Math.abs(state.velocity) * 8, 500);
  viewport.style.perspective = fov + 'px';

  const cameraZ = state.scroll * CONFIG.camSpeed;
  const modC = CONFIG.loopSize;
  const t = time * 0.001;

  for (const item of items) {
    let relZ = item.baseZ + cameraZ;
    let vizZ = ((relZ % modC) + modC) % modC;
    if (vizZ > 500) vizZ -= modC;

    let alpha = 1;
    if (vizZ < -4000) alpha = 0;
    else if (vizZ < -2500) alpha = (vizZ + 4000) / 1500;

    if (item.type !== 'star') {
      if (vizZ > 100) alpha = Math.max(0, 1 - (vizZ - 100) / 700);
    } else {
      if (vizZ > 200) alpha = Math.max(0, 1 - (vizZ - 200) / 300);
    }
    if (alpha < 0) alpha = 0;

    item.el.style.opacity = alpha;
    if (item.type === 'card') {
      item.el.style.pointerEvents = alpha > 0.3 ? 'auto' : 'none';
    }

    if (alpha > 0) {
      let trans = `translate3d(${item.x}px, ${item.y}px, ${vizZ}px)`;

      if (item.type === 'star') {
        const stretch = Math.max(1, Math.min(1 + Math.abs(state.velocity) * 0.1, 8));
        trans += ` scale3d(1, 1, ${stretch})`;
      } else if (item.type === 'text') {
        trans += ` rotateZ(${item.rot}deg)`;
        if (Math.abs(state.velocity) > 0.5) {
          const offset = state.velocity * 1.5;
          item.el.style.textShadow = `${offset}px 0 ${CONFIG.colors[0]}, ${-offset}px 0 ${CONFIG.colors[1]}`;
        } else {
          item.el.style.textShadow = 'none';
        }
      } else {
        const float = Math.sin(t * 0.8 + item.x * 0.01) * 6;
        trans += ` rotateZ(${item.rot}deg) rotateY(${float}deg)`;
      }

      item.el.style.transform = trans;
    }
  }

  requestAnimationFrame(raf);
}

/* ===== START ===== */
init();
requestAnimationFrame(raf);
