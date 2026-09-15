const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { PGlite } = require('@electric-sql/pglite');
const root = path.resolve(__dirname, '..');

test('fallback tries configured providers in order and validates every answer', async () => {
  const calls = []; let charged = 0;
  const history = Array.from({ length: 9 }, (_, i) => ({ role: 'VISITOR', content: 'Question ' + i }));
  const env = { CHAT_GEMINI_API_KEY: 'gemini-test', CHAT_GROQ_API_KEY: 'groq-test', CHAT_OPENROUTER_API_KEY: 'router-test' };
  const load = loader({ '@/lib/prisma': { prisma: { $queryRaw: async () => [{ count: ++charged }], product: { findMany: async () => [] } } } }, env, {
    fetch: async (url, options) => {
      calls.push(url);
      const body = JSON.parse(options.body);
      if (url.includes('googleapis')) {
        assert.equal(options.headers['x-goog-api-key'], 'gemini-test');
        assert.equal(options.headers.Authorization, undefined);
        const messages = JSON.parse(body.contents[0].parts[0].text);
        assert.equal(messages.length, 6); assert.equal(messages[0].content, 'Question 3');
        return Response.json({ error: {} }, { status: 429 });
      }
      const messages = JSON.parse(body.messages[1].content);
      assert.equal(messages.length, 6);
      if (url.includes('groq.com')) {
        assert.equal(options.headers.Authorization, 'Bearer groq-test');
        return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"kind":"facts","ids":["invented"]}' } }] });
      }
      assert.equal(options.headers.Authorization, 'Bearer router-test');
      return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"kind":"facts","ids":["jam_utama"]}' } }] });
    },
  });
  const result = await load('src/lib/chat-ai.ts').answerChat(history);
  assert.equal(result.handoff, false); assert.match(result.content, /06.00-18.00/);
  assert.equal(calls.length, 3); assert.equal(charged, 3);
});
test('valid handoff stops fallback and empty keys are skipped', async () => {
  const calls = [];
  const load = loader({ '@/lib/prisma': { prisma: { $queryRaw: async () => [{ count: 1 }], product: { findMany: async () => [] } } } },
    { CHAT_GROQ_API_KEY: 'groq-test', CHAT_OPENROUTER_API_KEY: 'router-test' }, {
      fetch: async url => { calls.push(url); return Response.json({ choices: [{ finish_reason: 'stop', message: { content: '{"kind":"handoff","ids":[]}' } }] }); },
    });
  assert.equal((await load('src/lib/chat-ai.ts').answerChat([{ role: 'VISITOR', content: 'Question' }])).handoff, true);
  assert.equal(calls.length, 1); assert.match(calls[0], /groq.com/);
});
test('all failed providers fail closed; daily cap cannot be bypassed through fallback', async () => {
  let calls = 0, count = 0;
  const env = { CHAT_GEMINI_API_KEY: 'g', CHAT_GROQ_API_KEY: 'q', CHAT_OPENROUTER_API_KEY: 'r' };
  const db = { $queryRaw: async () => [{ count: ++count }], product: { findMany: async () => [] } };
  const load = loader({ '@/lib/prisma': { prisma: db } }, env, { fetch: async () => { calls++; throw Error('Timeout'); } });
  const ai = load('src/lib/chat-ai.ts');
  assert.equal((await ai.answerChat([{ role: 'VISITOR', content: 'Hello' }])).handoff, true);
  assert.equal(calls, 3);
  count = 300;
  assert.equal((await ai.answerChat([{ role: 'VISITOR', content: 'Hello' }])).handoff, true);
  assert.equal(calls, 3);
});

