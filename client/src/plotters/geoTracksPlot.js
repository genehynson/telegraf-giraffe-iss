import React from 'react'
import {fromFlux, Plot} from '@influxdata/giraffe'
import axios from 'axios'

const REASONABLE_API_REFRESH_RATE = 20000;
const osmTileServerConfiguration = {
  tileServerUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
}
const pointLayer = {
  type: 'pointMap',
  isClustered: false,
  colors: [
    {type: 'min', hex: '#ffae42'},
    {type: 'max', hex: '#ffae42'},
  ],
}

export class GeoTracksPlot extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      table: {},
      lastUpdated: '',
      showPoints: false,
      currentOrHistory: 'current',
      historyMin: 93
    };

  }

  animationFrameId = 0;
  style = {
    width: "calc(100vw - 100px)",
    height: "calc(100vh - 100px)",
    margin: "50px",
  };
  menuStyle = {
    display: 'inline-block',
    float: 'right',
    margin: '0px 20px 0px 0px'
  };

  createTable = async (currentOrHistory) => {
    const resp = await axios.get(`http://localhost:3001/iss/${currentOrHistory}?min=${this.state.historyMin}`);
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
      this.createTable(this.state.currentOrHistory);
      this.animationFrameId = window.setInterval(() => this.createTable(this.state.currentOrHistory), REASONABLE_API_REFRESH_RATE);
    } catch (error) {
      console.error(error);
    }
  }

  componentWillUnmount = () => window.clearInterval(this.animationFrameId);

  showPoints = (event) => this.setState({ showPoints: event.target.checked });

  changeCurrentOrHistory = (event) => {
    this.setState({ currentOrHistory: event.target.value });
    this.createTable(event.target.value);
  }

  changeHistoryMin = (event) => {
    this.setState({ historyMin: event.target.value });
  }

  renderPlot = () => {
    const config = {
      table: this.state.table,
      showAxes: false,
      layers: [
        {
          type: 'geo',
          lat: 0,
          lon: 0,
          zoom: 1,
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
    if (this.state.showPoints) {
      config.layers[0].layers.push(pointLayer)
    }
    return (
    <div style={this.style}>
      <h3>ISS Movement</h3>
      <h5 style={{ display: 'inline-block', margin: '5px'}}>Last Updated: {this.state.lastUpdated}</h5>
      <h5 style={this.menuStyle}>
        <input type="checkbox" checked={this.state.showPoints} onChange={this.showPoints}/> Show Points
      </h5>
      {this.state.currentOrHistory === "history" &&
      <h5 style={this.menuStyle}>
        <input value={this.state.historyMin} onBlur={() => this.createTable(this.state.currentOrHistory)} onChange={this.changeHistoryMin}/> Min Back
      </h5>
      }
      <h5 style={this.menuStyle}>
        <input type="radio" value="current" name="currentOrHistory" checked={this.state.currentOrHistory === 'current'} onChange={this.changeCurrentOrHistory}/> Current
        <input type="radio" value="history" name="currentOrHistory" checked={this.state.currentOrHistory === 'history'} onChange={this.changeCurrentOrHistory}/> Historical
      </h5>
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
