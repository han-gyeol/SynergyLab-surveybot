var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
    server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());


var bot = new builder.UniversalBot(connector, [
    function (session) {
        session.send("Hello friend! Thank you for participating our study!");
        session.beginDialog('askForWakeSleepTime');
    },
    function (session, results) {
        session.userData.profile = results.response;

        session.send(`Great! I will poke you to ask you questions sometime in between %s and %s :)
        Let's get to the trial questions!`, session.userData.profile.wakeUpTime, session.userData.profile.sleepTime);
        session.beginDialog('askQuestions');
    },
    function (session, results) {
        session.dialogData.answers = results.response;

        if (session.dialogData.answers.q4 === 'null') {
            session.send("Thank you for your response! Your responses were (%s), (%s), (%s)",
                session.dialogData.answers.q1, session.dialogData.answers.q2, session.dialogData.answers.q3);
        }
        else {
            session.send("Thank you for your response! Your responses were (%s), (%s), (%s), (%s), (%s), (%s)",
            session.dialogData.answers.q1, session.dialogData.answers.q2, session.dialogData.answers.q3,
            session.dialogData.answers.q4, session.dialogData.answers.q5, session.dialogData.answers.q6);
        }
        session.endDialog();
    }
]);

bot.dialog('askForWakeSleepTime', [
    function (session) {
        session.dialogData.profile = {};
        builder.Prompts.text(session, "Would you tell me what time you usually wake up? (e.g.: 07:00)");
    },
    function (session, results) {
        session.dialogData.profile.wakeUpTime = results.response;
        builder.Prompts.text(session, "Would you tell me what time you usually go to sleep? (e.g.: 23:00)");
    },
    function (session, results) {
        session.dialogData.profile.sleepTime = results.response;
        session.endDialogWithResult({ response: session.dialogData.profile });
    }
]);

bot.dialog('askQuestions', [
    // Question 1
    function (session) {
        session.dialogData.answers = {};
        builder.Prompts.choice(session,
`Right now, I feel happy:\n
a.  1 = Not at all\n
b.  2\n
c.  3 = Neutral\n
d.  4\n
e.  5 = Very much so\n`,
             ["a","b","c","d","e"],
             { listStyle: 3 }
        );
    },

    // Question 2
    function (session, results) {
        session.dialogData.answers.q1 = results.response.entity;
        session.send("Your response of (%s) has been saved.", results.response.entity);
        builder.Prompts.choice(session,
`Right now, I feel good about myself.\n
a.  1 = Strongly disagree\n
b.  2\n
c.  3\n
d.  4 = Neither disagree nor agree\n
e.  5\n
f.  6\n
g.  7 = Strongly agree\n`,
             ["a","b","c","d","e","f","g"],
             { listStyle: 3 }
        );
    },

    // Question 3
    function (session, results) {
        session.dialogData.answers.q2 = results.response.entity;
        session.send("Your response of (%s) has been saved.", results.response.entity);
        builder.Prompts.text(session,
`In the past 20 minutes, I was with:\n
a.  My boyfriend / girlfriend / partner / spouse\n
b.  Friends / colleagues / schoolmates\n
c.  Family\n
d.  Alone\n
e.  Others (please specify. E.g. e(my professor))\n
*select all that apply. E.g. a,b,d OR b,e(my professor)\n
*if you were alone, please type 'f' or 'alone'`
        );
    },

    // Question 4
    function (session, results, next) {
        session.dialogData.answers.q3 = results.response;
        session.send("Your response of (%s) has been saved.", results.response);
        
        if (session.dialogData.answers.q3 === 'f' || session.dialogData.answers.q3 === 'alone') {
            next();
        }
        else {
            builder.Prompts.choice(session,
`In the past 20 minutes, the person/people I was with made me feel:\n
a.  1 = Completely excluded\n
b.  2\n
c.  3 = Neutral\n
d.  4\n
e.  5 = Completely included\n`,
                 ["a","b","c","d","e"],
                 { listStyle: 3 }
            );
        }
    },

    // Question 5
    function (session, results, next) {
        if (session.dialogData.answers.q3 === 'f' || session.dialogData.answers.q3 === 'alone') {
            session.dialogData.answers.q4 = 'null';
            next();
        }
        else {
            session.dialogData.answers.q4 = results.response.entity;
            session.send("Your response of (%s) has been saved.", session.dialogData.answers.q4);
            builder.Prompts.choice(session,
`In the past 20 minutes, the person/people I was with:\n
a.  Used their mobile phone\n
b.  Did not use their mobile phone\n`,
                 ["a","b"],
                 { listStyle: 3 }
            );
        }
    },

    // Question 6
    function (session, results, next) {
        if (session.dialogData.answers.q3 === 'f' || session.dialogData.answers.q3 ===  'alone') {
            session.dialogData.answers.q5 = 'null';
            next();
        }
        else {
            session.dialogData.answers.q5 = results.response.entity;
            session.send("Your response of (%s) has been saved.", session.dialogData.answers.q5);
            builder.Prompts.choice(session,
`In the past 20 minutes, I:\n
a.  1 = Not at all\n
b.  2\n
c.  3 = Neutral\n
d.  4\n
e.  5 = Very much so\n`,
                ["a","b","c","d","e"],
                { listStyle: 3 }
            );
        }
    },
    function (session, results) {
        if (session.dialogData.answers.q3 === 'f' || session.dialogData.answers.q3 ===  'alone') {
            session.dialogData.answers.q6 = 'null';
        }
        else {
            session.dialogData.answers.q6 = results.response.entity;
            session.send("Your response of (%s) has been saved.", session.dialogData.answers.q6);
        }
        session.endDialogWithResult({ response: session.dialogData.answers });
    }
]);