test('guest lookup uses only the hashed token and an unexpired session filter', async () => {
  let query;
  const load = loader({ '@/lib/prisma': { prisma: { chatConversation: { findFirst: async q => { query = q; return null; } } } } });
  const security = load('src/lib/chat-security.ts');
  const store = load('src/lib/chat-store.ts');
  assert.equal(await store.guestConversation(null), null);
  assert.equal(query, undefined);
  const token = security.newChatToken();
  await store.guestConversation(token);
  assert.equal(query.where.tokenHash, security.tokenHash(token));
  assert.ok(query.where.expiresAt.gt instanceof Date);
  assert.equal('id' in query.where, false);
});
test('AI transport validates provider output and never sends credentials in the URL', async () => {
  let calls = 0;
  const load = loader({ '@/lib/prisma': { prisma: { $queryRaw: async () => [{ count: 1 }], product: { findMany: async () => [] } } } }, { CHAT_GEMINI_API_KEY: 'test-key' }, {
    fetch: async (url, opts) => {
      calls++;
      assert.equal(url.includes('test-key'), false);
      assert.equal(opts.headers['x-goog-api-key'], 'test-key');
      return Response.json({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '{"kind":"facts","ids":["jam_utama"]}' }] } }] });
    },
  });
  const reply = await load('src/lib/chat-ai.ts').answerChat([{ role: 'VISITOR', content: 'Jam buka utama?' }]);
  assert.equal(reply.handoff, false); assert.match(reply.content, /06.00-18.00/); assert.equal(calls, 1);
});
test('reusing request IDs with different payloads is rejected', async () => {
  const data = memoryStore();
  await data.store.guestSend('c', 'Original', 'r1');
  await assert.rejects(() => data.store.guestSend('c', 'Changed', 'r1'), e => e.status === 409);
});
test('client history merge preserves older pages and rejects stale mode changes', () => {
  const { mergeChat } = loader()('src/hooks/useChat.ts');
  const message = n => ({ id: 'm' + n, sequence: n });
  const current = { id: 'a', version: 3, mode: 'ADMIN', messages: [message(2), message(3)] };
  const old = { id: 'a', version: 1, mode: 'AI', messages: [message(1), message(2)] };
  const result = mergeChat(current, old);
  assert.equal(result.mode, 'ADMIN'); assert.equal(result.messages.length, 3);
  assert.equal(result.hasEarlier, false);
});

