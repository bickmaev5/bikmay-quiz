const fetch = require('node-fetch');
const schedule = async () => {
    try {
        const r = await fetch('https://sheltered-reef-47163.herokuapp.com/');
        const s = await r.json();
        return s;
    } catch (e) {
        return e;
    }
}

const s = await schedule();
console.log(s);
