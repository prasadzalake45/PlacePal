import React, { useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map as OLMap, View } from 'ol';
import { Tile as TileLayer } from 'ol/layer';
import { OSM } from 'ol/source';
import { fromLonLat } from 'ol/proj';
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Icon, Style } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import './Map.css';

const Map = props => {
  const mapRef = useRef();

  const { center, zoom } = props;

  useEffect(() => {
    // Add console.log statements here to check the values of center and zoom
    console.log("Center:", center);
    console.log("Zoom:", zoom);

    const map = new OLMap({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([center.lng, center.lat]),
        zoom: zoom
      })
    });

    // Add a marker at the current location
    const marker = new Feature({
      geometry: new Point(fromLonLat([center.lng, center.lat]))
    });

    const markerStyle = new Style({
      image: new Icon({
        src: "https://img.freepik.com/premium-vector/pin-point-icon-with-red-map-location-pointer-symbol-isolated-white-background_120819-234.jpg",
        scale: 0.1
      })
    });

    marker.setStyle(markerStyle);
    const markerLayer = new VectorLayer({
      source: new VectorSource({
        features: [marker]
      })
    });

    map.addLayer(markerLayer);

    return () => {
      map.dispose();
    };
  }, [center, zoom]);

  return (
    <div
      ref={mapRef}
      className={`map ${props.className}`}
      style={props.style}
    ></div>
  );
};

export default Map;
