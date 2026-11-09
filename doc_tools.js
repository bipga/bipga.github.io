/* Pure documentation helpers shared by the browser and contract checks. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BPUPGA_DOCS = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const METHODS = ['grampa','regal','fugal','cena','s_gwl','immnc','oiteralign','alpine','gradalign_plus','slotalign','ulot','opgm_unsupervised'];
  const DATASETS = ['fbtw','grqc','dblp','Arxiv1-Arxiv2'];
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function highlightPython(source) {
    const pattern = /#[^\n]*|"[^"\n]*"|'[^'\n]*'|\b(?:import|from|as|class|def|return|print|with|if|for|in|False|True|None)\b|\b\d+(?:\.\d+)?\b/g;
    let last=0, output='';
    for (const match of source.matchAll(pattern)) {
      output += escapeHTML(source.slice(last,match.index));
      const value=match[0];
      const type=value.startsWith('#')?'comment':/^["']/.test(value)?'string':/^\d/.test(value)?'number':'keyword';
      output += `<span class="tok-${type}">${escapeHTML(value)}</span>`;
      last=match.index+value.length;
    }
    return output+escapeHTML(source.slice(last));
  }
  function quickstartSource(method, dataset) {
    if (!METHODS.includes(method) || !DATASETS.includes(dataset)) throw new Error('Unknown example selection');
    const params=method==='grampa'?', parameters={"eta": 1.0}':'';
    return `import bpupga as bp\n\n# Run from the repository root with the documented import setup.\ndata = bp.Dataset.load(\n    "baseline_exdit_261029/date_261023/${dataset}/bpupga/"\n    "rho_s0p6_rho_t0p6/construction_seed_2026")\nmethod = bp.Algorithm(\n    "${method}"${params}, seed=2026, device="cpu")\n\n# The algorithm receives only graph topology.\nresult = method.align(data.graph1, data.graph2)\nmetrics = bp.evaluate(result, data, ks=(1, 5, 10))\nprint(metrics["pair"])`;
  }
  function isObject(value) { return value!==null && typeof value==='object' && !Array.isArray(value); }
  function parseRunRecord(record) {
    if (!isObject(record)) throw new Error('The JSON file must contain an object.');
    if (typeof record.status!=='string' || !record.status.trim()) throw new Error('Expected a campaign record with a nonempty status.');
    if (!isObject(record.task) || typeof record.task.method!=='string' || typeof record.task.dataset!=='string') throw new Error('Expected campaign task.method and task.dataset fields.');
    const native=record.status==='SUCCESS' && isObject(record.variants?.native)?record.variants.native:null;
    const pair=native && isObject(native.pair)?native.pair:null;
    const metric=(key)=>{const value=pair?.[key];return typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=1?value:null;};
    return {
      status:record.status,method:record.task.method,dataset:record.task.dataset,condition:record.task.condition,seed:record.task.seed,
      precision:metric('precision'),recall:metric('recall'),f1:metric('f1'),native,
      runtime:isObject(record.runtime)?record.runtime:{},
      error:typeof record.error==='string'?record.error:null,
      referenceLimitations:record.dataset_summary?.groundtruth_limitations||null,
      label:record.status==='SUCCESS'&&!native?'The attempt reports SUCCESS, but no native metrics are present in this file.':record.status!=='SUCCESS'?'No native score is shown for an unsuccessful or unfinished attempt. N/A remains separate from a valid zero.':'Metrics are read from variants.native and are relative to the supplied reference. Decoder variants are not mixed into these scores. An unannotated node is not necessarily unmatched.'
    };
  }
  function searchEntries(index,query) {
    const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return index.filter((x)=>!x.href.includes('#')).slice(0,8);
    return index.map((entry)=>{
      const title=entry.title.toLowerCase(),text=(entry.text||'').toLowerCase(),keywords=(entry.keywords||'').toLowerCase();
      if (!words.every((word)=>(title+' '+text+' '+keywords).includes(word))) return null;
      return {entry,score:words.reduce((score,word)=>score+(title.includes(word)?6:0)+(text.includes(word)?2:0)+(keywords.includes(word)?1:0),0)};
    }).filter(Boolean).sort((a,b)=>b.score-a.score).slice(0,8).map((x)=>x.entry);
  }
  return {METHODS,DATASETS,escapeHTML,highlightPython,quickstartSource,parseRunRecord,searchEntries};
});
