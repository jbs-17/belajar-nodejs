const http = require('http');
const fs = require('fs');

const port = 1234
http.createServer((req, res) => {
    const url = req.url;
    if (url === '/favicon.ico') {
        res.end()
    }
    if (url === '/home') {
        fs.readFile('./index.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.write('Error: file not found!')
            } else {
                res.writeHead(200, { "content-type": 'text/html' })
                res.write(data)
                res.end()
            }
        })
        return
    } else if (url === '/about') {
        fs.readFile('./about.html', (err, data) => {
            if (err) {
                res.writeHead(404);
                res.write('Error: file not found!')
            } else {
                res.writeHead(200, { "content-type": 'text/html' })
                res.write(data)
                res.end()
            }
        })
        return
    }
    else { res.end() }
    res.end();
})
    .listen(port, () => {
        console.log(`Server bejalan di port ${port}`)
    })