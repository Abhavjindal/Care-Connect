import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faRobot,
  faBell,
  faClock,
  faUserMd,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

function Services() {
  const services = [
    {
      icon: faCalendarCheck,
      title: "Book Appointments",
      description:
        "Easily schedule appointments with specialists across departments like Pediatrics, Dermatology, Neurology, and more.",
    },
    {
      icon: faRobot,
      title: "AI Doctor Chat",
      description:
        "Chat with our AI-powered doctor assistant anytime for instant health advice and guidance before your consultation.",
    },
    {
      icon: faBell,
      title: "Medicine Reminders",
      description:
        "Set personalised medication reminders so you never miss a dose — manage and track them all from your dashboard.",
    },
    {
      icon: faClock,
      title: "Track Consultations",
      description:
        "Keep track of all your upcoming and past consultations, check status updates, and manage your health timeline.",
    },
    {
      icon: faUserMd,
      title: "Specialist Directory",
      description:
        "Browse and select from our diverse network of expert doctors sorted by department to get the most accurate care.",
    },
    {
      icon: faUserShield,
      title: "Secure Patient Profile",
      description:
        "Update your personal profile, keep your contact info current, and change or reset your password securely.",
    },
  ];

  return (
    <section id="services" className="services section">
      <div className="container section-title" data-aos="fade-up">
        <h2>Services</h2>
      </div>
      <div className="container">
        <div className="row gy-4">
          {services.map((service, index) => (
            <div
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={(index + 1) * 100}
              key={index}
            >
              <div className="service-item position-relative">
                <div className="icon">
                  <FontAwesomeIcon icon={service.icon} size="2x" />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;
