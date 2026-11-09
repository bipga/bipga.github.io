'use strict';
const $=(query)=>document.querySelector(query);
const $$=(query)=>[...document.querySelectorAll(query)];
const {highlightPython,quickstartSource,parseRunRecord,searchEntries}=window.BPUPGA_DOCS;
const legacy={'#overview':'index.html','#quickstart':'quickstart.html','#workflow':'index.html#workflow','#datasets':'datasets.html','#algorithms':'algorithms.html','#evaluation':'evaluation.html','#logs':'logs.html','#extending':'extending.html','#contract':'datasets.html#file-format','#inspector':'logs.html#inspector'};
if(document.body.dataset.page==='index'&&legacy[location.hash]&&location.hash!=='#overview'&&location.hash!=='#workflow')location.replace(legacy[location.hash]);
let toastTimer;
function toast(message){const node=$('#toast');node.textContent=message;node.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{node.hidden=true;},2600);}
async function copyCode(node){
  const value=node.textContent;
  try{
    if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);
    else{const text=document.createElement('textarea');text.value=value;text.style.position='fixed';text.style.opacity='0';document.body.appendChild(text);text.select();const success=document.execCommand('copy');text.remove();if(!success)throw new Error('Clipboard unavailable');}
    toast('Code copied to clipboard');
  }catch{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(node);selection.removeAllRanges();selection.addRange(range);toast('Code selected — press Ctrl/Cmd+C to copy');}
}
$$('.code-window').forEach((box,index)=>{
  const node=box.querySelector('pre code');if(!node)return;
  const label=box.querySelector('.code-header');
  if(label){const button=document.createElement('button');button.className='copy-button';button.type='button';button.textContent='Copy ⧉';button.setAttribute('aria-label',`Copy ${label.textContent.trim()||'code'}`);button.addEventListener('click',()=>copyCode(node));label.appendChild(button);}
  if(!node.id)node.id=`code-${index}`;
  const name=label?.textContent.toLowerCase()||'';
  if(!/terminal|shell|repository|metadata\.json/.test(name))node.innerHTML=highlightPython(node.textContent);
});
if($('#method-select')&&$('#dataset-select')){
  const update=()=>{$('#quickstart-code').innerHTML=highlightPython(quickstartSource($('#method-select').value,$('#dataset-select').value));};
  $('#method-select').addEventListener('change',update);$('#dataset-select').addEventListener('change',update);update();
}
try{if(localStorage.getItem('bpupga-theme')==='dark')document.documentElement.dataset.theme='dark';}catch{}
$('#theme-toggle').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem('bpupga-theme',next);}catch{}});
const sidebar=$('#sidebar'),menu=$('#menu-toggle');
function closeMenu(){sidebar.classList.remove('open');menu.setAttribute('aria-expanded','false');}
menu.addEventListener('click',()=>{const open=sidebar.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
$$('.nav-link').forEach((link)=>link.addEventListener('click',closeMenu));
document.addEventListener('click',(event)=>{if(!sidebar.contains(event.target)&&!menu.contains(event.target))closeMenu();});
if('IntersectionObserver'in window){
  const observer=new IntersectionObserver((entries)=>{const visible=entries.filter((x)=>x.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];if(visible)$$('.toc-link').forEach((link)=>link.classList.toggle('active',link.hash===`#${visible.target.id}`));},{rootMargin:'-12% 0px -65% 0px',threshold:0});
  $$('article h2[id],article h3[id]').forEach((node)=>observer.observe(node));
}
const dialog=$('#search-dialog');
function search(){
  const matches=searchEntries(window.BPUPGA_SEARCH||[],$('#search-input').value),container=$('#search-results');container.replaceChildren();
  if(!matches.length){const message=document.createElement('p');message.className='no-results';message.textContent='No matches. Try “construct”, “ranking”, or a parameter name.';container.appendChild(message);}
  matches.forEach((entry)=>{const link=document.createElement('a');link.className='search-result';link.href=entry.href;const title=document.createElement('strong'),description=document.createElement('span');title.textContent=entry.title;description.textContent=entry.text;link.append(title,description);link.addEventListener('click',()=>dialog.close());container.appendChild(link);});
}
function openSearch(){search();dialog.showModal();$('#search-input').focus();}
$('#search-open').addEventListener('click',openSearch);$('#search-close').addEventListener('click',()=>dialog.close());$('#search-input').addEventListener('input',search);
$('#search-input').addEventListener('keydown',(event)=>{if(event.key==='Enter'){const first=$('#search-results a');if(first){event.preventDefault();first.click();}}});
dialog.addEventListener('click',(event)=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
document.addEventListener('keydown',(event)=>{const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)||document.activeElement.isContentEditable;if((event.key==='/'&&!typing)||((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')){event.preventDefault();if(!dialog.open)openSearch();}if(event.key==='Escape')closeMenu();});
function renderRun(record){
  const run=parseRunRecord(record);$('#run-name').textContent=`${run.dataset} / ${run.method} / ${run.condition||'condition unspecified'}`;$('#run-status').textContent=run.status;
  const metrics=$('#run-metrics');metrics.replaceChildren();
  [['Pair precision',run.precision],['Pair recall',run.recall],['Native PairF1',run.f1]].forEach(([label,value])=>{const card=document.createElement('div');card.className='run-metric';const name=document.createElement('span'),number=document.createElement('strong'),bar=document.createElement('div'),fill=document.createElement('div');name.textContent=label;number.textContent=value===null?'N/A':value.toFixed(4);bar.className='metric-bar';fill.className='metric-fill';fill.style.setProperty('--fill',value===null?'0%':`${value*100}%`);bar.appendChild(fill);card.append(name,number,bar);metrics.appendChild(card);});
  const details=$('#run-details');details.replaceChildren();
  const detail=(label,value)=>{const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value===null||value===undefined?'Not recorded':String(value);row.append(dt,dd);details.appendChild(row);};
  detail('Execution seed',run.seed);
  detail('Fit wall time',typeof run.runtime.fit_wall_seconds==='number'&&Number.isFinite(run.runtime.fit_wall_seconds)?`${run.runtime.fit_wall_seconds.toFixed(3)} s`:null);
  detail('Peak process-tree RSS',typeof run.runtime.observed_fit_tree_peak_rss_mib==='number'&&Number.isFinite(run.runtime.observed_fit_tree_peak_rss_mib)?`${run.runtime.observed_fit_tree_peak_rss_mib.toFixed(1)} MiB`:null);
  if(run.native?.validity)detail('Native one-to-one',typeof run.native.validity.is_one_to_one==='boolean'?run.native.validity.is_one_to_one?'Yes':'No — repeated endpoints remain in native scoring':null);
  if(run.error)detail('Recorded error',run.error);if(run.referenceLimitations)detail('Reference scope',JSON.stringify(run.referenceLimitations));$('#run-caveat').textContent=run.label;$('#run-preview').hidden=false;
}
if($('#run-file')){
  async function readFile(file){const error=$('#file-error');error.hidden=true;try{if(!file)return;if(file.size>10*1024*1024)throw new Error('Choose a JSON file smaller than 10 MB.');renderRun(JSON.parse(await file.text()));}catch(problem){$('#run-preview').hidden=true;error.textContent=problem instanceof SyntaxError?'This file is not valid JSON. Choose a campaign result.json or started.json.':problem.message;error.hidden=false;}}
  $('#run-file').addEventListener('change',(event)=>readFile(event.target.files[0]));const drop=$('#drop-zone');['dragenter','dragover'].forEach((type)=>drop.addEventListener(type,(event)=>{event.preventDefault();drop.classList.add('dragover');}));['dragleave','drop'].forEach((type)=>drop.addEventListener(type,(event)=>{event.preventDefault();drop.classList.remove('dragover');}));drop.addEventListener('drop',(event)=>readFile(event.dataTransfer.files[0]));$('#clear-file').addEventListener('click',()=>{$('#run-preview').hidden=true;$('#file-error').hidden=true;$('#run-file').value='';});
}
