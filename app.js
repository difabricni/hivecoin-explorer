var config = require('./config');

function getblock(blockhash, callback) {

    const http = require('node:http');

    var postData = JSON.stringify({
        'id': '0',
        'method': 'getblock',
        'params': [`${blockhash}`,
                1],
        'jsonrpc': '2.0'

    });

    var headers = {
        'Content-Type': 'application/json',
        'Content-Lenght': Buffer.byteLength(postData)
    };

    var options = {
        host: config.host,
        port: config.port,
        auth: (config.username + ":" + config.password),
        method: 'POST',
        headers: headers
    };

    const req = http.request(options, function (res) {
        const { statusCode } = res;

        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        };

        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            res.resume();
            //return;
        }

        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            callback(JSON.parse(rawData));
        });
    });
    req.write(postData);
    req.end();

};

function getrawtransaction(txid, callback) {
    
    const http = require('node:http');

    var postData = JSON.stringify({
        'id': '0',
        'method': 'getrawtransaction',
        'params': [`${txid}`,
                1],
        'jsonrpc': '2.0'

    });

    //console.log(postData);
    //{"id": 0, "method": "getrawtransaction", "params": ["01b40901ddc50ccdef0a6fabed6c103025a8d86abf7c577bfc0e976c0409d6b0",1], "jsonrpc": "2.0"}

    var headers = {
        'Content-Type': 'application/json',
        'Content-Lenght': Buffer.byteLength(postData)
    };

    var options = {
        host: config.host,
        port: config.port,
        auth: (config.username + ":" + config.password),
        method: 'POST',
        headers: headers
    };

    const req = http.request(options, function (res) {
        const { statusCode } = res;

        let error;
        // Any 2xx status code signals a successful response but
        // here we're only checking for 200.
        if (statusCode !== 200) {
            error = new Error('Request Failed.\n' +
                            `Status Code: ${statusCode}`);
        };

        if (error) {
            console.error(error.message);
            // Consume response data to free up memory
            res.resume();
            //return;
        }

        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
            callback(JSON.parse(rawData));
        });
    });
    req.write(postData);
    req.end();
};

function startWebsite(){

    const http = require('node:http');
    var express = require('express');

    var txpage = function(req, res, next) {
		var txid = req.params.txid || null;
		if (txid != null) {
            let hivetransaction = getrawtransaction(txid, function(hivetransaction)
            {
                res.header('Content-Type', 'text/html');
                res.render('txpage', { hivetransaction: JSON.stringify(hivetransaction.result) });
                //console.log(JSON.stringify(hivetransaction.result));
            });

        } else {
			next();
		}
	};

    var blockpage = function(req, res, next) {
        var blockhash = req.params.blockhash || null;
        if (blockhash != null) {
            let hiveblock = getblock(blockhash, function(hiveblock)
            {
                res.header('Content-Type', 'text/html');
                res.render('blockpage', { hiveblock: JSON.stringify(hiveblock.result) });
                //console.log(JSON.stringify(hiveblock.result));
            });
        } else {
            next();
        }
    }

    var app = express();
    //app.use(bodyParser.json());
    app.set("view engine", "ejs");
    //app.set("views", path.join(__dirname, "views"));

    app.get('/get/transaction/:txid', txpage);
    app.get('/get/block/:blockhash', blockpage)

    var server=app.listen(3000, function(err) {
        if (err) console.log(err);
        console.log("Server listening on PORT", 3000);
    });

};


/* let txid = 'c6de938f1a5aa1b1a7253e7df79ed95e44d7ad31821cfb33187496e86fb74a1c';
let hivetransaction = getrawtransaction(txid, function(hivetransaction)
{
    console.log(hivetransaction.result);
});
 */


/* let hivetransaction = getrawtransaction("sdfgsdf", function(hivetransaction)
{
    console.log(hivetransaction.result);
});
 */
startWebsite();
