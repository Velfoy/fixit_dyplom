"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// --- INTERFACES ---

interface FeatureProps {
  title: string;
  description: string;
  icon: string;
}

// --- DATA ---

const superiorityPoints: FeatureProps[] = [
  {
    title: "🚀 Faster Workflows",
    description:
      "Automate schedules, work orders, and invoicing to serve more customers without adding headcount.",
    icon: "🚀",
  },
  {
    title: "🧠 Full Data Control",
    description:
      "Centralize customer data, vehicle history, and parts management in one easy-to-access place.",
    icon: "🧠",
  },
  {
    title: "⚙️ Resource Optimization",
    description:
      "Track mechanic time and inventory precisely to reduce waste and downtime.",
    icon: "⚙️",
  },
];

// --- STYLES ---

const styles = `
  .homepage-container {
    background-color: #f7f7f7;
    color: #111827;
    font-family: "Trebuchet MS", sans-serif;
    line-height: 1.6;
  }

  .hero-section {
    position: relative;
    height: 70vh;
    min-height: 500px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(135deg, #ad0404 0%, #b90606 100%);
    padding: 20px;
    color: white;
  }

  .hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 20px;
    letter-spacing: -0.5px;
  }

  .hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 40px;
    opacity: 0.95;
    max-width: 600px;
  }

  .cta-button {
    background-color: white;
    color: #ad0404;
    border: none;
    padding: 14px 32px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.3s ease;
    border-radius: 10px;
    font-family: "Trebuchet MS", sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .cta-button:hover {
    background-color: #f2f2f2;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .metrics-teaser {
    display: flex;
    justify-content: center;
    gap: 80px;
    padding: 60px 20px;
    background-color: white;
    flex-wrap: wrap;
  }

  .metric-item {
    text-align: center;
  }

  .metric-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: #ad0404;
  }

  .metric-label {
    font-size: 0.95rem;
    color: #6b7280;
    margin-top: 8px;
  }

  .features-section {
    padding: 80px 5%;
    background-color: #f7f7f7;
  }

  .about-section {
    padding: 80px 5%;
    background-color: white;
  }

  .contact-section {
    padding: 80px 5%;
    background-color: #1f2937;
    color: white;
  }

  .section-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 60px;
    color: #111827;
    font-weight: 800;
  }

  .contact-section .section-title {
    color: white;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 30px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .feature-card {
    background-color: white;
    padding: 40px;
    border-radius: 16px;
    border-top: 5px solid #ad0404;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 16px;
    display: block;
  }

  .feature-title {
    font-size: 1.3rem;
    margin-bottom: 12px;
    color: #111827;
    font-weight: 700;
  }

  .feature-card p {
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .about-content {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 50px;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
  }

  .about-text p {
    margin-bottom: 20px;
    color: #4b5563;
    line-height: 1.8;
    font-size: 1rem;
  }

  .about-image {
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .contact-details {
    font-size: 1.1rem;
    margin-top: 30px;
  }

  .contact-details p {
    margin: 15px 0;
  }

  .contact-link {
    color: #ad0404;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s;
  }

  .contact-link:hover {
    color: #8c0303;
  }

  @media (max-width: 768px) {
    .hero-title {
      font-size: 2rem;
    }

    .hero-subtitle {
      font-size: 1rem;
    }

    .metrics-teaser {
      gap: 40px;
    }

    .about-content {
      grid-template-columns: 1fr;
    }

    .section-title {
      font-size: 2rem;
    }

    .features-section,
    .about-section,
    .contact-section {
      padding: 40px 5%;
    }
  }
`;

// --- COMPONENTS ---

const HeroSection: React.FC = () => {
  const { data: session } = useSession();

  return (
    <header className="hero-section">
      <h1 className="hero-title">Next-Level Automotive Service Management</h1>
      <p className="hero-subtitle">
        Cut wasted time, grow profits, and delight customers with a modern
        platform.
      </p>
      {!session ? (
        <Link href="/login" className="cta-button">
          Start for Free
        </Link>
      ) : (
        <Link
          href={`/${session.user?.role?.toLowerCase()}/dashboard`}
          className="cta-button"
        >
          Go to Dashboard
        </Link>
      )}
    </header>
  );
};

const MetricsTeaser: React.FC = () => (
  <div className="metrics-teaser">
    <div className="metric-item">
      <div className="metric-value">98%</div>
      <div className="metric-label">Efektywność Zleceń</div>
    </div>
    <div className="metric-item">
      <div className="metric-value">250+</div>
      <div className="metric-label">Zadowolonych Klientów</div>
    </div>
    <div className="metric-item">
      <div className="metric-value">30%</div>
      <div className="metric-label">Wzrost Zysków</div>
    </div>
  </div>
);

const FeatureCard: React.FC<FeatureProps> = ({ title, description, icon }) => (
  <div className="feature-card">
    <span className="feature-icon">{icon}</span>
    <h3 className="feature-title">{title}</h3>
    <p>{description}</p>
  </div>
);

const FeaturesSection: React.FC = () => (
  <section className="features-section">
    <h2 className="section-title">Why Choose Our Platform?</h2>
    <div className="features-grid">
      {superiorityPoints.map((point, index) => (
        <FeatureCard key={index} {...point} />
      ))}
    </div>
  </section>
);

const AboutSection: React.FC = () => (
  <section className="about-section">
    <h2 className="section-title">About Us</h2>
    <div className="about-content">
      <div className="about-text">
        <p>
          Our system was built by a team that understands the challenges of
          modern workshops. Instead of complex and slow tools, we deliver an
          intuitive platform that automates critical processes.
        </p>
        <p>
          <strong>Our Mission:</strong> Let shop owners focus on great service
          while we handle management, scheduling, and paperwork. Your data stays
          secure and available 24/7.
        </p>
      </div>
      <img
        src="/images/logo_white_"
        alt="Panel administracyjny systemu"
        className="about-image"
      />
    </div>
  </section>
);

const ContactSection: React.FC = () => (
  <section className="contact-section">
    <h2 className="section-title">How to Contact Us</h2>
    <p style={{ fontSize: "1.05rem", marginBottom: "30px" }}>
      Want to learn how this helps your shop? We are here to help.
    </p>
    <div className="contact-details">
      <p>
        <strong>Phone:</strong>{" "}
        <a href="tel:+48123456789" className="contact-link">
          +48 123 456 789
        </a>
      </p>
      <p>
        <strong>Email:</strong>{" "}
        <a href="mailto:kontakt@fixit.pl" className="contact-link">
          kontakt@fixit.pl
        </a>
      </p>
    </div>
    <div style={{ marginTop: "40px" }}>
      <Link href="/login" className="cta-button">
        Sign Up and Get an Offer
      </Link>
    </div>
  </section>
);

// --- MAIN COMPONENT ---

export default function ServiceManagementHomePage() {
  return (
    <>
      <style>{styles}</style>
      <div className="homepage-container">
        <HeroSection />
        <MetricsTeaser />
        <FeaturesSection />
        <AboutSection />
        <ContactSection />
      </div>
    </>
  );
}
