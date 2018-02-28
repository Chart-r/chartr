'use strict';

console.log('Loading event');
let AWS = require('aws-sdk');
let dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
let docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function(event, context) {
    console.log("Entered function handler...");
    let method = event.httpMethod;

    if (method === "POST") { //Create a new user in the database
        console.log("Handling create user event");

        let bodyJson = JSON.parse(event.body);
        console.log("Body received: ", bodyJson);

        let parameters = {
            TableName: 'User',
            Item: bodyJson
        };

        docClient.put(parameters, function(err, data) {
            if (err) {
                console.log("Error", err);
            }
            else {
                console.log("Success", data);
            }
        });
    }
    else if (method === "GET") { //Retrieve an existing user from the database
        console.log("Handling get user event");

        let bodyJson = event["queryStringParameters"];
        console.log("Body received: ", bodyJson);

        let params = {
            TableName: "User",
            Key: bodyJson
        };

        docClient.get(params, function(err, data) {
            if (err) console.log(err);
            else console.log(data["Item"]);

            context.done(null, data["Item"]);
        });

    }
    else if (method === "UPDATE") {
        console.log("Handling update user event");

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
            if (err) console.log(err);
            else console.log(data);
        });
    }
    else if (method === "DELETE") {
        console.log("Handling delete user event");

        let bodyJson = JSON.parse(event.body);
        console.log("Body received: ", bodyJson);

        let params = {
            TableName: "User",
            Key: bodyJson
        };

        docClient.delete(params, function(err, data) {
            if (err) console.log(err);
            else console.log(data);
        });
    }
};
