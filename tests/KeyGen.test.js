const Util = require('../src/Util');
const rl = require('readline');
const { test, expect } = require('@jest/globals');

test('Keys are unique', () => {
    const samples = 10 ** 6;
    const set = new Set();

    console.log('Testing key generation with ' + samples + ' samples');

    process.stdout.write(0 + '/' + samples);

    let i = 0;
    let interval = setInterval(() => {
        rl.cursorTo(process.stdout, 0);
        process.stdout.write(i + '/' + samples);
    }, 500);

    for (i = 0; i < samples; i++) {
        set.add(Util.generateUniqueKey());
    }

    clearInterval(interval);
    rl.cursorTo(process.stdout, 0);

    expect(set.size).toEqual(samples);
});
