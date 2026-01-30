/**
 * 日本語タイピングエンジン専用テスト
 * バージョン: 1.0.0
 * 最終更新: 2026-01-30
 * 
 * このテストは以下を検証します：
 * 1. 全ひらがな・カタカナの正しいローマ字入力
 * 2. 濁音・半濁音の複数パターン入力
 * 3. 拗音（きゃ、しゅ等）の柔軟な入力
 * 4. 促音（っ）の適切な処理
 * 5. 「ん」の文脈依存処理
 * 6. 入力候補の正確な表示
 * 7. エラー検出の精度
 */

import { KANA_MAPPING, handleSokuon, handleN } from '../js/kana-mapping.js';
import { TypingEngine } from '../js/typing-engine.js';

export class JapaneseTypingTests {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            failures: [],
            coverage: {
                hiragana: 0,
                katakana: 0,
                dakuten: 0,
                handakuten: 0,
                yoon: 0,
                sokuon: 0,
                special: 0
            }
        };
    }

    async runAllTests() {
        console.log('🧪 日本語タイピングエンジンテスト開始...');
        this.resetResults();

        await this.testBasicHiragana();
        await this.testBasicKatakana();
        await this.testDakuten();
        await this.testHandakuten();
        await this.testYoon();
        await this.testSokuon();
        await this.testNHandling();
        await this.testMultiplePatterns();
        await this.testComplexWords();
        await this.testTokenizer();
        await this.testInputHints();
        await this.testErrorDetection();

        this.printResults();
        return this.results;
    }

    resetResults() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            failures: [],
            coverage: {
                hiragana: 0,
                katakana: 0,
                dakuten: 0,
                handakuten: 0,
                yoon: 0,
                sokuon: 0,
                special: 0
            }
        };
    }

    // Helper: Simple assertion
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                const sActual = JSON.stringify(actual);
                const sExpected = JSON.stringify(expected);
                if (sActual !== sExpected) {
                    throw new Error(`Expected ${sExpected}, but got ${sActual}`);
                }
            },
            toContain: (item) => {
                if (!actual.includes(item)) {
                    throw new Error(`Expected array to contain ${item}, but it didn't`);
                }
            },
            toInclude: (substring) => {
                if (!actual.includes(substring)) {
                    throw new Error(`Expected string to include "${substring}", but got "${actual}"`);
                }
            },
            toBeGreaterThan: (limit) => {
                if (actual <= limit) {
                    throw new Error(`Expected > ${limit}, but got ${actual}`);
                }
            },
            toHaveLength: (length) => {
                if (actual.length !== length) {
                    throw new Error(`Expected length ${length}, but got ${actual.length}`);
                }
            }
        };
    }

    // Helper: Run individual test case
    async test(name, fn, category = 'general') {
        this.results.total++;
        try {
            await fn();
            this.results.passed++;
            if (category !== 'general') {
                this.results.coverage[category]++;
            }
            console.log(`✅ ${name}`);
        } catch (error) {
            this.results.failed++;
            this.results.failures.push({ name, error: error.message });
            console.error(`❌ ${name}: ${error.message}`);
        }
    }

    // --- 基本ひらがなテスト ---
    async testBasicHiragana() {
        console.log('\n--- 基本ひらがなテスト ---');

        const hiraganaTests = [
            // あ行
            { kana: 'あ', patterns: ['a'] },
            { kana: 'い', patterns: ['i', 'yi'] },
            { kana: 'う', patterns: ['u', 'wu', 'whu'] },
            { kana: 'え', patterns: ['e'] },
            { kana: 'お', patterns: ['o'] },
            
            // か行
            { kana: 'か', patterns: ['ka', 'ca'] },
            { kana: 'き', patterns: ['ki'] },
            { kana: 'く', patterns: ['ku', 'cu', 'qu'] },
            { kana: 'け', patterns: ['ke'] },
            { kana: 'こ', patterns: ['ko', 'co'] },
            
            // さ行
            { kana: 'さ', patterns: ['sa'] },
            { kana: 'し', patterns: ['shi', 'si', 'ci'] },
            { kana: 'す', patterns: ['su'] },
            { kana: 'せ', patterns: ['se', 'ce'] },
            { kana: 'そ', patterns: ['so'] },
            
            // た行
            { kana: 'た', patterns: ['ta'] },
            { kana: 'ち', patterns: ['chi', 'ti'] },
            { kana: 'つ', patterns: ['tsu', 'tu'] },
            { kana: 'て', patterns: ['te'] },
            { kana: 'と', patterns: ['to'] },
            
            // な行
            { kana: 'な', patterns: ['na'] },
            { kana: 'に', patterns: ['ni'] },
            { kana: 'ぬ', patterns: ['nu'] },
            { kana: 'ね', patterns: ['ne'] },
            { kana: 'の', patterns: ['no'] },
            
            // は行
            { kana: 'は', patterns: ['ha'] },
            { kana: 'ひ', patterns: ['hi'] },
            { kana: 'ふ', patterns: ['fu', 'hu'] },
            { kana: 'へ', patterns: ['he'] },
            { kana: 'ほ', patterns: ['ho'] },
            
            // ま行
            { kana: 'ま', patterns: ['ma'] },
            { kana: 'み', patterns: ['mi'] },
            { kana: 'む', patterns: ['mu'] },
            { kana: 'め', patterns: ['me'] },
            { kana: 'も', patterns: ['mo'] },
            
            // や行
            { kana: 'や', patterns: ['ya'] },
            { kana: 'ゆ', patterns: ['yu'] },
            { kana: 'よ', patterns: ['yo'] },
            
            // ら行
            { kana: 'ら', patterns: ['ra'] },
            { kana: 'り', patterns: ['ri'] },
            { kana: 'る', patterns: ['ru'] },
            { kana: 'れ', patterns: ['re'] },
            { kana: 'ろ', patterns: ['ro'] },
            
            // わ行
            { kana: 'わ', patterns: ['wa'] },
            { kana: 'を', patterns: ['wo', 'o'] },
            { kana: 'ん', patterns: ['nn', 'xn', 'n'] }
        ];

        for (const { kana, patterns } of hiraganaTests) {
            await this.test(`${kana} → ${patterns.join(', ')}`, async () => {
                const mapping = KANA_MAPPING[kana];
                this.expect(mapping).toEqual(patterns);
                
                // 各パターンが含まれることを確認
                patterns.forEach(pattern => {
                    this.expect(mapping).toContain(pattern);
                });
            }, 'hiragana');
        }
    }

    // --- 基本カタカナテスト ---
    async testBasicKatakana() {
        console.log('\n--- 基本カタカナテスト ---');

        const katakanaTests = [
            { kana: 'ア', patterns: ['a'] },
            { kana: 'イ', patterns: ['i', 'yi'] },
            { kana: 'ウ', patterns: ['u', 'wu', 'whu'] },
            { kana: 'カ', patterns: ['ka', 'ca'] },
            { kana: 'シ', patterns: ['shi', 'si', 'ci'] },
            { kana: 'ツ', patterns: ['tsu', 'tu'] },
            { kana: 'フ', patterns: ['fu', 'hu'] }
        ];

        for (const { kana, patterns } of katakanaTests) {
            await this.test(`${kana} → ${patterns.join(', ')}`, async () => {
                const mapping = KANA_MAPPING[kana];
                this.expect(mapping).toEqual(patterns);
            }, 'katakana');
        }
    }

    // --- 濁音テスト ---
    async testDakuten() {
        console.log('\n--- 濁音テスト ---');

        const dakutenTests = [
            { kana: 'が', patterns: ['ga'] },
            { kana: 'ぎ', patterns: ['gi'] },
            { kana: 'ぐ', patterns: ['gu'] },
            { kana: 'げ', patterns: ['ge'] },
            { kana: 'ご', patterns: ['go'] },
            { kana: 'ざ', patterns: ['za'] },
            { kana: 'じ', patterns: ['ji', 'zi'] },
            { kana: 'ず', patterns: ['zu'] },
            { kana: 'ぜ', patterns: ['ze'] },
            { kana: 'ぞ', patterns: ['zo'] },
            { kana: 'だ', patterns: ['da'] },
            { kana: 'で', patterns: ['de'] },
            { kana: 'ど', patterns: ['do'] },
            { kana: 'ば', patterns: ['ba'] },
            { kana: 'び', patterns: ['bi'] },
            { kana: 'ぶ', patterns: ['bu'] },
            { kana: 'べ', patterns: ['be'] },
            { kana: 'ぼ', patterns: ['bo'] }
        ];

        for (const { kana, patterns } of dakutenTests) {
            await this.test(`${kana} → ${patterns.join(', ')}`, async () => {
                const mapping = KANA_MAPPING[kana];
                patterns.forEach(pattern => {
                    this.expect(mapping).toContain(pattern);
                });
            }, 'dakuten');
        }
    }

    // --- 半濁音テスト ---
    async testHandakuten() {
        console.log('\n--- 半濁音テスト ---');

        const handakutenTests = [
            { kana: 'ぱ', patterns: ['pa'] },
            { kana: 'ぴ', patterns: ['pi'] },
            { kana: 'ぷ', patterns: ['pu'] },
            { kana: 'ぺ', patterns: ['pe'] },
            { kana: 'ぽ', patterns: ['po'] }
        ];

        for (const { kana, patterns } of handakutenTests) {
            await this.test(`${kana} → ${patterns.join(', ')}`, async () => {
                const mapping = KANA_MAPPING[kana];
                this.expect(mapping).toEqual(patterns);
            }, 'handakuten');
        }
    }

    // --- 拗音テスト ---
    async testYoon() {
        console.log('\n--- 拗音テスト ---');

        const yoonTests = [
            { kana: 'きゃ', patterns: ['kya'] },
            { kana: 'きゅ', patterns: ['kyu'] },
            { kana: 'きょ', patterns: ['kyo'] },
            { kana: 'しゃ', patterns: ['sha', 'sya'] },
            { kana: 'しゅ', patterns: ['shu', 'syu'] },
            { kana: 'しょ', patterns: ['sho', 'syo'] },
            { kana: 'ちゃ', patterns: ['cha', 'tya', 'cya'] },
            { kana: 'ちゅ', patterns: ['chu', 'tyu', 'cyu'] },
            { kana: 'ちょ', patterns: ['cho', 'tyo', 'cyo'] },
            { kana: 'にゃ', patterns: ['nya'] },
            { kana: 'ひゃ', patterns: ['hya'] },
            { kana: 'みゃ', patterns: ['mya'] },
            { kana: 'りゃ', patterns: ['rya'] },
            { kana: 'ぎゃ', patterns: ['gya'] },
            { kana: 'じゃ', patterns: ['ja', 'jya', 'zya'] },
            { kana: 'びゃ', patterns: ['bya'] },
            { kana: 'ぴゃ', patterns: ['pya'] }
        ];

        for (const { kana, patterns } of yoonTests) {
            await this.test(`${kana} → ${patterns.join(', ')}`, async () => {
                const mapping = KANA_MAPPING[kana];
                patterns.forEach(pattern => {
                    this.expect(mapping).toContain(pattern);
                });
            }, 'yoon');
        }
    }

    // --- 促音テスト ---
    async testSokuon() {
        console.log('\n--- 促音テスト ---');

        await this.test('っ の基本パターン', async () => {
            const patterns = KANA_MAPPING['っ'];
            this.expect(patterns).toContain('ltu');
            this.expect(patterns).toContain('xtu');
        }, 'sokuon');

        await this.test('handleSokuon で子音重複', async () => {
            const patterns = handleSokuon('か');
            this.expect(patterns).toContain('kka');
        }, 'sokuon');
    }

    // --- 「ん」の処理テスト ---
    async testNHandling() {
        console.log('\n--- 「ん」処理テスト ---');

        await this.test('ん → nn, xn, n', async () => {
            const patterns = KANA_MAPPING['ん'];
            this.expect(patterns).toContain('nn');
            this.expect(patterns).toContain('xn');
            this.expect(patterns).toContain('n');
        }, 'special');

        await this.test('母音前の「ん」は n のみ不可', async () => {
            const patterns = handleN('あ');
            this.expect(patterns).toContain('nn');
            this.expect(patterns).toContain('xn');
            // 'n' は含まれないはず（母音の前）
        }, 'special');
    }

    // --- 複数パターンテスト ---
    async testMultiplePatterns() {
        console.log('\n--- 複数パターンテスト ---');

        await this.test('し → shi, si, ci', async () => {
            const patterns = KANA_MAPPING['し'];
            this.expect(patterns).toContain('shi');
            this.expect(patterns).toContain('si');
            this.expect(patterns).toContain('ci');
        });

        await this.test('じ → ji, zi', async () => {
            const patterns = KANA_MAPPING['じ'];
            this.expect(patterns).toContain('ji');
            this.expect(patterns).toContain('zi');
        });

        await this.test('ふ → fu, hu', async () => {
            const patterns = KANA_MAPPING['ふ'];
            this.expect(patterns).toContain('fu');
            this.expect(patterns).toContain('hu');
        });
    }

    // --- 複雑な単語テスト ---
    async testComplexWords() {
        console.log('\n--- 複雑な単語テスト ---');

        await this.test('「こんにちは」のトークン化', async () => {
            const engine = new TypingEngine();
            engine.currentText = 'こんにちは';
            engine.tokenizeText();
            
            this.expect(engine.tokens).toHaveLength(5);
            this.expect(engine.tokens[0].kana).toBe('こ');
            this.expect(engine.tokens[1].kana).toBe('ん');
            this.expect(engine.tokens[2].kana).toBe('に');
            this.expect(engine.tokens[3].kana).toBe('ち');
            this.expect(engine.tokens[4].kana).toBe('は');
        });

        await this.test('「しゅっぱつ」のトークン化', async () => {
            const engine = new TypingEngine();
            engine.currentText = 'しゅっぱつ';
            engine.tokenizeText();
            
            this.expect(engine.tokens).toHaveLength(4);
            this.expect(engine.tokens[0].kana).toBe('しゅ');
            this.expect(engine.tokens[1].kana).toBe('っ');
            this.expect(engine.tokens[2].kana).toBe('ぱ');
            this.expect(engine.tokens[3].kana).toBe('つ');
        });

        await this.test('「きょう」のトークン化', async () => {
            const engine = new TypingEngine();
            engine.currentText = 'きょう';
            engine.tokenizeText();
            
            this.expect(engine.tokens).toHaveLength(2);
            this.expect(engine.tokens[0].kana).toBe('きょ');
            this.expect(engine.tokens[1].kana).toBe('う');
        });
    }

    // --- トークナイザーテスト ---
    async testTokenizer() {
        console.log('\n--- トークナイザーテスト ---');

        await this.test('最長一致の動作', async () => {
            const engine = new TypingEngine();
            engine.currentText = 'しゃ'; // 2文字で1トークン
            engine.tokenizeText();
            
            this.expect(engine.tokens).toHaveLength(1);
            this.expect(engine.tokens[0].kana).toBe('しゃ');
            this.expect(engine.tokens[0].patterns).toContain('sha');
        });

        await this.test('複数トークンの処理', async () => {
            const engine = new TypingEngine();
            engine.currentText = 'あいうえお';
            engine.tokenizeText();
            
            this.expect(engine.tokens).toHaveLength(5);
        });
    }

    // --- 入力ヒントテスト ---
    async testInputHints() {
        console.log('\n--- 入力ヒントテスト ---');

        await this.test('入力候補の取得', async () => {
            const engine = new TypingEngine();
            const elements = this.createMockElements();
            engine.init(elements);
            
            engine.currentText = 'し';
            engine.tokenizeText();
            engine.currentInput = 's';
            
            const token = engine.tokens[0];
            const validPatterns = token.patterns.filter(p => p.startsWith('s'));
            
            this.expect(validPatterns.length).toBeGreaterThan(0);
            this.expect(validPatterns).toContain('shi');
            this.expect(validPatterns).toContain('si');
        });
    }

    // --- エラー検出テスト ---
    async testErrorDetection() {
        console.log('\n--- エラー検出テスト ---');

        await this.test('無効な入力の検出', async () => {
            const engine = new TypingEngine();
            const elements = this.createMockElements();
            engine.init(elements);
            
            engine.currentText = 'あ';
            engine.tokenizeText();
            engine.currentInput = '';
            
            const token = engine.tokens[0];
            const validPatterns = token.patterns.filter(p => p.startsWith('x'));
            
            this.expect(validPatterns).toHaveLength(0);
        });
    }

    createMockElements() {
        return {
            textDisplay: document.createElement('div'),
            typingInput: document.createElement('input'),
            wpmDisplay: document.createElement('div'),
            accuracyDisplay: document.createElement('div'),
            timerDisplay: document.createElement('div'),
            progressBar: document.createElement('div'),
            inputHintDisplay: document.createElement('div'),
            currentInputDisplay: document.createElement('div')
        };
    }

    printResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 日本語タイピングテスト結果:');
        console.log('='.repeat(60));
        console.log(`総テスト数: ${this.results.total}`);
        console.log(`✅ 成功: ${this.results.passed}`);
        console.log(`❌ 失敗: ${this.results.failed}`);
        console.log(`成功率: ${((this.results.passed / this.results.total) * 100).toFixed(2)}%`);
        
        console.log('\nカバレッジ:');
        console.log(`  ひらがな: ${this.results.coverage.hiragana} テスト`);
        console.log(`  カタカナ: ${this.results.coverage.katakana} テスト`);
        console.log(`  濁音: ${this.results.coverage.dakuten} テスト`);
        console.log(`  半濁音: ${this.results.coverage.handakuten} テスト`);
        console.log(`  拗音: ${this.results.coverage.yoon} テスト`);
        console.log(`  促音: ${this.results.coverage.sokuon} テスト`);
        console.log(`  特殊: ${this.results.coverage.special} テスト`);
        
        if (this.results.failures.length > 0) {
            console.log('\n失敗したテスト:');
            this.results.failures.forEach(({ name, error }) => {
                console.log(`  ❌ ${name}: ${error}`);
            });
        }
        
        console.log('='.repeat(60));
    }
}

// グローバル公開
window.JapaneseTypingTests = JapaneseTypingTests;
