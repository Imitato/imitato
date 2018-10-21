# imitato-serverless
Backend for Imitato.

## Example

In addition to a basic Lambda function and Express server, the `example` directory includes a [Swagger file](http://swagger.io/specification/), [CloudFormation template](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/) with [Serverless Application Model (SAM)](https://github.com/awslabs/serverless-application-model), and helper scripts to help you set up and manage your application.

### Steps for running the project
This guide assumes you have already [set up an AWS account](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html) and have the latest version of the [AWS CLI](https://aws.amazon.com/cli/) installed.

1) Run `export ACCOUNT_ID=<awsAccountId>`
2) Run `./setup.sh`. This will configure the project and modifies `package.json`, `simple-proxy-api.yaml` and `cloudformation.yaml`.
2.1) If using windows, use npm run win-setup instead of npm run setup. This step installs the node dependencies, creates an S3 bucket (if it does not already exist), packages and deploys your serverless Express application to AWS Lambda, and creates an API Gateway proxy API.
3) After the setup command completes, open the AWS CloudFormation console https://console.aws.amazon.com/cloudformation/home and switch to the region you specified. Select the `AwsServerlessExpressStack` stack, then click the `ApiUrl` value under the __Outputs__ section - this will open a new page with your running API. The API index lists the resources available in the example Express server (`app.js`), along with example `curl` commands.

Note: If you would want to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. If you specified a new bucket in the `config` command for step 1 and want to delete that bucket, run `npm run delete-bucket`.

## Node.js version

This example was written against Node.js version 6.10
