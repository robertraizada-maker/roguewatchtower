import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const source=readFileSync(new URL('../functions/admin/[[path]].js',import.meta.url),'utf8');
const {onRequest}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const env={ADMIN_PASSWORD:'test-password',ADMIN_API_TOKEN:'test-api-token',API_BASE_URL:'https://api.example'};
function context(auth=true){return {env,request:new Request('https://site.example/admin/imports/data',{headers:auth?{Authorization:'Basic '+btoa('robert.raizada:test-password')}:{}}),next(){throw Error('Unexpected asset request')}};}
test('backend auth failures do not challenge a valid browser login',async()=>{
 const original=globalThis.fetch;
 try { for(const status of [401,403]) { globalThis.fetch=async(url,init)=>{assert.equal(init.headers.Authorization,'Bearer test-api-token');return Response.json({message:'Unauthorized'},{status});};const response=await onRequest(context());assert.equal(response.status,502);assert.equal(response.headers.get('WWW-Authenticate'),null);assert.match((await response.json()).error,/backend API/); } } finally {globalThis.fetch=original;}
});
test('missing browser credentials still receive the login challenge',async()=>{const response=await onRequest(context(false));assert.equal(response.status,401);assert.match(response.headers.get('WWW-Authenticate'),/^Basic /);});
test('authenticated history requests retain returned imports',async()=>{const original=globalThis.fetch;try{globalThis.fetch=async()=>Response.json({imports:[{reportDate:'2026-09-06'}]});const response=await onRequest(context());assert.equal(response.status,200);assert.equal((await response.json()).imports[0].reportDate,'2026-09-06');}finally{globalThis.fetch=original;}});
