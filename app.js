(function () {
'use strict';
const data=window.GTA_DATA, isJA=document.documentElement.lang==='ja';
const locale=document.documentElement.lang,local=window.GTA_ACTIVE_LOCALE;
const tr=(en,ja)=>local?(local.tr[en]||en):(isJA?ja:en);
const regionNames=new Intl.DisplayNames([locale],{type:'region'});
const languageNames=new Intl.DisplayNames([locale],{type:'language'});
const langName=x=>x==='Other / not shown'?tr(x,'その他・一覧にない言語'):(data.languageCodes[x]?languageNames.of(data.languageCodes[x]):x);
const regionName=x=>regionNames.of(x)+' ('+x+')';
const escape=text=>String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function evaluate(platform,region,text,voice){
 const listing=(platform==='PS5'?data.listings:platform==='Xbox'?data.xboxListings:{})[region];
 if(!listing)return {state:'unknown',text:'Not verified',voice:'Not verified',source:null};
 const t=listing.text.includes(text),v=listing.voice.includes(voice);
 return {state:t&&v?'listed':'missing',text:t?'Listed as text':'Not in this table',voice:v?'Listed as voice':'Not in this table',source:listing.source};
}
window.evaluateLanguage=evaluate;
const form=document.getElementById('checker');if(!form)return;
for(const id of ['text','voice']){const field=document.getElementById(id);for(const language of data.languages){const o=document.createElement('option');o.value=language;o.textContent=langName(language);field.append(o);}}
form.elements.text.value=({en:'English',es:'Spanish (Spain)',de:'German',ko:'Korean','pt-BR':'Portuguese (Brazil)'})[locale]||'Japanese';if(!form.elements.text.value)form.elements.text.value='Japanese';form.elements.voice.value='English';
const picker=form.elements.region, search=document.getElementById('region-search');
const sorted=[...data.regions].sort((a,b)=>regionName(a).localeCompare(regionName(b),locale));
const groups={Asia:'JP KR HK TW SG IN ID MY TH VN PH CN',Oceania:'AU NZ',Americas:'US CA MX AR BR CL CO PE BO CR EC SV GT HN NI PA PY UY',Europe:'GB FR DE IT ES PT NL BE AT CH IE DK FI NO SE PL CZ SK HU GR TR RO BG HR SI UA LU MT CY IS RU',MiddleEast:'AE SA IL BH QA KW OM LB JO',Africa:'ZA MA TN'};
const groupLabels={Asia:tr('Asia','アジア'),Oceania:tr('Oceania','オセアニア'),Americas:tr('Americas','南北アメリカ'),Europe:tr('Europe','ヨーロッパ'),MiddleEast:tr('Middle East','中東'),Africa:tr('Africa','アフリカ')};
function populate(){
 const previous=picker.value||({en:'US',es:'ES',de:'DE',ko:'KR','pt-BR':'BR'})[locale]||'JP',q=search.value.trim().toLocaleLowerCase();picker.replaceChildren();
 for(const [key,codes] of Object.entries(groups)){
  const g=document.createElement('optgroup');g.label=groupLabels[key];
  for(const r of sorted.filter(r=>codes.split(' ').includes(r))){
   if(q&&![regionName(r),new Intl.DisplayNames(['en'],{type:'region'}).of(r),r].some(x=>x.toLocaleLowerCase().includes(q)))continue;
   const o=document.createElement('option');o.value=r;o.textContent=regionName(r)+(data.coverage[r][form.elements.platform.value].verified?'':' · '+tr('not verified','未確認'));g.append(o);
  }
  if(g.children.length)picker.append(g);
 }
 if([...picker.options].some(o=>o.value===previous))picker.value=previous;
 document.getElementById('coverage-summary').textContent=local?local.ui.toolDesc:tr(`${data.counts.regions} countries / territories checked · ${data.counts.PS5} PS5 tables · ${data.counts.Xbox} Xbox matrices. Filter, then choose a region.`,`${data.counts.regions}の国・地域を調査。PS5 ${data.counts.PS5}地域、Xbox ${data.counts.Xbox}地域の表を確認。検索後に地域を選択してください。`);
 render();
}
function render(){
 const platform=form.elements.platform.value,region=picker.value,text=form.elements.text.value,voice=form.elements.voice.value;
 const result=evaluate(platform,region,text,voice),coverage=data.coverage[region]?.[platform],source=data.sources[result.source||coverage?.source],el=document.getElementById('result');
 el.dataset.state=result.state;
 const title=result.state==='listed'?tr('Both languages are listed','選択した両言語が記載されています'):result.state==='missing'?tr('Your combination is not fully listed','選択した組み合わせの記載は揃っていません'):tr('Not verified for this region','この地域の対応言語は未確認です');
 const textStatus=x=>x==='Not verified'?tr(x,'未確認'):x==='Not in this table'?tr(x,'この表には記載なし'):x==='Listed as voice'?tr(x,'音声に記載あり'):tr(platform==='Xbox'?'Listed as subtitles':x,platform==='Xbox'?'字幕に記載あり':'テキストに記載あり');
 let note=result.state==='unknown'?tr('No usable regional language table was verified. A missing page or a redirect is not proof the game is unavailable. We do not borrow another country\'s result.','使用できる地域別の対応表を確認できませんでした。ページがないことや転送されたことは、ゲームを購入・利用できない証明ではありません。他国の結果は流用しません。'):platform==='Xbox'?tr('This regional Xbox page lists subtitles, interface and audio separately. This result checks subtitles and audio, not a purchased copy or account/code compatibility.','Xboxの地域別商品データは字幕・表示言語・音声を分けて記載しています。ここでは字幕と音声を判定します。実機動作やコード・アカウントの互換性は未検証です。'):tr('This is Sony\'s regional support table, not a hands-on test or exact store-SKU entitlement. Sony labels the column Text, without separating menus and subtitles.','Sonyの地域別サポート表の記載であり、実機検証や特定商品の利用権確認ではありません。テキスト欄はメニューと字幕を分けていません。');
 const stamp=source?.checkedAt?new Date(source.checkedAt).toLocaleString(locale==='en'?'en-GB':locale,{timeZone:'Asia/Tokyo',hour12:false})+' JST':null;
 el.innerHTML='<span class="badge">'+escape(region?regionName(region):tr('No matches','該当なし'))+' · '+escape(platform)+'</span><h2>'+escape(title)+'</h2><dl class="statuses"><div><dt>'+escape(langName(text))+tr(' text / subtitles','・テキスト／字幕')+'</dt><dd>'+escape(textStatus(result.text))+'</dd></div><div><dt>'+escape(langName(voice))+tr(' audio','・音声')+'</dt><dd>'+escape(textStatus(result.voice))+'</dd></div></dl><p>'+escape(note)+'</p>'+(source?'<a class="source" href="'+escape(source.url)+'" target="_blank" rel="noopener noreferrer">'+escape(tr(result.state==='unknown'?'Checked source, no verified table':'Official regional source',result.state==='unknown'?'確認した出典（対応表は未確認）':'地域別の公式出典'))+' ↗</a>':'')+(stamp?'<p class="meta">'+tr('Checked ','出典確認：')+escape(stamp)+'</p>':'');
}
form.addEventListener('submit',e=>e.preventDefault());
form.addEventListener('change',e=>{if(e.target===form.elements.platform)populate();else render();});search.addEventListener('input',populate);
const tbody=document.getElementById('coverage-rows');
for(const r of sorted){const row=document.createElement('tr');row.innerHTML='<th scope="row">'+escape(regionName(r))+'</th>'+['PS5','Xbox'].map(p=>{const c=data.coverage[r][p],s=data.sources[c.source];return '<td><a href="'+escape(s.url)+'" target="_blank" rel="noopener noreferrer">'+tr(c.verified?'Verified listing':'Not verified',c.verified?'公式表を確認':'未確認')+'</a></td>';}).join('');tbody.append(row);}
populate();
})();
