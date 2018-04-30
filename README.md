# Chatr Web

Welcome to the Repository for Chartr Backend!

## Overview

This repository holds the code for our Chartr AWS Lambda which controls all of the backend functionality through AWS Api Gateway. 
The Lambda code is based upon AWS's "serverless" Lambda architecture and uses Node.js and Express to handle routed API calls. Currently, the backend supports Chartr by providing endpoints that retrieve and store data for the following actions:
* Creating new users
* Posting new trips
* Searching trips
* Requesting to join trips
* Accepting/rejecting interested riders from trips
* Viewing past trips
* Viewing posted/pending/confirmed trips

You can read more about the API specification over in the [API Guide](API_GUIDE.md).


## Contributors

* Christian Cygnus
* Marco Valentino
* Shin Taniguchi

## Contributing

The contributing guide can be found [here](CONTRIBUTING.md).

## Project Documentation

The final project documentation can be found [here](project_documentation.pdf). Each Express endpoint is commented with it's purpose, which can also be seen in the structure of the function call that defines it. For example, `app.get("/route/to/something", ...)` represents the endpoint for a `GET` request to `/route/to/something`. All comments should be maintained when developing the project futher, as discussed in the contribution guide.

## Installation

Development can take place on any computer with `Node.js` and `npm` installed. Simply:

1. Clone the repository
2. Navigate to the directory you cloned into
3. Run `npm install` to install dependencies

Then you can develop the lambda as you would any other JS project. When you want the Lambda to be deployed to our AWS instance, simply submit a pull request as per the guidelines in the contribution guide.
