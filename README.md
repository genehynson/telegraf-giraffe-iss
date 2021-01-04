# Telegraf + Giraffe ISS Location Monitor

TODO

## What's inside:

**Client:**

React app created with [create-react-app](https://github.com/facebook/create-react-app) that uses Giraffe to render plots. See the `client` directory.

**Server**

ExpressJS server that uses both the [InfluxDB API](https://docs.influxdata.com/influxdb/v2.0/reference/api/) and the [influxdb-client-js](https://github.com/influxdata/influxdb-client-js) library to query data from an InfluxDB instance. See `server` directory.

## How to:

**Start server**

1. Navigate to `server` directory in terminal
1. Export your environment variables

```sh
export INFLUX_URL=http://localhost:9999
export INFLUX_TOKEN=foo
export ORG_ID=1234
export BUCKET_NAME=my-bucket
```
1. `npm install`
1. `npm run server`
1. Server starts at `localhost:3001`

**Start UI**

1. Navigate to `client` directory in second terminal
1. `npm install`
1. `npm start`
1. Navigate to `localhost:3000`

# Examples

TODO

# Credits

This project was inspired by Sean Brickley's [InfluxDB blog post](https://www.influxdata.com/blog/tracking-the-international-space-station-using-influxdb/) and used my [Giraffe-Playground](https://github.com/genehynson/giraffe-playground) repo as a starting point.