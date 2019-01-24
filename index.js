const fs = require('fs');
const express = require('express');
const app = express();
const body_parse = require('body-parser')
const port = 8001;
//设置中间件
app.use(express.static('jet'));
app.use(body_parse.json());
app.use(body_parse.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.send("jet v1.0");
});

app.get('/getConfig', (req, res) => {
    fs.readFile('jet/config.json', (err, data) => {
        if (err) {
            console.error(err);
        } else {
            res.set('Content-Type', 'application/json; charset=UTF-8');
            res.send(data.toString());
        }
    });
});

app.get('/getFile/*', (req, res) => {
    let filePath = 'jet/' + req.path.substring(9);
    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                res.send(data.toString());
            }
        });
    } else {
        res.send('file not exist.');
    }
});

app.get('/m/*', (req, res) => {
    if (req.path.length > 3) {
        let filePath = 'jet/' + req.path.substring(3) + '.html';
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    let content = data.toString();
                    let matchAsset = content.match(/<asset>([\w\-\.]*?)<\/asset>/ig);
                    if (matchAsset) {
                        for (var i in matchAsset) {
                            let sourceFile = matchAsset[i].substring(7, matchAsset[i].length-8);
                            let extName = sourceFile.substring(sourceFile.lastIndexOf('.'), sourceFile.length);
                            if (extName == '.css') {
                                content = content.replace(matchAsset[i], '<link href="/'+sourceFile+'" type="text/css" rel="stylesheet" />');
                            } else if (extName == '.js') {
                                content = content.replace(matchAsset[i], '<script src="/'+sourceFile+'" type="text/javascript"></script>');
                            }
                        }
                    }
                    for (let k in req.query) {
                        content = content.replace('#'+k+'#', req.query[k]);
                    }
                    content = content.replace('app-page:back', 'javascript:history.back();');
                    content = content.replace('app-page:', '/m/');
                    content = content.replace('app-local:', '/image/');
                    res.set('Content-Type', 'text/html; charset=UTF-8');
                    res.send(content);
                }
            });
        } else {
            res.send('page not found.');
        }
    } else {
        res.send('url wrong.');
    }
});

app.post('/getTest', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.send('--> 来自服务端响应：'+req.body.username);
});

app.listen(port, () => {
    console.log('---->', 'jet service on line.');
});