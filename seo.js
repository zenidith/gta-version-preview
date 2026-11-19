'use strict';
(() => {
const base='https://zenidith.github.io/gta-version-preview/';
const langs=['en','ja','es','pt-BR','ko','de'];
const params=new URLSearchParams(location.search),path=location.pathname;
const legacy=path.match(/\/(ja\/)?answers\/([^/]+\.html)$/);
const isJA=path.includes('/ja/');
let lang=params.get('lang')||(isJA?'ja':'en');if(!langs.includes(lang))lang=isJA?'ja':'en';
const filename=path.split('/').pop()||'index.html';
const page=['guide.html','languages.html'].includes(filename)?filename:'index.html';
const topics=['launch','editions','install','world','performance','ratings','status','news','faq','sources'];
const topic=params.get('topic')||'launch';
function url(c){const prefix=c==='ja'?'ja/':'';let result=base+prefix+page;const p=new URLSearchParams();if(page==='guide.html')p.set('topic',topic);if(c!=='en'&&c!=='ja')p.set('lang',c);return result+(p.size?'?'+p.toString():'');}
let canonical;
if(legacy)canonical=base+(legacy[1]||'')+'answers/'+legacy[2];
else canonical=url(lang);
if(page==='guide.html'&&!topics.includes(topic)){document.querySelector('meta[name=robots]').content='noindex,follow';return;}
let tag=document.querySelector('link[rel=canonical]');if(!tag){tag=document.createElement('link');tag.rel='canonical';document.head.append(tag);}tag.href=canonical;
document.querySelectorAll('link[hreflang]').forEach(e=>e.remove());
for(const c of [...(legacy?['en','ja']:langs),'x-default']){const a=document.createElement('link');a.rel='alternate';a.hreflang=c;const target=c==='x-default'?'en':c;a.href=legacy?base+(target==='ja'?'ja/':'')+'answers/'+legacy[2]:url(target);document.head.append(a);}
})();
