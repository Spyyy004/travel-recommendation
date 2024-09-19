// server.js
const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const cors = require("cors");
const nodemailer = require('nodemailer');
const markdownpdf = require("markdown-pdf");
const fs = require("fs");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

app.use(cors());

app.post("/recommendations", async (req, res) => {
  const {
    currentLocation,
    destination,
    budget,
    currency,
    visaRequirements,
    travelStyle,
  } = req.body;
  console.log(req.body, "AOAOALL");

  // Check if all required fields are provided
  if (!currentLocation || !destination || !budget || !currency) {
    return res
      .status(400)
      .json({
        error:
          "Missing required fields: currentLocation, destination, budget, or currency",
      });
  }

  // OpenAI prompt creation with currency specification
  const prompt = `
    I am from ${currentLocation} and I want to visit ${destination}, but I have a budget of ${budget}. 
    I want the cost breakdown in ${currency}. 
    I would prefer a ${travelStyle} style of travel, and I prefer destinations that are ${visaRequirements} for someone from ${currentLocation}.
    Can you recommend 3 similar, more affordable destination, including a detailed cost breakdown (flights, stay, food, and local travel) with a range for each in ${currency}?

    Here is an example response:

    {
     "data":[
      {
           "bestAlternative": "Kashmir, India",
      "bestTimeToVisit": "March to September",
      "totalCost": "₹50,000 - ₹85,000",
      "costBreakdown": {
        "flights": "₹20,000 - ₹30,000",
        "stay": "₹15,000 - ₹25,000",
        "food": "₹7,000 - ₹15,000",
        "localTravel": "₹5,000 - ₹10,000"
      },
      "additionalTips": [
        "Consider trekking options like the Ghorepani Poon Hill trek, which is popular among tourists and provides breathtaking views.",
        "Make sure to check visa requirements for Nepal, which are generally straightforward for Indian citizens.",
        "Always keep some extra budget for activities and emergencies."
      ]
      }
     ]

    }
     Only return JSON and nothing else
    `
    ;

  const messages = [
    {
      role: "user",
      content: prompt,
    },
  ];

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 3000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your OpenAI API key
          "Content-Type": "application/json",
        },
      }
    );

    const recommendationText = response.data.choices[0].message.content.trim();

    // Parse the response to create a structured JSON object
    const recommendation = parseOpenAIResponse(recommendationText);

    // Return formatted recommendation as JSON
    res.json(recommendation);
  } catch (error) {
    console.error("Error fetching recommendation from OpenAI:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch recommendation. Please try again." });
  }
});

// Helper function to parse OpenAI response
function parseOpenAIResponse(responseText) {
  // Parse the response text into a JSON object
  const cleanedResponseText = responseText
  .replace(/```json/g, "")  // remove ```json at the beginning
  .replace(/```/g, ""); 

  try {
    const parsedResponse = JSON.parse(cleanedResponseText);
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing OpenAI response:", error, cleanedResponseText);
    return {
      bestAlternative: "N/A",
      bestTimeToVisit: "N/A",
      totalCost: "N/A",
      costBreakdown: {
        flights: "N/A",
        stay: "N/A",
        food: "N/A",
        localTravel: "N/A",
      },
      additionalTips: [],
    };
  }
}




const sendEmailWithAttachment = async (email, itineraryFilePath) => {
    // Configure your email transporter (replace with your email provider's config)
    
  
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });
    // Setup email data
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Travel Itinerary. Curated by Alter-Nation',
      text: 'Hey, Ayush here from Alternation. Thank you for trusting AlterNation. Please find attached your travel itinerary in PDF format.',
      attachments: [
        {
          filename: 'itinerary.pdf',
          path: itineraryFilePath,
        },
      ],
    };
  
    // Send email
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${email}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error('Failed to send email');
    }
  };
  
  // POST route for sending itinerary email
  app.post("/send-email", async (req, res) => {
    const { currentLocation, destination, email, budget } = req.body;
  
    // Check if all required fields are provided
    if (!currentLocation || !destination || !email || !budget) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // await sendEmailWithAttachment('cswithiyush@gmail.com');

  
    // OpenAI prompt to create a day-wise itinerary
    const prompt = `
      I am planning a trip from ${currentLocation} to ${destination} with a budget of ${budget}.
      Can you provide a detailed day-wise itinerary for the trip, including places to visit, activities, food recommendations, and accommodations? Please make sure your calculations related to money are close to accurate.
      Please include all relevant details such as travel tips and cost estimates. Your response must be in a proper markdown format as I am going to generate a pdf out of it.
    `;

    const messages = [
        {
          role: "user",
          content: prompt,
        },
      ];
  
    try {
      // OpenAI API call to generate the itinerary in markdown
    


      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: messages,
          max_tokens: 3000,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your OpenAI API key
            "Content-Type": "application/json",
          },
        }
      );
  
      const itineraryMarkdown = response.data.choices[0].message.content;
      console.log(itineraryMarkdown, "CONSYAAJKA")
      // Convert markdown to PDF
      const pdfFilePath = path.join(__dirname, 'itinerary.pdf');
      markdownpdf().from.string(itineraryMarkdown).to(pdfFilePath, async () => {
        console.log("PDF created successfully.");
  
        // Send the PDF via email
        try {
          await sendEmailWithAttachment(email, pdfFilePath);
          res.status(200).json({ message: 'Itinerary sent successfully!' });
  
          // Clean up the generated PDF file after sending
          fs.unlinkSync(pdfFilePath);
        } catch (error) {
          res.status(500).json({ error: 'Failed to send email.' });
        }
      });
    } catch (error) {
      console.error("Error generating itinerary:", error);
      res.status(500).json({ error: 'Failed to generate itinerary.' });
    }
  });
  

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
