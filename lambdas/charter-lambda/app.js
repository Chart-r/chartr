let express = require("express");
let cors = require("cors");
let app = express();
let bodyParser = require("body-parser");
const uuidv4 = require("uuid/v4");
let AWS = require("aws-sdk");
let docClient = new AWS.DynamoDB.DocumentClient();

app.use(cors());
app.use(bodyParser.json());

/**
 * Email function
 */

app.post("/email/confirmation", (req, res) => {
    let emailInfo = {
        "driverName": req.body.driverName,
        "riderName": req.body.riderName,
        "driverPhone": req.body.driverPhone,
        "riderPhone": req.body.riderPhone,
        "driverEmail": req.body.driverEmail,
        "riderEmail": req.body.riderEmail,
        "tripTime" : req.body.tripTime
    };

    AWS.config.update({region: "us-east-1"});

    let date = new Date(emailInfo.tripTime);
    let driverMessage = "You have accepted " + emailInfo.riderName + " on your trip which leaves on " +
                            date.toDateString() + ". You can contact your rider at the following number: " +
                            emailInfo.riderPhone + "\n\n Thank you for using Chartr!";
    let riderMessage = "Good news! You have been accepted on " + emailInfo.driverName + "'s trip which leaves on " +
                            date.toDateString() + ". You can contact your driver at the following number: " +
                            emailInfo.driverPhone + "\n\n Thank you for using Chartr!";

    // Create sendEmail params
    let driverEmailParams = {
        Destination: { /* required */
            ToAddresses: [
                emailInfo.driverEmail
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Text: {
                    Charset: "UTF-8",
                    Data: driverMessage
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Chartr Trip Confirmation"
            }
        },
        Source: "chartr.dev@gmail.com", /* required */
        ReplyToAddresses: [
            "chartr.dev@gmail.com"
        ],
    };

    let riderEmailParams = {
        Destination: { /* required */
            ToAddresses: [
                emailInfo.riderEmail
            ]
        },
        Message: { /* required */
            Body: { /* required */
                Text: {
                    Charset: "UTF-8",
                    Data: riderMessage
                }
            },
            Subject: {
                Charset: "UTF-8",
                Data: "Chartr Trip Confirmation"
            }
        },
        Source: "chartr.dev@gmail.com", /* required */
        ReplyToAddresses: [
            "chartr.dev@gmail.com"
        ],
    };

    // Create the promise and SES service object
    let driverPromise = new AWS.SES({apiVersion: "2010-12-01"}).sendEmail(driverEmailParams).promise();

    // Handle promise's fulfilled/rejected states
    driverPromise.then(
        function(data) {
            console.log(data.MessageId);

            let riderPromise = new AWS.SES({apiVersion: "2010-12-01"}).sendEmail(riderEmailParams).promise();

            riderPromise.then((data) => {
                console.log(data.MessageId);
                AWS.config.update({region: "us-east-2"});
                res.json("Success!");
            }).catch((err) => {
                console.log(err, err.stack);
                AWS.config.update({region: "us-east-2"});
                res.json("Failure...");
            });

        }).catch(
        function(err) {
            console.error(err, err.stack);
            AWS.config.update({region: "us-east-2"});
            res.json("Failure...");
        });
});



/** User Functions */

// Get User By Email
app.get('/user/:email', function(req,res){
    let email = req.params.email;

    let params = {
        TableName: 'UserTest',
        FilterExpression: "#email = :search",
        ExpressionAttributeNames: {
            "#email": "email"
        },
        ExpressionAttributeValues : {
            ":search" : email
        }
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            if (data["Items"][0] == null) {
                res.json("No user found")
            }
            res.json(data["Items"][0]);
        }
    });
});

// Get User By UID
app.get('/user/uid/:id', function(req,res){
    let id = req.params.id;

    let params = {
        TableName: 'UserTest',
        Key: {"uid":id},
    };

    docClient.get(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            if (data['Item'] == null) {
                res.json("No user found");
            }
            res.json(data['Item']);
        }
    });
});

// Post User
app.post("/user", function(req,res){
    let uid = uuidv4();
    let userData = {
        "uid": uid,
        "email": req.body.email,
        "name": req.body.name,
        "birthdate": req.body.birthdate,
        "phone": req.body.phone
    };

    let parameters = {
        TableName: "UserTest",
        Item: userData,
    };

    docClient.put(parameters, function(err, data) {
        if (err) {
            console.log("Error", err);
        }
        else {
            console.log("Success", data);
            res.json("Successful");
        }
    });
});

// Delete User
app.delete("/user/:id", function(req, res) {
    let id = req.params.id;

    let params = {
        TableName: "UserTest",
        Key: {"uid":id},
    };

    docClient.delete(params, function(err) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json("Successful");
        }
    });
});

/** Trip Functions **/

// Create a trip
app.post("/user/:uid/trip/", function(req,res){
    let uid = req.params.uid;
    let tid = uuidv4();

    let tripData = {
        "tid": tid,
        "end_lat": req.body.end_lat,
        "end_lng": req.body.end_lng,
        "end_time": req.body.end_time,
        "price": req.body.price,
        "seats": req.body.seats,
        "smoking": req.body.smoking,
        "start_lat": req.body.start_lat,
        "start_lng": req.body.start_lng,
        "start_time": req.body.start_time,
        "users": {
            [uid]: "driving"
        }
    };

    let parameters = {
        TableName: "TripTest",
        Item: tripData
    };

    docClient.put(parameters, function(err, data) {
        if (err) {
            console.log("Error", err);
        }
        else {
            console.log("Success", data);
            res.json("Successful");
        }
    });
});

