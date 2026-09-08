import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync(new URL('../lib/player-standings.ts', import.meta.url), 'utf8'), {compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const { buildPlayerStandings, getPlayerSlug, getPlayerWindow, getPlayerMedal } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
const deck = (id, dailyRank, reportDate='2026-09-04', extra={}) => ({player_id:id,player_name:`Player ${id}`,player_handle:`player${id}`,dailyRank,reportDate,standing:10,tournament_players:100,...extra});

test('awards the requested points for daily positions, independently of tournament placing', () => {
 const players=buildPlayerStandings([1,2,3,4,5].map(rank=>deck(rank,rank,'2026-09-04',{standing:99})), '2026-09-04');
 assert.deepEqual(players.map(p=>p.points),[8,5,3,2,1]);
 assert.deepEqual(players.map(p=>p.rank),[1,2,3,4,5]);
 assert.deepEqual(players.slice(0,3).map(p=>getPlayerMedal(p.rank)),['🥇','🥈','🥉']);
});
test('adds repeated appearances and uses identity rather than display name', () => {
 const players=buildPlayerStandings([deck(1,5,'2026-09-04',{player_name:'New Name'}),deck(1,1,'2026-09-03',{player_name:'Old Name'}),deck(2,2,'2026-09-04',{player_name:'New Name'})], '2026-09-04');
 assert.equal(players.length,2);assert.equal(players[0].points,9);assert.equal(players[0].wins,1);assert.equal(players[0].name,'New Name');
 assert.deepEqual(players[0].decks.map(d=>d.reportDate),['2026-09-04','2026-09-03']);
});
test('uses 28 calendar days inclusively and excludes future dates and non-top-five results', () => {
 assert.deepEqual(getPlayerWindow('2026-09-04'),{startDate:'2026-08-08',endDate:'2026-09-04'});
 const players=buildPlayerStandings([deck(1,1,'2026-08-08'),deck(2,1,'2026-08-07'),deck(3,1,'2026-09-05'),deck(4,6),deck(5,0),deck(6,1.5)],'2026-09-04');
 assert.deepEqual(players.map(p=>p.id),[1]);
});
test('identical results receive consecutive unique ranks and remain descending', () => {
 const players=buildPlayerStandings([deck(1,1),deck(2,1),deck(3,2)],'2026-09-04');
 assert.deepEqual(players.map(p=>p.rank),[1,2,3]);
 assert.deepEqual(players.map(p=>p.points),[8,8,5]);
});
test('produces safe, distinct profile URLs, including reserved usernames', () => {
 assert.equal(getPlayerSlug(1,'Valid_User-2'),'valid_user-2');
 for(const handle of ['Name With Spaces','../admin','名前','id-123','123',undefined]) assert.equal(getPlayerSlug(7,handle),'id-7');
 const players=buildPlayerStandings([deck(1,1,'2026-09-04',{player_handle:'Same'}),deck(2,2,'2026-09-04',{player_handle:'same'}),deck(3,3,'2026-09-04',{player_handle:'id-1'})],'2026-09-04');
 assert.deepEqual(players.map(p=>p.slug),['id-1','id-2','id-3']);
});
test('handles empty periods and refuses to merge players without IDs', () => {
 assert.deepEqual(buildPlayerStandings([],'2026-09-04'),[]);
 assert.throws(()=>buildPlayerStandings([deck(undefined,1)],'2026-09-04'),/player ID/);
});

test('equal points favor lowest tournament percentage before daily finish or recency', () => {
 const players=buildPlayerStandings([deck(1,2),deck(1,3,'2026-09-03',{standing:17,tournament_players:1000}),deck(2,1,'2026-09-04',{standing:25,tournament_players:1000})],'2026-09-04');
 assert.deepEqual(players.map(p=>p.points),[8,8]);
 assert.deepEqual(players.map(p=>p.id),[1,2]);
 assert.deepEqual(players.map(p=>Number(p.bestFinishPercentage.toFixed(1))),[1.7,2.5]);
 assert.deepEqual(players.map(p=>p.rank),[1,2]);
});
test('equal points and best finishes favor the most recent appearance', () => {
 const players=buildPlayerStandings([deck(1,1,'2026-09-02'),deck(1,5,'2026-09-03'),deck(2,1,'2026-09-01'),deck(2,5,'2026-09-04')],'2026-09-04');
 assert.deepEqual(players.map(p=>p.id),[2,1]);
 assert.deepEqual(players.map(p=>p.rank),[1,2]);
});
test('fully equal results use a stable fallback regardless of input order', () => {
 const decks=[deck(2,1,undefined,{player_name:'Same'}),deck(1,1,undefined,{player_name:'Same'})];
 for(const input of [decks,[...decks].reverse()]) {
  const players=buildPlayerStandings(input,'2026-09-04');
  assert.deepEqual(players.map(p=>p.id),[1,2]);
  assert.deepEqual(players.map(p=>p.rank),[1,2]);
 }
});