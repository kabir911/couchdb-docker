#!/usr/bin/node

var adapter = require('./events/mysql-adapter.js');
var cvr = adapter();

console.log('Replication deamon starting, connecting to mysql ...');
// Connect to mysql
cvr.connect();

// Read the last seq
var get_last_seq_sql = cvr.config.queries.get_seq;
cvr.mysql.query(get_last_seq_sql, function (err, results) {
    if (err) throw err;
    const last_seq = results[0].seq;
    console.log('Last sequence is', last_seq);
    if (last_seq != '') {
        cvr.setSince(last_seq);
    }

    // Listen for couchdb changes
    cvr.listen();

    cvr.on('created', function (docNotify) {
        var self = this;
        var insert = this.config.queries.insert;
        var update = this.config.queries.update;
        var last_seq_sql = this.config.queries.last_seq;
        console.log( 'Creation notify seq', docNotify.seq);
        this.database.get(docNotify.id, function (err, doc) {
            if (err) throw err;
            self.mysql.beginTransaction(function(err) {
                if (err) { 
                    self.mysql.rollback(function() {
                        throw err;
                    });
                } else {
                    mysql_doc = { 'doc_id': doc._id, 'seq': docNotify.seq, 'doc': JSON.stringify(doc) };
                    console.log( 'Creating mysql doc', doc._id);                    
                    self.mysql.query(insert, mysql_doc, function(err, res) {
                        if (err) { 
                            console.log( 'INSERT ERROR!' );
                            self.mysql.rollback( function() {
                                throw err;
                            });
                        } else {
                            self.mysql.query(last_seq_sql, { "seq" : docNotify.seq }, function(err, res) {
                                if (err) { 
                                    self.mysql.rollback( function() {
                                        throw err;
                                    });
                                } else {
                                    self.mysql.commit( function(err) {
                                        if (err) { 
                                            self.mysql.rollback( function() {
                                                throw err;
                                            });
                                        }
                                        console.log('Transaction Complete.');
                                        // self.mysql.end();
                                    });
                                }
                            });                            
                        }
                    });
                }
            });
        });
    });

    cvr.on('updated', function(doc) {
        var query = this.config.queries.update;
        var last_seq_sql = this.config.queries.last_seq;
        var self = this;
        
        console.log( 'Updating seq', doc.seq);
        mysql_doc = { 'doc_id' : doc.id, 'doc': JSON.stringify(doc), 'seq': doc.seq };    
        self.mysql.beginTransaction(function(err) {
            if (err) { 
                self.mysql.rollback(function() {
                    throw err;
                });
            } else {
                self.mysql.query(query, [ mysql_doc, doc.id ], function (err, res) {
                    if (err) { 
                        self.mysql.rollback(function() {
                            throw err;
                        });
                    } else {
                        self.mysql.query(last_seq_sql, { "seq" : doc.seq }, function (err, res) {
                            if (err) { 
                                self.mysql.rollback(function() {
                                    throw err;
                                });
                            } else {
                                self.mysql.commit(function(err) {
                                    if (err) { 
                                        self.mysql.rollback(function() {
                                            throw err;
                                        });
                                    }
                                    console.log('Transaction Complete.');
                                    // self.mysql.end();
                                });
                            }
                        });                        
                    }
                });
            }
        });
    });

    cvr.on('deleted', function (doc) {
        var query = this.config.queries.delete;
        var last_seq_sql = this.config.queries.last_seq;
        var self = this;

        console.log( 'Deleting seq', doc.seq);
        self.mysql.beginTransaction(function(err) {
            if (err) { 
                self.mysql.rollback(function() {
                    throw err;
                });
            } else {
                self.mysql.query(query, doc.id, function (err) {
                    if (err) { 
                        self.mysql.rollback(function() {
                            throw err;
                        });
                    } else {
                        self.mysql.query(last_seq_sql, { "seq" : doc.seq }, function (err, res) {
                            if (err) { 
                                self.mysql.rollback(function() {
                                    throw err;
                                });
                            } else {
                                self.mysql.commit(function(err) {
                                    if (err) { 
                                        self.mysql.rollback(function() {
                                            throw err;
                                        });
                                    }
                                    console.log('Transaction Complete.');
                                    // self.mysql.end();
                                });
                            }
                        });                        
                    }
                });
            }
        });
    });

    console.log('Replication deamon from couchdb to mysql running ...');
});

// TODO: A separate rebuild script is required to completely rebuild the mysql copy from the couchdb, traverse _all_docs or use _changes since start

