const fetch = require('node-fetch');
const schedule = async () => {
    const r = await fetch('https://sheltered-reef-47163.herokuapp.com/');
    const s = await r.json();
    return s;
}

const s = await schedule();
console.log(s);
