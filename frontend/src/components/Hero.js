// src/components/Hero.jsx
import React from 'react';
import '../css/main.css'; // your existing CSS

const Hero = () => {
  return (
    <section id="hero" className="hero section light-background">
      {/* ✅ Background Image — from public/assets/img */}
      <img
        src={process.env.PUBLIC_URL + '/assets/img/hero-bg.jpg'}
        alt="Hero Background"
        className="hero-bg"
      />

      <div className="container position-relative">
        {/* Welcome Text */}
        <div className="welcome position-relative" data-aos="fade-down" data-aos-delay="100">
          <h2>WELCOME TO CARE-CONNECT</h2>
        </div>

        <div className="content row gy-4">
          {/* Why Choose Care-Connect Box */}
          <div className="col-lg-4 d-flex align-items-stretch">
            <div className="why-box" data-aos="zoom-out" data-aos-delay="200">
              <h3>Why Choose Care-Connect?</h3>
              <p>
                Care Connect offers a seamless digital healthcare experience by combining a user-friendly interface with
                a powerful backend system. It allows patients to easily explore hospital departments, understand
                treatments, and book appointments—all in one place. Designed for clarity, speed, and accessibility, Care
                Connect simplifies hospital interactions, saves time, and ensures patients get the information and
                support they need without hassle.
              </p>
              <div className="text-center">
                <a href="#about" className="more-btn">
                  <span>Learn More</span> <i className="bi bi-chevron-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="col-lg-8 d-flex align-items-stretch">
            <div className="d-flex flex-column justify-content-center">
              <div className="row gy-4">
                {/* Card 1 */}
                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="300">
                    <i className="bi bi-chat-dots"></i>
                    <h4>Conversational Health Assistance</h4>
                    <p>
                      Provides 24x7 AI-powered support through natural dialogue, simulating a nurse's guidance.
                    </p>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="400">
                    <i className="bi bi-capsule-pill"></i>
                    <h4>Medication & Appointment Management</h4>
                    <p>
                      Sends personalized reminders for medicine and appointments to ensure adherence and timely care.
                    </p>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="col-xl-4 d-flex align-items-stretch">
                  <div className="icon-box" data-aos="zoom-out" data-aos-delay="500">
                    <i className="bi bi-heart-pulse"></i>
                    <h4>Wellness Monitoring & Emergency Alerts</h4>
                    <p>
                      Tracks symptoms, checks mental well-being, and notifies caregivers in emergencies using real-time
                      insights.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
