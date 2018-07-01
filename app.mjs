import express from 'express';
import cors from 'cors';
import path from 'path';
import https from 'https';
import jsonLoader from 'load-json-file';

const app = express();
const apiRouter = express.Router();
const mainRouter = express.Router();

const currencyApiUrl = 'https://free.currencyconverterapi.com/api/v5';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

apiRouter.get('/convert', (req, res) => {
    var url = currencyApiUrl.concat(`/convert?q=${req.query.from}_${req.query.to}&compact=y`);
    var result;
    https.get(url, function(res) {
        var body = '';
        res.on('data', function(chunk) {
            body += chunk;
        });
        res.on('end', function() {
            try {
                result = JSON.parse(body);
                returnResult(result);
                /*console.log(jsonObj);
                var val = jsonObj[`${req.query.from}_${req.query.to}`];
                if(val) {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(jsonObj);
                    //cb(null, Math.random(total * 100) / 100);
                }
                else {
                    var err = new Error("Value not found for" + url);
                    console.log(err);
                    //cb(err);
                }*/
            } catch(e) {
                console.log("Parse error: ", e);
            }
        });
    }).on('error', function(e) {
        console.log("Got an error: ", e);
    });
    function returnResult(result){
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify(result));
    }
   console.log(`${req.query.from}, ${req.query.to}`);
});

mainRouter.get(['/', '/index'], (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
});

mainRouter.get(['/currencies'], (req,res) => {
    jsonLoader('currenices.json').then(data => {
        res.header("Content-Type", "application/json");
        res.send(JSON.stringify(data));
    });
})

app.use(cors());
app.use('/api', apiRouter);
app.use('/', mainRouter);
app.use(express.static('public'));

app.listen(3000, () => console.log('Running on localhost:' + 3000));
