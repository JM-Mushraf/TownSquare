// api.js
import axios from 'axios'
export const fetchAnnouncements = async () => {
    try {
      const {data} = await axios.get(`${import.meta.env.VITE_BACKEND_BASEURL}/post/announcements/all`,{
        withCredentials:true,
      })
      
      
      
      return data.announcements;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  };