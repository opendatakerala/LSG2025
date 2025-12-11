import React, { useEffect } from 'react';
import { MapContainer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface KeralaMapProps {
    geoJsonData: any | null;
    onFeatureClick?: (feature: any) => void;
}

const MapController: React.FC<{ data: any }> = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (data) {
            const geoJsonLayer = L.geoJSON(data);
            map.fitBounds(geoJsonLayer.getBounds());
        }
    }, [data, map]);

    return null;
};

export const KeralaMap: React.FC<KeralaMapProps> = ({ geoJsonData, onFeatureClick }) => {
    const onEachFeature = (feature: any, layer: L.Layer) => {
        if (onFeatureClick) {
            layer.on({
                click: () => onFeatureClick(feature),
                mouseover: (e) => {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 3,
                        color: '#666',
                        dashArray: '',
                        fillOpacity: 0.7
                    });
                    layer.bringToFront();
                },
                mouseout: (e) => {
                    const layer = e.target;
                    // Reset style
                    // Note: This resets to default path style, might need to pass original style function if we use dynamic styles
                    layer.setStyle({
                        weight: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.5
                    });
                }
            });
        }
    };

    return (
        <MapContainer
            center={[10.8505, 76.2711]} // Center of Kerala
            zoom={7}
            style={{ height: '100%', width: '100%', background: '#ffffff' }}
            className="z-0"
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            attributionControl={false}
        >
            {geoJsonData && (
                <>
                    <GeoJSON
                        key={JSON.stringify(geoJsonData)} // Force re-render when data changes
                        data={geoJsonData}
                        style={() => ({
                            fillColor: '#3b82f6',
                            weight: 1,
                            opacity: 1,
                            color: 'white',
                            dashArray: '3',
                            fillOpacity: 0.5
                        })}
                        onEachFeature={onEachFeature}
                    />
                    <MapController data={geoJsonData} />
                </>
            )}
        </MapContainer>
    );
};
