import { createSchema, emptyFinance, engagementSchema, updateSchema, type Engagement } from '@strategy/shared';
import { catalog } from '@strategy/shared/catalog';

const storageKey='ai-strategy-studio.pages.v1';

function seedEngagements():Engagement[]{
 const updatedAt=new Date().toISOString();
 return [
  engagementSchema.parse({id:'11111111-1111-4111-8111-111111111111',revision:0,synthetic:true,updatedAt,context:{name:'Nordstern Industries · Demo',profile:'group',objective:'Verstehen, wie KI Produktentwicklung und technischen Vertrieb verändert, und die nächsten sechs Wochen priorisieren.',audience:'c-level',focus:'hardware'},answers:{},selectedOptions:['engineering','sales-intelligence'],initiatives:[
   {id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',title:'Engineering Knowledge Copilot',origin:'option',optionId:'engineering',focus:'hardware',owner:'VP Engineering',hypothesis:'Geprüftes Engineering-Wissen verkürzt die Suche und verbessert die Nachvollziehbarkeit von Produktentscheidungen.',evidence:'Referenzfälle, Quellenkorrektheit, Nacharbeit und Zeit bis zur belastbaren Antwort vergleichen.',risk:'IP-Abfluss, falsche technische Antworten und unklare Dokumentversionen.',status:'validate',committed:900,nextTranche:350},
   {id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',title:'Sales Intelligence für komplexe Angebote',origin:'option',optionId:'sales-intelligence',focus:'sales',owner:'Chief Sales Officer',hypothesis:'Nachvollziehbares Kundenwissen verbessert Gesprächsqualität und Angebotskonsistenz.',evidence:'Bedarfsnachweis, Angebotskorrekturen, Durchlaufzeit und belegten Kundennutzen vergleichen.',risk:'Unbelegte Kaufabsichten, falsche Leistungszusagen und sensible Preisdaten.',status:'validate',committed:600,nextTranche:250}
  ],finance:{fiscalYear:2027,currency:'EUR',target:12500,budget:8400,forecast:7200,actuals:950,reallocationNote:'Explorationsmittel quartalsweise gegen Evidenz und Kapazität neu betrachten.'}}),
  engagementSchema.parse({id:'22222222-2222-4222-8222-222222222222',revision:0,synthetic:true,updatedAt,context:{name:'Werkraum Technologies · Demo',profile:'midmarket',objective:'Mit wenigen klaren Wertfeldern einen Einstieg in AI-gestützte Produktentwicklung und Vertrieb finden.',audience:'c-1',focus:'software'},answers:{},selectedOptions:[],initiatives:[],finance:{...emptyFinance,fiscalYear:2027,target:1800,budget:1200,forecast:950,actuals:120,reallocationNote:'Kapazität für höchstens zwei parallele Evidenzvorhaben reservieren.'}})
 ];
}
function write(items:Engagement[]){try{localStorage.setItem(storageKey,JSON.stringify(items))}catch{/* Zustand bleibt für diese Sitzung nutzbar. */}}
function read(){try{const raw=localStorage.getItem(storageKey);if(raw){const parsed=JSON.parse(raw);if(Array.isArray(parsed)){const result=parsed.map(item=>engagementSchema.parse(item));if(result.length)return result}}}catch{/* Ungültige Browserdaten werden ersetzt. */}const seeded=seedEngagements();write(seeded);return seeded}
function payload(init?:RequestInit){if(typeof init?.body!=='string')throw new Error('Ungültige Browser-Demo-Anfrage.');try{return JSON.parse(init.body)}catch{throw new Error('Ungültige Browser-Demo-Daten.')}}

export async function staticRequest<T>(url:string,init?:RequestInit):Promise<T>{
 const method=init?.method??'GET';
 if(method==='GET'&&url==='/api/catalog')return structuredClone(catalog) as T;
 const list=read();
 if(url==='/api/engagements'){
  if(method==='GET')return structuredClone(list) as T;
  if(method==='POST'){const value=createSchema.parse(payload(init));const next=engagementSchema.parse({id:crypto.randomUUID(),revision:0,synthetic:true,updatedAt:new Date().toISOString(),context:{...value,objective:'',audience:'c-level',focus:'hardware'},answers:{},selectedOptions:[],initiatives:[],finance:{...emptyFinance}});write([...list,next]);return structuredClone(next) as T}
 }
 const match=url.match(/^\/api\/engagements\/([a-f0-9-]+)$/);
 if(match){const index=list.findIndex(item=>item.id===match[1]);if(index<0)throw new Error('Die Demoakte wurde nicht gefunden.');if(method==='GET')return structuredClone(list[index]) as T;if(method==='PATCH'){const value=updateSchema.parse(payload(init));if(value.revision!==list[index].revision)throw new Error('Die Akte wurde zwischenzeitlich geändert. Bitte neu laden und Änderungen abgleichen.');const next=engagementSchema.parse({...list[index],...value,revision:value.revision+1,updatedAt:new Date().toISOString()});list[index]=next;write(list);return structuredClone(next) as T}}
 throw new Error('Diese Funktion ist in der Browser-Demo nicht verfügbar.');
}
