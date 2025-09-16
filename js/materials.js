(function(){
  const isGhPages = location.pathname.includes('/info-tech-portal/');
  const BASE_PATH = isGhPages ? '/info-tech-portal/' : '/';
  const BASE_URL = location.origin + BASE_PATH;
  const SOURCE_PRIORITY = [
    BASE_URL + 'public-index.json',
    BASE_URL + 'assets/schedule.json'
  ];

  function toUtc(dateStr){
    try { return new Date(dateStr).getTime(); } catch(e) { return NaN; }
  }

  function nowUtc(){ return Date.now(); }

  async function loadIndex(){
    for(const src of SOURCE_PRIORITY){
      try{
        const res = await fetch(src, {cache:'no-cache'});
        if(!res.ok) throw new Error('HTTP '+res.status);
        const json = await res.json();
        if(Array.isArray(json)) return {items: json, source: src};
      }catch(e){ /* try next */ }
    }
    return {items: [], source: null};
  }

  function isPublished(item){
    if(!item.publishAt) return true;
    const pub = toUtc(item.publishAt);
    if(Number.isNaN(pub)) return true;
    return nowUtc() >= pub;
  }

  function fmtSize(bytes){
    if(typeof bytes !== 'number') return '';
    const units = ['B','KB','MB','GB'];
    let i=0, val=bytes;
    while(val>=1024 && i<units.length-1){ val/=1024; i++; }
    return `${val.toFixed(1)} ${units[i]}`;
  }

  function renderList(list, opts){
    const { pcContainer, mobileContainer } = opts;

    // PC
    if(pcContainer){
      const ul = document.createElement('ul');
      ul.className = 'button-list';
      list.forEach(it => {
        const li = document.createElement('li');
  const a = document.createElement('a');
  a.href = BASE_URL + it.path.replace(/^\/?/, '');
        a.target = '_blank';
        a.className = 'btn btn-custom d-block mb-2';
        a.textContent = it.title || it.path.split('/').pop();
        li.appendChild(a);
        ul.appendChild(li);
      });
      pcContainer.innerHTML = '';
      pcContainer.appendChild(ul);
    }

    // Mobile
    if(mobileContainer){
      mobileContainer.innerHTML = '';
      list.forEach(it => {
        const card = document.createElement('div');
        card.className = 'card';
        const body = document.createElement('div');
        body.className = 'card-body';
  const a = document.createElement('a');
  a.href = BASE_URL + it.path.replace(/^\/?/, '');
        a.target = '_blank';
        a.className = 'stretched-link';
        a.textContent = it.title || it.path.split('/').pop();
        body.appendChild(a);
        if(it.desc){
          const p = document.createElement('div');
          p.className = 'text-muted small mt-1';
          p.textContent = it.desc;
          body.appendChild(p);
        }
        card.appendChild(body);
        mobileContainer.appendChild(card);
      });
    }
  }

  async function renderMaterials(opts){
    const { course, classId, pcSelector, mobileSelector } = opts;
    const pcContainer = document.querySelector(pcSelector);
    const mobileContainer = document.querySelector(mobileSelector);
    if(!pcContainer && !mobileContainer) return;

    const {items} = await loadIndex();
    const filtered = items
      .filter(it => (!course || it.course===course) && (!classId || it.classId===classId))
      .filter(isPublished)
      .sort((a,b)=> toUtc(a.publishAt||0) - toUtc(b.publishAt||0));

    renderList(filtered, { pcContainer, mobileContainer });
  }

  window.ITPortal = window.ITPortal || {};
  window.ITPortal.renderMaterials = renderMaterials;
})();
