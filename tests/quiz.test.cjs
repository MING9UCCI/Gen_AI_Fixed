const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const key = require('./pdf-answer-key.json');
(async () => {
  const browser = await chromium.launch({headless:true, ...(process.env.QUIZ_BROWSER_PATH ? {executablePath:process.env.QUIZ_BROWSER_PATH} : {})});
  try {
    const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('https://**/*',route=>route.abort());
    await page.setContent(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),{waitUntil:'domcontentloaded'});
    const audit=await page.evaluate(key=>{
      audioOn=false; timerOn=false;
      let count=0, shuffles=0;
      for(const ch of ['1','2','4']){
        for(const type of ['mc','ox','short']){
          RAW['ch'+ch][type].forEach((q,i)=>{
            const norm=x=>String(x).replace(/\s+/g,'').toLowerCase();
            if(norm(q.ans)!==norm(key[ch][type][i]))throw Error(`PDF mismatch ${ch}/${type}/${i+1}`);
            count++;
          });
        }
      }
      const pool=buildPool();
      for(const items of Object.values(pool))for(const it of items.filter(q=>q.type==='mc')){
        for(let i=0;i<100;i++){
          shuffleOptions(it);
          if(it.shAns<0||it.shOpts[it.shAns]!==it.opts[it.ans])throw Error('Shuffle mismatch');
          shuffles++;
        }
      }
      const original=RAW.ch1.mc[0].ans;
      RAW.ch1.mc[0].ans=0;
      let rejected=false;
      try{buildPool();}catch{rejected=true;}finally{RAW.ch1.mc[0].ans=original;}
      if(!rejected)throw Error('Invalid answer accepted');
      for(const [type,bad] of [['ox','?'],['short',undefined]]){
        const q=RAW.ch1[type][0], original=q.ans;
        q.ans=bad;let rejected=false;
        try{buildPool();}catch{rejected=true;}finally{q.ans=original;}
        if(!rejected)throw Error('Invalid '+type+' answer accepted');
      }
      return {count,shuffles};
    },key);
    assert.deepEqual(audit,{count:75,shuffles:3600});
    // Complete every chapter via actual buttons and verify grading and feedback.
    for(const mode of ['1','2','4','full']){
      await page.evaluate(mode=>startExam(mode),mode);
      const total=mode==='full'?50:25;
      assert.equal(await page.evaluate(()=>list.length),total);
      if(mode==='full')assert.deepEqual(await page.evaluate(()=>Object.fromEntries(['mc','short','ox'].map(t=>[t,list.filter(q=>q.type===t).length]))),{mc:24,short:16,ox:10});
      for(let i=0;i<total;i++){
        const q=await page.evaluate(()=>({type:list[idx].type,answer:list[idx].type==='mc'?list[idx].shAns:list[idx].ans}));
        if(q.type==='mc')await page.locator('.opt').nth(q.answer).click();
        else if(q.type==='ox')await page.locator('.oxbtn.'+q.answer.toLowerCase()).click();
        else{
          await page.getByRole('button',{name:'정답 확인하기'}).click();
          await page.getByRole('button',{name:'맞았어요'}).click();
        }
        assert(!/undefined|NaN/.test(await page.locator('#q-body').innerText()+await page.locator('#q-fb').innerText()));
        assert.equal(await page.evaluate(()=>okCnt),i+1);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
        await page.locator('#q-next').click();
      }
      assert.equal(await page.locator('#r-score').innerText(),'100');
      assert.equal(await page.locator('#r-no').innerText(),'0');
    }
    // Incorrect answers must be graded once and retain the correct shuffled answer.
    for(const type of ['mc','ox','short']){
      const q=await page.evaluate(type=>{
        startExam('1');list=[list.find(q=>q.type===type)];idx=0;renderQ();
        const it=list[0];return {answer:it.shAns,ox:it.ans,text:it.type==='mc'?it.shOpts[it.shAns]:it.type==='ox'?it.ans:it.ansText};
      },type);
      if(type==='mc')await page.locator('.opt').nth((q.answer+1)%4).click();
      else if(type==='ox')await page.locator('.oxbtn.'+(q.ox==='O'?'x':'o')).click();
      else{
        await page.getByRole('button',{name:'정답 확인하기'}).click();
        await page.getByRole('button',{name:'틀렸어요'}).click();
      }
      assert.equal(await page.evaluate(()=>okCnt),0);
      assert.equal(await page.evaluate(()=>wrong.length),1);
      await page.locator('#q-next').click();
      await page.locator('#r-review summary').click();
      assert((await page.locator('#r-review').innerText()).includes(q.text));
    }
    // Timeouts, self-grading guard, and keyboard navigation.
    for(const type of ['mc','ox','short']){
      await page.evaluate(type=>{
        startExam('1');
        list=[list.find(q=>q.type===type)];idx=0;renderQ();timeUp();timeUp();
      },type);
      assert.equal(await page.evaluate(()=>wrong.length),1);
      assert.equal(await page.locator('#q-nextrow').isVisible(),true);
      assert(!/undefined|NaN/.test(await page.locator('#q-fb').innerText()));
      await page.locator('#q-next').click();
      assert(!/undefined|NaN/.test(await page.locator('#r-review').innerText()));
    }
    await page.evaluate(()=>{startExam('1');list=[list.find(q=>q.type==='short')];idx=0;renderQ();});
    await page.getByRole('button',{name:'정답 확인하기'}).click();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>idx),0);
    assert.equal(await page.locator('#scr-quiz').isVisible(),true);
    await page.evaluate(()=>{const b=document.querySelector('.selfbtn');b.onclick();b.onclick();});
    assert.equal(await page.evaluate(()=>okCnt),1);
    await page.evaluate(()=>{startExam('1');});
    const answer=await page.evaluate(()=>{idx=list.findIndex(q=>q.type==='mc');renderQ();return list[idx].shAns;});
    await page.keyboard.press(String(answer+1));
    const oldIndex=await page.evaluate(()=>idx);
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(()=>idx),oldIndex+1);
    await page.evaluate(()=>{timerOn=true;startExam('1');showTitle();});
    assert.equal(await page.evaluate(()=>tid),null);
    await page.setViewportSize({width:320,height:700});
    await page.evaluate(()=>{timerOn=false;startExam('2');});
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));
    await page.screenshot({path:path.join(__dirname,'../../mobile-preview.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    console.log('PASS: 75 PDF answers; 3,600 shuffles; all 4 modes; grading, timeouts, review, keyboard, mobile 320/390px.');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
