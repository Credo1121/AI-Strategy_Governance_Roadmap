import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { createSchema, updateSchema } from '@strategy/shared';
import { catalog, exportBriefing } from '@strategy/shared/catalog';
import { createStore } from './store';

class HttpError extends Error {constructor(public status:number,public code:string,message:string){super(message)}}
async function body(req:IncomingMessage){
 if(!req.headers['content-type']?.toLowerCase().startsWith('application/json'))throw new HttpError(415,'UNSUPPORTED_MEDIA_TYPE','JSON als Content-Type erforderlich.');
 const origin=req.headers.origin;
 if(origin&&!['http://127.0.0.1:3000','http://localhost:3000'].includes(origin))throw new HttpError(403,'ORIGIN','Diese Anfrage ist nicht zugelassen.');
 const chunks:Buffer[]=[];let size=0;
 for await(const c of req){size+=c.length;if(size>65536)throw new HttpError(413,'TOO_LARGE','Die Anfrage ist zu groß.');chunks.push(c)}
 try{return JSON.parse(Buffer.concat(chunks).toString('utf8'))}catch{throw new HttpError(400,'BAD_JSON','Ungültige JSON-Daten.')}
}
export function createApp(path:string){
 const store=createStore(path);
 const server=createServer(async(req:IncomingMessage,res:ServerResponse)=>{
  const requestId=randomUUID();
  const json=(status:number,value:unknown)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Request-ID':requestId});res.end(JSON.stringify(value))};
  try{
   const url=new URL(req.url??'/', 'http://127.0.0.1');const p=url.pathname;
   if(req.method==='GET'&&p==='/api/health')return json(200,{status:'ok',mode:'demo'});
   if(req.method==='GET'&&p==='/api/catalog')return json(200,catalog);
   if(p==='/api/engagements'){
    if(req.method==='GET')return json(200,store.list());
    if(req.method==='POST'){const c=createSchema.parse(await body(req));return json(201,store.create(c.name,c.profile))}
   }
   const match=p.match(/^\/api\/engagements\/([a-f0-9-]+)(\/export)?$/);
   if(match){
    const id=match[1];if(!z.string().uuid().safeParse(id).success)throw new HttpError(404,'NOT_FOUND','Die Demoakte wurde nicht gefunden.');
    const e=store.get(id);if(!e)throw new HttpError(404,'NOT_FOUND','Die Demoakte wurde nicht gefunden.');
    if(req.method==='GET'&&match[2]){res.writeHead(200,{'Content-Type':'text/markdown; charset=utf-8','Content-Disposition':`attachment; filename="strategiebriefing-${id}.md"`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(exportBriefing(e))}
    if(req.method==='GET')return json(200,e);
    if(req.method==='PATCH'&&!match[2]){
     const u=updateSchema.parse(await body(req));const r=store.update(id,u);
     if(r.status==='conflict')throw new HttpError(409,'CONFLICT','Die Akte wurde zwischenzeitlich geändert. Bitte neu laden und Änderungen abgleichen.');
     if(r.status==='missing')throw new HttpError(404,'NOT_FOUND','Die Demoakte wurde nicht gefunden.');
     return json(200,r.value);
    }
   }
   throw new HttpError(404,'NOT_FOUND','Dieser Endpunkt wurde nicht gefunden.');
  }catch(error){
   if(res.writableEnded)return;
   if(error instanceof z.ZodError)return json(400,{error:{code:'VALIDATION',message:'Bitte Eingaben, bekannte IDs und Feldlängen prüfen.',requestId}});
   if(error instanceof HttpError)return json(error.status,{error:{code:error.code,message:error.message,requestId}});
   console.error(JSON.stringify({event:'request_failed',requestId}));
   json(500,{error:{code:'INTERNAL',message:'Die Anfrage konnte nicht verarbeitet werden.',requestId}});
  }
 });
 server.requestTimeout=15000;server.headersTimeout=10000;
 return {server,store};
}
