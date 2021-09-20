'use strict'


// Start Config Section

//Put your server tag name you can get this in @MTProxybot 
let ad_tag = 'a8184a25a40cd4a83fa4e8badd34e56f'

//Server Port
let port = 8080

// End of Config Section

const { MTProtoProxy } = require('mtprotoproxy');
const http = require('http');
const net = require('net');

let data = `{
    "users":[
        {"username":"mohammad1@gmail.com","password":"1234.","secret":"dd000000000000000000000000000000006d6f68616d6d61643140676d61696c2e636f6d","maxConnection":1},
        {"username":"mohammad2@gmail.com","password":"1234..","secret":"dd000000000000000000000000000000006d6f68616d6d61643240676d61696c2e636f6d","maxConnection":2},
        {"username":"mohammad3@gmail.com","password":"1234...","secret":"dd000000000000000000000000000000006d6f68616d6d61643340676d61696c2e636f6d","maxConnection":3},
        {"username":"mohammad4@gmail.com","password":"1234....","secret":"dd000000000000000000000000000000006d6f68616d6d61643440676d61696c2e636f6d","maxConnection":4}
    ]
}`
let db = JSON.parse(data)
let sec = []
db.users.forEach(user => {
    sec[user.secret] = { "max": user.maxConnection, "conCount": 0 }
})
// console.log(sec["dd000000000000000000000000000000006d6f68616d6d61643140676d61696c2e636f6d"].conCount)
let totalBytesRead = 0;
let totalBytesWritten = 0;
let totalConnections = 0
let ongoingConnections = 0
let stats = [];
let allowedClients = [];

let httpServer = http.createServer(function (req, res) {
    let p = req.url.toLowerCase();
    let ip = req.socket.remoteAddress;
    if (p === '/log') {
        res.write(`<html><h1>Dear ${req.socket.remoteAddress}, Welcome; Here is the report:</h1>
			<head>
			<style>
			table, th, td {
			  border: 1px solid black;
			  border-collapse: collapse;
			}
			th, td {
			  padding: 5px;
			  text-align: left;
			}
			</style>
			</head>`)
        res.end(`
			<h2>Statistics</h2>
			<div>totalBytesRead: ${totalBytesRead}</div>
			<div>totalBytesWritten: ${totalBytesWritten}</div>
			<div>totalConnections: ${totalConnections}</div>
			<div>ongoingConnections: ${ongoingConnections}</div>
			<h2>Log:</h2>
			<table style="width:100%">
			  <tr>
			    <th>Disconnected</th>
			    <th>Connection time</th>
			    <th>No</th>
			    <th>IP</th>
			    <th>PORT</th>
			    <th>Sent</th>
			    <th>Received</th>
			    <th>Error</th>
			    <th>Disconnetion time</th>
			  </tr>
			<tr>${stats.map(
            function (stat) {
                return '<td>' + Object.keys(stat).map(function (item) {
                    if ((item === 'ctime') || (item === 'dtime'))
                        return new Date(stat[item]).toLocaleString();
                    if (item === 'error') {
                        if (!stat[item])
                            return 'No error'
                        return stat[item].stack;
                    }
                    return stat[item];
                }).join('</td><td>')
            }).join('</tr><tr>') + '</td>'
            }</tr></table></html>`);
        return
    }
    if (p === '/clients') {
        res.write('<html><h1>Dear ' + req.socket.remoteAddress + ', Welcome; Here are the clients:</h1>')
        res.end(`<h2>Statistics</h2><div>totalBytesRead: ${totalBytesRead}</div><div>totalBytesWritten: ${totalBytesWritten}</div><div>totalConnections: ${totalConnections}</div><div>ongoingConnections: ${ongoingConnections}</div><h2>Current clients:</h2><div>${Object.keys(stats).filter(function (index) { return !stats[index].ended }).map(index => stats[index].address).join('</div><div>')}</div></html>`);
        return
    }
    res.end(`<html><h1>This website is under construction...</h1><div>Comeback later please.</div></html>`);
    return
});


let telegram = new MTProtoProxy(
    {
        secrets: sec,
        httpServer,
        async enter(options) {
            console.log(`New client:${options.address}`);
            ongoingConnections++;
            if (sec[options.secretIndex] && sec[options.secretIndex].conCount <= sec[options.secretIndex].max) {
                return ad_tag;
            }
            else {
                return new Error('Forbidden user');
            }
        },
        leave(options) {
            console.log('Client left:', options.address);
            totalBytesRead += options.bytesRead;
            totalBytesWritten += options.bytesWritten;
            totalConnections++;
            ongoingConnections--;
        },
        ready() {
            let proxy = net.createServer(telegram.proxy);
            proxy.on('error', function (err) { console.log(err) })
            proxy.listen(port, '0.0.0.0');
        }
    }
);