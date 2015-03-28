/**
 * Created by ridho on 27/03/15.
 */
var appRoot = require('app-root-path');
var uuid = require('node-uuid');
var assert = require('assert');

var request = require('superagent');
var expect = require('expect.js');


describe('user_model', function(){
    // connect to db
    var db = require(appRoot + '/libs/core/database.js');
    var User = require(appRoot + '/modules/accounts/Users.js');
    var Account = require(appRoot + '/modules/accounts');

    var pwd = "1";

    var params = {
        username: "rpl",
        role: "user",
        email: "r@rpl.im",
        password: "1"
    };

    beforeEach(function(done){
        params = {
            username: "rpl",
            role: "user",
            email: "r@rpl.im",
            password: "1"
        };

        done();
    });

    describe('create a user', function(){
        it('should create a user by posting', function(done){
            params.username += uuid.v1({msecs: new Date().getTime()});

            // initial post with this username
            var account = new Account();
            account.signUp(
                function failedSignUp(err) {
                    console.log("kudune koplo");
                    assert.equal(2,1);
                    done();
                },
                params,
                function successSignUp(user) {
                    assert.equal(1,1);
                    done();
                }
            );
        });

        it('should failed because incomplete param', function(done){
            params.username += uuid.v1({msecs: new Date().getTime()});
            params.email = null;

            var account = new Account();
            account.signUp(
                function failedSignUp(err) {
                    assert.equal(1,1);
                    done();
                },
                params,
                function successSignUp(user) {
                    console.log("kudune fafa")
                    assert.equal(1,2);
                    done();
                }
            );
        });

        it('should failed because incomplete param', function(done){
            params.username = null;
            params.email = "r@rpl.im";

            var account = new Account();
            account.signUp(
                function failedSignUp(err) {
                    assert.equal(1,1);
                    done();
                },
                params,
                function successSignUp(user) {
                    console.log("kudune araw")
                    assert.equal(1,2);
                    done();
                }
            );
        });

        it('should failed because there is already the same username', function(done){
            params.username += "rere_" + uuid.v1({msecs: new Date().getTime()});
            params.email = "r@rpl.im";

            // initial post with this username
            var account = new Account();
            account.signUp(
                function failedSignUp(err) {
                    console.log("kudune koplo")
                    assert.equal(1, 2);
                    done();
                },
                params,
                function successSignUp(user) {
                    var account = new Account();
                    account.signUp(
                        function failedSignUp(err) {
                            assert.equal(1,1);
                            done();
                        },
                        params,
                        function successSignUp(user) {
                            console.log("kudune koplo")
                            assert.equal(2,1);
                            done();
                        }
                    );
                }
            );
        });
    });
});

