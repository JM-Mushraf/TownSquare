import { useState } from "react";
import axios from "axios";

const GetLocation = () => {
  const [location, setLocation] = useState(null);
  const [area, setArea] = useState(null);
  const [error, setError] = useState(null);

  const LOCATIONIQ_API_KEY = "pk.7ce1fd74419db3ac9d9c48b15c7648f6"; // Replace with your LocationIQ API Key

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });

          // Reverse Geocode to get area name
          try {
            const response = await axios.get(
              `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
            );

            const address = response.data.address;
            console.log(address);
            
            const areaName = address.suburb || address.city || address.town || "Unknown Area";
            setArea(areaName);
          } catch (err) {
            setError("Failed to fetch location details.");
          }
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="p-4 text-center">
      <h2 className="text-xl font-bold mb-2">Get Your Location</h2>
      <button
        onClick={getUserLocation}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
      >
        Get Location
      </button>

      {location && (
        <p className="mt-2">
          📍 Latitude: {location.latitude}, Longitude: {location.longitude}
        </p>
      )}

      {area && <p className="mt-2">📌 Area: {area}</p>}

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default GetLocation;
