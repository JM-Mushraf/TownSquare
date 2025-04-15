// api.js
import axios from 'axios'
export const fetchAnnouncements = async () => {
    try {
      const {data} = await axios.get('http://localhost:3000/post/announcements/all'); // Replace with your backend endpoint
      console.log(data);
      
      
      return data.announcements;
    } catch (error) {
      console.error('Error fetching announcements:', error);
      return [];
    }
  };