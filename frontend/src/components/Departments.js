import React, { useState } from "react";

function Departments() {
  const [activeTab, setActiveTab] = useState("cardiology");

  const departments = {
    cardiology: {
      title: "Cardiology",
      description:
        "Cardiology focuses on the diagnosis and treatment of diseases of the heart and blood vessels. Our specialists provide comprehensive care including preventive, diagnostic, and therapeutic services for patients with cardiovascular conditions.",
      img: "/assets/img/departments-1.jpg",
    },
    neurology: {
      title: "Neurology",
      description:
        "Neurology deals with disorders of the nervous system including the brain, spinal cord, and peripheral nerves. Our expert neurologists provide consultations for conditions such as stroke, epilepsy, multiple sclerosis, and neurodegenerative diseases.",
      img: "/assets/img/departments-2.jpg",
    },
    hepatology: {
      title: "Hepatology",
      description:
        "Hepatology is concerned with the study, prevention, diagnosis, and management of diseases that affect the liver, gallbladder, biliary tree, and pancreas. Our team provides advanced care for liver-related conditions.",
      img: "/assets/img/departments-3.jpg",
    },
    pediatrics: {
      title: "Pediatrics",
      description:
        "Pediatrics focuses on the health and medical care of infants, children, and adolescents. Our pediatricians are dedicated to ensuring the well-being of children through preventive healthcare and treatment of illnesses.",
      img: "/assets/img/departments-4.jpg",
    },
    eyecare: {
      title: "Eye Care",
      description:
        "Our Eye Care department offers advanced diagnostic and treatment options for a wide range of eye conditions. From routine eye exams to specialized treatments, our ophthalmologists ensure the best care for your vision.",
      img: "/assets/img/departments-5.jpg",
    },
    dermatology: {
      title: "Dermatology",
      description:
        "Our dermatology department provides diagnosis and treatment for acne, eczema, psoriasis, skin infections, hair loss, and skin cancers. We combine clinical expertise with the latest cosmetic and medical dermatology advancements to enhance skin health and appearance.",
      img: "/assets/img/departments-6.jpg",
    },
  };

  return (
    <section id="departments" className="departments section">
      <div className="container" data-aos="fade-up">
        <div className="section-title">
          <h2>Departments</h2>
          <p>
            Learn more about our specialized departments and the wide range of
            medical services we offer.
          </p>
        </div>

        <div className="row gy-4">
          {/* Left side - Tabs */}
          <div className="col-lg-3">
            <ul className="nav nav-tabs flex-column">
              {Object.keys(departments).map((key) => (
                <li className="nav-item" key={key}>
                  <button
                    className={`nav-link ${
                      activeTab === key ? "active show" : ""
                    }`}
                    onClick={() => setActiveTab(key)}
                  >
                    {departments[key].title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side - Content */}
          <div className="col-lg-9">
            <div className="tab-content">
              <div className="tab-pane fade active show">
                <div className="row gy-4">
                  <div className="col-lg-8 details order-2 order-lg-1">
                    <h3>{departments[activeTab].title}</h3>
                    <p>{departments[activeTab].description}</p>
                  </div>
                  <div className="col-lg-4 text-center order-1 order-lg-2">
                    <img
                      src={`${process.env.PUBLIC_URL}${departments[activeTab].img}`}
                      alt={departments[activeTab].title}
                      className="img-fluid rounded-3 shadow"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Departments;
