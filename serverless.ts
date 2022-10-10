import type { AWS } from "@serverless/typescript";

import functions from "./serverless/functions";
import dynamoResources from "./serverless/dynamoResources";

const serverlessConfiguration: AWS = {
  service: "reminderapp",
  frameworkVersion: "2",
  plugins: ["serverless-esbuild", "serverless-iam-roles-per-function"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    profile: "sls-profile-1",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb:*"],
        Resource: [
          "arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.reminderTable}",
          "arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.reminderTable}/index/index1",
        ],
      },
    ],

    region: "eu-central-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      REMINDER_TABLE_NAME: "${self:custom.reminderTable}",
      BASE_URL: {
        "Fn::Join": [
          "",
          [
            "https://",
            { Ref: "HttpApi" },
            ".execute-api.${self:provider.region}.amazonaws.com",
          ],
        ],
      },
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions,
  resources: {
    Resources: {
      ...dynamoResources,
    },
  },

  package: { individually: true },
  custom: {
    reminderTable: "${sls:stage}-reminder-table",
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
