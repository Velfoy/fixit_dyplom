"use client";

import { ArrowRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "@/styles/landing.css";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleArrowClick = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  const handleGetStarted = () => {
    if (session?.user) {
      // User is logged in, redirect to dashboard
      const role = (session.user as any).role?.toLowerCase() || "admin";
      router.push(`/${role}/dashboard`);
    } else {
      // User is not logged in, redirect to login
      router.push("/login");
    }
  };

  const handleContactClick = () => {
    // Scroll to footer
    handleArrowClick("footer");
  };
  return (
    <div className="landing-page">
      {/* Header */}

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=80"
            alt="Modern auto repair shop"
            className="hero-img"
          />
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Transform Your Auto Shop
              <br />
              Management
            </h1>
            <p className="hero-description">
              Complete auto repair shop management system. Track orders, manage
              inventory, handle customers, and boost your shop's efficiency with
              FixIt.
            </p>
            <button
              className="hero-btn"
              onClick={() => handleArrowClick("contact")}
            >
              Get in Touch
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing-container" id="features">
        <div className="features-heading">
          <h2 className="features-title">
            Everything Your Shop
            <br />
            Needs to Succeed
            <br />
          </h2>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-img">
              <img
                src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1080&q=80"
                alt="Service Orders Management"
              />
            </div>
            <div className="feature-content">
              <div className="feature-header">
                <h3 className="feature-title">Service Orders</h3>
                <span className="feature-value">Complete Lifecycle</span>
              </div>
              <p className="feature-description">
                Create, track, and manage service orders from intake through
                completion. Assign parts, set priorities, and monitor real-time
                status updates
              </p>
              <button
                className="feature-link"
                onClick={() => handleArrowClick("services")}
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-content">
              <div className="feature-header">
                <h3 className="feature-title">Warehouse & Parts</h3>
              </div>
              <p className="feature-description">
                Manage your complete inventory with real-time stock tracking.
                Monitor part quantities, suppliers, pricing, and automate
                reordering when stock runs low
              </p>
              <button
                className="feature-link"
                onClick={() => handleArrowClick("warehouse-section")}
              >
                Explore <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="feature-img">
              <img
                src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1080&q=80"
                alt="Warehouse Management"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="landing-container">
        <div className="mission-section">
          <p className="mission-label">Our Vision</p>
          <h2 className="mission-title">
            "Every auto repair shop deserves powerful tools to streamline
            operations, manage teams efficiently, and deliver exceptional
            customer experiences."
          </h2>
        </div>
      </section>

      {/* Services Section */}
      <section className="landing-container" id="services">
        <div className="performance-list">
          <div className="performance-item">
            <div className="performance-left">
              <h3 className="performance-title">Customers Management</h3>
            </div>
            <div className="performance-right">
              <p className="performance-description">
                Maintain detailed customer profiles with complete vehicle
                history, service records, and communication history
              </p>
              <button
                className="performance-icon"
                onClick={() => handleArrowClick("customers-section")}
                title="View Customers"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="performance-item">
            <div className="performance-left">
              <h3 className="performance-title">Mechanics Management</h3>
            </div>
            <div className="performance-right">
              <p className="performance-description">
                Track your team's schedule, assign tasks to mechanics, monitor
                productivity and performance metrics
              </p>
              <button
                className="performance-icon"
                onClick={() => handleArrowClick("mechanics-section")}
                title="View Mechanics"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="performance-item">
            <div className="performance-left">
              <h3 className="performance-title">Cars & Vehicles</h3>
            </div>
            <div className="performance-right">
              <p className="performance-description">
                Catalog all vehicles in the system with detailed specs,
                maintenance history, and service recommendations
              </p>
              <button
                className="performance-icon"
                onClick={() => handleArrowClick("cars-section")}
                title="View Cars"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="performance-item">
            <div className="performance-left">
              <h3 className="performance-title">Branches Management</h3>
            </div>
            <div className="performance-right">
              <p className="performance-description">
                Manage multiple shop locations with centralized control and
                branch-specific tracking
              </p>
              <button
                className="performance-icon"
                onClick={() => handleArrowClick("branches-section")}
                title="View Branches"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="performance-item">
            <div className="performance-left">
              <h3 className="performance-title">User Roles & Permissions</h3>
            </div>
            <div className="performance-right">
              <p className="performance-description">
                Set up different user roles (Admin, Manager, Mechanic, Customer)
                with customized access levels
              </p>
              <button
                className="performance-icon"
                onClick={() => handleArrowClick("users-section")}
                title="View Users"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="landing-container" id="warehouse-section">
        <div className="stats-card">
          <div className="stats-grid">
            <div className="stats-img">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1080&q=80"
                alt="Warehouse System"
              />
            </div>

            <div className="stats-content">
              <div>
                <div className="stats-item">
                  <div className="stats-value-row">
                    <span className="stats-value">Track</span>
                    <span className="stats-unit">Real-time</span>
                  </div>
                  <p className="stats-label">Monitor all warehouse inventory</p>
                </div>

                <div className="stats-item">
                  <div className="stats-value-row">
                    <span className="stats-value">Manage</span>
                    <span className="stats-unit">Suppliers</span>
                  </div>
                  <p className="stats-label">
                    Set pricing and supplier details
                  </p>
                </div>

                <div className="stats-item">
                  <div className="stats-value-row">
                    <span className="stats-value">Parts</span>
                    <span className="stats-unit">Organized</span>
                  </div>
                  <p className="stats-label">
                    Categorize and search parts easily
                  </p>
                </div>
              </div>

              <div className="stats-footer">
                <p>
                  Keep your warehouse running smoothly with comprehensive
                  inventory management, stock tracking, and automated alerts
                  when parts run low.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="landing-container">
        <div className="gallery-header">
          <p className="mission-label">Key Modules</p>
          <h2 className="features-title">
            Manage Every Aspect
            <br />
            of Your Business
          </h2>
        </div>

        <div className="gallery-grid">
          <div className="gallery-item" id="customers-section">
            <div className="gallery-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1080&q=80"
                alt="Customer Management"
              />
            </div>
            <h3 className="gallery-item-title">Customers</h3>
            <p className="gallery-item-subtitle">
              Complete customer profiles with history and communication
            </p>
          </div>

          <div className="gallery-item" id="mechanics-section">
            <div className="gallery-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1521791055366-0d553872125f?w=1080&q=80"
                alt="Mechanics Management"
              />
            </div>
            <h3 className="gallery-item-title">Mechanics</h3>
            <p className="gallery-item-subtitle">
              Track team schedules, tasks, and performance metrics
            </p>
          </div>

          <div className="gallery-item" id="invoices-section">
            <div className="gallery-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=1080&q=80"
                alt="Invoicing System"
              />
            </div>
            <h3 className="gallery-item-title">Invoices</h3>
            <p className="gallery-item-subtitle">
              Generate invoices and manage payments with Stripe
            </p>
          </div>

          <div className="gallery-item" id="cars-section">
            <div className="gallery-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1080&q=80"
                alt="Vehicle Management"
              />
            </div>
            <h3 className="gallery-item-title">Vehicles</h3>
            <p className="gallery-item-subtitle">
              Catalog all vehicles with complete service history
            </p>
          </div>

          <div className="gallery-item" id="branches-section">
            <div className="gallery-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&q=80"
                alt="Branch Management"
              />
            </div>
            <h3 className="gallery-item-title">Branches</h3>
            <p className="gallery-item-subtitle">
              Manage multiple shop locations centrally
            </p>
          </div>

          <div className="gallery-item" id="users-section">
            <div className="gallery-img-wrapper">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1080&q=80"
                alt="User Management"
              />
            </div>
            <h3 className="gallery-item-title">Users & Roles</h3>
            <p className="gallery-item-subtitle">
              Set permissions for Admin, Manager, Mechanic, Customer
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section" id="contact">
          <h2 className="cta-title">
            Want to Learn More
            <br />
            About FixIt?
          </h2>
          <p className="cta-description">
            Contact us to see how FixIt can help your auto repair shop
            streamline operations, manage your team more efficiently, and
            deliver better service to your customers.
          </p>
          <div className="cta-buttons">
            <button className="cta-btn-primary" onClick={handleContactClick}>
              Contact Us
            </button>
            <button className="cta-btn-secondary" onClick={handleGetStarted}>
              Get Started
            </button>
          </div>
        </div>
        {/* Docs & Help Section */}
        <section className="landing-container" id="documentation">
          <div className="gallery-header center-text">
            <p className="mission-label">Documentation</p>
            <h2 className="features-title">Guide to Get Started</h2>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item">
              <div className="gallery-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1080&q=80"
                  alt="Setup"
                />
              </div>
              <h3 className="gallery-item-title">Setup & Roles</h3>
              <p className="gallery-item-subtitle">
                Create branches, invite users, and assign roles (Admin, Manager,
                Mechanic, Customer)
              </p>
            </div>

            <div className="gallery-item">
              <div className="gallery-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1080&q=80"
                  alt="Orders"
                />
              </div>
              <h3 className="gallery-item-title">Service Orders</h3>
              <p className="gallery-item-subtitle">
                Intake vehicles, assign mechanics, add parts/labor, track status
                to completion
              </p>
            </div>

            <div className="gallery-item">
              <div className="gallery-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1080&q=80"
                  alt="Invoices"
                />
              </div>
              <h3 className="gallery-item-title">Invoicing & Payments</h3>
              <p className="gallery-item-subtitle">
                Generate invoices, apply taxes/discounts, and collect payments
                via Stripe
              </p>
            </div>
          </div>
        </section>

        <section className="landing-container" id="help">
          <div className="gallery-header center-text">
            <p className="mission-label">Help & Support</p>
            <h2 className="features-title">We’re Here When You Need Us</h2>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item">
              <div className="gallery-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=1080&q=80"
                  alt="Onboarding"
                />
              </div>
              <h3 className="gallery-item-title">Onboarding</h3>
              <p className="gallery-item-subtitle">
                Guided setup checklist and quick-start videos for your team
              </p>
            </div>

            <div className="gallery-item">
              <div className="gallery-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1509475826633-fed577a2c71b?w=1080&q=80"
                  alt="Troubleshooting"
                />
              </div>
              <h3 className="gallery-item-title">Troubleshooting</h3>
              <p className="gallery-item-subtitle">
                Common fixes, data checks, and contact paths for urgent issues
              </p>
            </div>

            <div className="gallery-item">
              <div className="gallery-img-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1080&q=80"
                  alt="Training"
                />
              </div>
              <h3 className="gallery-item-title">Training</h3>
              <p className="gallery-item-subtitle">
                Role-based tips for Admins, Managers, Mechanics, and Front Desk
              </p>
            </div>
          </div>
        </section>
        {/* FAQ Section */}
        <section
          className="landing-container faq-section"
          id="faq"
          style={{ padding: "5rem 0rem" }}
        >
          <div className="gallery-header center-text">
            <p className="mission-label">FAQ</p>
            <h2 className="features-title">Frequently Asked Questions</h2>
          </div>

          <div className="faq-list">
            {[
              {
                q: "How do I start using FixIt?",
                a: "Click Get Started below. If you already have an account, you'll go straight to your dashboard; otherwise you'll be prompted to log in.",
              },
              {
                q: "Can FixIt handle multiple branches?",
                a: "Yes. You can manage multiple shop locations with centralized control and branch-specific tracking.",
              },
              {
                q: "Does FixIt manage parts and warehouse stock?",
                a: "FixIt tracks parts, suppliers, pricing, and stock levels with alerts when items run low.",
              },
            ].map((item, idx) => (
              <details key={idx} className="faq-item">
                <summary className="faq-summary">{item.q}</summary>
                <p className="faq-answer">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>FIXIT</h3>
              <p>Auto Repair Shop Management System</p>
            </div>
            <div className="footer-section">
              <h4>Features</h4>
              <ul className="footer-links">
                <li>
                  <a href="#features">Overview</a>
                </li>
                <li>
                  <a href="#services">Modules</a>
                </li>
                <li>
                  <a href="#contact">Contact</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Support</h4>
              <ul className="footer-links">
                <li>
                  <a href="#documentation">Documentation</a>
                </li>
                <li>
                  <a href="#faq">FAQ</a>
                </li>
                <li>
                  <a href="#help">Help</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Contact</h4>
              <ul className="footer-links">
                <li>marsonyteam@gmail.com</li>
                <li>+48 883 589 324</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 FixIt. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
