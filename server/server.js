#!/usr/bin/env node
const express = require('express')
const cors = require('cors')
const { InfluxDB, flux } = require('@influxdata/influxdb-client')

// vars to connect to bucket in influxdb
const baseURL = process.env.INFLUX_URL // url of your cloud instance
const influxToken = process.env.INFLUX_TOKEN; // create an all access token in the UI, export it as INFLUX_TOKEN
const orgID = process.env.ORG_ID // export your org id;
const bucket = process.env.BUCKET_NAME //export the name of your bucket

// connect to influxdb
const influxDB = new InfluxDB({ url: baseURL, token: influxToken })
const queryApi = influxDB.getQueryApi(orgID)

const issQuery = `from(bucket: "iss")
|> range(start: -24h)
|> filter(fn: (r) => r["_measurement"] == "iss")
|> filter(fn: (r) => r["_field"] == "iss_position_latitude" or r["_field"] == "iss_position_longitude")`;

// start the server
const app = express();
app.use(cors())
const port = 3001;

app.get('/iss', (_, res) => {
  let csv = ''
  let clientQuery = flux``+issQuery
  queryApi.queryLines(clientQuery, {
    next(line) {
      csv = `${csv}${line}\n`;
    },
    error(error) {
      console.error(error)
      console.log('\nFinished /iss ERROR')
      res.end()
    },
    complete() {
      console.log('\nFinished /iss SUCCESS')
      res.end(JSON.stringify({ csv }))
    },
  })
})

app.listen(port, () => {
  console.log(`listening on port :${port}`);
});
