/* Progressive enhancements for the Sphinx documentation. All file inspection stays local. */
(function(){
  'use strict';
  const script=document.currentScript;
  const root=new URL('../',script.src);
  const ready=()=>{
    const main=document.querySelector('[role="main"]');
    if(main){main.id=main.id||'bipga-main';const skip=document.createElement('a');skip.className='bipga-skip';skip.href='#'+main.id;skip.textContent='Skip to content';document.body.prepend(skip);}
    const search=document.querySelector('#rtd-search-form input[name="q"]');
    document.addEventListener('keydown',(event)=>{
      const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable;
      if(search&&((event.key==='/'&&!typing)||((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'))){event.preventDefault();search.focus();}
    });
    const mobile=document.querySelector('.wy-nav-top [data-toggle="wy-nav-top"]');
    if(mobile){
      const contentWrap=document.querySelector('.wy-nav-content-wrap');
      const syncNavigation=()=>mobile.setAttribute('aria-expanded',String(window.matchMedia('(max-width:768px)').matches && !!contentWrap?.classList.contains('shift')));
      mobile.tabIndex=0;mobile.setAttribute('role','button');mobile.setAttribute('aria-label','Toggle navigation');
      mobile.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();mobile.click();}});
      if(contentWrap)new MutationObserver(syncNavigation).observe(contentWrap,{attributes:true,attributeFilter:['class']});
      window.addEventListener('resize',syncNavigation);
      syncNavigation();
    }
    async function copyCode(pre,button){
      const original='Copy';
      try{await navigator.clipboard.writeText(pre.textContent);button.textContent='Copied';}
      catch{const range=document.createRange();range.selectNodeContents(pre);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);button.textContent='Selected';}
      window.setTimeout(()=>{button.textContent=original;},1800);
    }
    if(!location.pathname.includes('/_modules/'))document.querySelectorAll('.highlight').forEach(box=>{const pre=box.querySelector('pre');if(!pre)return;const button=document.createElement('button');button.type='button';button.className='bipga-copy';button.textContent='Copy';button.setAttribute('aria-label','Copy code');button.addEventListener('click',()=>copyCode(pre,button));box.appendChild(button);});
    const data=window.BIPGA_EXAMPLES;
    const method=document.getElementById('method-select'),dataset=document.getElementById('dataset-select');
    if(method&&dataset&&data){
      for(const [value,label]of Object.entries(data.methods)){const o=document.createElement('option');o.value=value;o.textContent=label;method.appendChild(o);}
      for(const [value,label]of Object.entries(data.datasets)){const o=document.createElement('option');o.value=value;o.textContent=label;dataset.appendChild(o);}
      method.value='grampa';dataset.value='fbtw';
      const update=()=>{const code=data.examples[method.value][dataset.value];document.getElementById('quickstart-code').innerHTML=window.BPUPGA_DOCS.highlightPython(code);};
      method.addEventListener('change',update);dataset.addEventListener('change',update);update();
      document.getElementById('download-example').addEventListener('click',()=>{const code=data.examples[method.value][dataset.value];const url=URL.createObjectURL(new Blob([code],{type:'text/x-python;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=method.value+'__'+dataset.value+'.py';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    }
    const input=document.getElementById('run-file');
    if(input){
      const preview=document.getElementById('run-preview'),error=document.getElementById('file-error');
      input.addEventListener('change',async()=>{
        error.hidden=true;preview.hidden=true;const file=input.files[0];if(!file)return;
        try{
          if(file.size>10*1024*1024)throw Error('Choose a JSON file smaller than 10 MB.');
          const run=window.BPUPGA_DOCS.parseRunRecord(JSON.parse(await file.text()));
          document.getElementById('run-status').textContent=run.status;
          document.getElementById('run-name').textContent=run.dataset+' / '+run.method+(run.seed!==undefined && run.seed!==null?' / seed '+run.seed:'');
          const metrics=document.getElementById('run-metrics');metrics.replaceChildren();
          for(const [label,value]of [['Pair precision',run.precision],['Pair recall',run.recall],['Native Pair F1',run.f1]]){const box=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value===null?'N/A':value.toFixed(4);box.append(dt,dd);metrics.appendChild(box);}
          document.getElementById('run-caveat').textContent=run.label;preview.hidden=false;
        }catch(e){error.textContent=e instanceof SyntaxError?'This file is not valid JSON. Choose a saved result.json or started.json.':e.message;error.hidden=false;}
      });
      document.getElementById('clear-file').addEventListener('click',()=>{input.value='';preview.hidden=true;error.hidden=true;});
    }
    const aliases={
      'Dataset-load':'reference/data.html#bpupga.Dataset.load','construct':'reference/data.html#bpupga.construct',
      'Algorithm':'reference/algorithm.html#bpupga.Algorithm','Algorithm-align':'reference/algorithm.html#bpupga.Algorithm.align',
      'AlignmentDataset':'reference/records.html#bpupga.AlignmentDataset','AlignmentResult':'reference/records.html#bpupga.AlignmentResult',
      'evaluate':'reference/evaluation.html#bpupga.evaluate','diagnose':'reference/diagnostics.html#bpupga.diagnose',
      'RunLog-open':'reference/logging.html#bpupga.RunLog.open','RunLog-properties':'reference/logging.html#bpupga.RunLog',
      'register-algorithm':'reference/extensions.html#bpupga.register_algorithm'
    };
    if(location.pathname.endsWith('/api.html')&&aliases[location.hash.slice(1)])location.replace(new URL(aliases[location.hash.slice(1)],root));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
