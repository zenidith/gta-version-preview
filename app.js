(function () {
  'use strict';
  const data = window.GTA_DATA;
  const isJA = document.documentElement.lang === "ja";
  const names = {"English": "英語", "Japanese": "日本語", "French": "フランス語", "German": "ドイツ語", "Italian": "イタリア語", "Korean": "韓国語", "Polish": "ポーランド語", "Portuguese (Brazil)": "ポルトガル語（ブラジル）", "Russian": "ロシア語", "Simplified Chinese": "中国語（簡体字）", "Spanish (Mexico)": "スペイン語（メキシコ）", "Spanish (Spain)": "スペイン語（スペイン）", "Traditional Chinese": "中国語（繁体字）", "Other / not shown": "その他・一覧にない言語"};
  const tr = (en, ja) => isJA ? ja : en;
  function evaluate(platform, region, text, voice) {
    const listing = (platform === 'PS5' ? data.listings : platform === 'Xbox' ? data.xboxListings : {})[region];
    if (!listing) return {state:'unknown',title:'Not verified for this version',text:'Not verified',voice:'Not verified',source:null};
    const textListed = listing.text.includes(text), voiceListed = listing.voice.includes(voice);
    return {state:textListed && voiceListed ? 'listed':'missing',title:textListed && voiceListed ? 'Both languages are listed':'Your combination is not fully listed',text:textListed?'Listed as text':'Not in this table',voice:voiceListed?'Listed as voice':'Not in this table',source:listing.source};
  }
  window.evaluateLanguage = evaluate;
  const form = document.getElementById('checker');
  if (!form) return;
  for (const id of ['text','voice']) {
    const field = document.getElementById(id);
    data.languages.forEach(language => {const option=document.createElement('option');option.value=language;option.textContent=isJA ? names[language] : language;field.appendChild(option);});
  }
  document.getElementById('text').value='Japanese';
  document.getElementById('voice').value='English';
  form.addEventListener('submit', event => event.preventDefault());
  const escape = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function render() {
    const platform=form.elements.platform.value, region=form.elements.region.value, text=form.elements.text.value, voice=form.elements.voice.value;
    const result = evaluate(platform,region,text,voice), el=document.getElementById('result'), source=data.sources[result.source];
    el.dataset.state=result.state;
    if (isJA) {
      result.title = result.state === 'listed' ? '選択した両言語が記載されています' : result.state === 'missing' ? '選択した組み合わせの記載は揃っていません' : 'この版の対応言語は未確認です';
      result.text = result.text === 'Listed as text' ? 'テキストに記載あり' : result.text === 'Not in this table' ? 'この表には記載なし' : '未確認';
      result.voice = result.voice === 'Listed as voice' ? '音声に記載あり' : result.voice === 'Not in this table' ? 'この表には記載なし' : '未確認';
    }
    let note=result.state==='listed' ? 'This is what Sony lists, not a hands-on test. The source labels subtitle-related support as "Text".' : result.state==='missing' ? 'Not listed is not the same as tested and impossible. Do not buy expecting a language this table does not confirm.' : 'No language-level answer is encoded here. The US Xbox page gives a count, not a usable matrix in our read; Japan has not been verified.';
    if (isJA) note = result.state === 'listed' ? 'Sonyの表の記載であり、実機検証ではありません。元の表の項目名は「テキスト」です。' : result.state === 'missing' ? '記載がないことと、実機で非対応を確認したことは別です。この表で確認できない言語を使える前提で購入しないでください。' : '言語別の判定はできません。米国Xboxの取得できたページでは総数のみ確認でき、日本向けの表は未確認です。';
    if (platform === 'Xbox' && result.state !== 'unknown') note = tr('Xbox embedded product data lists interface and subtitle support separately. Both Japan and US pages use product 9P3H4968GRSM. A listing is not a cross-account purchase or in-game test.','Xboxの商品データは表示言語と字幕を別々に記載しています。日米のページは同じ商品ID 9P3H4968GRSM です。アカウントをまたぐ購入や実機動作を検証した結果ではありません。');
    el.innerHTML='<span class="badge">'+(result.state==='unknown'?tr('Evidence gap','情報未確認'):tr('Official regional listing','地域別の公式表に基づく結果'))+'</span><h2>'+escape(result.title)+'</h2><dl class="statuses"><div><dt>'+escape(isJA ? names[text] : text)+tr(' text','・テキスト')+'</dt><dd>'+escape(result.text)+'</dd></div><div><dt>'+escape(isJA ? names[voice] : voice)+tr(' audio','・音声')+'</dt><dd>'+escape(result.voice)+'</dd></div></dl><p>'+escape(note)+'</p>'+(source?'<a class="source" href="'+source.url+'" target="_blank" rel="noopener noreferrer">'+escape(isJA ? ({psJP:'PlayStationサポート・日本',psUS:'PlayStationサポート・米国',xboxUS:'Xboxストア・米国',xboxJP:'Xboxストア・日本'}[result.source] || source.title) : source.title)+' ↗</a>':'')+'<p class="meta">'+tr('Evidence checked ','出典確認：')+escape(isJA ? '2026年11月19日 02:56 JST' : data.checkedLabel)+'</p>';
  }
  form.addEventListener('change',render);render();
})();
