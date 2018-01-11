var follow = require('follow');
var nano = require('nano');
var mysql = require('mysql');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var CONFIG = require('../configuration/config');

function MysqlAdapter (config) {
    if (!(this instanceof MysqlAdapter)) return new MysqlAdapter(config);
    this.config = config || CONFIG;
    this.mysql = this.parseMySQL();
    // TODO: Connect to mysql and retrive the last sequence number and set the since option on coucdb accordingly
    this.couch = this.config.couch;
    this.database = require('nano')(this.couch.db);
}

util.inherits(MysqlAdapter, EventEmitter);

MysqlAdapter.prototype.parseMySQL = function () {
    return mysql.createConnection({
        host : this.config.mySQL.host,
        user : this.config.mySQL.user,
        password : this.config.mySQL.password,
        database : this.config.mySQL.database
    });
};

MysqlAdapter.prototype.connect = function () {
    var self = this;
    this.mysql.connect(function (err) {
        if (err) throw err;        
    });
};

MysqlAdapter.prototype.setSince = function (seq) {
    this.couch.since = seq;
}

MysqlAdapter.prototype.listen = function () {
    var self = this;
    follow(this.couch, function (err, change) {
        if (err) throw err;
        self.handle(change);
    });
};

MysqlAdapter.prototype.handle = function (change) {
    if (change.deleted) {
        this.sync(change, 'deleted');
    } else if (change.changes[0].rev[0] != '1') {
        this.sync(change, 'updated');
    } else {
        this.sync(change, 'created');
    } 
};

MysqlAdapter.prototype.sync = function (change, status) {
    this.emit(status, change);
};

module.exports = MysqlAdapter;