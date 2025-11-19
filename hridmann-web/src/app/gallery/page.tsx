// src/app/gallery/page.tsx
import Link from "next/link";
import Image from "next/image";
import MasonryGallery from "@/components/MasonryGallery";
import MobileNavOverlay from "@/components/MobileNavOverlay";
import Splash from "@/components/Splash";
import Aurora from "@/components/Aurora";
import HeaderEffects from "@/components/HeaderEffects";
import ScrollAnimations from "@/components/ScrollAnimations";
import Reveal from "@/components/Reveal";

import { sanityClient } from "@/lib/sanity";
import { GALLERY_QUERY, SETTINGS_QUERY, SERVICES_QUERY } from "@/lib/queries";

export const revalidate = 60;

export const metadata = {
  title: "Gallery | Hridmann",
  description: "Explore highlights from Hridmann’s workshops, sessions, and events.",
};

type Slug = { current?: string };
type Service = {
  _id?: string;
  slug?: Slug;
  title: string;
};

export default async function GalleryPage() {
  const [gallery, settings, services] = await Promise.all([
    sanityClient.fetch(GALLERY_QUERY),
    sanityClient.fetch(SETTINGS_QUERY),
    sanityClient.fetch<Service[]>(SERVICES_QUERY),
  ]);

  return (
    <main>
      {/* ✨ Splash (same as homepage) */}
      <Splash logoUrl={settings?.logo?.asset?.url} />
      <ScrollAnimations />
      <HeaderEffects />
      <Reveal />

      {/* 🌈 Aurora background behind everything */}
      {/* <div className="aurora-wrapper absolute inset-0 -z-10">
        <Aurora
          colorStops={["#a7e8e1", "#6ec6c1", "#2aa6a0"]}
          amplitude={0.3}
          blend={0.35}
          speed={0.4}
        />
      </div> */}

      <nav className="navbar navbar-expand-lg navbar-light  py-3 sticky-top header">
        <div className="container">

          <Link href="/" className="navbar-brand fw-semibold">
            {settings?.siteName ?? "Hridmann"}
          </Link>

          <ul className="navbar-nav ms-auto d-none d-lg-flex flex-row align-items-center gap-3">

            <li className="nav-item">
              <Link className="nav-link text-dark" href="/#about">Founder</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link text-dark" href="/#about-hridmann">About</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link text-dark" href="/#vision">Vision</Link>
            </li>

            {/* Services scroll + dropdown */}
            <li className="nav-item dropdown position-static">
              <Link className="nav-link text-dark px-0" href="/#services">Services</Link>

              <ul className="dropdown-menu shadow border-0 rounded-3 p-2 menu-elev" style={{ minWidth: "20rem" }}>
                {services?.map((s, i) => (
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
              <Link className="nav-link text-dark" href="/#why-choose">Why Choose</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link text-dark" href="/#testimonials">Testimonials</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link text-dark" href="/gallery">Gallery</Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link text-dark" href="/#contact">Contact</Link>
            </li>

          </ul>

          <MobileNavOverlay services={services} brand={settings?.siteName ?? "Hridmann"} />
        </div>
      </nav>

      {/* 🖼️ Main Content */}
      <section className="pt-24 pb-16 relative z-10">
        <div className="container text-center">
          <h1 className="fw-semibold mb-4 text-[#0E1E2A]">
            {gallery?.title || "Gallery"}
          </h1>

          {gallery?.images?.length ? (
            <MasonryGallery images={gallery.images} />
          ) : (
            <p className="text-muted">No images uploaded yet.</p>
          )}
        </div>
      </section>
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
    </main>
  );
}
