// src/app/page.tsx
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import type { PortableTextBlock } from 'sanity'
import Splash from "@/components/Splash"
import MobileNavOverlay from "@/components/MobileNavOverlay";
import ContactForm from "@/components/ContactForm";
import ShinyText from "@/components/ShinyText"

import Aurora from '@/components/Aurora';

import { EVENTS_QUERY } from "@/lib/queries";
import type { EventType } from "@/lib/types";






import { sanityClient } from '@/lib/sanity'
import {
  HOME_QUERY,
  SERVICES_QUERY,
  TESTIMONIALS_QUERY,
  SETTINGS_QUERY,
} from '@/lib/queries'
import { urlFor } from '@/lib/image'

import Link from 'next/link'
import ScrollAnimations from '@/components/ScrollAnimations'
import HeaderEffects from '@/components/HeaderEffects'
import Reveal from '@/components/Reveal'

type Slug = { current?: string }
type Service = {
  _id?: string
  slug?: Slug
  icon?: string
  title: string
  description?: string
}

type Testimonial = {
  _id?: string
  name: string
  role?: string
  message: string
}

type Home = {
  heroTitle?: string
  heroSubtitle?: string
  heroBadge?: string
  aboutTitle?: string
  aboutBody?: PortableTextBlock[]
  portrait?: { asset?: { _ref?: string } }
  aboutPortrait?: { asset?: { _ref?: string } }
  focusAreas?: string[]
  certifications?: string[]
  servicesTitle?: string
  servicesSubtitle?: string
  testimonialsTitle?: string
  testimonialsSubtitle?: string
  contactTitle?: string
  contactHelpText?: string
}

type Settings = {
  siteName?: string
  contactEmail?: string
  instagram?: string
  footerNote?: string
  logo?: { asset?: { url?: string; _ref?: string } }
  navAboutLabel?: string
  navServicesLabel?: string
  navTestimonialsLabel?: string
  navContactLabel?: string
  ctaExploreLabel?: string
  ctaContactLabel?: string
  formSendLabel?: string
}

// ISR
export const revalidate = 60

