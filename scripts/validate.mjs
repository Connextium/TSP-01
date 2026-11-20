import fs from 'node:fs';
import path from 'node:path';
const pub=path.resolve('public');
const errors=[];
const ok=(yes,message)=>{if(!yes)errors.push(message)};
const has=(p)=>fs.existsSync(path.join(pub,p));
const read=(p)=>fs.readFileSync(path.join(pub,p),'utf8');
const chapters=['tokenization','rwa','money','capital','liquidity','settlement','dlt','controls','governance'];
const catalog=JSON.parse(read('data/catalog.json'));
ok(catalog.reports.length===22,'Expected 22 reports');
for(const name of ['index.html','styles.css','hero.js','report-filter.js','research/index.html','reports/index.html','methodology/index.html','evidence/index.html'])ok(has(name),'Missing '+name);
const pages=[];
function walk(dir){for(const name of fs.readdirSync(dir)){const full=path.join(dir,name);if(fs.statSync(full).isDirectory())walk(full);else if(name==='index.html')pages.push(full)}}
walk(pub);
for(const p of pages){
 const text=fs.readFileSync(p,'utf8');
 for(const [,href] of text.matchAll(/href="([^"]+)"/g)){
  ok(!href.includes('{')&&!href.includes('}'),'Template link in '+p+': '+href);
  if(href.startsWith('/')){
   const trimmed=href.split(/[?#]/)[0].replace(/^\/+/, '');
   ok(has(trimmed)||has(path.posix.join(trimmed,'index.html')),'Missing internal link '+href+' in '+p);
  }
 }
}
for(const chapter of chapters)ok(has('research/'+chapter+'/index.html'),'Missing chapter '+chapter);
for(const report of catalog.reports){
 const reportHtml=report.url.replace(/^\/+/, '')+'index.html';
 ok(has(reportHtml),'Missing report '+report.url);
 if(!has(reportHtml))continue;
 const html=read(reportHtml);
 for(const section of ['id="literature"','id="architecture"','id="worked-case"','id="failure"','id="references"'])ok(html.includes(section),'Missing '+section+' in '+report.url);
 ok(read('research/'+report.chapter+'/index.html').includes('href="'+report.url+'"'),'Missing chapter report link '+report.url);
}
for(const alias of ['rwa/index.html','reports/rwa/index.html'])ok(has(alias),'Missing shorthand route '+alias);
ok(read('index.html').includes('Beyond Tokens.'),'Missing original hero');
ok(read('index.html').includes('Programme-%1'),'Incorrect header');
if(errors.length){console.error('Validation issues: '+errors.length);errors.forEach(x=>console.error(' - '+x));process.exit(1)}
console.log('TSP-01 validated: '+chapters.length+' chapters; '+catalog.reports.length+' full reports; '+pages.length+' HTML pages.');
