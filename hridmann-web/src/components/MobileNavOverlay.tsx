"use client";


import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type Slug = { current?: string };
type Service = { _id?: string; slug?: Slug; title: string };

const HEADER_OFFSET = 96; // adjust if your sticky header is taller

export default function MobileNavOverlay({
  services,
  brand = "Hridmann",
}: {
  services: Service[];
  brand?: string;
}) {
  const [open, setOpen] = useState(false);
  const [svcOpen, setSvcOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const svcListRef = useRef<HTMLUListElement | null>(null);

  // lock background scroll when menu is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = open ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // close overlay whenever the route changes
  useEffect(() => {
    setOpen(false);
    setSvcOpen(false); // Also close services dropdown
  }, [pathname]);

  // smooth scroll helper for in-page anchors
  const goToHash = (hash: string) => {
    const el = document.querySelector(hash) as HTMLElement | null;
    if (!el) return;
    // Close first to feel snappy
    setOpen(false);
    // scroll after animation starts
    setTimeout(() => {
      const y = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 120);
  };

  const handleAnchor = (e: React.MouseEvent, hash: string) => {
    e.preventDefault();
    const el = document.querySelector(hash) as HTMLElement | null;

    if (el) {
      // element exists on current page -> smooth local scroll
      goToHash(hash);
    } else {
      // not on this page -> go home then adjust for header
      setOpen(false);
      router.push("/" + hash);
      setTimeout(() => goToHash(hash), 200);
    }
  };

  const handleServiceClick = (slug?: string) => {
    if (!slug) return;
    setOpen(false);
    router.push(`/services/${slug}`);
  };

  const svcMaxHeight = svcListRef.current?.scrollHeight ?? 0;

  return (
    <>
      {/* the hamburger button (mobile only) - now toggles open/close */}
      <button
        className="navbar-toggler d-lg-none border-0"
        type="button"
        aria-controls="mobileOverlay"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen(!open)}
      >
        <span className={`navbar-toggler-icon ${open ? 'open' : ''}`}></span>
      </button>

      {/* overlay */}
      <div
        id="mobileOverlay"
        aria-hidden={!open}
        className={`mobile-overlay${open ? " open" : ""}`}
      >
        <div className="mobile-overlay__header">
          <div className="mobile-overlay__brand">{brand}</div>
          <button
            className="btn-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          ></button>
          {/* Removed the duplicate close button */}
        </div>

        <div className="mobile-overlay__body">
          <ul className="list-unstyled m-0">
            <li className="mo-item">
              <a href="#about" className="mo-link" onClick={(e) => handleAnchor(e, "#about")}>
                Founder
              </a>
            </li>

            <li className="mo-item">
              <a href="#about-hridmann" className="mo-link" onClick={(e) => handleAnchor(e, "#about-hridmann")}>
                About Hridmann
              </a>
            </li>

            <li className="mo-item">
              <a href="#vision" className="mo-link" onClick={(e) => handleAnchor(e, "#vision")}>
                Vision & Philosophy
              </a>
            </li>

            <li className="mo-item">
              <a href="#why-choose" className="mo-link" onClick={(e) => handleAnchor(e, "#why-choose")}>
                Why Choose
              </a>
            </li>


            <li className="mo-item">
              <button
                type="button"
                className="mo-link mo-toggle d-flex align-items-center justify-content-between w-100"
                aria-expanded={svcOpen}
                onClick={() => setSvcOpen((v) => !v)}
              >
                <span>Services</span>
                <i className="bi bi-chevron-down mo-chevron" />
              </button>

              <div
                className="overflow-hidden ps-2"
                style={{
                  maxHeight: svcOpen ? `${svcMaxHeight}px` : "0px",
                  transition: "max-height .25s ease",
                }}
              >
                <ul ref={svcListRef} className="list-unstyled mb-2">
                  {services?.map((s, i) => (
                    <li key={s._id ?? s.slug?.current ?? i} className="my-1">
                      <button
                        type="button"
                        className="mo-sublink"
                        onClick={() => handleServiceClick(s.slug?.current)}
                      >
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            <li className="mo-item">
              <a
                href="#testimonials"
                className="mo-link"
                onClick={(e) => handleAnchor(e, "#testimonials")}
              >
                Testimonials
              </a>
            </li>

            <li className="mo-item">
              <a
                href="/gallery"
                className="mo-link"
                onClick={() => setOpen(false)}
              >
                Gallery
              </a>
            </li>


            <li className="mo-item">
              <a
                href="#contact"
                className="mo-link"
                onClick={(e) => handleAnchor(e, "#contact")}
              >
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}