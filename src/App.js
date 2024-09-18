

import React, { useState } from 'react';
import { countries } from './countryData';
import { currencies } from './currencyData';
import { sendApiRequest, sendMailApiRequest } from './api';
import { ArrowRight, Send, MapPin, Calendar, DollarSign, Briefcase, Compass, Info } from 'lucide-react';
import {ToastContainer, toast} from 'react-toastify'

const TravelRecommender = () => {
  const [formData, setFormData] = useState({
    currentLocation: 'India',
    destination: 'USA',
    budget: 1000,
    currency: 'USD',
    visaRequirements: 'Tourist',
    travelStyle: 'Adventure',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(true);
  const [emails, setEmails] = useState({});
  const [isDisabled, setIsDisabled] = useState(false);
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChipSelect = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await sendApiRequest(formData);
      setResult(response);
      setFormVisible(false);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = (index, recommendation) => {
    setIsDisabled(true);
    const emailToSend = emails[index];
    if (!emailToSend) {
      toast.error('Please enter a valid email');
      return;
    }
  
    // Show a toast notification to indicate the email will be sent

  
    // Proceed with sending the email
    
  
    // Make an API call with the current form data and selected email
    const body = {
      email: emailToSend,
      currentLocation: formData.currentLocation,
      destination: recommendation.bestAlternative,
      budget: formData.budget
    };
    toast('Please check your mail in 2 minutes!');
    // Simulate API call (you should replace this with your actual API call)
    sendMailApiRequest(body)
      .then((response) => {
        toast('Itinerary sent successfully!');
        setIsDisabled(false);
      })
      .catch((error) => {
        console.error('Error sending itinerary:', error);
        toast('There was an error sending the itinerary. Please try again.');
        setIsDisabled(false);

      });
  };

  const handleEmailChange = (e, index) => {
    setEmails({ ...emails, [index]: e.target.value });
  };

  return (
  
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">

    <h1 className="text-4xl font-bold mb-8 text-gray-800">
  Discover Your <span className="relative">
    <span className="line-through">Dream</span>
    <span className="absolute left-0 -bottom-1 w-full h-0.5 bg-gray-800"></span>
  </span>
  <span className="ml-2">Budget Destination</span>
</h1>

      {formVisible ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
              <div className="relative">
                <MapPin className="absolute top-3 left-3 text-gray-400" size={18} />
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                >
                  <option value="">Select your location</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
              <div className="relative">
                <MapPin className="absolute top-3 left-3 text-gray-400" size={18} />
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                >
                  <option value="">Select destination</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget ({formData.currency})</label>
              <div className="relative">
                <input
                  type="range"
                  min="500"
                  max="100000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-center mt-2 font-semibold text-blue-600">{formData.budget} {formData.currency}</p>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Currency</label>
              <div className="relative">
                <DollarSign className="absolute top-3 left-3 text-gray-400" size={18} />
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Visa Requirement</label>
              <div className="flex gap-2" style={{flexWrap:'wrap'}}>
                {['Pre Apply', 'Visa-On-Arrival'].map((type) => (
                  <div
                    key={type}
                    className={`flex-1 px-4 py-2 rounded-lg cursor-pointer text-center transition-all ${
                      formData.visaRequirements === type
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChipSelect('visaRequirements', type)}
                  >
                    <Briefcase className="inline-block mr-2" size={16} />
                    {type}
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Travel Style</label>
              <div className="flex gap-2">
                {['Adventure', 'Relaxation', 'Cultural'].map((style) => (
                  <div
                    key={style}
                    className={`flex-1 px-4 py-2 rounded-lg cursor-pointer text-center transition-all ${
                      formData.travelStyle === style
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    onClick={() => handleChipSelect('travelStyle', style)}
                  >
                    <Compass className="inline-block mr-2" size={16} />
                    {style}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            className="mt-8 bg-blue-600 text-white py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition-all flex items-center justify-center"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Finding Your Perfect Trip...
              </span>
            ) : (
              <span className="flex items-center">
                Get Recommendations
                <ArrowRight className="ml-2" size={20} />
              </span>
            )}
          </button>
        </div>
      ) : (
        result && result.data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl">
            {result.data.map((recommendation, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-6 transition-all hover:shadow-2xl">
                <h3 className="text-2xl font-bold mb-4 text-blue-600">Destination {index + 1}</h3>
                <div className="space-y-4">
                  <p className="flex items-center">
                    <MapPin className="mr-2 text-gray-500" size={18} />
                    <span className="font-medium">{recommendation.bestAlternative}</span>
                  </p>
                 
                  <p className="flex items-center">
                    <DollarSign className="mr-2 text-gray-500" size={18} />
                    <span>Total Cost: {recommendation.totalCost}</span>
                  </p>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3">Cost Breakdown</h4>
                    <ul className="space-y-2">
                      <li className="flex justify-between">
                        <span>Flights</span>
                        <span className="font-medium">{recommendation.costBreakdown.flights}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Stay</span>
                        <span className="font-medium">{recommendation.costBreakdown.stay}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Food</span>
                        <span className="font-medium">{recommendation.costBreakdown.food}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Local Travel</span>
                        <span className="font-medium">{recommendation.costBreakdown.localTravel}</span>
                      </li>
                    </ul>
                  </div>
                  {recommendation.additionalTips && recommendation.additionalTips.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-3 flex items-center">
                      <Info className="mr-2 text-blue-500" size={18} />
                      Useful Tips
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                      {recommendation.additionalTips.map((text, i) => (
                        <li key={i}>{text}</li>
                      ))}
                    </ul>
                  </div>
                )}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Receive Itinerary</label>
                    <div className="flex">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-grow border border-gray-300 rounded-l-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={emails[index] || ''}
                        onChange={(e) => handleEmailChange(e, index)}
                      />
                      <button
                        className="bg-green-600 text-white py-2 px-4 rounded-r-lg hover:bg-green-700 transition-all flex items-center"
                        onClick={() => handleSendEmail(index, recommendation)}
                        disabled={isDisabled}
                      >
                        <Send className="mr-2" size={18} />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

<ToastContainer style={{height:20,width:20, flexDirection:'row',display:'flex'}} />
    </div>
  );
};

export default TravelRecommender;