# Telegraf + InfluxDB + Giraffe ISS Location Monitor

This project monitors the position of the International Space Station using Telegraf, InfluxDB, React, and Giraffe!

ISS position data is retrieved from this API: http://open-notify.org/Open-Notify-API/ISS-Location-Now/

## What's inside:

**Client:**

React app created with [create-react-app](https://github.com/facebook/create-react-app) that uses Giraffe to render plots. See the `client` directory.

**Server**

ExpressJS server that uses both the [InfluxDB API](https://docs.influxdata.com/influxdb/v2.0/reference/api/) and the [influxdb-client-js](https://github.com/influxdata/influxdb-client-js) library to query data from an InfluxDB instance. See `server` directory.

**Telegraf**

Contains the `iss.conf` Telegraf config file that is used to poll ISS location data and forward it to InfluxDB. 

This Telegraf config uses the HTTP plugin to poll the ISS position API. It uses a converter plugin to convert the Lat and Long values to floats. Finally, it pushes the data to InfluxDB using the v2 plugin. 

## How to:

**Start Telegraf**

1. Download the Telegraf CLI
1. Create a InfluxDB token and put it in the `iss.conf` file along with your org id and InfluxDB url.
1. Run `telegraf --config ./telegraf/iss.conf`

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

# What does it do?

The Telegraf config polls the ISS location API every 10 seconds, parses the JSON data, and forwards the data to a InfluxDB bucket.

The server has two API endpoints. One for retrieving the *current* orbit of the ISS and one to query *historical* orbit data. The `/iss/current` endpoint tracks the current position of the ISS as it travels from West to East. The `/iss/history` endpoint takes a `min` query param and retrieves that much data. These queries differ because the *current* endpoint will not "wrap" tracks around the map unlike the *historical* endpoint. These queries use the `experimental/geo` Flux import.

The UI uses the Influx Giraffe library to render a `geo` plot with two layers: `trackMap` and `pointMap`. The track map renders the dashed line and the point map renders the markers. You can toggle between the two API endpoints using the radio buttons in the top left. If you select the "Historical" option, you can provide a value for the `min` parameter. 

![iss](images/iss.gif "ISS")

*Note: There is a bug in Giraffe that renders these awkward horizontal lines when the track data wraps. See https://github.com/influxdata/giraffe/issues/442*

# Credits

This project was inspired by Sean Brickley's [InfluxDB blog post](https://www.influxdata.com/blog/tracking-the-international-space-station-using-influxdb/) and used my [Giraffe-Playground](https://github.com/genehynson/giraffe-playground) repo as a starting point. Also thanks to the [Open Notify](http://open-notify.org/about.html) project for providing the ISS location API.