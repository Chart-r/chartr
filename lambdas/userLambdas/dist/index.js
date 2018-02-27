'use strict';

console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context) {
    console.log("Entered function handler...");
    var method = event.httpMethod;

    if (method === "POST") {
        //Create a new user in the database
        console.log("Handling create user event");

        var bodyJson = JSON.parse(event.body);
        console.log("Body received: ", bodyJson);

        var parameters = {
            TableName: 'User',
            Item: bodyJson
        };

        docClient.put(parameters, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data);
            }
        });
    } else if (method === "GET") {
        //Retrieve an existing user from the database
        console.log("Handling get user event");

        var _bodyJson = JSON.parse(event.body);
        console.log("Body received: ", _bodyJson);

        var params = {
            TableName: "User",
            Key: _bodyJson
        };

        docClient.get(params, function (err, data) {
            if (err) console.log(err);else console.log(data["Item"]);

            context.done(null, data["Item"]);
        });
    } else if (method === "UPDATE") {
        console.log("Handling update user event");

        var _bodyJson2 = JSON.parse(event.body);
        console.log("Body received: ", _bodyJson2);

        var expression = "";
        var valueObject = {};
        var nameObject = {};

        Object.keys(_bodyJson2).forEach(function (key) {
            if (key.toString() !== "email") {
                var valueKey = ":" + Math.random().toString(36).substring(7);
                var nameKey = "#" + Math.random().toString(36).substring(7);

                expression += nameKey + " = " + valueKey + ", ";

                valueObject[valueKey] = _bodyJson2[key];
                nameObject[nameKey] = key.toString();
            }
        });

        expression = "set " + expression.substring(0, expression.length - 2);

        var _params = {
            TableName: "User",
            Key: {
                "email": _bodyJson2["email"]
            },
            UpdateExpression: expression,
            ExpressionAttributeValues: valueObject,
            ExpressionAttributeNames: nameObject
        };

        console.log(expression);
        console.log(valueObject);
        console.log(_params);

        docClient.update(_params, function (err, data) {
            if (err) console.log(err);else console.log(data);
        });
    } else if (method === "DELETE") {
        console.log("Handling delete user event");
    }
};
//# sourceMappingURL=index.js.map