function loader(overrides = {}, env = {}, globals = {}) {
  overrides = { '@/lib/prisma': { prisma: {} }, '@/lib/auth': { auth: async () => null }, ...overrides };
  const cache = new Map();
  function load(file) {
    if (cache.has(file)) return cache.get(file).exports;
    const module = { exports: {} }; cache.set(file, module);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    function localRequire(id) {
      if (id in overrides) return overrides[id];
      if (id === 'next/server') return { NextResponse: { json(value, init) { const r = Response.json(value, init); r.cookies = { set(name, value, opts) { r.headers.set('set-cookie', name + '=' + value + '; HttpOnly; SameSite=' + opts.sameSite + '; Path=' + opts.path + (opts.secure ? '; Secure' : '')); } }; return r; } } };
      if (id.startsWith('@/')) return load('src/' + id.slice(2) + '.ts');
      return require(id);
    }
    vm.runInNewContext(code, { module, exports: module.exports, require: localRequire, process: { env }, console: { error() {} }, Request, Response, URL, Date, Buffer, AbortSignal, fetch: async () => { throw Error('Unexpected external network'); }, ...globals });
    return module.exports;
  }
  return load;
}
const url = 'https://test.invalid/api/chat';
function request(payload, headers = {}, token) {
  const r = new Request(url, { method: 'POST', headers: { origin: 'https://test.invalid', 'content-type': 'application/json', ...headers }, body: JSON.stringify(payload) });
  r.cookies = { get: () => token ? { value: token } : undefined };
  r.nextUrl = new URL(url);
  return r;
}
test('chat tokens are unpredictable, stored hashed, and set HttpOnly/Secure', () => {
  const sec = loader({}, { NODE_ENV: 'production' })('src/lib/chat-security.ts');
  const a = sec.newChatToken(), b = sec.newChatToken();
  assert.notEqual(a, b); assert.equal(a.length, 43);
  assert.notEqual(sec.tokenHash(a), a); assert.equal(sec.tokenHash(a).length, 64);
  const cookie = sec.chatJSON({}, a).headers.get('set-cookie');
  assert.match(cookie, /__Host-nays_chat=/); assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=strict/);
  assert.equal(sec.requestToken(request({}, {}, '../../bad')), null);
});
test('cross-origin writes, missing origin, and oversized bodies are rejected', async () => {
  const sec = loader()('src/lib/chat-security.ts');
  assert.throws(() => sec.sameOrigin(request({}, { origin: 'https://attacker.invalid' })), e => e.status === 403);
  const missing = new Request(url, { method: 'POST' });
  assert.throws(() => sec.sameOrigin(missing), e => e.status === 403);
  await assert.rejects(() => sec.boundedJSON(request({ text: 'a'.repeat(9000) })), e => e.status === 413);
  await assert.rejects(() => sec.boundedJSON(request({}, { 'content-type': 'text/plain' })), e => e.status === 415);
});
test('chat schemas reject client-selected identities, empty and oversized messages', () => {
  const { guestAction, adminAction } = loader()('src/lib/chat-contract.ts');
  const id = '00000000-0000-4000-8000-000000000001';
  assert.equal(guestAction.safeParse({ action: 'message', text: 'Hi', requestId: id, conversationId: 'victim' }).success, false);
  assert.equal(guestAction.safeParse({ action: 'message', text: ' ', requestId: id }).success, false);
  assert.equal(guestAction.safeParse({ action: 'message', text: 'a'.repeat(2001), requestId: id }).success, false);
  assert.equal(adminAction.safeParse({ action: 'claim', adminId: 'other' }).success, false);
});
test('rate limiting is database atomic, independent of process memory', async () => {
  let calls = 0;
  const sec = loader({ '@/lib/prisma': { prisma: { $queryRaw: async () => [{ count: ++calls }] } } })('src/lib/chat-security.ts');
  await sec.rateLimit('test', 1, 60);
  await assert.rejects(() => sec.rateLimit('test', 1, 60), e => e.status === 429);
});
test('AI only renders known facts and catalogue values', () => {
  const { renderSelection } = loader()('src/lib/chat-ai.ts');
  const products = [{ id: 'p', name: 'Risol', sellingPrice: 2500, unit: 'pcs', supplier: 'A' }];
  assert.match(renderSelection({ kind: 'products', ids: ['p'] }, products).content, /2.500/);
  assert.match(renderSelection({ kind: 'facts', ids: ['maps_cabang'] }, []).content, /fzvJrdbCGMVV3yFq7/);
  for (const data of [{ kind: 'facts', ids: ['invented'] }, { kind: 'products', ids: ['p', 'p'] }, { kind: 'greeting', ids: ['p'] }, { kind: 'products', ids: ['p'], content: 'Harga Rp1' }]) {
    assert.throws(() => renderSelection(data, products));
  }
});
test('sensitive questions and missing AI configuration hand off without external calls', async () => {
  const { answerChat } = loader()('src/lib/chat-ai.ts');
  assert.equal((await answerChat([{ role: 'VISITOR', content: 'Aman untuk alergi?' }])).handoff, true);
  assert.equal((await answerChat([{ role: 'VISITOR', content: 'Jam buka?' }])).handoff, true);
});
test('guest cannot select another conversation and admin endpoints enforce login', async () => {
  let touched = false;
  const db = { $queryRaw: async () => [{ count: 1 }], chatConversation: { findFirst: async () => { touched = true; return null; } } };
  const load = loader({ '@/lib/prisma': { prisma: db }, '@/lib/auth': { auth: async () => null } }, { CHAT_ENABLED: 'true', AUTH_SECRET: 'test-only' });
  const guest = await load('src/app/api/chat/route.ts').POST(request({ action: 'message', text: 'secret', requestId: '00000000-0000-4000-8000-000000000001' }));
  assert.equal(guest.status, 401); assert.equal(touched, false);
  for (const file of ['src/app/api/admin/chats/route.ts', 'src/app/api/admin/chats/[id]/route.ts']) {
    const mod = load(file);
    assert.equal((await mod.GET(request({}), { params: Promise.resolve({ id: 'victim' }) })).status, 401);
    if (mod.POST) assert.equal((await mod.POST(request({ action: 'claim' }), { params: Promise.resolve({ id: 'victim' }) })).status, 401);
  }
  const invalid = await load('src/app/api/chat/route.ts').POST(request({ action: 'start' }, { origin: 'https://attacker.invalid' }));
  assert.equal(invalid.status, 403);
});
function memoryStore(answer = async () => ({ content: 'Verified answer', handoff: false })) {
  const c = { id: 'c', tokenHash: 'stored', mode: 'AI', assigneeId: null, version: 0, messageCount: 0, visitorSequence: 0, adminReadSequence: 0, aiJobId: null, aiStartedAt: null, expiresAt: new Date(Date.now() + 86400000) };
  const messages = [];
  const tx = {
    chatConversation: {
      findUnique: async () => ({ ...c }),
      updateMany: async ({ where, data }) => {
        if (where.version !== undefined && where.version !== c.version || where.mode && where.mode !== c.mode || where.aiJobId && where.aiJobId !== c.aiJobId) return { count: 0 };
        for (const [k, v] of Object.entries(data)) c[k] = v && typeof v === 'object' && 'increment' in v ? c[k] + v.increment : v;
        return { count: 1 };
      },
    },
    chatMessage: {
      findUnique: async ({ where }) => messages.find(m => m.requestId === where.conversationId_requestId.requestId),
      create: async ({ data }) => { const m = { id: String(messages.length + 1), ...data }; messages.push(m); return m; },
      findMany: async () => messages.slice().reverse(),
    },
  };
  const db = { ...tx, $transaction: async fn => fn(tx) };
  const store = loader({ '@/lib/prisma': { prisma: db }, '@/lib/chat-ai': { answerChat: answer, HANDOFF_REPLY: { content: 'Waiting for admin', handoff: true } } })('src/lib/chat-store.ts');
  return { store, c, messages, tx };
}
test('visitor retry is idempotent and AI does not answer after admin takeover', async () => {
  const data = memoryStore(async () => {
    await data.store.adminChange('c', 'admin-1', { action: 'claim' });
    return { content: 'Too late', handoff: false };
  });
  await data.store.guestSend('c', 'Halo', 'request-1');
  await data.store.guestSend('c', 'Halo', 'request-1');
  assert.equal(data.c.mode, 'ADMIN');
  assert.equal(data.messages.filter(m => m.role === 'VISITOR').length, 1);
  assert.equal(data.messages.some(m => m.content === 'Too late'), false);
});
test('only assigned admin may reply or release; guest messages in admin mode do not trigger AI', async () => {
  let aiCalls = 0;
  const data = memoryStore(async () => { aiCalls++; return { content: 'AI', handoff: false }; });
  await data.store.adminChange('c', 'admin-1', { action: 'claim' });
  await assert.rejects(() => data.store.adminChange('c', 'admin-2', { action: 'claim' }), e => e.status === 409);
  await assert.rejects(() => data.store.adminChange('c', 'admin-2', { action: 'message', text: 'No', requestId: 'r2' }), e => e.status === 409);
  await assert.rejects(() => data.store.adminChange('c', 'admin-2', { action: 'release' }), e => e.status === 409);
  await data.store.guestSend('c', 'Question', 'r3');
  await data.store.adminChange('c', 'admin-1', { action: 'message', text: 'Answer', requestId: 'r4' });
  await data.store.adminChange('c', 'admin-1', { action: 'message', text: 'Answer', requestId: 'r4' });
  assert.equal(aiCalls, 0); assert.equal(data.messages.filter(m => m.role === 'ADMIN').length, 1);
  await data.store.adminChange('c', 'admin-1', { action: 'release' });
  assert.equal(data.c.mode, 'AI'); assert.equal(data.c.assigneeId, null);
});
test('expired AI jobs become a waiting conversation and stale CAS cannot append', async () => {
  const data = memoryStore();
  data.c.aiJobId = 'lost'; data.c.aiStartedAt = new Date(Date.now() - 60000);
  await data.store.recoverChat('c');
  assert.equal(data.c.mode, 'WAITING'); assert.equal(data.c.aiJobId, null);
  const stale = { ...data.c, version: data.c.version - 1 };
  const count = data.messages.length;
  await assert.rejects(() => data.store.appendMessage(data.tx, stale, 'AI', 'stale', null), e => e.status === 409);
  assert.equal(data.messages.length, count);
});
test('chat migration enforces token/message uniqueness and cascades only its own transcript', async () => {
  const db = new PGlite();
  try {
    await db.exec(fs.readFileSync(path.join(root, 'prisma/migrations/20260915000000_guest_chat/migration.sql'), 'utf8'));
    await db.exec('INSERT INTO "ChatConversation" (id,"tokenHash","updatedAt","expiresAt") VALUES (\'a\',\'hash-a\',NOW(),NOW()+INTERVAL \'30 days\'),(\'b\',\'hash-b\',NOW(),NOW()+INTERVAL \'30 days\')');
    await assert.rejects(() => db.exec('INSERT INTO "ChatConversation" (id,"tokenHash","updatedAt","expiresAt") VALUES (\'c\',\'hash-a\',NOW(),NOW())'), /unique/);
    await db.exec('INSERT INTO "ChatMessage" (id,"conversationId",sequence,role,content,"requestId") VALUES (\'m1\',\'a\',1,\'VISITOR\',\'hello\',\'r1\'),(\'m2\',\'b\',1,\'VISITOR\',\'private\',\'r1\')');
    await assert.rejects(() => db.exec('INSERT INTO "ChatMessage" (id,"conversationId",sequence,role,content,"requestId") VALUES (\'m3\',\'a\',2,\'VISITOR\',\'duplicate\',\'r1\')'), /unique/);
    await db.exec('DELETE FROM "ChatConversation" WHERE id=\'a\'');
    assert.equal((await db.query('SELECT COUNT(*)::int n FROM "ChatMessage"')).rows[0].n, 1);
  } finally { await db.close(); }
});
