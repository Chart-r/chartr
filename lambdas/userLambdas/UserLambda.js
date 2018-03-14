'use strict';

console.log('Loading event');
let AWS = require('aws-sdk');

/**
 * Handles a user PUT request using the given doc client.
 * Expects correct formatting of the body of the
 * request to directly pass into the Database
 *
 * @param {object} docClient Initialized Document Client
 * @param {object} event Event from the API invocation (JSON)
 * @param {function} callback Callback for returning from the lambda
 */
function handleUserPut(docClient, event, callback) {
    let bodyJson = JSON.parse(event.body);
    console.log('Body received: ', bodyJson);

    let expression = '';
    let valueObject = {};
    let nameObject = {};

    Object.keys(bodyJson).forEach((key) => {
        if (key.toString() !== 'email') {
            let valueKey = ':' + Math.random().toString(36).substring(7);
            let nameKey = '#' + Math.random().toString(36).substring(7);

            expression += nameKey + ' = ' + valueKey + ', ';

            valueObject[valueKey] = bodyJson[key];
            nameObject[nameKey] = key.toString();
        }
    });

    expression = 'set ' + expression.substring(0, expression.length - 2);

    let params = {
        TableName: 'User',
        Key: {
            'email': bodyJson['email'],
        },
        UpdateExpression: expression,
        ExpressionAttributeValues: valueObject,
        ExpressionAttributeNames: nameObject,
    };

    console.log(expression);
    console.log(valueObject);
    console.log(params);

    docClient.update(params, (err, data) => {
        if (err) {
            console.log(err);

            writeAPIOutput(500, 'Server error', callback);
        } else {
            console.log(data);

            writeAPIOutput(200, 'Successfully updated user!', callback);
        }
    });
}

/**
 * Handles a user DELETE request using the given doc client.
 * Expects correct formatting of the body of the
 * request to directly pass into the Database
 *
 * @param {object} docClient Initialized Document Client
 * @param {object} event Event from the API invocation (JSON)
 * @param {function} callback Callback for returning from the lambda
 */
function handleUserDelete(docClient, event, callback) {
    let bodyJson = JSON.parse(event.body);
    console.log('Body received: ', bodyJson);

    let params = {
        TableName: 'User',
        Key: bodyJson,
    };

    docClient.delete(params, function(err, data) {
        if (err) {
            console.log(err);

            writeAPIOutput(500, 'Server error', callback);
        } else {
            console.log(data);

            writeAPIOutput(200, 'Successfully deleted user!', callback);
        }
    });
}

/**
 * Handles a user GET request using the given doc client.
 * Expects correct formatting of the body of the
 * request to directly pass into the Database
 *
 * @param {object} docClient Initialized Document Client
 * @param {object} event Event from the API invocation (JSON)
 * @param {function} callback Callback for returning from the lambda
 */
function handleUserGet(docClient, event, callback) {
    let bodyJson = event['queryStringParameters'];
    console.log('Body received: ', bodyJson);

    let params = {
        TableName: 'User',
        Key: bodyJson,
    };

    docClient.get(params, function(err, data) {
        if (err) {
            console.log(err);

            writeAPIOutput(500, err, callback);
        } else {
            console.log(data['Item']);

            writeAPIOutput(200, data['Item'], callback);
        }
    });
}

/**
 * Handles a user POST request using the given doc client.
 * Expects correct formatting of the body of the request to
 * directly pass into the Database
 *
 * @param {object} docClient Initialized Document Client
 * @param {object} event Event from the API invocation (JSON)
 * @param {function} callback Callback for returning from the lambda
 */
function handleUserPost(docClient, event, callback) {
    let bodyJson = JSON.parse(event.body);
    console.log('Body received: ', bodyJson);

    let parameters = {
        TableName: 'User',
        Item: bodyJson,
    };

    docClient.put(parameters, function(err, data) {
        if (err) {
            console.log('Error', err);

            writeAPIOutput(500, 'Server error', callback);
        } else {
            console.log('Success', data);

            writeAPIOutput(200, 'Successfully created user!', callback);
        }
    });
}

/**
 * Main handler for a Lambda invocation.
 * Event will contain the JSON of the API Gateway call, and callback
 * must be called to return from invocation.
 *
 * @param {object} event JSON Information from API gateway
 * @param {object} context Context info provided by Lambda
 * @param {function} callback Callback to call to return from the function
 */
exports.handler = function(event, context, callback) {
    console.log('Entered function handler...');
    let docClient = new AWS.DynamoDB.DocumentClient();

    let method = event.httpMethod;

    if (method === 'POST') { // Create a new user
        console.log('Handling create user event');

        handleUserPost(docClient, event, callback);
    } else if (method === 'GET') { // Retrieve an existing user
        console.log('Handling get user event');

        handleUserGet(docClient, event, callback);
    } else if (method === 'PUT') { // Update existing user
        console.log('Handling update user event');
        handleUserPut(docClient, event, callback);
    } else if (method === 'DELETE') { // Delete existing user
        console.log('Handling delete user event');

        handleUserDelete(docClient, event, callback);
    }
};

/**
 * Write the status code and body message out API gateway
 * @param {number} statCode Status code of the response
 * @param {object} bodyMessage Message to return to the invoker
 * @param {function} callback Callback from Lambda invocation
 */
function writeAPIOutput(statCode, bodyMessage, callback) {
    let response = {
        statusCode: statCode,
        body: JSON.stringify(bodyMessage),
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    };

    callback(null, response);
}
