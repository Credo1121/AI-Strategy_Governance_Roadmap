import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { engagementSchema, type Engagement, type Update } from '@strategy/shared';

export function createStore(path: string) {
 if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
 const db=new DatabaseSync(path);
 db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
 const version=(db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version;
 if(version>1)throw new Error('Unbekannte Datenbankversion');
 if(version===0)db.exec('BEGIN; CREATE TABLE engagements (id TEXT PRIMARY KEY, revision INTEGER NOT NULL CHECK(revision >= 0), data TEXT NOT NULL CHECK(json_valid(data))); PRAGMA user_version = 1; COMMIT;');
 function parse(row: unknown): Engagement|undefined {return row?engagementSchema.parse(JSON.parse((row as {data:string}).data)):undefined}
 function get(id:string){return parse(db.prepare('SELECT data FROM engagements WHERE id = ?').get(id))}
 function insert(e:Engagement){db.prepare('INSERT INTO engagements(id,revision,data) VALUES (?,?,?)').run(e.id,e.revision,JSON.stringify(e));return e}
 function create(name:string,profile:Engagement['context']['profile']){
  return insert({id:randomUUID(),revision:0,context:{name,profile,objective:'',audience:'c-level',focus:'hardware'},answers:{},selectedOptions:[],updatedAt:new Date().toISOString(),synthetic:true});
 }
 if(!(db.prepare('SELECT id FROM engagements LIMIT 1').get())){
  db.exec('BEGIN');
  try{
   insert({id:'11111111-1111-4111-8111-111111111111',revision:0,context:{name:'Nordstern Industries · Demo',profile:'group',objective:'Verstehen, wie KI Produktentwicklung und technischen Vertrieb verändert, und die nächsten sechs Wochen priorisieren.',audience:'c-level',focus:'hardware'},answers:{},selectedOptions:['engineering','sales-intelligence'],updatedAt:new Date().toISOString(),synthetic:true});
   insert({id:'22222222-2222-4222-8222-222222222222',revision:0,context:{name:'Werkraum Technologies · Demo',profile:'midmarket',objective:'Mit wenigen klaren Wertfeldern einen Einstieg in AI-gestützte Produktentwicklung und Vertrieb finden.',audience:'c-1',focus:'software'},answers:{},selectedOptions:[],updatedAt:new Date().toISOString(),synthetic:true});
   db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
 }
 return {get,create,list:()=>db.prepare('SELECT data FROM engagements ORDER BY id').all().map(row=>parse(row)!),
  update:(id:string,u:Update)=>{
   const old=get(id);if(!old)return {status:'missing' as const};
   const next:Engagement={...old,context:u.context,answers:u.answers,selectedOptions:u.selectedOptions,revision:u.revision+1,updatedAt:new Date().toISOString()};
   const r=db.prepare('UPDATE engagements SET revision = ?, data = ? WHERE id = ? AND revision = ?').run(next.revision,JSON.stringify(next),id,u.revision);
   return r.changes===1?{status:'ok' as const,value:next}:{status:'conflict' as const};
  },close:()=>db.close()};
}
