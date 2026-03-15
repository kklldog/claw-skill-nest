const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const request = require('supertest');

const tmpDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claw-skill-nest-test-'));
process.env.DATA_DIR = tmpDataDir;
process.env.API_KEY = 'test-key';

const { app } = require('../index');

const api = () => request(app).set('X-API-Key', 'test-key');

let uploadedId = null;

test('GET /api/skills should require API key', async () => {
  const res = await request(app).get('/api/skills');
  assert.equal(res.status, 401);
});

test('GET /api/auth/verify should validate API key', async () => {
  const okRes = await request(app)
    .get('/api/auth/verify')
    .set('X-API-Key', 'test-key');
  assert.equal(okRes.status, 200);
  assert.equal(okRes.body.ok, true);
  assert.equal(okRes.body.appName, '虾滑');

  const badRes = await request(app).get('/api/auth/verify');
  assert.equal(badRes.status, 401);
});

test('upload -> list -> detail -> download -> delete lifecycle', async () => {
  const fixture = path.join(__dirname, 'fixtures', 'demo.skill');

  const uploadRes = await request(app)
    .post('/api/skills/upload')
    .set('X-API-Key', 'test-key')
    .field('name', 'demo-skill')
    .field('description', 'for integration test')
    .attach('file', fixture);

  assert.equal(uploadRes.status, 200);
  assert.equal(uploadRes.body.name, 'demo-skill');
  uploadedId = uploadRes.body.id;

  const listRes = await request(app)
    .get('/api/skills')
    .set('X-API-Key', 'test-key');
  assert.equal(listRes.status, 200);
  assert.ok(Array.isArray(listRes.body));
  assert.ok(listRes.body.find((x) => x.id === uploadedId));

  const detailRes = await request(app)
    .get(`/api/skills/${uploadedId}`)
    .set('X-API-Key', 'test-key');
  assert.equal(detailRes.status, 200);
  assert.equal(detailRes.body.id, uploadedId);

  const downloadRes = await request(app)
    .get(`/api/skills/${uploadedId}/download`)
    .set('X-API-Key', 'test-key');
  assert.equal(downloadRes.status, 200);
  assert.match(downloadRes.headers['content-disposition'] || '', /attachment/);

  const delRes = await request(app)
    .delete(`/api/skills/${uploadedId}`)
    .set('X-API-Key', 'test-key');
  assert.equal(delRes.status, 200);

  const detail404 = await request(app)
    .get(`/api/skills/${uploadedId}`)
    .set('X-API-Key', 'test-key');
  assert.equal(detail404.status, 404);
});
