package main

import (
	"log"
	"testing"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/dynamodb"
	"github.com/aws/aws-sdk-go/service/dynamodb/dynamodbiface"
)

type mockDynamoDBClient struct {
	dynamodbiface.DynamoDBAPI
}

func (m *mockDynamoDBClient) GetItem(input *dynamodb.GetItemInput) (*dynamodb.GetItemOutput, error) {
	// mock response/functionality
	log.Printf("Mock GetItem called")
	var output = new(dynamodb.GetItemOutput)
	output.Item = make(map[string]*dynamodb.AttributeValue)
	output.Item["email"] = &dynamodb.AttributeValue{S: aws.String("joe.smitty@gmail.com")}
	var err error
	log.Printf("Mock GetItem returning")
	return output, err
}

func (m *mockDynamoDBClient) UpdateItem(input *dynamodb.UpdateItemInput) (*dynamodb.UpdateItemOutput, error) {
	// mock response/functionality
	log.Printf("Mock UpdateItem called")
	var output = new(dynamodb.UpdateItemOutput)
	var err error
	log.Printf("Mock UpdateItem returning")
	return output, err
}

func (m *mockDynamoDBClient) PutItem(input *dynamodb.PutItemInput) (*dynamodb.PutItemOutput, error) {
	// mock response/functionality
	log.Printf("Mock PutItem called")
	var output = new(dynamodb.PutItemOutput)
	var err error
	log.Printf("Mock PutItem returning")
	return output, err
}

func (m *mockDynamoDBClient) Scan(*dynamodb.ScanInput) (*dynamodb.ScanOutput, error) {
	// mock response/functionality
	log.Printf("Mock Scan called")
	var output = new(dynamodb.ScanOutput)
	output.Items = append(output.Items, make(map[string]*dynamodb.AttributeValue))
	output.Items[0]["id"] = &dynamodb.AttributeValue{S: aws.String("12345")}
	var err error
	log.Printf("Mock Scan returning")
	return output, err
}

func TestHandler(t *testing.T) {
	// Setup Test
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	mockSvc := &mockDynamoDBClient{}
	var request events.APIGatewayProxyRequest
	request.HTTPMethod = "POST"
	request.Body = "{\"email\":\"joe.smitty@gmail.com\",\"start_lat\":1.0,\"start_lng\":1.0,\"end_lat\":1.0,\"end_lng\":1.0,\"start_time\":1234,\"end_time\":2345,\"seats\":4,\"smoking\":false,\"price\":5.00}"
	returnValue, _ := ProcessRequest(mockSvc, request)
	if returnValue.StatusCode != 200 {
		t.Errorf("StatusCode, got: %d, want: %d.", returnValue.StatusCode, 200)
	}

	request.HTTPMethod = "GET"
	returnValue, _ = ProcessRequest(mockSvc, request)
	if returnValue.StatusCode != 200 {
		t.Errorf("StatusCode, got: %d, want: %d.", returnValue.StatusCode, 200)
	}
}
