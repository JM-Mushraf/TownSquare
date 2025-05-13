// api.js
import axios from 'axios'
export const fetchAnnouncements = async () => {
    try {
      const {data} = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/post/announcements/all`); // Replace with your backend endpoint
      return data.announcements;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  };