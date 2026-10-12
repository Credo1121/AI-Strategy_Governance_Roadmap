import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { createApp } from './app';
import { createStore } from './store';
const id='11111111-1111-4111-8111-111111111111';
test('API: vollständiger Beratungslauf, Persistenz und Konfliktschutz',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'strategy-test-')),path=join(dir,'demo.sqlite');const {server,store}=createApp(path);
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
 try{
  assert.equal((await fetch(base+'/health')).status,200);
  const catalog=await (await fetch(base+'/catalog')).json();assert.equal(catalog.stages.hardware.length,5);assert.equal(catalog.questions.length,6);
  const e=await (await fetch(base+'/engagements/'+id)).json();
  const update={revision:e.revision,context:e.context,answers:{'hardware.ambition':'Produktentscheidungen mit belegter Kundenevidenz verbessern.'},selectedOptions:['software-loop']};
  const patch=(payload:unknown)=>fetch(base+'/engagements/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const saved=await patch(update);assert.equal(saved.status,200);assert.equal((await saved.json()).revision,1);
  assert.equal((await patch(update)).status,409);
  for(const payload of [{...update,revision:1,admin:true},{...update,revision:1,answers:{unknown:'x'}},{...update,revision:1,selectedOptions:['not-real']},{...update,revision:1,selectedOptions:['platform','platform']},{...update,revision:1,answers:{'hardware.ambition':'x'.repeat(4001)}}])assert.equal((await patch(payload)).status,400);
  const current=await (await fetch(base+'/engagements/'+id)).json();assert.equal(current.answers['hardware.ambition'],update.answers['hardware.ambition']);assert.deepEqual(current.selectedOptions,['software-loop']);
  const md=await (await fetch(base+'/engagements/'+id+'/export')).text();assert.match(md,/Produktentscheidungen/);assert.match(md,/Woche 6/);assert.match(md,/Offen —/);assert.match(md,/repräsentative Änderung/);
  assert.equal((await fetch(base+'/engagements/33333333-3333-4333-8333-333333333333')).status,404);
  const foreign=await fetch(base+'/engagements',{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://evil.example'},body:JSON.stringify({name:'Test Demo',profile:'group'})});assert.equal(foreign.status,403);
  assert.equal((await fetch(base+'/engagements',{method:'POST',headers:{'Content-Type':'text/plain'},body:'{}'})).status,415);
  assert.equal((await fetch(base+'/engagements',{method:'POST',headers:{'Content-Type':'application/json'},body:'{'})).status,400);
  assert.equal((await fetch(base+'/engagements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'x'.repeat(66000),profile:'group'})})).status,413);
  const created=await fetch(base+'/engagements',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Neue synthetische Akte',profile:'midmarket'})});assert.equal(created.status,201);assert.equal((await created.json()).synthetic,true);
 }finally{await new Promise<void>((r,j)=>server.close(e=>e?j(e):r()));store.close()}
 const reopened=createStore(path);try{assert.equal(reopened.get(id)?.answers['hardware.ambition'],'Produktentscheidungen mit belegter Kundenevidenz verbessern.');assert.equal(reopened.list().length,3)}finally{reopened.close();rmSync(dir,{recursive:true,force:true})}
});
test('Parallel gespeicherte Änderungen: nur eine Revision darf gewinnen',()=>{
 const s=createStore(':memory:');try{const e=s.get(id)!;const u={revision:0,context:e.context,answers:{},selectedOptions:[]};assert.equal(s.update(id,u).status,'ok');assert.equal(s.update(id,u).status,'conflict');assert.equal(s.get(id)?.revision,1)}finally{s.close()}
});
