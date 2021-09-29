/* global document */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {MVTLayer, TileLayer} from '@deck.gl/geo-layers';
import {PathLayer} from '@deck.gl/layers';
import {MVTLoader} from '@loaders.gl/mvt';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  bearing: 0,
  pitch: 0,
  longitude: -122.45,
  latitude: 37.78,
  zoom: 12
};

const MVT_URL =
  'https://tiles-a.basemaps.cartocdn.com/vectortiles/carto.streets/v1/{z}/{x}/{y}.mvt';

// Hack static URL for now
const GEOJSON_URL =
  'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const BORDERS = true;

const MAP_LAYER_STYLES = {
  maxZoom: 14,

  getFillColor: f => {
    switch (f.properties.layerName) {
      case 'poi':
        return [255, 0, 0];
      case 'water':
        return [120, 150, 180];
      case 'building':
        return [218, 218, 218];
      default:
        return [240, 240, 240];
    }
  },

  getLineWidth: 1,
  lineWidthUnits: 'pixels',
  getLineColor: [192, 192, 192],

  getPointRadius: 4,
  pointRadiusUnits: 'pixels'
};

class Root extends PureComponent {
  constructor(props) {
    super(props);
    this._onClick = this._onClick.bind(this);
    this.state = {
      clickedItem: null
    };
  }

  _onClick(info) {
    this.setState({clickedItem: info.object});
  }

  _renderClickedItem() {
    const {clickedItem} = this.state;
    if (!clickedItem || !clickedItem.properties) {
      return null;
    }

    return (
      <div className="clicked-info">
        id: {clickedItem.id} {JSON.stringify(clickedItem.properties)}
      </div>
    );
  }

  render() {
    return (
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        onClick={this._onClick}
        layers={[
          new MVTLayer({
            ...MAP_LAYER_STYLES,
            data: MVT_URL,
            onClick: this._onClick.bind(this),
            pickable: true,
            autoHighlight: true,
            binary: true
          }),
          new TileLayer({
            data: GEOJSON_URL,
            autoHighlight: true,
            highlightColor: [60, 60, 60, 40],
            minZoom: 0,
            maxZoom: 19,
            tileSize: 256,
            zoomOffset: devicePixelRatio === 1 ? -1 : 0,
            renderSubLayers: props => {
              const {
                bbox: {west, south, east, north}
              } = props.tile;

              return [
                BORDERS &&
                  new PathLayer({
                    id: `${props.id}-border`,
                    visible: true,
                    data: [
                      [[west, north], [west, south], [east, south], [east, north], [west, north]]
                    ],
                    getPath: d => d,
                    getColor: [255, 0, 0],
                    widthMinPixels: 4
                  })
              ];
            }
          })
        ]}
      >
        {this._renderClickedItem()}
      </DeckGL>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
