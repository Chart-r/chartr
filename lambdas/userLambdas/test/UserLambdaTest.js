import {handler} from "../UserLambda";

let AWS = require('aws-sdk-mock');
let assert = require('assert');

AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
    callback(null, "successfully posted item in database");
});

AWS.mock('DynamoDB.DocumentClient', 'delete', function (params, callback) {
    callback(null, "successfully deleted item in database");
});

AWS.mock('DynamoDB.DocumentClient', 'update', function (params, callback) {
    callback(null, "successfully updated item in database");
});

AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback) {
    callback(null, {Item: {email: "testPerson@gmail.com", name: "Test Person"}});
});


describe("Test suite for User Lambda", function () {
    it("Test get item from database", function () {
        let event = {
            httpMethod: "GET",
            body: "{}",
            queryStringParameters: {
                email: "testPerson@gmail.com"
            }
        };

        handler(event, null, callback);
        
        function callback(nothing, response) {
            assert.equal(response.statusCode, 200);

            let body = JSON.parse(response.body);

            assert.equal(body.email, "testPerson@gmail.com");
            assert.equal(body.name, "Test Person");
        }

    });
});