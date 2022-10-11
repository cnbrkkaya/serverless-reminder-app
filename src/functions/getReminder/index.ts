import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { v4 as uuidv4 } from "uuid";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const tableName = process.env.REMINDER_TABLE_NAME;

    const { userId } = event.pathParameters;

    if (!userId) {
      return formatJSONResponse({
        statusCode: 400,
        data: {
          message: "userId is required",
        },
      });
    }

    const data = await dynamo.query({
      tableName,
      index: "index1",
      pkValue: userId,
    });

    return formatJSONResponse({
      statusCode: 200,
      data,
    });
  } catch (error) {
    console.log("error", error);
    return formatJSONResponse({
      statusCode: 502,
      data: {
        message: error.message,
      },
    });
  }
};