export default async function HomePage() {
  const [home, services, testimonials, settings, events] = await Promise.all([
    sanityClient.fetch<Home>(HOME_QUERY),
    sanityClient.fetch<Service[]>(SERVICES_QUERY),
    sanityClient.fetch<Testimonial[]>(TESTIMONIALS_QUERY),
    sanityClient.fetch<Settings>(SETTINGS_QUERY),
    sanityClient.fetch<EventType[]>(EVENTS_QUERY),
  ])

  return (
    <main>
      <Splash logoUrl={settings?.logo?.asset?.url} />
      <ScrollAnimations />
      <HeaderEffects />
      <Reveal />












      {/* Aurora background */}
      <div className="aurora-wrapper">
        <Aurora
          colorStops={["#a7e8e1", "#6ec6c1", "#2aa6a0"]}
          amplitude={0.3}
          blend={0.35}
          speed={0.4}
        />
      </div>

      {/* NAV (desktop small dropdown + mobile hamburger) */}
      <nav className="navbar navbar-expand-lg navbar-light  py-3 sticky-top header">
        <div className="container">
          {/* Brand */}
          <Link href="/" className="navbar-brand fw-semibold">
            {settings?.siteName ?? "Hridmann"}
          </Link>

          {/* Desktop menu */}
          <ul className="navbar-nav ms-auto d-none d-lg-flex flex-row align-items-center gap-3">
            <li className="nav-item">
              <Link className="nav-link text-dark" href="#about">About</Link>
            </li>

            {/* Services dropdown — click scrolls to #services; hover shows list */}
            <li className="nav-item dropdown position-static" >
              <Link className="nav-link text-dark px-0" href="#services">
                Services
              </Link>

              {/* HOVER (desktop) = small dropdown with items from Sanity */}
              <ul
                className="dropdown-menu shadow border-0 rounded-3 p-2 menu-elev"
                style={{ minWidth: "20rem" }}
              >
                {services.map((s, i) => (
                  <li key={s._id ?? s.slug?.current ?? i}>
                    {s.slug?.current ? (
                      <Link className="dropdown-item rounded-2 py-2" href={`/services/${s.slug.current}`}>
                        {s.title}
                      </Link>
                    ) : (
                      <span className="dropdown-item rounded-2 py-2 disabled">{s.title}</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>

            <li className="nav-item">
              <Link className="nav-link text-dark" href="#testimonials">Testimonials</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" href="#contact">Contact</Link>
            </li>
          </ul>

          {/* Mobile hamburger button - positioned on the right */}
          <MobileNavOverlay services={services} brand={settings?.siteName ?? "Hridmann"} />
        </div>
      </nav>



      {/* HERO */}
      <header className="relative overflow-hidden w-full py-20">
        <div className="container relative z-10">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <span className="badge rounded-pill text-bg-light border mb-3">
                <i className="bi bi-heart-pulse me-2 text-danger" />
                {home?.heroBadge || 'Psychology • HR • Wellbeing'}
              </span>

              <h1 className="display-5 fw-semibold mb-3">
                <ShinyText
                    text={home?.heroTitle || 'Shaping Minds. Strengthening Workplaces.'}
                    disabled={false}
                    speed={1.5}
                    className='custom-class'
                    />
              </h1>

              <p className="lead mb-4">
                {home?.heroSubtitle ||
                  'Training, assessments, and counselling led by Harshana Uchil Kuveskar — bridging psychology with practical HR to build safe, resilient and high-performing teams.'}
              </p>

              <div className="d-flex flex-wrap gap-2">
                <Link  href="#services" className="btn btn-primary btn-lg">
                  <i className="bi bi-grid-3x3-gap me-2" />
                  {settings?.ctaExploreLabel || 'Explore Services'}
                </Link>
                <Link  href="#contact" className="btn btn-outline-ink btn-lg">
                  <i className="bi bi-chat-left-text me-2" />
                  {settings?.ctaContactLabel || 'Get in Touch'}
                </Link>
              </div>
            </div>

            <div className="col-lg-5">
              {/* <div className="hero-card p-3"> */}
                {home?.portrait ? (
                  <Image
                    className="rounded-4 img-fluid"
                    src={urlFor(home.portrait).width(1100).height(800).fit('crop').url()}
                    alt="Hridmann"
                    width={1100}
                    height={800}
                    priority
                  />
                ) : (
                  <Image
                    className="rounded-4 img-fluid"
                    src="/logo.png"
                    alt="Hridmann"
                    width={800}
                    height={600}
                    priority
                  />
                )}
              {/* </div> */}
            </div>
          </div>
        </div>
      </header>
      <div className="section-divider" />

      {/* ABOUT */}
      <section id="about" className="section-pad card-soft">
        <div className="container">
          <div className="row g-4 align-items-start">
            {/* Left column: text */}
            <div className="col-lg-6">
              <h2 className="fw-semibold mb-3">
                {home?.aboutTitle || 'About the Founder'}
              </h2>
              <div className="mb-3">
                {home?.aboutBody && <PortableText value={home.aboutBody} />}
              </div>
            </div>

            {/* Right column: photo + focus + certs */}
            <div className="col-lg-6">
              {/* Founder photo */}
              {home?.aboutPortrait && (
                <div className="mb-4">
                  <div className="ratio ratio-4x3 rounded-4 overflow-hidden shadow-sm">
                    <Image
                      src={urlFor(home.aboutPortrait).width(1200).height(900).fit('crop').url()}
                      alt="About founder portrait"
                      fill
                      sizes="(max-width: 992px) 100vw, 600px"
                      className="object-fit-cover"
                    />
                  </div>
                </div>
              )}

              {/* Core Strengths*/}
              <div className="card bg-[var(--soft)] border-0 shadow-none p-4">
                {home?.focusAreas?.length ? (
                  <>
                    <h5 className="mb-3 font-semibold">Core Strengths</h5>
                    <div className="space-y-1">
                      {home.focusAreas.map((item, i) => (
                        <p key={i} className="m-0">{item}</p>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {/* SERVICES */}
      <section id="services" className="section-pad card-soft">

        <div className="container">
          <div className="row justify-content-center text-center mb-4">
            <div className="col-lg-8">
              <h2 className="fw-semibold">{home?.servicesTitle || 'Services'}</h2>
              <p className="text-dark">
                {home?.servicesSubtitle || 'Psychology-led programs tailored to people, culture, and performance.'}
              </p>
            </div>
          </div>

          <div className="row g-4">
            {services?.map((s: Service, i: number) => (
              <div
                key={s._id ?? s.slug?.current ?? `svc-${i}`}
                className="col-md-6 col-lg-4"
              >
                <div className="card card-soft h-100">
                  <div className="card-body p-4">
                    <div className="icon-badge mb-3">
                      <i className={`bi ${s.icon || 'bi-grid-3x3-gap'}`} />
                    </div>
                    <h5 className="card-title">{s.title}</h5>
                    <p className="card-text muted">{s.description}</p>

                    {s.slug?.current && (
                      <Link href={`/services/${s.slug.current}`} className="btn btn-link p-0">
                        Learn more <i className="bi bi-arrow-right ms-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="section-pad card-soft">
        <div className="container">
          <div className="row justify-content-center text-center mb-4">
            <div className="col-lg-8">
              <h2 className="fw-semibold">{home?.testimonialsTitle || 'Testimonials'}</h2>
              <p className="text-dark">{home?.testimonialsSubtitle || 'What leaders and learners say.'}</p>
            </div>
          </div>

          {/* Mobile horizontal scroll */}
          <div className="d-flex d-md-none gap-3 overflow-auto pb-3" style={{ scrollSnapType: 'x mandatory' }}>
            {testimonials?.map((t, i) => (
              <div key={t._id ?? `t-${i}`} className="flex-shrink-0" style={{ width: '85%', scrollSnapAlign: 'start' }}>
                <div className="card card-soft h-100">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="mb-3">
                      <i className="bi bi-quote display-6 text-secondary" />
                    </div>
                    <p className="flex-grow-1">{t.message}</p>
                    <div className="mt-3 small muted">
                      <strong>{t.name}</strong>
                      <br />
                      {t.role || ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop grid */}
          <div className="row g-4 d-none d-md-flex">
            {testimonials?.map((t, i) => (
              <div key={t._id ?? `t-${i}`} className="col-md-6 col-lg-4">
                <div className="card card-soft h-100">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="mb-3">
                      <i className="bi bi-quote display-6 text-secondary" />
                    </div>
                    <p className="flex-grow-1">{t.message}</p>
                    <div className="mt-3 small muted">
                      <strong>{t.name}</strong>
                      <br />
                      {t.role || ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {events && events.length > 0 && (
        <>
          <section id="events" className="section-pad card-soft">
            <div className="container">
              {/* Heading */}
              <div className="row justify-content-center text-center mb-5">
                <div className="col-lg-8">
                  <h2 className="fw-semibold">Events & Workshops</h2>
                  <p className="text-dark">
                    Explore our latest sessions, talks, and workshops.
                  </p>
                </div>
              </div>

              {/* Events Grid or Scroll */}
              <div
                className={`${
                  events.length === 1
                    ? "d-flex justify-content-center"
                    : "d-flex flex-wrap justify-content-center gap-4"
                }`}
              >
                {events.map((event, i) => {
                  const isPast =
                    event.date && new Date(event.date) < new Date();

                  return (
                    <div
                      key={event._id ?? `event-${i}`}
                      className="col-md-6 col-lg-4 d-flex"
                      style={{
                        maxWidth: "420px",
                        minWidth: "340px",
                      }}
                    >
                      <div
                        className={`card card-soft h-100 border-0 shadow-sm transition-all duration-300 w-100 ${
                          isPast ? "opacity-75" : ""
                        }`}
                      >
                        {/* Image */}
                        {event.flyer?.asset && (
                          <div className="ratio ratio-16x9 rounded-top-4 overflow-hidden">
                            <Image
                              src={urlFor(event.flyer)
                                .width(1200)
                                .height(800)
                                .fit("crop")
                                .url()}
                              alt={event.title}
                              width={1200}
                              height={800}
                              className="object-fit-cover"
                            />
                          </div>
                        )}

                        {/* Text */}
                        <div className="card-body p-4 text-start">
                          <h5 className="fw-semibold mb-2 text-[#0E1E2A]">
                            {event.title}
                          </h5>

                          {event.date && (
                            <p className="text-muted small mb-3">
                              {new Date(event.date).toLocaleDateString("en-IN", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          )}

                          <p
                            className="text-dark small lh-base mb-4"
                            style={{ whiteSpace: "pre-line" }}
                          >
                            {event.description ||
                              "Join us for this upcoming workshop or event."}
                          </p>

                          {event.link && (
                            <Link
                              href={event.link}
                              target="_blank"
                              className="btn btn-outline-dark btn-sm rounded-pill px-3"
                            >
                              Learn More
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <div className="section-divider" />
        </>
      )}


      {/* CONTACT */}
      <section id="contact" className="section-pad card-soft">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <div className="card card-soft p-4 h-100">
                <h3 className="fw-semibold mb-3">
                  {home?.contactTitle || 'Get in Touch'}
                </h3>
                <p className="mb-1">
                  <i className="bi bi-envelope me-2" />
                  <Link href={`mailto:${settings?.contactEmail || 'harshana.hridmann@gmail.com'}`}>
                    {settings?.contactEmail || 'harshana.hridmann@gmail.com'}
                  </Link>
                </p>
                {settings?.instagram && (
                  <p className="mb-4">
                    <i className="bi bi-instagram me-2" />
                    <Link target="_blank" rel="noopener" href={settings.instagram}>
                      @hridmann
                    </Link>
                  </p>
                )}
                <p className="muted small mb-0">
                  {home?.contactHelpText || 'Prefer a quick call? Drop a message with your number and we’ll reach out.'}
                </p>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="card card-soft p-4 h-100">
                <h5 className="mb-3">{settings?.formSendLabel || 'Send a Message'}</h5>
                <ContactForm label={settings?.formSendLabel} />  {/* ✅ clean replacement */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY CTA & FOOTER */}
      <Link
        href="#contact"
        className="btn btn-accent sticky-cta shadow shiny-btn"
      >
        <i className="bi bi-telephone me-2" />
        Contact
      </Link>

      <footer className="py-4 border-top bg-white">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between text-center">
          
          {/* Left side - copyright */}
          <div className="text-muted small">
            © {new Date().getFullYear()} {settings?.siteName || "Hridmann"}
          </div>

          {/* Center - signature */}
          <div className="my-2 my-md-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/harshana-signature.jpeg"
              style={{ height: "20px", objectFit: "contain" }}
            />
          </div>

          {/* Right side - footer note */}
          <div className="footer-note small text-muted">
            {settings?.footerNote || ""}
          </div>
        </div>
      </footer>




      {/* <footer className="py-4 border-top">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <div>© {new Date().getFullYear()} {settings?.siteName || 'Hridmann'}</div>
          <div className="footer-note small">{settings?.footerNote || ''}</div>
        </div>
      </footer> */}

    </main>
  )
}
