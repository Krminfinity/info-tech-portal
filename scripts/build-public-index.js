// Build public-index.json by scanning assets and optional schedule.json
// - Files under assets/information_technology_{2,3}/class{1,2}/...
// - Publish date inferred from filename (YYYYMMDD, YYYY-MM-DD, YYYY_MM_DD) or from schedule.json
// - Output only items whose publishAt <= now (UTC)
// Usage: node scripts/build-public-index.js

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const assetsDir = path.join(repoRoot, 'assets');
const schedulePath = path.join(assetsDir, 'schedule.json');
const outPath = path.join(repoRoot, 'public-index.json');

const DATE_PATTERNS = [
  /(20\d{2})(\d{2})(\d{2})/,            // 20250415
  /(20\d{2})[-_](\d{2})[-_](\d{2})/     // 2025-04-15 or 2025_04_15
];

function toUtcMs(s){
  if(!s) return 0;
  const t = Date.parse(s);
  return isNaN(t) ? 0 : t;
}

function inferDateFromName(name){
  for(const re of DATE_PATTERNS){
    const m = name.match(re);
    if(m){
      const y = m[1], mo = m[2], d = m[3];
      const iso = `${y}-${mo}-${d}T00:00:00Z`;
      const t = toUtcMs(iso);
      if(t) return iso;
    }
  }
  return null;
}

function walk(dir){
  const out = [];
  if(!fs.existsSync(dir)) return out;
  for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
    const full = path.join(dir, entry.name);
    if(entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function toUrlPath(abs){
  return abs.replace(repoRoot + path.sep, '').replace(/\\/g, '/');
}

function parseCourseClass(relPath){
  // assets/information_technology_2/class1/...
  const parts = relPath.split('/');
  const idx = parts.indexOf('assets');
  if(idx === -1) return {};
  const seg = parts.slice(idx+1);
  const courseDir = seg[0] || '';
  const classDir = seg[1] || '';
  let course = '';
  if(courseDir.includes('technology_2')) course = 'it2';
  if(courseDir.includes('technology_3')) course = 'it3';
  const classId = classDir.startsWith('class') ? classDir : '';
  return { course, classId };
}

function titleFromFilename(name){
  // remove extension, replace separators with spaces
  const base = name.replace(/\.[^.]+$/, '');
  return base.replace(/[_-]+/g, ' ');
}

function loadSchedule(){
  if(!fs.existsSync(schedulePath)) return [];
  try{
    const raw = fs.readFileSync(schedulePath, 'utf-8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch{
    return [];
  }
}

function main(){
  const files = walk(assetsDir)
    .filter(p => /\.(pdf|pptx?|docx?|xlsx?)$/i.test(p));

  const schedule = loadSchedule();
  // Build a lookup from path -> metadata (schedule.json may override)
  const metaByPath = new Map(schedule.map(it => [it.path, it]));

  const items = files.map(abs => {
    const rel = toUrlPath(abs);
    const name = path.basename(abs);
    const { course, classId } = parseCourseClass(rel);
    const inferred = inferDateFromName(name);
    const baseItem = {
      path: rel,
      course,
      classId,
      publishAt: inferred || null,
      title: titleFromFilename(name)
    };
    // Merge schedule override if exists
    const override = metaByPath.get(rel);
    return override ? { ...baseItem, ...override, path: rel } : baseItem;
  }).filter(it => it.course && it.classId); // must belong to known course/class

  const now = Date.now();
  const published = items.filter(it => {
    if(!it.publishAt) return false; // if no date, not yet
    const t = toUtcMs(it.publishAt);
    return now >= t;
  }).sort((a,b)=> toUtcMs(a.publishAt||0) - toUtcMs(b.publishAt||0));

  fs.writeFileSync(outPath, JSON.stringify(published, null, 2));
  console.log('Scanned files:', files.length, 'Published items:', published.length);
}

if (require.main === module) {
  main();
}
