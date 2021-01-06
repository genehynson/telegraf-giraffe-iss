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

// start the server
const app = express();
app.use(cors())
const port = 3001;

// returns historical data as a single track. Minutes are taken as a parameter
app.get('/iss/history', (req, res) => {
  let csv = ''
  const issHistoryQuery = `
  import "experimental/geo"
  from(bucket: "iss")
  |> range(start: -${req.query.min}m)
  |> aggregateWindow(every: 3m, fn: min, createEmpty: false)
  |> geo.shapeData(latField: "iss_position_latitude", lonField: "iss_position_longitude", level: 14)
  |> geo.asTracks()`;
  let clientQuery = flux``+issHistoryQuery
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

// returns the current orbit from West to East as a single track.
app.get('/iss/current', (_, res) => {
  let csv = ''
  const issCurrentQuery = `
  import "experimental/geo"
  currentPos = from(bucket: "iss")
  |> range(start: -1m)
  |> filter(fn: (r) => r._field == "iss_position_longitude")
  |> tail(n: 1)
  |> findRecord(
    fn: (key) => true,
    idx: 0
  )

  from(bucket: "iss")
  |> range(start: -93m)
  |> aggregateWindow(every: 3m, fn: min, createEmpty: false)
  |> geo.shapeData(latField: "iss_position_latitude", lonField: "iss_position_longitude", level: 14)
  |> filter(fn: (r) => r.lon <= currentPos._value)
  |> geo.asTracks()`
  let clientQuery = flux``+issCurrentQuery
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
