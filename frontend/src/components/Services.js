import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserMd,
  faStethoscope,
  faVials,
  faAmbulance,
  faWheelchair,
  faNotesMedical,
} from "@fortawesome/free-solid-svg-icons";

function Services() {
  const services = [
    {
      icon: faUserMd,
      title: "Primary Care",
      description:
        "General consultations, health checkups, and preventive care from hospitals and clinics near you.",
    },
    {
      icon: faStethoscope,
      title: "Specialist Consultations",
      description:
        "Expert advice from specialists in cardiology, orthopedics, neurology, dermatology, and more.",
    },
    {
      icon: faVials,
      title: "Diagnostics & Lab Tests",
      description:
        "Access labs and imaging centers for blood tests, X-rays, MRIs, ultrasounds, and other diagnostic needs.",
    },
    {
      icon: faAmbulance,
      title: "Emergency & Urgent Care",
      description:
        "Locate nearby emergency rooms and urgent care clinics for quick medical attention.",
    },
    {
      icon: faWheelchair,
      title: "Rehabilitation & Therapy",
      description:
        "Book physiotherapy, occupational therapy, and speech therapy services at trusted centers.",
    },
    {
      icon: faNotesMedical,
      title: "Pharmacy & Medicine Delivery",
      description:
        "Get e-prescriptions and convenient medicine delivery or pickup from partner pharmacies.",
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
