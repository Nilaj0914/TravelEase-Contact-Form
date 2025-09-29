import { useState } from 'react';
import Head from 'next/head';
import { Poppins } from 'next/font/google';
import styles from '../styles/Home.module.css';

// Import shared components
import Header from '../components/Header';
import Footer from '../components/Footer';

// Configure the font
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export default function Contact() {
  // Use a single state object for all form data
  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    tripType: 'Leisure',
    budget: '',
    services: {
      flights: false,
      hotels: false,
      tours: false,
    },
    requests: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  // State for submission status
  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: null,
  });

  // Generic handler for text, email, date, number, and select inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // Handler for checkboxes
  const handleServiceChange = (e) => {
    const { id, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      services: { ...prev.services, [id]: checked },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name || !formData.email || !formData.destination || !formData.startDate) {
      setStatus({ ...status, error: 'Please fill out all required fields.' });
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setStatus({ ...status, error: 'Please enter a valid email address.' });
      return;
    }

    // Validate phone number: only digits are allowed if the field is not empty
    if (formData.phone && !/^\d+$/.test(formData.phone)) {
      setStatus({ ...status, error: 'Phone number can only contain numbers.' });
      return;
    }

    setStatus({ submitting: true, submitted: false, error: null });

    try {
      // IMPORTANT: Replace this with your actual API Gateway endpoint
      const endpoint = 'https://YOUR_API_GATEWAY_ENDPOINT_URL/submit';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Something went wrong. Please try again later.');
      }

      setStatus({ submitting: false, submitted: true, error: null });
      setFormData(initialFormData); // Reset form to initial state

    } catch (error) {
      setStatus({ submitting: false, submitted: false, error: error.message });
    }
  };

  return (
    <div className={`${styles.container} ${poppins.className}`}>
      <Head>
        <title>Plan Your Trip - TravelEase</title>
        <meta name="description" content="Submit your travel inquiry to the TravelEase team." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <div className="contact-hero">
          <h1>Plan Your Perfect Getaway</h1>
          <p>Fill out the form below, and our travel experts will craft a personalized itinerary for you.</p>
        </div>

        <div className="form-container">
          {status.submitted ? (
            <div className="success-message">
              <h3>Thank you for your inquiry!</h3>
              <p>You will receive a confirmation email shortly with the details of your request.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <fieldset>
                <legend>Traveler Details</legend>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input type="text" id="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input type="email" id="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input type="tel" id="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </fieldset>

              <fieldset>
                <legend>Travel Specifics</legend>
                 <div className="form-group">
                    <label htmlFor="destination">Destination *</label>
                    <input type="text" id="destination" value={formData.destination} onChange={handleChange} required />
                  </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Departure Date *</label>
                    <input type="date" id="startDate" value={formData.startDate} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endDate">Return Date</label>
                    <input type="date" id="endDate" value={formData.endDate} onChange={handleChange} />
                  </div>
                </div>
                 <div className="form-group">
                    <label htmlFor="travelers">Number of Travelers</label>
                    <input type="number" id="travelers" min="1" value={formData.travelers} onChange={handleChange} />
                  </div>
              </fieldset>
              
              <fieldset>
                <legend>Preferences & Services</legend>
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="tripType">Type of Trip</label>
                        <select id="tripType" value={formData.tripType} onChange={handleChange}>
                            <option>Leisure</option>
                            <option>Honeymoon</option>
                            <option>Adventure</option>
                            <option>Family</option>
                            <option>Business</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="budget">Budget (per person)</label>
                        <select id="budget" value={formData.budget} onChange={handleChange}>
                            <option value="">Select Budget</option>
                            <option value="<1000">Under $1,000</option>
                            <option value="1000-2500">$1,000 - $2,500</option>
                            <option value="2500-5000">$2,500 - $5,000</option>
                            <option value=">5000">Over $5,000</option>
                        </select>
                    </div>
                </div>
                <div className="form-group">
                    <label>Services Needed</label>
                    <div className="checkbox-group">
                        <label><input type="checkbox" id="flights" checked={formData.services.flights} onChange={handleServiceChange} /> Flights</label>
                        <label><input type="checkbox" id="hotels" checked={formData.services.hotels} onChange={handleServiceChange} /> Hotels</label>
                        <label><input type="checkbox" id="tours" checked={formData.services.tours} onChange={handleServiceChange} /> Tours & Activities</label>
                    </div>
                </div>
              </fieldset>

              <fieldset>
                <legend>Special Requests</legend>
                 <div className="form-group">
                    <label htmlFor="requests">Anything else we should know? (e.g., interests, accessibility needs)</label>
                    <textarea id="requests" rows="5" value={formData.requests} onChange={handleChange}></textarea>
                  </div>
              </fieldset>

              {status.error && <p className="error-message">{status.error}</p>}

              <button type="submit" className="submit-button" disabled={status.submitting}>
                {status.submitting ? 'Submitting...' : 'Get My Custom Quote'}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />

      <style jsx>{`
        .contact-hero { text-align: center; padding: 4rem 2rem; background-color: #f0f7ff; }
        .contact-hero h1 { font-size: 2.5rem; font-weight: 700; color: #333; margin-bottom: 0.5rem; }
        .contact-hero p { font-size: 1.2rem; color: #555; max-width: 600px; margin: 0 auto; }
        .form-container { max-width: 800px; margin: 3rem auto; padding: 2.5rem; background-color: #ffffff; border-radius: 15px; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
        fieldset { border: none; padding: 0; margin: 0 0 2rem 0; }
        legend { font-size: 1.5rem; font-weight: 700; color: #0070f3; margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e0e0e0; width: 100%; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #444; }
        .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 0.8rem 1rem; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; font-family: inherit; transition: border-color 0.2s ease, box-shadow 0.2s ease; background-color: #f9f9f9; }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus { outline: none; border-color: #0070f3; box-shadow: 0 0 0 3px rgba(0, 112, 243, 0.2); background-color: #fff; }
        .checkbox-group { display: flex; gap: 1.5rem; align-items: center; }
        .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; font-weight: normal; }
        .checkbox-group input { width: auto; }
        .submit-button { display: block; width: 100%; padding: 1rem; background: #0070f3; color: white; border: none; border-radius: 8px; font-size: 1.2rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s ease; margin-top: 1rem; }
        .submit-button:hover:not(:disabled) { background: #005bb5; }
        .submit-button:disabled { background: #a0c3e8; cursor: not-allowed; }
        .success-message { text-align: center; padding: 2rem; }
        .success-message h3 { font-size: 1.8rem; color: #28a745; margin-bottom: 1rem; }
        .error-message { color: #d93025; margin-bottom: 1rem; text-align: center; }
        @media (max-width: 768px) {
            .form-container { margin: 2rem 1rem; padding: 1.5rem; }
            .contact-hero h1 { font-size: 2rem; }
            .form-row { grid-template-columns: 1fr; gap: 0; }
        }
      `}</style>
    </div>
  );
}


