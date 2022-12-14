import { APIGatewayProxyEvent } from "aws-lambda";
import { formatJSONResponse } from "@libs/apiGateway";
import { dynamo } from "@libs/dynamo";
import { v4 as uuidv4 } from "uuid";

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const tableName = process.env.REMINDER_TABLE_NAME;
    const body = JSON.parse(event.body);
    const { email, phoneNumber, reminder, reminderDate } = body;

    const validationErrors = validateInputs({
      email,
      phoneNumber,
      reminder,
      reminderDate,
    });
    if (validationErrors) {
      return validationErrors;
    }

    const userId = email || phoneNumber;

    const data = {
      ...body,
      id: uuidv4(),
      TTL: reminderDate / 1000,
      pk: userId,
      sk: reminderDate.toString(),
    };

    await dynamo.write(data, tableName);

    return formatJSONResponse({
      statusCode: 200,
      data: {
        message: `Reminder is set for ${new Date(reminderDate).toDateString()}`,
        id: data.id,
      },
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

const validateInputs = ({
  email,
  phoneNumber,
  reminder,
  reminderDate,
}: {
  email?: string;
  phoneNumber?: string;
  reminder: string;
  reminderDate: number;
}) => {
  if (!email && !phoneNumber) {
    return formatJSONResponse({
      statusCode: 400,
      data: {
        message: "Email or phone number is required",
      },
    });
  }

  if (!reminder) {
    return formatJSONResponse({
      statusCode: 400,
      data: {
        message: "Reminder required to create a reminder",
      },
    });
  }

  if (!reminderDate) {
    return formatJSONResponse({
      statusCode: 400,
      data: {
        message: "reminderDate required to create a reminder",
      },
    });
  }
  return;
};
