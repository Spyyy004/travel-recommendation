// api.js
import axios from 'axios';

export const sendApiRequest = async (formData) => {
  try {
    const response = await axios.post('https://travel-recommendation-pwqo.onrender.com/recommendations', formData);
    return response.data;
  } catch (error) {
    console.error("API call failed", error);
    return null;
  }
};

export const sendMailApiRequest = async (data) => {
    try {
        const response = await axios.post('https://travel-recommendation-pwqo.onrender.com/send-email', data);
        return response.data;
      } catch (error) {
        console.error("API call failed", error);
        return null;
      }
}
