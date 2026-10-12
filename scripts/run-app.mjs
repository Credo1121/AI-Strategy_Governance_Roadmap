import { spawn } from 'node:child_process';
const mode=process.argv[2]==='start'?'start':'dev';
const children=[];let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;for(const child of children){try{if(process.platform!=='win32'&&child.pid)process.kill(-child.pid,'SIGTERM');else child.kill('SIGTERM')}catch(error){if(error.code!=='ESRCH')throw error}}setTimeout(()=>process.exit(code),1000).unref()}
for(const workspace of ['@strategy/api','@strategy/web']){
 const child=spawn('npm',['run',mode,'--workspace',workspace],{stdio:'inherit',detached:process.platform!=='win32',env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});children.push(child);
 child.on('error',()=>stop(1));child.on('exit',code=>{if(!stopping)stop(code??1)});
}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
