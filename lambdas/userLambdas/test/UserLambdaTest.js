import {handler} from '../UserLambda';

let AWS = require('aws-sdk-mock');
let assert = require('assert');

AWS.mock('DynamoDB.DocumentClient', 'put', function(params, callback) {
    callback(null, 'successfully posted item in database');
});

AWS.mock('DynamoDB.DocumentClient', 'delete', function(params, callback) {
    callback(null, 'successfully deleted item in database');
});

AWS.mock('DynamoDB.DocumentClient', 'update', function(params, callback) {
    callback(null, 'successfully updated item in database');
});

AWS.mock('DynamoDB.DocumentClient', 'get', function(params, callback) {
    callback(null, {Item: {
        email: 'testPerson@gmail.com',
            name: 'Test Person'}});
});


describe('Test suite for User Lambda', function() {
    it('Test get user from database', function() {
        let event = {
            httpMethod: 'GET',
            body: '{}',
            queryStringParameters: {
                email: 'joe.smitty@gmail.com',
            },
        };

        handler(event, null, callback);

        /**
         * Callback function for the Lambda event handler to verify
         * JSON output
         * @param {object} nothing Expect to be null
         * @param {string} response Response from the API gateway invocation
         */
        function callback(nothing, response) {
            assert.equal(response.statusCode, 200);

            let body = JSON.parse(response.body);

            assert.equal(body.email, 'testPerson@gmail.com');
            assert.equal(body.name, 'Test Person');
        }
    });

    it('Test update user from database', function() {
        let event = {
            httpMethod: 'PUT',
            body: '{"email":"joe.smitty@gmail.com",' +
            '"name":"Joe Smitty","rating":"5"}',
        };

        handler(event, null, callback);

        /**
         * Callback function for the Lambda event handler to verify
         * JSON output
         * @param {object} nothing Expect to be null
         * @param {string} response Response from the API gateway invocation
         */
        function callback(nothing, response) {
            assert.equal(response.statusCode, 200);

            let body = JSON.parse(response.body);

            assert.equal(body, 'Successfully updated user!');
        }
    });

    it('Test delete user from database', function() {
        let event = {
            httpMethod: 'DELETE',
            body: '{"email":"joe.smitty@gmail.com"}',
        };

        handler(event, null, callback);

        /**
         * Callback function for the Lambda event handler to verify
         * JSON output
         * @param {object} nothing Expect to be null
         * @param {string} response Response from the API gateway invocation
         */
        function callback(nothing, response) {
            assert.equal(response.statusCode, 200);

            let body = JSON.parse(response.body);

            assert.equal(body, 'Successfully deleted user!');
        }
    });

    it('Test post user into database', function() {
        let event = {
            httpMethod: 'POST',
            body: '{"email":"joe.smitty@gmail.com","name":"Joe Smitty"}',
        };

        handler(event, null, callback);

        /**
         * Callback function for the Lambda event handler to verify
         * JSON output
         * @param {object} nothing Expect to be null
         * @param {string} response Response from the API gateway invocation
         */
        function callback(nothing, response) {
            assert.equal(response.statusCode, 200);

            let body = JSON.parse(response.body);

            assert.equal(body, 'Successfully created user!');
        }
    });
});
