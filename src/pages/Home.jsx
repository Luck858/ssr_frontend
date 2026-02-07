import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import HomeWelcomeSection from "../components/HomeWelcomeSection";
import ManagementSection from "../components/ManagementSection";
import StatsCounter from "../components/StatsCounter";
import StudentsJourney from "../components/StudentsJourney";
import RecruitersSection from "../components/RecruitersSection";
import Footer from "../components/Footer";

const API = import.meta.env.VITE_API_URL;

const HomePage = () => {
  const [slides, setSlides] = useState([]);
  const [loadingHero, setLoadingHero] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resSlides = await fetch(`${API}/api/hero-carousel/slides`);
        const dataSlides = await resSlides.json();
        setSlides(dataSlides.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setTimeout(() => setLoadingHero(false), 600);
      }
    };

    load();
  }, []);

  return (
    <>
      <Navbar />

      {/* ================= HERO ================= */}
      <section className="section-hero">
        {loadingHero ? (
          <div className="container py-4">
            <div className="skeleton" style={{ height: 360 }} />
          </div>
        ) : (
          <HeroSection slides={slides} />
        )}
      </section>

      {/* ================= WELCOME ================= */}
      <section className="section section-white compact">
        <HomeWelcomeSection />
      </section>

      {/* ================= MANAGEMENT ================= */}
      {/* <section className="section section-soft compact">
        <ManagementSection />
      </section> */}

      {/* ================= STATS ================= */}
      <section className="section section-white compact">
        <StatsCounter />
      </section>

      {/* ================= STUDENT JOURNEY ================= */}
      <section className="section section-soft compact">
        <StudentsJourney />
      </section>

      {/* ================= RECRUITERS ================= */}
      <section className="section section-white compact">
        <RecruitersSection />
      </section>

      {/* ================= FOOTER ================= */}
      <Footer />

      {/* ================= GLOBAL PAGE STYLES ================= */}
      <style>{`
        /* ---------- BASE SECTION ---------- */
        .section {
          padding: 70px 0;
          margin: 0;
        }

        /* Reduce padding when sections touch */
        .section.compact {
          padding-top: 50px;
          padding-bottom: 0px;
        }

        .section-white {
          background: #ffffff;
        }

        .section-soft {
          background: var(--primary-soft);
        }

        .section-hero {
          background: #ffffff;
          padding: 0;
        }

        /* ---------- CONTAINER ---------- */
        .container {
          max-width: 1200px;
        }

        /* ---------- SKELETON ---------- */
        .skeleton {
          background: linear-gradient(
            90deg,
            #ececec,
            #f5f5f5,
            #ececec
          );
          background-size: 200% 100%;
          animation: shimmer 1.2s infinite;
          border-radius: 12px;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* ---------- MOBILE ---------- */
        @media (max-width: 768px) {
          .section {
            padding: 50px 0;
          }
          .section.compact {
            padding: 40px 0;
          }
        }
      `}</style>
    </>
  );
};

export default HomePage;
