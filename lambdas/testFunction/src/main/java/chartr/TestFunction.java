package chartr;

import java.io.*;

import com.amazonaws.services.lambda.runtime.RequestStreamHandler;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;


import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.ParseException;
import org.json.simple.parser.JSONParser;

public class TestFunction implements RequestStreamHandler
{
    JSONParser parser;

    public void handleRequest(InputStream inputStream, OutputStream outputStream, Context context) throws IOException {
        parser = getParser();

        LambdaLogger logger = context.getLogger();
        logger.log("Loading Java Lambda handler of ProxyWithStream");

        BufferedReader reader = getReader(inputStream);
        JSONObject responseJson = new JSONObject();
        String responseCode = "200";

        String queryString = "I GOT NOTHING...";
        String bodyString = "I GOT NOTHING...";

        try {
            JSONObject event = (JSONObject)parser.parse(reader);
            if (event.get("queryStringParameters") != null) {
                JSONObject qps = (JSONObject)event.get("queryStringParameters");
                if ( qps.get("testParam") != null) {
                    queryString = (String)qps.get("testParam");
                }
            }

            if (event.get("body") != null) {
                JSONObject body = (JSONObject)parser.parse((String)event.get("body"));
                if ( body.get("time") != null) {
                    bodyString = (String)body.get("time");
                }
            }

            String resultString = "You passed in a query string \"" + queryString + "\" and a body of \"" + bodyString + "\"";


            JSONObject responseBody = new JSONObject();
            responseBody.put("input", event.toJSONString());
            responseBody.put("message", resultString);

            JSONObject headerJson = new JSONObject();
            headerJson.put("x-custom-header", "my custom header value");

            responseJson.put("isBase64Encoded", false);
            responseJson.put("statusCode", responseCode);
            responseJson.put("headers", headerJson);
            responseJson.put("body", responseBody.toString());

        } catch(ParseException pex) {
            responseJson.put("statusCode", "400");
            responseJson.put("exception", pex);
        }

        logger.log(responseJson.toJSONString());
        OutputStreamWriter writer = getWriter(outputStream);
        writer.write(responseJson.toJSONString());
        writer.close();
    }

    public OutputStreamWriter getWriter(OutputStream outputStream) throws UnsupportedEncodingException {
        return new OutputStreamWriter(outputStream, "UTF-8");
    }

    public JSONParser getParser() {
        return new JSONParser();
    }

    public BufferedReader getReader(InputStream inputStream) {
        return new BufferedReader(new InputStreamReader(inputStream));
    }
}
