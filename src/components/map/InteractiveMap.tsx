import React, { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { feature } from 'topojson-client';

// Fix icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface InteractiveMapProps {
    geoJsonData: any | null;
    onFeatureClick?: (feature: any) => void;
    onFeatureHover?: (feature: any, event: L.LeafletMouseEvent) => void;
    onFeatureOut?: () => void;
    interactive?: boolean;
    zoomControl?: boolean;
    dragging?: boolean;
    scrollWheelZoom?: boolean;
    touchZoom?: boolean;
    doubleClickZoom?: boolean;
    padding?: [number, number];
}

const MapController: React.FC<{ data: any; padding?: [number, number] }> = ({ data, padding = [20, 20] }) => {
    const map = useMap();
    useEffect(() => {
        if (data) {
            const layer = L.geoJSON(data);
            try {
                const b = layer.getBounds();
                if (b.isValid()) {
                    map.fitBounds(b, { padding });
                    map.invalidateSize();
                }
            } catch (e) {
                console.warn("Could not fit bounds", e);
            }
        }
        // Force resize
        map.invalidateSize();
    }, [data, map, padding?.[0], padding?.[1]]); // Only check values, not array reference
    return null;
};

type TopoJSON = {
  type: string;
  objects: Record<string, string>;
}

const process = (geoJsonData: TopoJSON): GeoJSON.GeoJsonObject | null => {
  if (geoJsonData) {
      let dataToRender = geoJsonData;

      // Handle TopoJSON
      if (geoJsonData.type === 'Topology') {
          try {
              const objects = geoJsonData.objects;
              const objectName = Object.keys(objects)[0]; // Pick first object
              if (objectName) {
                  dataToRender = feature(geoJsonData, objects[objectName]);
              }
          } catch (err) {
              console.error("TopoJSON conversion error:", err);
          }
      }
    return dataToRender as GeoJSON.GeoJsonObject;
  } else {
      return null;
  }
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
    geoJsonData,
    onFeatureClick,
    onFeatureHover,
    onFeatureOut,
    interactive = false,
    zoomControl,
    dragging,
    scrollWheelZoom,
    touchZoom,
    doubleClickZoom,
    padding = [20, 20]
}) => {
  const processedData = process(geoJsonData)

    // Style for the features
    // ... (rest of the file logic reused) ...

    // We need to re-implement style/event handlers to close the component from the replacement
    const style = (feature: any) => ({
        fillColor: feature?.properties?._fillColor || '#3b82f6',
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: feature?.properties?._fillColor ? 0.9 : 0.5
    });

    const highlightStyle = {
        weight: 2,
        color: '#1d4ed8',
        dashArray: '',
        fillOpacity: 0.7
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
        const l = layer as L.Path;

        l.on({
            mouseover: (e) => {
                const target = e.target;
                target.setStyle(highlightStyle);
                target.bringToFront();
                if (onFeatureHover) onFeatureHover(feature, e);
            },
            mouseout: (e) => {
                const target = e.target;
                target.setStyle(style);
                if (onFeatureOut) onFeatureOut();
            },
            click: () => {
                if (onFeatureClick) onFeatureClick(feature);
            },
            mousemove: (e) => {
                if (onFeatureHover) onFeatureHover(feature, e);
            }
        });
    };

    return (
        <MapContainer
            center={[10.8505, 76.2711]}
            zoom={7}
            style={{ height: '100%', width: '100%', background: 'white' }}
            dragging={dragging ?? interactive}
            zoomControl={zoomControl ?? interactive}
            scrollWheelZoom={scrollWheelZoom ?? interactive}
            doubleClickZoom={doubleClickZoom ?? interactive}
            touchZoom={touchZoom ?? interactive}
            boxZoom={interactive}
            keyboard={interactive}
            attributionControl={false}
        >
            {processedData && (
                <>
                    <GeoJSON
                        key={JSON.stringify(geoJsonData).length}
                        data={processedData}
                        style={style}
                        onEachFeature={onEachFeature}
                    />
                    <MapController data={processedData} padding={padding} />
                </>
            )}
        </MapContainer>
    );
};
