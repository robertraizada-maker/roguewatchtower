import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';
const source = ts.transpileModule(readFileSync(new URL('../lib/two-liners.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { getUniqueCardCount } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('ignores quantities, headings and totals, and deduplicates matching entries', () => {
    assert.equal(getUniqueCardCount('Pokémon: 8\r\n4 Pikachu SSP 1\r\n2 Pikachu SSP 2\r\n2 Pikachu SSP 1\r\nTrainer: 4\r\n4  Rare Candy SVI 191\r\nEnergy: 48\r\n48 Basic {L} Energy SVE 4\r\nTotal Cards: 60'), 4);
});
test('distinguishes the 16-card boundary and excludes missing lists', () => {
    for (const count of [16, 17]) {
        assert.equal(getUniqueCardCount(Array.from({length: count}, (_, i) => `4 Card ${i} SET ${i}`).join('\n')), count);
    }
    for (const value of [null, '', 'Pokémon: 0\nTotal Cards: 60']) assert.equal(getUniqueCardCount(value), null);
});
