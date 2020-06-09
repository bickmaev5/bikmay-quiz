const fetch = require('node-fetch');

const parser = async () => {
    const res = await fetch('https://www.wowprogress.com/pve/ru');
    console.log(res);
};

const main = async () => {
    const result = await parser();
};

main();