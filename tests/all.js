const fs = require('fs');
const { basename } = require('path');

const colors = {
    Reset: '\x1b[0m',
    FgGreen: '\x1b[32m',
    FgRed: '\x1b[31m',
    FgYellow: '\x1b[33m'
};

const addResetAfterText = string => {
    return `${string}${colors.Reset}`;
};

const greenText = string => {
    return `${colors.FgGreen}${addResetAfterText(string)}`;
};

const yellowText = string => {
    return `${colors.FgYellow}${addResetAfterText(string)}`;
};

const redText = string => {
    return `${colors.FgRed}${addResetAfterText(string)}`;
};

process.env.executedFromAll = true;

const files = fs.readdirSync(__dirname);

let reviews = 0;
let fails = 0;

files.forEach(file => {
    if (!file.endsWith('.js') || file === basename(__filename)) return;
    console.log('-'.repeat(60));
    console.log(file + ': ');
    const result = require(`./${file}`);
    if (typeof result == 'object') {
        console.log(yellowText('REQUIRES REVIEW'));
        reviews++;
    } else if (result) {
        console.log(greenText('SUCCESS'));
    } else {
        console.log(redText('FAIL'));
        fails++;
    }
});

console.log(yellowText(`\n\n>> ${reviews} tests require a review`));
const finalText = `>>> All tests executed with ${fails} failures`;
console.log(fails > 0 ? redText(finalText) : greenText(finalText));

(''); // Add a breakpoint on this line
