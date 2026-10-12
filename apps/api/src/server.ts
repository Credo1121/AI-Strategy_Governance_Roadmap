import { fileURLToPath } from 'node:url';
import { createApp } from './app';
const {server,store}=createApp(fileURLToPath(new URL('../../../.data/demo.sqlite',import.meta.url)));
server.listen(4010,'127.0.0.1',()=>console.log('Strategy API · demo · 127.0.0.1:4010'));
function close(){server.close(()=>{store.close();process.exit(0)})}
process.on('SIGINT',close);process.on('SIGTERM',close);
