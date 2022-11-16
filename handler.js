const serverless = require("serverless-http");
const express = require("express");
const app = express();
const getSearchResults = require('./libs/google-search');
const AWS = require("aws-sdk");
const lambda = new AWS.Lambda()
app.use(express.json());
app.get("/", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from root!",
  });
});

app.get("/hello", (req, res, next) => {
  return res.status(200).json({
    message: "Hello from path!",
  });
});
app.post("/scrapeGoogle", async (req, res, next) => {
  try {
    const { kw } = req?.body
    const ip = req?.headers["x-forwarded-for"] || req?.socket?.remoteAddress;
    console.log("IP", ip);
    const result = await getSearchResults(kw);
    const funcConfig = lambda.getFunction({
      FunctionName: 'scrape-google-dev-scrapeGoogle',
    })
    let status = (await funcConfig.promise()).Configuration.LastUpdateStatus
    console.log(status)
    while (status === "InProgress") {
      status = (await funcConfig.promise()).Configuration.LastUpdateStatus
    }
    await lambda.updateFunctionConfiguration({
      FunctionName: 'scrape-google-dev-scrapeGoogle',
      Environment: {
        Variables: {}
      }
    }).promise();
    console.log(result);
    return res.status(200).json({
      result
    });
  }
  catch (e) {
    console.log(e)
    return res.status(500).json({
      message: e?.message
    });
  }
});


app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
