let request = require('supertest');

let AWS = require('aws-sdk-mock');

AWS.mock('DynamoDB.DocumentClient', 'put', function(params, callback) {
    callback(null, 'successfully posted item in database');
});

AWS.mock('DynamoDB.DocumentClient', 'delete', function(params, callback) {
    callback(null, 'successfully deleted item in database');
});

AWS.mock('DynamoDB.DocumentClient', 'update', function(params, callback) {
    callback(null, 'successfully updated item in database');
});

AWS.mock('DynamoDB.DocumentClient', 'scan', function(params, callback) {
    callback(null, {
        Items:
            {
                name: 'Test Person'
            }
    });
});

AWS.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
    callback(null, {
        Item:
            {
                name: 'Test Person'
            }
    });
});


describe('loading express', function () {
    let server;
    let hook;


    before(function (done) {
        delete require.cache[require.resolve('./../app')];
        server = require('./../app');
        hook = server.listen(done);
    });

    after(function (done) {
        hook.close(done);
    });

    /**
     * GET REQUEST TESTS
     */

    it('responds to GET /user/:email', function testSlash(done) {
        request(server)
            .get('/user/cygnus2@illinois.edu')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('responds to GET /trip', function testSlash(done) {
        request(server)
            .get('/trip')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('responds to GET /trip/current', function testSlash(done) {
        request(server)
            .get('/trip/current')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('responds to GET /user/:uid/trip/', function testSlash(done) {
        request(server)
            .get('/user/12345/trip/')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('responds to GET /trip/:tid', function testSlash(done) {
        request(server)
            .get('/trip/12345')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('responds to GET /user/:uid/trip/:filter', function testSlash(done) {
        request(server)
            .get('/user/12345/trip/all')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('responds to GET /review/:rid', function testSlash(done) {
        request(server)
            .get('/review/12345')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    it('responds to GET /user/12345/review/', function testSlash(done) {
        request(server)
            .get('/user/12345/review/')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });

    /**
     * POST REQUEST TESTS
     */
    it('responds to POST /user', function testSlash(done) {
        request(server)
            .post('/user')
            .send({ email: "test@test.net", name: "Tester man", birthdate: "2/22/2222", phone: "8888888888"})
            .expect(200, done)
            .expect('"Successful"');
    });

    it('responds to POST /user/:uid/trip/', function testSlash(done) {
        request(server)
            .post('/user/1234/trip/')
            .send({ email: "test@test.net", name: "Tester man", birthdate: "2/22/2222", phone: "8888888888"})
            .expect(200, done)
            .expect('"Successful"');
    });

    it('responds to POST /user/:uid/review/', function testSlash(done) {
        request(server)
            .post('/user/12345/review/')
            .send({ email: "test@test.net", name: "Tester man", birthdate: "2/22/2222", phone: "8888888888"})
            .expect(200, done)
            .expect('"Success"');
    });


    /**
     * DELETE REQUEST TESTS
     */
    it('responds to DELETE /user/:id', function testSlash(done) {
        request(server)
            .delete('/user/12345')
            .send({ email: "test@test.net", name: "Tester man", birthdate: "2/22/2222", phone: "8888888888"})
            .expect(200, done)
            .expect('"Successful"');
    });

    it('responds to DELETE /trip/:tid', function testSlash(done) {
        request(server)
            .delete('/trip/12345')
            .send({ email: "test@test.net", name: "Tester man", birthdate: "2/22/2222", phone: "8888888888"})
            .expect(200, done)
            .expect('"Successful"');
    });


    /**
     * PUT REQUEST TESTS
     */
    it('responds to PUT /user/:uid/trip/:tid/:state', function testSlash(done) {
        request(server)
            .put('/user/12345/trip/6789/pending')
            .send({ email: "test@test.net", name: "Tester man", birthdate: "2/22/2222", phone: "8888888888"})
            .expect(200, done)
            .expect('"Successful"');
    });


    /**
     * FAILURE TESTS
     */

    it('404 everything else', function testPath(done) {
        request(server)
            .get('/user')
            .expect(404, done);
    });
});
