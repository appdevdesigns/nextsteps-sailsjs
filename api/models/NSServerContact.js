/**
 * NSServerContact
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    tableName: 'nextsteps_contact',

    attributes: {

        contact_uuid	: 'STRING',


        contact_firstname	: 'STRING',


        contact_lastname	: 'STRING',


        contact_nickname	: 'STRING',


        campus_uuid	: 'STRING',


        year_id	: 'INT',


        contact_phone	: 'STRING',


        contact_email	: 'STRING',


        contact_notes	: 'STRING',
        
        // Generate transaction entry
        transaction: function(operation, lang, cb) {
            var dfd = $.Deferred();
            var xEntry = {  'operation': operation,
                            'model': 'Contact',
                            'params': {
                                'contact_uuid' : this.contact_uuid                                
                            } 
                         };
            if (operation != "destroy") {
               xEntry.params.contact_firstname = this.contact_firstname;
               xEntry.params.contact_lastname  = this.contact_lastname;
               xEntry.params.contact_nickname  = this.contact_nickname;
               xEntry.params.campus_uuid       = this.campus_uuid;
               xEntry.params.year_id           = this.year_id;
               xEntry.params.contact_phone     = this.contact_phone;
               xEntry.params.contact_email     = this.contact_email;
               xEntry.params.contact_notes     = this.contact_notes;
            }
            
            if (cb) {
                cb(xEntry);
            }
            dfd.resolve(xEntry);
            
            return dfd;
        }, // transaction


        users: function(filter, cb) {
            var dfd = $.Deferred();

            if (typeof cb == 'undefined') {
                if (typeof filter == 'function') {
                    cb = filter;
                    filter = {};
                }
            }

            filter = filter || {};
            DBHelper.manyThrough(NSServerUserContact, {contact_uuid:this.contact_uuid}, NSServerUser, 'user_uuid', 'user_uuid', filter)
            .then(function(listUsers) {
                if (cb) {
                    cb(null, listUsers);
                }
                dfd.resolve(listUsers);
            })
            .fail(function(err){
                if (cb) {
                    cb(err);
                }
                dfd.reject(err);
            });
            return dfd;
        }
        
    }, // attributes

    //  Life cycle callbacks
    afterCreate: function(entry, cb) {
        // Nothing to do here.
        cb();
    },

    afterUpdate: function(entry, cb) {
        NSServerContact.findOne(entry.id)
        .then(function(contact){
            // Notify all users
            contact.users().
            then(function(users){
                var numDone = 0;
                var numToDo = 0;
                users.forEach(function(user){
                    DBHelper.addTransaction('update', contact, user)
                    .then(function(){
                        numDone++;
                        if (numDone == numToDo){
                            cb(null);
                        }
                    })
                    .fail(function(err){
                        cb(err);
                    });
                    numToDo++;
                });
                if (numToDo == 0){
                    cb(null);
                }
            })
            .fail(function(err){
                cb(err);
            });
        })
        .fail(function(err){
            cb(err);
        });
    }

};
