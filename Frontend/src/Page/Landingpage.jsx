import React, { useState, useEffect } from "react";
import Medihublogo from "../Images/MediHublogo.png";
import Banner from "../Images/Banner.png";
import OnlineAppointmentLogo from "../Images/OnlineAppoitment.png";
import Doctor from "../Images/Doctor.png";
import Twentyfour from "../Images/Twentyfour.png";
import Record from "../Images/MedicalRecord.png";
import ClinicImage from "../Images/Aboutus.png"; // Add a clinic image here
import Navbar from "../Component/Navbar";
import { useNavigate } from "react-router-dom"; 

const Landingpage = () => {
  const navigate = useNavigate(); 
  const handleBookAppointment = () => {
    navigate("/login"); // Navigate to the login page
  };
  // State for About Us sliding navigation
  const [currentAboutIndex, setCurrentAboutIndex] = useState(0);

  // About Us paragraphs data
  const aboutUsParagraphs = [
    "MediHub is a state-of-the-art clinic offering exceptional medical services. Our dedicated team of doctors and healthcare professionals ensures the highest standards of care for our patients.",
    "At MediHub, we focus on providing a comfortable environment with advanced medical technologies to ensure the best treatment outcomes. We are committed to personalized care and patient satisfaction.",
    "We offer a wide range of services, from routine check-ups to specialized treatments. Our team is here to assist you with your health needs every step of the way, ensuring comprehensive healthcare."
  ];

  // Function to show the next About Us paragraph
  const nextAboutUs = () => {
    setCurrentAboutIndex((prevIndex) => (prevIndex + 1) % aboutUsParagraphs.length);
  };

  // Function to show the previous About Us paragraph
  const prevAboutUs = () => {
    setCurrentAboutIndex((prevIndex) =>
      prevIndex === 0 ? aboutUsParagraphs.length - 1 : prevIndex - 1
    );
  };

  


  // Scroll to section and update active section
  

  return (
    <div>
            <div>
        <Navbar/>
      </div>
    <div className="bg-gradient-to-r from-blue-50 to-white min-h-screen flex flex-col items-center">
      {/* Navbar - Fixed */}


      {/* Welcome Heading */}
      <div id="home" className="w-full text-center mb-12 mt-24">
        <h1 className="text-5xl font-extrabold text-gray-900 mt-10">
          Welcome to <span className="text-[#3CB5AC]">MediHub</span>!
        </h1>
        <p className="text-gray-600 mt-4">
          Your trusted partner for managing health appointments with ease.
        </p>
      </div>

      <main className="flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="lg:w-1/2 text-center lg:text-left mt-8">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-10 ml-14">
            Make an <span className="text-[#015F6B]">Appointment</span>
          </h1>
          <p className="text-gray-600 mb-6 leading-8">
            Schedule your appointment with one of our trusted doctors today. We offer a wide range of medical services to help you maintain your health and well-being.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-[#2FA093] text-white px-6 py-3 rounded hover:text-blue-700 ml-36 mt-14">
              Book Appointment
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 mt-10 lg:mt-0">
          <img
            src={Banner}
            alt="Doctor"
            className="w-full rounded-lg shadow-md"
          />
        </div>
      </main>

      {/* Services Section */}
      <section id="services" className="w-full mt-16 bg-blue-50 py-12">
        <h2 className="text-3xl font-extrabold text-[#3CB5AC] text-center mb-8">
          Our Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
          <div className="bg-[#015F6B] p-6 rounded-lg shadow-md text-center">
            <img src={OnlineAppointmentLogo} alt="Online Appointment" className="w-16 h-14 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Online Appointment</h3>
            <p className="text-white">
              Book your appointments online easily and at your convenience.
            </p>
          </div>

          <div className="bg-[#0367A5] p-6 rounded-lg shadow-md text-center">
            <img src={Twentyfour} alt="24/7 Availability" className="w-16 h-14 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">24/7 Availability</h3>
            <p className="text-white">
              Our services are available around the clock, whenever you need us.
            </p>
          </div>

          <div className="bg-[#3A99D9] p-6 rounded-lg shadow-md text-center">
            <img src={Doctor} alt="Trusted Doctors" className="w-16 h-14 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Trusted Doctors</h3>
            <p className="text-white">
              Consult with our experienced and certified doctors for expert care.
            </p>
          </div>

          <div className="bg-[#007B8A] p-6 rounded-lg shadow-md text-center">
            <img src={Record} alt="Secure Medical Records" className="w-16 h-14 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Secure Medical Records</h3>
            <p className="text-white">
              Your medical history is stored securely and can be accessed anytime.
            </p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="w-full mt-16 bg-white py-12">
        <h2 className="text-3xl font-extrabold text-[#3CB5AC] text-center mb-8">
          About Us
        </h2>
        <div className="flex flex-col lg:flex-row items-center justify-center max-w-7xl mx-auto px-4">
          <div className="lg:w-1/2 text-center lg:text-left">
            <p className="text-[25px] text-gray-600 mb-6 leading-10">
              {aboutUsParagraphs[currentAboutIndex]}
            </p>

            <div className="flex space-x-7 mt-12 ml-44">
              <button
                className="bg-[#3CB5AC] text-white px-6 py-3 rounded hover:bg-[#015F6B]"
                onClick={prevAboutUs}
              >
                &#8592;
              </button>
              <button
                className="bg-[#3CB5AC] text-white px-6 py-3 rounded hover:bg-[#015F6B]"
                onClick={nextAboutUs}
              >
                &#8594;
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 mt-8 lg:mt-0 ml-28">
            <img
              src={ClinicImage}
              alt="Clinic"
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      {/* Contact Us Section */}
     <section className="w-full mt-16 bg-[#F5F8FB] py-12">
  <h2 className="text-3xl font-extrabold text-[#3CB5AC] text-center mb-8">
    Contact Us
  </h2>
  <div className="max-w-7xl mx-auto px-4">
    <div className="flex justify-between items-start gap-12">
      {/* Left Section: Quick Links */}
      <div className="lg:w-1/3 ml-18 mb-8 lg:mb-0">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Quick Links</h3>
        <ul className="text-lg text-gray-600">
          <li className="mb-4 hover:text-[#015F6B] cursor-pointer">Home</li>
          <li className="mb-4 hover:text-[#015F6B] cursor-pointer">Services</li>
          <li className="mb-4 hover:text-[#015F6B] cursor-pointer">About Us</li>
          <li className="mb-4 hover:text-[#015F6B] cursor-pointer">Contact Us</li>
        </ul>
      </div>

      {/* Middle Section: Image */}
      <div className="lg:w-1/3 ml-60 mr-20 flex justify-center mb-8 lg:mb-0">
        <img
          src={Medihublogo} // Make sure this path points to your image
          alt="Clinic"
          className="w-64 h-64 
          "
        />
      </div>

      {/* Right Section: Contact Details */}
      <div className="lg:w-1/3  text-left ml-36"> {/* Use ml-auto here to push the section to the right */}
        {/* Follow Us Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Follow Us</h3>
          <div className="flex space-x-8 mb-8">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg" // Facebook Logo
                alt="Facebook"
                className="w-12 h-12 transition-transform duration-300 ease-in-out hover:scale-110"
              />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" // Instagram Logo
                alt="Instagram"
                className="w-12 h-12 transition-transform duration-300 ease-in-out hover:scale-110"
              />
            </a>
          </div>
        </div>

        {/* Email Us Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Email Us</h3>
          <p className="text-lg text-gray-600">contact@medihub.com</p>
        </div>

        {/* Contact No Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Contact No</h3>
          <p className="text-lg text-gray-600">9811321046</p>
        </div>
      </div>
    </div>
  </div>
</section>
    </div>
    </div>

  );
};

export default Landingpage;
