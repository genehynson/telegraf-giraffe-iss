import React from 'react'
import {fromFlux, Plot} from '@influxdata/giraffe'
import axios from 'axios'

const REASONABLE_API_REFRESH_RATE = 20000;
const osmTileServerConfiguration = {
  tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}

export class GeoTracksPlot extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      table: {},
      lastUpdated: ''
    };

  }

  animationFrameId = 0;
  style = {
    width: "calc(100vw - 100px)",
    height: "calc(90vh - 90px)",
    margin: "50px",
  };

  createTable = async () => {
    const resp = await axios.get('http://localhost:3001/iss');
    try {
      let results = fromFlux(resp.data.csv);
      let currentDate = new Date();
      this.setState({ table: results.table, lastUpdated: currentDate.toLocaleTimeString() });
    } catch (error) {
      console.error('error', error.message);
    }
  }

  componentDidMount = async () => {
    try {
      this.createTable();
      this.animationFrameId = window.setInterval(this.createTable, REASONABLE_API_REFRESH_RATE);
    } catch (error) {
      console.error(error);
    }
  }

  componentWillUnmount = () => window.clearInterval(this.animationFrameId);

  renderPlot = () => {
    const config = {
      table: this.state.table,
      showAxes: false,
      layers: [
        {
          type: 'geo',
          lat: 0,
          lon: 0,
          zoom: 2,
          allowPanAndZoom: true,
          detectCoordinateFields: false,
          layers: [
            {
              type: 'trackMap',
              speed: 1000,
              trackWidth: 6,
              randomColors: true,
              endStopMarkers: true,
              endStopMarkerRadius: 6,
            },
          ],
          tileServerConfiguration: osmTileServerConfiguration,
        },
      ],
    };
    return (
    <div style={this.style}>
      <h3>ISS Movement</h3>
      <h5>Last Updated: {this.state.lastUpdated}</h5>
      <Plot config={config} />
    </div>
    )
  }

  renderEmpty = () => {
    return (
      <div style={this.style}>
        <h3>Loading...</h3>
      </div>
    )
  }

  render = () => Object.keys(this.state.table).length > 0 ? this.renderPlot() : this.renderEmpty();
}
