import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./map.css";

function LocationComponent() {
  const [location, setLocation] = useState("Fetching location...");
  const [error, setError] = useState(null);
  const requestGeolocationPermission = async () => {
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: "geolocation" });

      if (permission.state === "denied") {
        setError("Location access is denied. Enable it in your browser settings.");
        setLocation("Permission denied.");
        return false;
      }
    }
    return true;
  };
  const getLocation = useCallback(async () => {
    const permissionGranted = await requestGeolocationPermission();
    if (!permissionGranted) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          console.log(`Latitude: ${latitude}, Longitude: ${longitude}`);

          try {
            const response = await axios.get(
              `https:us1.locationiq.com/v1/reverse?key=pk.69b624eadc91f4b86faf46cc73cc3f11&lat=12.832180&lon=77.590848&format=json&accept-language=en`
            );

            console.log("Location API Response:", response.data);

            if (response.data && response.data.display_name) {
              setLocation(response.data.display_name);
              setError(null);
            } else {
              setLocation("Location not found in response");
            }
          } catch (error) {
            console.error("Error fetching location:", error);
            setError("Error fetching location: " + error.message);
            setLocation("Could not retrieve location");
          }
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Permission denied or error fetching location");
          setLocation("Permission denied or error fetching location");
        },
        { enableHighAccuracy: true, timeout: 30000 }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLocation("Geolocation is not supported.");
    }
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    <div className="location-container">
      <button className="get-location-button" onClick={getLocation}>
        Get My Location
      </button>
      <div className="location-text">{location}</div>
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

export default LocationComponent;
