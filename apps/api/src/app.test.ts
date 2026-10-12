import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { AddressInfo } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import { createApp } from './app';
import { createStore } from './store';
const id='11111111-1111-4111-8111-111111111111';
test('API: vollständiger Beratungslauf, Persistenz und Konfliktschutz',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'strategy-test-')),path=join(dir,'demo.sqlite');const {server,store}=createApp(path);
 await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
 try{
  assert.equal((await fetch(base+'/health')).status,200);
  const catalog=await (await fetch(base+'/catalog')).json();assert.equal(catalog.stages.hardware.length,5);assert.equal(catalog.questions.length,6);assert.equal(catalog.portfolioBoard.perspectives.length,4);
  const e=await (await fetch(base+'/engagements/'+id)).json();
  assert.equal(e.initiatives.length,2);assert.equal(e.finance.budget,8400);
  const initiative={...e.initiatives[0],status:'funded',owner:'SVP Engineering',committed:1100,nextTranche:420};
  const update={revision:e.revision,context:e.context,answers:{'hardware.ambition':'Produktentscheidungen mit belegter Kundenevidenz verbessern.'},selectedOptions:['software-loop'],initiatives:[initiative],finance:{...e.finance,forecast:7600,reallocationNote:'Tranche nach belastbarer Engineering-Evidenz neu entscheiden.'}};
  const patch=(payload:unknown)=>fetch(base+'/engagements/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  const saved=await patch(update);assert.equal(saved.status,200);assert.equal((await saved.json()).revision,1);
  assert.equal((await patch(update)).status,409);
  for(const payload of [{...update,revision:1,admin:true},{...update,revision:1,answers:{unknown:'x'}},{...update,revision:1,selectedOptions:['not-real']},{...update,revision:1,selectedOptions:['platform','platform']},{...update,revision:1,answers:{'hardware.ambition':'x'.repeat(4001)}},{...update,revision:1,initiatives:[{...initiative,committed:-1}]},{...update,revision:1,initiatives:[initiative,{...initiative,id:'33333333-3333-4333-8333-333333333333'}]},{...update,revision:1,finance:{...update.finance,currency:'USD'}}])assert.equal((await patch(payload)).status,400);
  const current=await (await fetch(base+'/engagements/'+id)).json();assert.equal(current.answers['hardware.ambition'],update.answers['hardware.ambition']);assert.deepEqual(current.selectedOptions,['software-loop']);assert.equal(current.initiatives[0].owner,'SVP Engineering');assert.equal(current.finance.forecast,7600);
  const md=await (await fetch(base+'/engagements/'+id+'/export')).text();assert.match(md,/Produktentscheidungen/);assert.match(md,/Woche 6/);assert.match(md,/Offen —/);assert.match(md,/repräsentative Änderung/);assert.match(md,/Enterprise-AI-Portfolio/);assert.match(md,/SVP Engineering/);assert.match(md,/Rolling Forecast: 7.600/);
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
 const s=createStore(':memory:');try{const e=s.get(id)!;const u={revision:0,context:e.context,answers:{},selectedOptions:[],initiatives:e.initiatives,finance:e.finance};assert.equal(s.update(id,u).status,'ok');assert.equal(s.update(id,u).status,'conflict');assert.equal(s.get(id)?.revision,1)}finally{s.close()}
});
test('Datenbankmigration v1 ergänzt Portfolio und Finanzrahmen',()=>{
 const dir=mkdtempSync(join(tmpdir(),'strategy-migration-')),path=join(dir,'demo.sqlite');
 const db=new DatabaseSync(path);db.exec('CREATE TABLE engagements (id TEXT PRIMARY KEY, revision INTEGER NOT NULL CHECK(revision >= 0), data TEXT NOT NULL CHECK(json_valid(data))); PRAGMA user_version = 1;');
 const legacy={id,revision:0,context:{name:'Legacy Demo',profile:'group',objective:'Migration prüfen',audience:'c-level',focus:'hardware'},answers:{},selectedOptions:['engineering'],updatedAt:new Date().toISOString(),synthetic:true};
 db.prepare('INSERT INTO engagements(id,revision,data) VALUES (?,?,?)').run(id,0,JSON.stringify(legacy));db.close();
 const migrated=createStore(path);try{const e=migrated.get(id)!;assert.equal(e.initiatives.length,1);assert.equal(e.initiatives[0].optionId,'engineering');assert.equal(e.finance.currency,'EUR')}finally{migrated.close()}
 const checked=new DatabaseSync(path,{readOnly:true});try{assert.equal((checked.prepare('PRAGMA user_version').get() as {user_version:number}).user_version,2)}finally{checked.close();rmSync(dir,{recursive:true,force:true})}
});
