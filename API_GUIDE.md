# chartr
Chartr: A New Way to Travel

# Endpoints:


# User Functions

## User Object Structure

    uid: String

    email: String,

    name: String,

    birthdate: String,

    phone: String

    rating: Double

    review_count: Int

## Get User

GET: /user/:email

Params:

    email: The email of the user to get

Notes:
 - If there are no users that match the email, it will return an empty list []

## Post User

POST: /user

Body:

    "email": email,

    "name": name,

    "birthdate": birthdate,

    "phone": phone

## Delete User

DELETE: /user/:id

Params:

    uid: The uid of the user to delete



# Trip Functions

## Trip Object Structure

    tid: String,

    end_lat: Double,

    end_lng: Double,

    end_time: Long,

    price: Int,

    seats: Int,

    smoking: Boolean,

    start_lat: Double,

    start_lng: Double

    users: {

        item1: "driving"

        item2: "riding"

        item3: "pending"

    }

## Create a trip

POST: /user/:uid/trip

Params:

    uid: The uid of the user creating the trip

Body:

    "end_lat": end_lat,

    "end_lng": end_lng,

    "end_time": end_time,

    "price": price,

    "seats": seats,

    "smoking": smoking,

    "start_lat": start_lat,

    "start_lng": start_lng,

    "start_time": start_time

Notes:
 - The user creating the trip will be set as the driver

## Get all trips

GET: /trip

## Get current trips (after current date)

GET: /trip/current

## Get all user's trip

GET: /user/:uid/trip

Params:

    uid: The uid of the user to get trips for

## Get specific trip

GET: /trip/:tid

Params:

    tid: The tid of the trip to get

# Get user's filtered trips

GET: /user/:uid/trip/:status

Params:　

    uid: The uid of the user to get the trips for

    status: The status to filter on

Notes:
 - Use only 'driving', 'pending', 'riding' for the status,
 all lowercase

# Update user's trip status

GET: /user/:uid/trip/:tid/:status

Params:

    uid: The uid of the user requesting or being accepted

    tid: The trip the user is requesting or being accepted

    status: The status of the user

Notes:
 - Use this function when users request to ride on a trip
 or are accepted onto a trip
 - Only use 'pending' (for making requests) and 'riding' (for accepting requests)

# Delete trip

DELETE: /trip/:tid

Params:

    tid: The tid of the trip being deleted



## Review functions

# Review Object Structure

    rid: String

    reviewer: String

    reviewee: String,

    trip: String,

    comment: String,

    rating: Double,

# Post a review

POST: /user/:uid/review

Body:

    "reviewee": reviewee_id,

    "trip": tid,

    "comment": comment,

    "rating": rating,

Params:

    uid: The uid of the user posting the review

Notes:
 - Make sure to set the uid as the reviewer and not the reviewee
 - Make sure to include the reviewee's uid in the body
 - This function should automatically update a user's rating

# Get a review

GET: /review/:rid

Params:

    rid: The rid of the review to get

# Get all of a user's review

GET: /user/:uid/review

Params:

    uid: The uid of the user to get all reviews for
