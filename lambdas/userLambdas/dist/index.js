'use strict';

console.log('Loading event');
var AWS = require('aws-sdk');
var dynamodb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });
var docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = function (event, context, callback) {
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

                writeAPIOutput(500, "Server error", callback);
            } else {
                console.log("Success", data);

                writeAPIOutput(200, "Successfully created user!", callback);
            }
        });
    } else if (method === "GET") {
        //Retrieve an existing user from the database
        console.log("Handling get user event");

        var _bodyJson = event["queryStringParameters"];
        console.log("Body received: ", _bodyJson);

        var params = {
            TableName: "User",
            Key: _bodyJson
        };

        docClient.get(params, function (err, data) {
            if (err) {
                console.log(err);

                writeAPIOutput(500, err, callback);
            } else {
                console.log(data["Item"]);

                writeAPIOutput(200, data["Item"], callback);
            }
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
            if (err) {
                console.log(err);

                writeAPIOutput(500, "Server error", callback);
            } else {
                console.log(data);

                writeAPIOutput(200, "Successfully updated user!", callback);
            }
        });
    } else if (method === "DELETE") {
        console.log("Handling delete user event");

        var _bodyJson3 = JSON.parse(event.body);
        console.log("Body received: ", _bodyJson3);

        var _params2 = {
            TableName: "User",
            Key: _bodyJson3
        };

        docClient.delete(_params2, function (err, data) {
            if (err) {
                console.log(err);

                writeAPIOutput(500, "Server error", callback);
            } else {
                console.log(data);

                writeAPIOutput(200, "Successfully deleted user!", callback);
            }
        });
    }
};

function writeAPIOutput(statCode, bodyMessage, callback) {
    var response = {
        statusCode: statCode,
        body: JSON.stringify(bodyMessage)
    };

    callback(null, response);
}
//# sourceMappingURL=index.js.map