import React from 'react'
import {fromFlux, Plot} from '@influxdata/giraffe'
import axios from 'axios'
import { geoTracks } from '../helpers/geoLayer'

const REASONABLE_API_REFRESH_RATE = 5000;
const osmTileServerConfiguration = {
  tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}

export class GeoTracks extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      table: {},
      lastUpdated: ''
    };
    this.animateRealData = this.animateRealData.bind(this);
    this.createRealDataTable = this.createRealDataTable.bind(this);
    this.fetchData = this.fetchData.bind(this);
  }

  animationFrameId = 0;
  style = {
    width: "calc(100vw - 100px)",
    height: "calc(100vh - 100px)",
    margin: "50px",
  };

  async fetchData() {
    return await axios.get('http://localhost:3001/iss');
  }

  async createRealDataTable() {
    // const resp = await this.fetchData();
    try {
      // let results = fromFlux(resp.data.csv);
      let results = { table: geoTracks(-74, 40, 3) }
      console.log(results)
      let currentDate = new Date();
      this.setState({ table: results.table, lastUpdated: currentDate.toLocaleTimeString() });
    } catch (error) {
      console.error('error', error.message);
    }
  }

  animateRealData() {
    this.createRealDataTable();
  }

  async componentDidMount() {
    try {
      this.createRealDataTable();
      // this.animationFrameId = window.setInterval(this.animateRealData, REASONABLE_API_REFRESH_RATE);
    } catch (error) {
      console.error(error);
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.animationFrameId);
  }

  renderPlot() {
    const config = {
      table: this.state.table,
      showAxes: false,
      layers: [
        {
          type: 'geo',
          lat: 40,
          lon: -74,
          zoom: 6,
          allowPanAndZoom: true,
          detectCoordinateFields: false,
          layers: [
            {
              type: 'trackMap',
              speed: 200,
              trackWidth: 4,
              randomColors: true,
              endStopMarkers: true,
              endStopMarkerRadius: 4,
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

  renderEmpty() {
    return (
      <div style={this.style}>
        <h3>Loading...</h3>
      </div>
    )
  }

  render() {
    return Object.keys(this.state.table).length > 0 ? this.renderPlot() : this.renderEmpty();
  }
}
