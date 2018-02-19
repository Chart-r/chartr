import chartr.TestFunction;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.Test;
import org.mockito.Mockito;

import java.io.*;

public class TestFunctionTest
{
    @Test
    public void testNoInput() throws IOException, ParseException {
        InputStream input = Mockito.mock(InputStream.class);
        OutputStream output = Mockito.mock(OutputStream.class);
        Context context = Mockito.mock(Context.class);
        LambdaLogger logger = Mockito.mock(LambdaLogger.class);
        JSONParser parser = Mockito.mock(JSONParser.class);
        OutputStreamWriter writer = Mockito.mock(OutputStreamWriter.class);

        Mockito.when(context.getLogger()).thenReturn(logger);

        TestFunction victim = Mockito.mock(TestFunction.class);
        BufferedReader bufferedReader = Mockito.mock(BufferedReader.class);

        Mockito.when(victim.getReader(Mockito.isA(InputStream.class))).thenReturn(bufferedReader);
        Mockito.when(victim.getParser()).thenReturn(parser);
        Mockito.when(victim.getWriter(Mockito.isA(OutputStream.class))).thenReturn(writer);
        Mockito.when(parser.parse(Mockito.isA(BufferedReader.class))).thenReturn(new JSONObject());
        Mockito.when(parser.parse(Mockito.isA(String.class))).thenReturn(new JSONObject());

        Mockito.doCallRealMethod().when(victim).handleRequest(Mockito.isA(InputStream.class), Mockito.isA(OutputStream.class), Mockito.isA(Context.class));
        victim.handleRequest(input, output, context);
    }
}
