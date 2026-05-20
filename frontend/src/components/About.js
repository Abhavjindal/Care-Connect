// src/components/About.jsx
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVialCircleCheck, faPumpMedical, faHeartCircleXmark } from '@fortawesome/free-solid-svg-icons';

function About() {
  return (
    <section id="about" className="about section">
      <div className="container">
        <div className="row gy-4 gx-5">
          {/* ✅ Image from public/assets/img */}
          <div
            className="col-lg-6 position-relative align-self-start"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <img
              src={process.env.PUBLIC_URL + '/assets/img/about.jpg'}
              className="img-fluid"
              alt="About"
            />
          </div>

          <div
            className="col-lg-6 content"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3>About Us</h3>
            <p>
              Care Connect is a unified healthcare platform connecting patients with hospitals and clinics.
              We make healthcare access simple, informative, and hassle-free.
            </p>

            <ul>
              <li>
                <FontAwesomeIcon icon={faVialCircleCheck} />
                <div>
                  <h5>Access experienced doctors and verified healthcare providers.</h5>
                </div>
              </li>
              <li>
                <FontAwesomeIcon icon={faPumpMedical} />
                <div>
                  <h5>Explore treatments and book appointments at hospitals and clinics.</h5>
                </div>
              </li>
              <li>
                <FontAwesomeIcon icon={faHeartCircleXmark} />
                <div>
                  <h5>Experience care that prioritizes your health, comfort, and satisfaction.</h5>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
