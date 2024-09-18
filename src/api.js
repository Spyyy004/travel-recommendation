// api.js
import axios from 'axios';

export const sendApiRequest = async (formData) => {
  try {
    const response = await axios.post('http://localhost:3000/recommendations', formData);
    return response.data;
  } catch (error) {
    console.error("API call failed", error);
    return null;
  }
};

export const sendMailApiRequest = async (data) => {
    try {
        const response = await axios.post('http://localhost:3000/send-email', data);
        return response.data;
      } catch (error) {
        console.error("API call failed", error);
        return null;
      }
}
