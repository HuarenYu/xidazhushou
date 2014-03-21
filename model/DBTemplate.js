var mysql = require('mysql'),
    config = require('../config/config'),
    connectionPool = mysql.createPool({
        host     : config['database']['host'],
        user     : config['database']['user'],
        password : config['database']['password'],
        database : config['database']['dbname']
    });

exports.query = function(sql, params, fn) {
    connectionPool.getConnection(function(error, connection) {
        if (error) {
            fn(error);
            return;
        }
        connection.query(sql, params, function(error, rows) {
            connection.release();
            if (error) {
                fn(error);
                return;
            }
            fn(null, rows);
        });
    });
};

exports.getConnection = function(fn) {
    connectionPool.getConnection(fn);
};