// api.js
import axios from 'axios'
export const fetchAnnouncements = async (token) => {
    try {
      const {data} = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/post/announcements/all`,{
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`
        }
      })
      
      
      
      return data.announcements;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  };