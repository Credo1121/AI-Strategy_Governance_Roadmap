import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { emptyFinance, engagementSchema, type Engagement, type Initiative, type Update } from '@strategy/shared';

const optionPortfolio: Record<Engagement['selectedOptions'][number],Omit<Initiative,'id'|'optionId'|'origin'>> = {
 engineering:{title:'Engineering Knowledge Copilot',focus:'hardware',owner:'VP Engineering',hypothesis:'Geprüftes Engineering-Wissen verkürzt die Suche und verbessert die Nachvollziehbarkeit von Produktentscheidungen.',evidence:'Referenzfälle, Quellenkorrektheit, Nacharbeit und Zeit bis zur belastbaren Antwort vergleichen.',risk:'IP-Abfluss, falsche technische Antworten und unklare Dokumentversionen.',status:'validate',committed:900,nextTranche:350},
 'software-loop':{title:'AI-gestützter Software-Lieferfluss',focus:'software',owner:'VP Digital Products',hypothesis:'AI-Unterstützung über Discovery, Umsetzung, Review und Betrieb verbessert die Zeit bis zur akzeptierten Änderung.',evidence:'End-to-End-Durchlaufzeit, Review-Aufwand, Fehler und Produktwirkung an einer repräsentativen Änderung messen.',risk:'Review-Engpass, unsicherer Code und steigende Betriebsbelastung.',status:'candidate',committed:400,nextTranche:180},
 'sales-intelligence':{title:'Sales Intelligence für komplexe Angebote',focus:'sales',owner:'Chief Sales Officer',hypothesis:'Nachvollziehbares Kundenwissen verbessert Gesprächsqualität und Angebotskonsistenz.',evidence:'Bedarfsnachweis, Angebotskorrekturen, Durchlaufzeit und belegten Kundennutzen vergleichen.',risk:'Unbelegte Kaufabsichten, falsche Leistungszusagen und sensible Preisdaten.',status:'validate',committed:600,nextTranche:250},
 platform:{title:'Gemeinsame AI-Befähigungsplattform',focus:'shared',owner:'CIO / CDO',hypothesis:'Gemeinsame Daten-, Werkzeug- und Evaluationsbausteine reduzieren redundante Pilotkosten.',evidence:'Zwei Wertfelder auf Wiederverwendung, Betriebskosten und konkrete Nutzer prüfen.',risk:'Zu großer Plattformbau ohne belegte Wertfelder und klare Betriebsverantwortung.',status:'candidate',committed:300,nextTranche:200}
};
function initiativesFor(selected:Engagement['selectedOptions']):Initiative[]{return selected.map(optionId=>({id:randomUUID(),origin:'option',optionId,...optionPortfolio[optionId]}))}
function financeFor(id:string):Engagement['finance']{return id==='11111111-1111-4111-8111-111111111111'?{fiscalYear:2027,currency:'EUR',target:12500,budget:8400,forecast:7200,actuals:950,reallocationNote:'Explorationsmittel quartalsweise gegen Evidenz und Kapazität neu betrachten.'}:{...emptyFinance}}

export function createStore(path: string) {
 if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
 const db=new DatabaseSync(path);
 db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
 const version=(db.prepare('PRAGMA user_version').get() as {user_version:number}).user_version;
 if(version>2)throw new Error('Unbekannte Datenbankversion');
 if(version===0)db.exec('BEGIN; CREATE TABLE engagements (id TEXT PRIMARY KEY, revision INTEGER NOT NULL CHECK(revision >= 0), data TEXT NOT NULL CHECK(json_valid(data))); PRAGMA user_version = 2; COMMIT;');
 if(version===1){
  db.exec('BEGIN');
  try{
   const rows=db.prepare('SELECT id,data FROM engagements').all() as {id:string;data:string}[];
   const update=db.prepare('UPDATE engagements SET data = ? WHERE id = ?');
   for(const row of rows){const raw=JSON.parse(row.data) as Engagement;const migrated={...raw,initiatives:initiativesFor(raw.selectedOptions??[]),finance:financeFor(row.id)};update.run(JSON.stringify(engagementSchema.parse(migrated)),row.id)}
   db.exec('PRAGMA user_version = 2; COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
 }
 function parse(row: unknown): Engagement|undefined {return row?engagementSchema.parse(JSON.parse((row as {data:string}).data)):undefined}
 function get(id:string){return parse(db.prepare('SELECT data FROM engagements WHERE id = ?').get(id))}
 function insert(e:Engagement){db.prepare('INSERT INTO engagements(id,revision,data) VALUES (?,?,?)').run(e.id,e.revision,JSON.stringify(e));return e}
 function create(name:string,profile:Engagement['context']['profile']){
  return insert({id:randomUUID(),revision:0,context:{name,profile,objective:'',audience:'c-level',focus:'hardware'},answers:{},selectedOptions:[],initiatives:[],finance:{...emptyFinance},updatedAt:new Date().toISOString(),synthetic:true});
 }
 if(!(db.prepare('SELECT id FROM engagements LIMIT 1').get())){
  db.exec('BEGIN');
  try{
   insert({id:'11111111-1111-4111-8111-111111111111',revision:0,context:{name:'Nordstern Industries · Demo',profile:'group',objective:'Verstehen, wie KI Produktentwicklung und technischen Vertrieb verändert, und die nächsten sechs Wochen priorisieren.',audience:'c-level',focus:'hardware'},answers:{},selectedOptions:['engineering','sales-intelligence'],initiatives:initiativesFor(['engineering','sales-intelligence']),finance:financeFor('11111111-1111-4111-8111-111111111111'),updatedAt:new Date().toISOString(),synthetic:true});
   insert({id:'22222222-2222-4222-8222-222222222222',revision:0,context:{name:'Werkraum Technologies · Demo',profile:'midmarket',objective:'Mit wenigen klaren Wertfeldern einen Einstieg in AI-gestützte Produktentwicklung und Vertrieb finden.',audience:'c-1',focus:'software'},answers:{},selectedOptions:[],initiatives:[],finance:{...emptyFinance,fiscalYear:2027,target:1800,budget:1200,forecast:950,actuals:120,reallocationNote:'Kapazität für höchstens zwei parallele Evidenzvorhaben reservieren.'},updatedAt:new Date().toISOString(),synthetic:true});
   db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error}
 }
 return {get,create,list:()=>db.prepare('SELECT data FROM engagements ORDER BY id').all().map(row=>parse(row)!),
  update:(id:string,u:Update)=>{
   const old=get(id);if(!old)return {status:'missing' as const};
   const next:Engagement={...old,context:u.context,answers:u.answers,selectedOptions:u.selectedOptions,initiatives:u.initiatives,finance:u.finance,revision:u.revision+1,updatedAt:new Date().toISOString()};
   const r=db.prepare('UPDATE engagements SET revision = ?, data = ? WHERE id = ? AND revision = ?').run(next.revision,JSON.stringify(next),id,u.revision);
   return r.changes===1?{status:'ok' as const,value:next}:{status:'conflict' as const};
  },close:()=>db.close()};
}
