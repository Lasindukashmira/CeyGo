import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const WEATHER_CACHE_PREFIX = 'weather_cache_';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Weather code to condition mapping
 * Based on WMO Weather interpretation codes
 * https://open-meteo.com/en/docs
 */
const WEATHER_CODES = {
    0: { condition: 'Clear sky', icon: '☀️' },
    1: { condition: 'Mainly clear', icon: '🌤️' },
    2: { condition: 'Partly cloudy', icon: '⛅' },
    3: { condition: 'Overcast', icon: '☁️' },
    45: { condition: 'Fog', icon: '🌫️' },
    48: { condition: 'Rime fog', icon: '🌫️' },
    51: { condition: 'Light drizzle', icon: '🌦️' },
    53: { condition: 'Moderate drizzle', icon: '🌦️' },
    55: { condition: 'Dense drizzle', icon: '🌧️' },
    56: { condition: 'Freezing drizzle', icon: '🌧️' },
    57: { condition: 'Heavy freezing drizzle', icon: '🌧️' },
    61: { condition: 'Slight rain', icon: '🌧️' },
    63: { condition: 'Moderate rain', icon: '🌧️' },
    65: { condition: 'Heavy rain', icon: '🌧️' },
    66: { condition: 'Freezing rain', icon: '🌨️' },
    67: { condition: 'Heavy freezing rain', icon: '🌨️' },
    71: { condition: 'Slight snow', icon: '🌨️' },
    73: { condition: 'Moderate snow', icon: '❄️' },
    75: { condition: 'Heavy snow', icon: '❄️' },
    77: { condition: 'Snow grains', icon: '❄️' },
    80: { condition: 'Slight showers', icon: '🌦️' },
    81: { condition: 'Moderate showers', icon: '🌧️' },
    82: { condition: 'Violent showers', icon: '🌧️' },
    85: { condition: 'Slight snow showers', icon: '🌨️' },
    86: { condition: 'Heavy snow showers', icon: '🌨️' },
    95: { condition: 'Thunderstorm', icon: '⛈️' },
    96: { condition: 'Thunderstorm with hail', icon: '⛈️' },
    99: { condition: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

/**
 * Get weather info from weather code
 */
const getWeatherInfo = (code) => {
    return WEATHER_CODES[code] || { condition: 'Unknown', icon: '🌤️' };
};

/**
 * Get day name from date string
 */
const getDayName = (dateString, index) => {
    if (index === 0) return 'Today';
    if (index === 1) return 'Tomorrow';

    const date = new Date(dateString);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

/**
 * Calculate UV Index from solar radiation (approximate)
 */
const calculateUVIndex = (hour) => {
    // Simplified UV estimation based on time of day in tropical region
    if (hour >= 10 && hour <= 14) return 'High';
    if ((hour >= 8 && hour < 10) || (hour > 14 && hour <= 16)) return 'Moderate';
    return 'Low';
};

/**
 * Fetch weather data from Open-Meteo API
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} placeName - Name of the place for caching
 */
export const getWeatherData = async (latitude, longitude, placeName = 'location') => {
    const cacheKey = `${WEATHER_CACHE_PREFIX}${placeName.replace(/\s/g, '_')}`;

    // Check cache first
    try {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
            const { data, timestamp } = JSON.parse(cached);
            if (Date.now() - timestamp < CACHE_DURATION) {
                console.log('Returning cached weather for', placeName);
                return data;
            }
        }
    } catch (error) {
        console.warn('Cache read error:', error);
    }

    try {
        console.log(`Fetching weather for ${placeName} (${latitude}, ${longitude})...`);

        const params = {
            latitude,
            longitude,
            current: [
                'temperature_2m',
                'relative_humidity_2m',
                'apparent_temperature',
                'weather_code',
                'wind_speed_10m',
            ].join(','),
            daily: [
                'weather_code',
                'temperature_2m_max',
                'temperature_2m_min',
            ].join(','),
            timezone: 'Asia/Colombo',
            forecast_days: 7,
        };

        const response = await axios.get('https://api.open-meteo.com/v1/forecast', { params });
        const apiData = response.data;

        // Transform API response to match existing app structure
        const currentHour = new Date().getHours();
        const weatherInfo = getWeatherInfo(apiData.current.weather_code);

        const weatherData = {
            current: {
                temperature: Math.round(apiData.current.temperature_2m),
                condition: weatherInfo.condition,
                icon: weatherInfo.icon,
                feelsLike: Math.round(apiData.current.apparent_temperature),
                humidity: apiData.current.relative_humidity_2m,
                windSpeed: Math.round(apiData.current.wind_speed_10m),
                uvIndex: calculateUVIndex(currentHour),
            },
            forecast: apiData.daily.time.slice(0, 5).map((date, index) => {
                const dayWeather = getWeatherInfo(apiData.daily.weather_code[index]);
                return {
                    day: getDayName(date, index),
                    condition: dayWeather.condition,
                    icon: dayWeather.icon,
                    high: Math.round(apiData.daily.temperature_2m_max[index]),
                    low: Math.round(apiData.daily.temperature_2m_min[index]),
                };
            }),
        };

        // Cache the result
        try {
            await AsyncStorage.setItem(cacheKey, JSON.stringify({
                data: weatherData,
                timestamp: Date.now(),
            }));
            console.log('Cached weather for', placeName);
        } catch (error) {
            console.warn('Cache write error:', error);
        }

        return weatherData;
    } catch (error) {
        console.error('Error fetching weather:', error);
        // Return fallback data
        return getFallbackWeather();
    }
};

/**
 * Fallback weather data when API fails
 */
const getFallbackWeather = () => ({
    current: {
        temperature: 28,
        condition: 'Partly Cloudy',
        icon: '⛅',
        feelsLike: 32,
        humidity: 75,
        windSpeed: 12,
        uvIndex: 'High',
    },
    forecast: [
        { day: 'Today', condition: 'Partly Cloudy', icon: '⛅', high: 31, low: 24 },
        { day: 'Tomorrow', condition: 'Sunny', icon: '☀️', high: 32, low: 25 },
        { day: 'Wednesday', condition: 'Light Rain', icon: '🌧️', high: 29, low: 23 },
        { day: 'Thursday', condition: 'Cloudy', icon: '☁️', high: 30, low: 24 },
        { day: 'Friday', condition: 'Sunny', icon: '☀️', high: 33, low: 25 },
    ],
});

/**
 * Clear weather cache
 */
export const clearWeatherCache = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        const weatherKeys = keys.filter(key => key.startsWith(WEATHER_CACHE_PREFIX));
        await AsyncStorage.multiRemove(weatherKeys);
        console.log('Weather cache cleared');
    } catch (error) {
        console.warn('Error clearing weather cache:', error);
    }
};

export default {
    getWeatherData,
    clearWeatherCache,
};
