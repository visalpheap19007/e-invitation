import React, { useEffect, useMemo, useRef, useState } from "react";
import { WEDDING_DATE, images, contacts, mapUrl, content } from "./config.js";
const KH_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
const toKhmer = (n) =>
  String(n)
    .split("")
    .map((d) => (/\d/.test(d) ? KH_DIGITS[Number(d)] : d))
    .join("");

function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, new Date(target).getTime() - Date.now());
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff / 3600000) % 24),
      m: Math.floor((diff / 60000) % 60),
      s: Math.floor((diff / 1000) % 60),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return t;
}

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}


function Intro({ onOpen, t, lang }) {
  return (
    <div className="intro">
      <img src={images.cover} alt="" width={100} className="intro-bg" />
      <div className="intro-shade" />
      <div className="intro-inner">
        <p className="intro-small">{t.title}</p>
        <h1 className="intro-names">
          {t.brideName} <span>&amp;</span> {t.groomName}
        </h1>
        <button className="btn" onClick={onOpen}>
          {lang === "km" ? "បើកលិខិតអញ្ជើញ" : "Open invitation"}
        </button>
      </div>
    </div>
  );
}

function Countdown({ t, lang }) {
  const c = useCountdown(WEDDING_DATE);
  const vals = [c.d, c.h, c.m, c.s].map((v) => {
    const s = String(v).padStart(2, "0");
    return lang === "km" ? toKhmer(s) : s;
  });
  return (
    <div className="countdown reveal">
      {vals.map((v, i) => (
        <div className="cd-box" key={i}>
          <span className="cd-num">{v}</span>
          <span className="cd-unit">{t.units[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Lightbox({ index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onPrev, onNext]);

  const touch = useRef(null);
  return (
    <div
      className="lightbox"
      onClick={onClose}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0].clientX - touch.current;
        if (Math.abs(dx) > 50) (dx > 0 ? onPrev : onNext)();
        touch.current = null;
      }}
    >
      <button className="lb-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <button
        className="lb-nav lb-prev"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous"
      >
        ‹
      </button>
      <img src={images.gallery[index]} alt="" onClick={(e) => e.stopPropagation()} />
      <button
        className="lb-nav lb-next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState("km");
  const [opened, setOpened] = useState(false);
  const [lb, setLb] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const t = content[lang];
  const total = images.gallery.length;

  useEffect(() => {
    document.documentElement.lang = lang === "km" ? "km" : "en";
  }, [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = !opened || lb !== null ? "hidden" : "";
  }, [opened, lb]);

  useReveal();

  const prev = () => setLb((i) => (i + total - 1) % total);
  const next = () => setLb((i) => (i + 1) % total);
  const close = () => setLb(null);

  const toggleLang = () => setLang((l) => (l === "km" ? "en" : "km"));

  const sched = useMemo(() => t.schedule, [t]);

  return (
    <div className={`app lang-${lang}`}>
      {!opened && <Intro onOpen={() => setOpened(true)} t={t} lang={lang} />}

      <header className={`topbar ${scrolled ? "solid" : ""}`}>
        <a href="#top" className="brand">
          {lang === "km" ? "០" : "♡"}
        </a>
        <nav>
          <a href="#words">{t.wordsTitle}</a>
          <a href="#venue">{t.venueTitle}</a>
          <a href="#gallery">{t.galleryTitle}</a>
        </nav>
        <button className="lang" onClick={toggleLang}>
          {t.langLabel}
        </button>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <img src={images.hero} alt={t.heroAlt} className="hero-img" />
          <div className="hero-shade" />
          <div className="hero-text">
            <p className="eyebrow">{t.title}</p>
            <h1 className="names">
              <span>{t.brideName}</span>
              <em>&amp;</em>
              <span>{t.groomName}</span>
            </h1>
            <p className="date">{t.dateLine}</p>
            <a href="#words" className="scroll-cue" aria-label="Scroll">
              <span />
            </a>
          </div>
        </section>

        {/* INVITE + COUNTDOWN */}
        <section className="section center">
          <p className="invite reveal">{t.invite}</p>
          <div className="ornament reveal">❖</div>
          <h2 className="h2 reveal">{t.countdownTitle}</h2>
          <Countdown t={t} lang={lang} />
        </section>

        {/* WORDS */}
        <section id="words" className="section words">
          <div className="words-grid">
            <div className="words-photos reveal">
              <img src={images.words} alt="" className="ph ph-a" />
              <img src={images.cozy} alt="" className="ph ph-b" />
            </div>
            <div className="words-copy reveal">
              <h2 className="h2">{t.wordsTitle}</h2>
              {t.words.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
              <div className="signoff">
                {t.brideName} <em>&amp;</em> {t.groomName}
              </div>
            </div>
          </div>
        </section>

        {/* VENUE */}
        <section id="venue" className="section venue">
          <img src={images.pond} alt="" className="venue-bg" />
          <div className="venue-shade" />
          <div className="venue-card reveal">
            <h2 className="h2">{t.venueTitle}</h2>
            <h3 className="venue-name">{t.venueName}</h3>
            <p className="venue-addr">{t.venueAddress}</p>
            <ul className="schedule">
              {sched.map((s, i) => (
                <li key={i}>
                  <b>{s.time}</b>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
            <a className="btn" href={mapUrl} target="_blank" rel="noreferrer">
              {t.mapLabel}
            </a>
          </div>
        </section>

        {/* GALLERY */}
        <section id="gallery" className="section gallery">
          <h2 className="h2 reveal">{t.galleryTitle}</h2>
          <div className="grid">
            {images.gallery.map((src, i) => (
              <button key={i} className="tile reveal" onClick={() => setLb(i)}>
                <img src={src} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className="section center contact">
          <h2 className="h2 reveal">{t.contactTitle}</h2>
          <div className="links reveal">
            <a href={contacts.telegram} target="_blank" rel="noreferrer">
              Telegram
            </a>
            <a href={contacts.messenger} target="_blank" rel="noreferrer">
               Call Me
            </a>
            <a href={contacts.facebook} target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
          <p className="thanks reveal">{t.thanks}</p>
          <p className="foot reveal">
            {t.footer} · {t.brideName} &amp; {t.groomName}
          </p>
        </section>
      </main>

      {lb !== null && <Lightbox index={lb} onClose={close} onPrev={prev} onNext={next} />}
    </div>
  );
}