// Get all trips
app.get("/trip", function(req,res){
    let params = {
        TableName: "TripTest",
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json(data["Items"]);
        }
    });
});

// Get current trips
app.get("/trip/current", function(req,res){
    let date = Date.now();

    let params = {
        TableName: "TripTest",
        FilterExpression: "#start_time > :date",
        ExpressionAttributeNames: {
            "#start_time": "start_time"
        },
        ExpressionAttributeValues : {
            ":date" : date
        }
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json(data["Items"]);
        }
    });
});

// Get all User's trips
app.get("/user/:uid/trip/", function(req,res){
    let id = req.params.uid;

    let params = {
        TableName: "TripTest",
        FilterExpression: "#users.#id > :filter",
        ExpressionAttributeNames: {
            "#users": "users",
            "#id": id
        },
        ExpressionAttributeValues : {
            ":filter" : " "
        }
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json(data["Items"]);
        }
    });
});


// Get specific trips
app.get("/trip/:tid", function(req,res){
    let tid = req.params.tid;

    let params = {
        TableName: "TripTest",
        Key: {"tid":tid}
    };

    docClient.get(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json(data["Items"]);
        }
    });
});

// Get User's Filtered trips
app.get("/user/:uid/trip/:filter", function(req,res){
    let id = req.params.uid;
    let filter = req.params.filter;

    let params = {
        TableName: "TripTest",
        FilterExpression: "#users.#id = :filter",
        ExpressionAttributeNames: {
            "#users": "users",
            "#id": id
        },
        ExpressionAttributeValues : {
            ":filter" : filter
        }
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json(data["Items"]);
        }
    });
});


// Update User Trip status
app.put("/user/:uid/trip/:tid/:state", function(req,res){
    let uid = req.params.uid;
    let tid = req.params.tid;
    let state = req.params.state;

    let params = {
        TableName: "TripTest",
        Key: {"tid": tid},
        UpdateExpression:"SET #users.#uid= :state",
        ExpressionAttributeNames: {
            "#users": "users",
            "#uid": uid
        },
        ExpressionAttributeValues: {
            ":state": state
        }
    };

    docClient.update(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        }
        else {
            console.log("Success", data);
            res.json("Successful");
        }
    });
});

// Delete Trip
app.delete("/trip/:tid", function(req, res) {
    let tid = req.params.tid;

    let params = {
        TableName: "TripTest",
        Key: {"tid":tid},
    };

    docClient.delete(params, function(err) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json("Successful");
        }
    });
});

/** Review Functions **/

// Post a review
app.post("/user/:uid/review/", function(req,res){
    let rid = uuidv4();
    let uid = req.params.uid;

    let reviewData = {
        "rid": rid,
        "reviewer": uid,
        "reviewee": req.body.reviewee,
        "trip": req.body.tid,
        "comment": req.body.comment,
        "rating": req.body.rating,
    };

    let parameters = {
        TableName: "ReviewTest",
        Item: reviewData
    };

    docClient.put(parameters, function(err, data) {
        if (err) {
            console.log("Error", err);
        }
        else {
            console.log("Success", data);
            updateRating(reviewData.reviewee, reviewData.rating, res);
        }
    });
});

// Get a review
app.get("/review/:rid", function(req,res){
    let rid = req.params.rid;

    let params = {
        TableName: "UserTest",
        Key: {"rid":rid},
    };

    docClient.get(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            if (data["Item"] == null) {
                res.json("No review found");
            }
            res.json(data["Item"]);
        }
    });
});

// Get all user's reviews
app.get("/user/:uid/review/", function(req,res){
    let uid = req.params.uid;

    let params = {
        TableName: "ReviewTest",
        FilterExpression: "#reviewee = :uid",
        ExpressionAttributeNames: {
            "#reviewee": "reviewee",
        },
        ExpressionAttributeValues : {
            ":uid" : uid
        }
    };

    docClient.scan(params, function(err, data) {
        if (err) {
            res.json("Error");
        }
        else {
            res.json(data["Items"]);
        }
    });
});

function updateRating(uid, rating, res) {

    let params = {
        TableName: "UserTest",
        Key: {"uid":uid}
    };

    docClient.get(params, function(err, data) {
        if (!err) {
            let newRating = rating;
            let currRating = data["Item"]["rating"];
            let numReview = data["Item"]["review_count"];
            if (numReview == null && currRating == null) {
                numReview = 1;
            }
            else {
                newRating = currRating * numReview + rating;
                numReview++;
                newRating /= numReview;
            }


            let params = {
                TableName: "UserTest",
                Key: {"uid": uid},
                UpdateExpression:"SET #rating = :newRating, #count = :reviewCount",
                ExpressionAttributeNames: {
                    "#rating": "rating",
                    "#count": "review_count"
                },
                ExpressionAttributeValues: {
                    ":newRating": newRating,
                    ":reviewCount" : numReview
                }
            };

            docClient.update(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                }
                else {
                    console.log("Success", data);
                    res.json("Success");
                }
            });

        }
    });
}

app.listen(3000, function(){console.log("started on port 3000");});

module.exports = app;
