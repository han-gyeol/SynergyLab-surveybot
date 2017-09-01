var restify = require('restify');
var startbot = require('./chatbot');
var clock = require('./clock.js');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

// Listen for facebook webhook
server.get('/', function(req, res) {
    res.send('Hello world, I am a chat bot');
});

// Listen for facebook webhook
server.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === process.env.FB_VERIFY_ACCESS_TOKEN) {
    	res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

// Listen for messages from users 
server.post('/webhook', function(req, res) {
        console.log("Received message");
        res.send('HELLO!');
});

startbot(server);