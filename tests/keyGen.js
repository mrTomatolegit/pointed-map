const Util = require('../src/Util');
const rl = require('readline');

const samples = 10 ** 6;

console.log('Testing key generation with ' + samples + ' samples');

const set = new Set();

process.stdout.write(0 + '/' + samples);

for (let i = 0; i < samples; i++) {
    set.add(Util.generateUniqueKey());
    if (((i / samples) * 100) % 10 == 0) {
        rl.cursorTo(process.stdout, 0);
        process.stdout.write(i + '/' + samples);
    }
}

rl.cursorTo(process.stdout, 0);
console.log(`${set.size}/${samples} unique samples`);
if (set.size == samples) {
    process.env.executedFromAll ? (module.exports = true) : console.log('SUCCESS');
} else {
    process.env.executedFromAll ? (module.exports = false) : console.log('FAIL');
}
