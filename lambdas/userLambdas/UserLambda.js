'use strict';

console.log('Loading event');
let AWS = require('aws-sdk');

function handleUserPut(docClient, event, callback) {
    let bodyJson = JSON.parse(event.body);
    console.log("Body received: ", bodyJson);

    let expression = "";
    let valueObject = {};
    let nameObject = {};

    Object.keys(bodyJson).forEach((key) => {
        if (key.toString() !== "email") {
            let valueKey = ":" + Math.random().toString(36).substring(7);
            let nameKey = "#" + Math.random().toString(36).substring(7);

            expression += nameKey + " = " + valueKey + ", ";

            valueObject[valueKey] = bodyJson[key];
            nameObject[nameKey] = key.toString();
        }
    });

    expression = "set " + expression.substring(0, expression.length - 2);

    let params = {
        TableName: "User",
        Key: {
            "email": bodyJson["email"]
        },
        UpdateExpression: expression,
        ExpressionAttributeValues: valueObject,
        ExpressionAttributeNames: nameObject
    };

    console.log(expression);
    console.log(valueObject);
    console.log(params);

    docClient.update(params, (err, data) => {
        if (err) {
            console.log(err);

            writeAPIOutput(500, "Server error", callback);
        }
        else {
            console.log(data);

            writeAPIOutput(200, "Successfully updated user!", callback);
        }
    });
}

function handleUserDelete(docClient, event, callback) {
    let bodyJson = JSON.parse(event.body);
    console.log("Body received: ", bodyJson);

    let params = {
        TableName: "User",
        Key: bodyJson
    };

    docClient.delete(params, function (err, data) {
        if (err) {
            console.log(err);

            writeAPIOutput(500, "Server error", callback);
        }
        else {
            console.log(data);

            writeAPIOutput(200, "Successfully deleted user!", callback);
        }
    });
}

function handleUserGet(docClient, event, callback) {
    let bodyJson = event["queryStringParameters"];
    console.log("Body received: ", bodyJson);

    let params = {
        TableName: "User",
        Key: bodyJson
    };

    docClient.get(params, function (err, data) {
        if (err) {
            console.log(err);

            writeAPIOutput(500, err, callback);
        }
        else {
            console.log(data["Item"]);

            writeAPIOutput(200, data["Item"], callback)
        }
    });
}

function handleUserPost(docClient, event, callback) {
    let bodyJson = JSON.parse(event.body);
    console.log("Body received: ", bodyJson);

    let parameters = {
        TableName: 'User',
        Item: bodyJson
    };

    docClient.put(parameters, function (err, data) {
        if (err) {
            console.log("Error", err);

            writeAPIOutput(500, "Server error", callback);
        }
        else {
            console.log("Success", data);

            writeAPIOutput(200, "Successfully created user!", callback);
        }
    });
}

exports.handler = function(event, context, callback) {
    console.log("Entered function handler...");
    let dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
    let docClient = new AWS.DynamoDB.DocumentClient();

    let method = event.httpMethod;

    if (method === "POST") { //Create a new user in the database
        console.log("Handling create user event");

        handleUserPost(docClient, event, callback);
    }
    else if (method === "GET") { //Retrieve an existing user from the database
        console.log("Handling get user event");

        handleUserGet(docClient, event, callback);

    }
    else if (method === "PUT") {
        console.log("Handling update user event");
        handleUserPut(docClient, event, callback);
    }
    else if (method === "DELETE") {
        console.log("Handling delete user event");

        handleUserDelete(docClient, event, callback);
    }
};

function writeAPIOutput(statCode, bodyMessage, callback) {
    let response = {
        statusCode : statCode,
        body: JSON.stringify(bodyMessage)
    };

    callback(null, response);
}
