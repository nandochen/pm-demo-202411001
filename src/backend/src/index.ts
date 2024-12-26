import express from "express";

// db 
let db = {
    key001: 'value001'
}

const endpoint: string = 'https://testnet.toncenter.com/api/v2/';
const key: string = '&api_key=12ef1fc91b0d4ee237475fed09efc66af909d83f72376c7c3c42bc9170847ecb';

const app = express();
app.use(express.json());

app.get('/backend-get', (req, res) => {
    res.send(`Response from backend (key001: ${db.key001})`);
});

app.post('/backend-set', (req, res) => { 
    db.key001 = 'value002';
    res.send(`Response from backend (key001: ${db.key001})`);
});

app.post('/getBalance', (req, res) => { 
    let address = req.body.address;
    const url = endpoint + 'getAddressBalance?address=' + address + key;
    try {
        fetch(url).then(res0 => {
            res0.text().then(t => {
                res.send(t);
            });
        });
    } catch (e) {
        res.send(`Error: ${e}<br />Url: ${url}`);
    }
});

app.post('/getTransactions', (req, res) => { 
    let address = req.body.address;
    const url = endpoint + 'getTransactions?address=' + address + key;
    try {
        fetch(url).then(res0 => {
            res0.text().then(t => {
                res.send(t);
            });
        });
    } catch (e) {
        res.send(`Error: ${e}<br />Url: ${url}`);
    }
});

app.get('/res-send', (req, res) => {
    res.send(`Call res-send`);
});

app.get('/res-write', (req, res) => {
    res.write('Why hello there sir');
    res.end();
});

app.get('/500', (req, res) => {
    res.sendStatus(500);
});

app.use(express.static('/dist'));

app.listen();