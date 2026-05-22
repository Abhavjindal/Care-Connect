import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function Testimonials() {
  const testimonials = [
    {
      name: "Dr. Priya Sharma",
      role: "Physician",
      img: process.env.PUBLIC_URL + "/assets/img/testimonials-1.jpg",
      rating: 5,
      text: "The new AI Doctor chat provides instant, empathetic advice, making patient triage faster than ever.",
    },
    {
      name: "Ravi Patel",
      role: "Patient",
      img: process.env.PUBLIC_URL + "/assets/img/testimonials-2.jpg",
      rating: 5,
      text: "Booking appointments is a breeze now, and the password reset feature saved me when I forgot my login details.",
    },
    {
      name: "Dr. Anil Kumar",
      role: "Physician",
      img: process.env.PUBLIC_URL + "/assets/img/testimonials-3.jpg",
      rating: 4.5,
      text: "The department view lets me quickly identify patients needing my specialty, and the AI chat assists with triage.",
    },
    {
      name: "Sneha Desai",
      role: "Patient",
      img: process.env.PUBLIC_URL + "/assets/img/testimonials-4.jpg",
      rating: 5,
      text: "I love seeing the department info next to each doctor; it helped me choose the right specialist.",
    },
    {
      name: "Dr. Vikram Singh",
      role: "Physician",
      img: process.env.PUBLIC_URL + "/assets/img/testimonials-5.jpg",
      rating: 5,
      text: "Integration with reminders ensures my patients never miss follow‑up appointments.",
    },
  ];

  return (
    <section id="testimonials" className="testimonials section">
      <div className="container">
        <div className="row align-items-center">
          {/* Left Info Section */}
          <div
            className="col-lg-5 info"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            <h3>What Our Users Say</h3>
            <p>
              Hear from patients and professionals who trust Care Connect for
              seamless healthcare services.
            </p>
          </div>

          {/* Right Swiper Slider */}
          <div className="col-lg-7" data-aos="fade-up" data-aos-delay="200">
            <Swiper
              loop={true}
              speed={600}
              autoplay={{ delay: 5000 }}
              slidesPerView="auto"
              pagination={{ clickable: true }}
              modules={[Pagination, Autoplay]}
            >
              {testimonials.map((t, index) => (
                <SwiperSlide key={index}>
                  <div className="testimonial-item">
                    <div className="d-flex align-items-center">
                      <img
                        src={t.img}
                        className="testimonial-img flex-shrink-0"
                        alt={t.name}
                      />
                      <div>
                        <h3>{t.name}</h3>
                        <h4>{t.role}</h4>
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <i
                              key={i}
                              className={`bi bi-star${
                                t.rating >= i + 1
                                  ? "-fill"
                                  : t.rating > i
                                  ? "-half"
                                  : ""
                              }`}
                            ></i>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p>
                      <i className="bi bi-quote quote-icon-left"></i>
                      <span>{t.text}</span>
                      <i className="bi bi-quote quote-icon-right"></i>
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
