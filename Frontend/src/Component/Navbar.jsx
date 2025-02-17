import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct hook for navigation
import Medihublogo from "../Images/MediHublogo.png";
import Button from './Button';

const Navbar = () => {
    const [activeSection, setActiveSection] = useState("home");
    const navigate = useNavigate(); // Initialize navigate

    const scrollToSection = (section) => {
        const element = document.getElementById(section);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            setActiveSection(section);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const sections = ["home", "services", "about", "contact"];
            let active = "home";
            sections.forEach((section) => {
                const el = document.getElementById(section);
                if (el && window.scrollY >= el.offsetTop - 50) {
                    active = section;
                }
            });
            setActiveSection(active);
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        <div className="w-full bg-[#3CB5AC] fixed top-0 left-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-24">
                <div className="text-lg font-semibold text-white">
                    <img src={Medihublogo} alt="logo" className="w-14" />
                </div>
                <ul className="flex space-x-16 text-white">
                    <li
                        className={`cursor-pointer hover:text-blue-900 ${activeSection === "home" ? "text-blue-900" : ""}`}
                        onClick={() => scrollToSection("home")}
                    >
                        Home
                    </li>
                    <li
                        className={`cursor-pointer hover:text-blue-900 ${activeSection === "services" ? "text-blue-900" : ""}`}
                        onClick={() => scrollToSection("services")}
                    >
                        Services
                    </li>
                    <li
                        className={`cursor-pointer hover:text-blue-900 ${activeSection === "about" ? "text-blue-900" : ""}`}
                        onClick={() => scrollToSection("about")}
                    >
                        About us
                    </li>
                    <li
                        className={`cursor-pointer hover:text-blue-900 ${activeSection === "contact" ? "text-blue-900" : ""}`}
                        onClick={() => scrollToSection("contact")}
                    >
                        Contact us
                    </li>
                </ul>
                <div className="flex space-x-2">
                    <Button
                        type="button"
                        text="Login"
                        onClick={() => navigate('/login')} // Correct navigation
                        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
                    />
                    <Button
                        type="button"
                        text="Sign Up"
                        onClick={() => navigate('/signup')} // Correct navigation
                        className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-200"
                    />
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
