// Comprehensive integration verification for Memory Heist
const http = require('http');

async function request(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.setHeader('Content-Type', 'application/json');
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('=== MEMORY HEIST FULL SYSTEM VERIFICATION ===\n');

  // 1. Health check
  console.log('1. Testing Backend Health (/api/health)...');
  const health = await request('http://localhost:8080/api/health');
  console.log('   Status:', health.status, 'Body:', health.body);
  if (health.status !== 200 || health.body.database !== 'connected') {
    throw new Error('Health check failed!');
  }

  // 2. Levels list
  console.log('\n2. Testing Level Summaries (/api/levels)...');
  const levels = await request('http://localhost:8080/api/levels');
  console.log(`   Found ${levels.body.length} levels in MongoDB:`);
  levels.body.forEach((l) => {
    console.log(`   - Level ${l.levelNumber}: ${l.name} (${l.difficulty}, ${l.width}x${l.height}, ${l.guardCount} guards)`);
  });
  if (levels.body.length !== 5) {
    throw new Error(`Expected 5 levels, found ${levels.body.length}`);
  }

  // 3. Level detail
  console.log('\n3. Testing Level Detail (/api/levels/level-1)...');
  const lvl1 = await request('http://localhost:8080/api/levels/level-1');
  console.log('   Level 1 Entrance:', lvl1.body.entrance);
  console.log('   Level 1 Key:', lvl1.body.key);
  console.log('   Level 1 Door:', lvl1.body.door);
  console.log('   Level 1 Diamond:', lvl1.body.diamond);
  console.log('   Level 1 Exit:', lvl1.body.exit);
  console.log('   Level 1 Guards:', lvl1.body.guards.length);
  if (!lvl1.body.entrance || !lvl1.body.key || !lvl1.body.diamond || !lvl1.body.exit) {
    throw new Error('Level 1 layout missing key landmarks!');
  }

  // 4. Create Attempt
  console.log('\n4. Testing Attempt Creation (/api/attempts)...');
  const testPlayerId = 'qa-operative-' + Date.now();
  const createRes = await request('http://localhost:8080/api/attempts', { method: 'POST' }, {
    levelId: 'level-1',
    playerId: testPlayerId,
    mode: 'NORMAL'
  });
  console.log('   Created Attempt ID:', createRes.body.id, 'Status:', createRes.body.status);
  if (createRes.status !== 201 || createRes.body.status !== 'IN_PROGRESS') {
    throw new Error('Attempt creation failed!');
  }

  // 5. Complete Attempt (Victory)
  console.log('\n5. Testing Attempt Completion (/api/attempts/{id}/complete)...');
  const completeRes = await request(`http://localhost:8080/api/attempts/${createRes.body.id}/complete`, { method: 'POST' }, {
    playerId: testPlayerId,
    success: true,
    timeTakenSeconds: 22,
    flashesUsed: 1,
    reason: 'DIAMOND_SECURED'
  });
  console.log('   Score Breakdown:', completeRes.body.scoreBreakdown);
  console.log('   Final Score:', completeRes.body.score);
  // 45s limit - 22s = 23s remaining * 25 = 575
  // 2 unused flashes * 200 = 400
  // Base = 1000
  // Total = 1975
  if (completeRes.body.score !== 1975) {
    throw new Error(`Expected score 1975, got ${completeRes.body.score}`);
  }

  // 6. Test Idempotency
  console.log('\n6. Testing Idempotency (repeating complete request)...');
  const repeatRes = await request(`http://localhost:8080/api/attempts/${createRes.body.id}/complete`, { method: 'POST' }, {
    playerId: testPlayerId,
    success: true,
    timeTakenSeconds: 22,
    flashesUsed: 1,
    reason: 'DIAMOND_SECURED'
  });
  if (repeatRes.body.score !== 1975 || repeatRes.body.id !== createRes.body.id) {
    throw new Error('Idempotency failed!');
  }
  console.log('   Idempotency confirmed: Returned existing record without duplication.');

  // 7. Check Player Progress
  console.log('\n7. Testing Player Progress (/api/progress)...');
  const progressRes = await request(`http://localhost:8080/api/progress?playerId=${testPlayerId}`);
  console.log('   Progress Body:', progressRes.body);
  if (progressRes.body.totalScore !== 1975 || !progressRes.body.completedLevelIds.includes('level-1')) {
    throw new Error('Progress does not reflect completed attempt!');
  }

  console.log('\n>>> ALL BACKEND REST ENDPOINTS AND BUSINESS RULES VERIFIED! <<<');
}

runVerification().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
