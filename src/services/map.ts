import { useQuery } from "@tanstack/react-query";
import { feature } from 'topojson-client';

type Trend = {
  LB_Code: string;
  Leading_Front: string;
}

type Properties = {
  [index: string]: string | number
}

type Feature = {
  properties: Properties
}

const loadMap = async (file: string, trends: Trend[]) => {
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const path = `${baseUrl}data/topojson/Kerala/${file}`;
  const response = await fetch(path);

  if (!response.ok) throw new Error("Map data not found");

  let data = await response.json();
  if (data.type === "Topology") {
    const objectName = Object.keys(data.objects)[0];
    if (objectName) {
      data = feature(data, data.objects[objectName]);
    }
  }

  // Inject style properties based on trends
  const processedFeatures = data.features.map((feature: Feature) => {
    const props = feature.properties;
    // Try to match LB Code
    const code = props.SEC_Kerala_code || props.LSG_code || props.LGD_Code;
    // Or match by Name for Districts if code fails? (GeoJSON might have different codes)

    const trend = trends.find((t) => t.LB_Code === code);

    let color = "#94a3b8"; // Default slate
    if (trend) {
      switch (trend.Leading_Front) {
        case "LDF":
          color = "#ef4444";
          break; // red-500
        case "UDF":
          color = "#22c55e";
          break; // green-500
        case "NDA":
          color = "#f97316";
          break; // orange-500
        case "Hung":
          color = "#64748b";
          break; // slate-500
        case "IND":
          color = "#94a3b8";
          break;
      }
    }

    return {
      ...feature,
      properties: {
        ...props,
        _fillColor: color, // Custom prop for InteractiveMap to use?
        // InteractiveMap uses specific style logic. I might need to update InteractiveMap or pass a style function.
        // Currently InteractiveMap uses fixed style. I should update it to support data-driven style.
        // Workaround: InteractiveMap is simple. I can update it to read fillColor from properties.
      },
    };
  });
  return ({ ...data, features: processedFeatures });
};

export const useMap = (file: string, trends: Trend[]) =>
  useQuery({
    queryKey: ["map", file],
    queryFn: () => loadMap(file, trends),
  });
