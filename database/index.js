const mysql = require('mysql');
const config = require('../config.js');
const pool = mysql.createPool(config.DBOPTIONS);
pool.getConnection(function (error, connection) {
	if (error) throw error;
	console.log("Database Connected: %s", connection);
});

module.exports = {

    addParticipant: function (participant) {
        pool.query(`INSERT INTO participants VALUES(
                    ${participant.id},
                    ${participant.name},
                    ${participant.wake},
                    ${participant.sleep});`, function (error, results, fields) {
            if (error) throw error;
            else {
                console.log("New participant added: " + participant.name);
            }
        });
    },

    addResponse: function (response) {
        pool.query(`INSERT INTO responses VALUES(
                    ${response.time},
                    ${response.id},
                    ${response.response});`, function (error, results, fields) {
            if (error) throw error;
            else {
                console.log("New response added: " + response.time);
            }
        });
    },

    getParticipants: function (callback) {
        pool.query(`SELECT * FROM Survey.participants;`, function (error, results, fields) {
            if (error) {
                throw error;
            } else {
                let data = [];
                results.forEach(function (row) {
                    data.push({
                        id: row.id,
                        name: row.name,
                        wake: row.wake,
                        sleep: row.sleep
                    });
                });
                callback(data);
            }
        });
    },

    getResponses: function (participant_id, callback) {
        pool.query(`SELECT * FROM Survey.responses
                    WHERE id=${participant_id};`, function (error, results, fields) {
            if (error) {
                throw error;
            } else {
                let data = [];
                results.forEach(function (row) {
                    data.push({
                        time: row.time,
                        response: row.response
                    });
                });
                callback(data);
            }
        });
    }

}