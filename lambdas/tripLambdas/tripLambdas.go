package main

import (
	"errors"
	"log"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbattribute"
	"fmt"
	"encoding/json"
	"os"
	"github.com/google/uuid"
)

var (
	// ErrNameNotProvided is thrown when a name is not provided
	ErrNameNotProvided = errors.New("no name was provided in the HTTP body")
)

type Trip struct {
	ID string`json:"id"`
	Users map[string]string`json:"users"`
	StartLat float32`json:"start_lat"`
	StartLng float32`json:"start_lng"`
	EndLat float32`json:"end_lat"`
	EndLng float32`json:"end_lng"`
	StartTime int`json:"start_time"`
	EndTime int`json:"end_time"`
	Seats int`json:"seats"`
	Smoking bool`json:"smoking"`
	Price float32`json:"price"`
}

type User struct {
	Email string`json:"email"`
	Name string`json:"name"`
	Trips map[string]string`json:"trips"`
}

// Handler is your Lambda function handler
// It uses Amazon API Gateway request/responses provided by the aws-lambda-go/events package,
// However you could use other event sources (S3, Kinesis etc), or JSON-decoded primitive types such as 'string'.
func Handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	// stdout and stderr are sent to AWS CloudWatch Logs
	log.Printf("Processing Lambda request %s\n", request.RequestContext.RequestID)
	log.Printf("Method Type: %s\n", request.HTTPMethod)

	sess, err := session.NewSession(&aws.Config{
		Region: aws.String("us-east-2")},
	)

	svc := dynamodb.New(sess)

	if err != nil {
		fmt.Println(err.Error())
		return events.APIGatewayProxyResponse{}, err
	}

	switch request.HTTPMethod {
		case "POST":
			log.Print("Handling post trip")
			user := User{}
			trip := Trip{}

			log.Printf("Body: %s\n", request.Body)

			data := []byte(request.Body)

			// Get the user data from the JSON
			err = json.Unmarshal(data, &user)
			if err != nil {
				panic(fmt.Sprintf("Failed to unmarshal User, %v", err))
			}

			// Get the trip data from the JSON
			err = json.Unmarshal(data, &trip)
			if err != nil {
				panic(fmt.Sprintf("Failed to unmarshal Trip, %v", err))
			}
			// Add the creating user as the driver
			trip.Users=make(map[string]string)
			trip.Users[user.Email] = "Driver"
			trip.ID = uuid.New().String()

			log.Printf("Trip info: %s", trip)
			log.Printf("User info: %s", user)


			// Get current user info
			result, err := svc.GetItem(&dynamodb.GetItemInput{
				TableName: aws.String("User"),
				Key: map[string]*dynamodb.AttributeValue{
					"email": {
						S: aws.String(user.Email),
					},
				},
			})

			if err != nil {
				fmt.Println("1" + err.Error())
				os.Exit(0)
			}

			err = dynamodbattribute.UnmarshalMap(result.Item, &user)
			log.Printf("Grab user from database %s", user)

			if user.Trips == nil {
				user.Trips = make(map[string]string)
			}
			user.Trips[trip.ID] = "Driver"
			log.Printf("Make user trip: %s", user.Trips)
			var userTripDB =make(map[string]*dynamodb.AttributeValue)
			for k,v := range user.Trips {
				log.Printf("Key and Value pair: %s, %s", k, v)
				userTripDB[k]=&dynamodb.AttributeValue{S: &v,}
			}

			// Update the current user's trips to include created trip
			updateUserInput := &dynamodb.UpdateItemInput{
				ExpressionAttributeValues: map[string]*dynamodb.AttributeValue{
					":trip": {
						M: userTripDB,
					},
				},
				TableName: aws.String("User"),
				Key: map[string]*dynamodb.AttributeValue{
					"email": {
						S: aws.String(user.Email),
					},
				},
				ReturnValues:     aws.String("UPDATED_NEW"),
				UpdateExpression: aws.String("set trips = :trip"),
			}

			_, err = svc.UpdateItem(updateUserInput)

			if err != nil {
				fmt.Println(err.Error())
				os.Exit(1)
			}

			// Update the trips table with the created trip
			tripItem, err := dynamodbattribute.MarshalMap(trip)

			log.Printf("AV item, %s", tripItem)

			input := &dynamodb.PutItemInput{
				Item: tripItem,
				TableName: aws.String("Trip"),
			}

			_, err = svc.PutItem(input)

			if err != nil {
				fmt.Println("Got error calling PutItem:")
				fmt.Println(err.Error())
				os.Exit(1)
			}

			return events.APIGatewayProxyResponse{
				Body:       "Successfully created trip",
				StatusCode: 200,
			}, nil

		case "GET":
			params := &dynamodb.ScanInput{
				TableName: aws.String("Trip"),
			}
			result, err := svc.Scan(params)
			if err != nil {
				fmt.Errorf("Error %s", err)
			}

			obj := []Trip{}
			err = dynamodbattribute.UnmarshalListOfMaps(result.Items, &obj)
			if err != nil {
				fmt.Errorf("Error %s", err)
			}
			log.Printf("Trips data: %s", obj)

			j, err := json.Marshal(&obj)
			if err != nil {
				fmt.Println("Got error calling PutItem:")
				fmt.Println(err.Error())
				os.Exit(1)
			}

			return events.APIGatewayProxyResponse{
				Body:       string(j),
				StatusCode: 200,
			}, nil

		case "DELETE":
			log.Print("DELETE")
	}

	// If no name is provided in the HTTP request body, throw an error
	if len(request.Body) < 1 {
		return events.APIGatewayProxyResponse{}, ErrNameNotProvided
	}



}

func main() {
	lambda.Start(Handler)
}