import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from "lucide-react";

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  visibility: number;
  pressure: number;
  location: string;
  feelsLike: number;
}

const getWeatherIcon = (code: number) => {
  if (code === 0 || code === 1) return <Sun className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />;
  if (code === 2 || code === 3) return <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />;
  if (code === 45 || code === 48) return <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />;
  if (code >= 71 && code <= 85) return <CloudRain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />;
  if (code === 80 || code === 81 || code === 82) return <CloudRain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />;
  if (code >= 85 && code <= 99) return <CloudRain className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />;
  return <Cloud className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />;
};

const getWeatherCondition = (code: number) => {
  if (code === 0) return "Clear";
  if (code === 1 || code === 2) return "Mostly Clear";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Drizzle";
  if (code >= 71 && code <= 77) return "Snow";
  if (code === 80 || code === 81 || code === 82) return "Rain Showers";
  if (code >= 85 && code <= 99) return "Snow Showers";
  return "Unknown";
};

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user's location
        const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos.coords),
            (err) => {
              // If geolocation fails, use a default location (New York)
              resolve({ latitude: 40.7128, longitude: -74.006 } as GeolocationCoordinates);
            }
          );
        });

        const { latitude, longitude } = position;

        // Fetch weather data from Open-Meteo API
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,weather_code&timezone=auto`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }

        const data = await response.json();
        const current = data.current;

        // Get location name from coordinates (using reverse geocoding)
        let locationName = "Current Location";
        try {
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (geoResponse.ok) {
            const geoData = await geoResponse.json();
            locationName = geoData.address?.city || geoData.address?.town || "Current Location";
          }
        } catch {
          // Use default location name if reverse geocoding fails
        }

        setWeather({
          temperature: Math.round(current.temperature_2m),
          condition: getWeatherCondition(current.weather_code),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          visibility: 10, // Open-Meteo doesn't provide visibility in free tier
          pressure: 1013, // Default pressure
          location: locationName,
          feelsLike: Math.round(current.apparent_temperature),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load weather");
        // Set default weather if error occurs
        setWeather({
          temperature: 72,
          condition: "Clear",
          humidity: 65,
          windSpeed: 8,
          visibility: 10,
          pressure: 1013,
          location: "Default Location",
          feelsLike: 70,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="p-6 bg-card text-card-foreground rounded-xl shadow-md">
        <div className="h-87 bg-muted animate-pulse rounded-lg" />
      </Card>
    );
  }

  if (!weather) {
    return null;
  }

  return (
    <Card className="p-4 sm:p-6 bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 text-card-foreground rounded-xl shadow-md border border-blue-200 dark:border-blue-800">
      <div className="flex justify-between items-start mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Weather</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">{weather.location}</p>
        </div>
        {getWeatherIcon(Math.floor(Math.random() * 100))}
      </div>

      <div className="mb-4 sm:mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-semibold text-foreground">{weather.temperature}°</span>
          <span className="text-sm sm:text-lg text-muted-foreground">F</span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
          Feels like {weather.feelsLike}° • {weather.condition}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white/50 dark:bg-black/20">
          <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground">Humidity</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white/50 dark:bg-black/20">
          <Wind className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground">Wind</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{weather.windSpeed} mph</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white/50 dark:bg-black/20">
          <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground">Visibility</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{weather.visibility} mi</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-white/50 dark:bg-black/20">
          <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs text-muted-foreground">Pressure</p>
            <p className="text-sm sm:text-base font-medium text-foreground">{weather.pressure} mb</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="text-[11px] sm:text-xs text-amber-600 dark:text-amber-400 mt-3 sm:mt-4 text-center">
          Using default weather data
        </p>
      )}
    </Card>
  );
}
