// src/app/services/[slug]/[subslug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { sanityClient } from "@/lib/sanity";
import {
  SERVICE_BY_SLUG_QUERY,
  SETTINGS_QUERY,
  SERVICES_QUERY,
} from "@/lib/queries";
import type { PortableTextBlock } from "sanity";
import ContactForm from "@/components/ContactForm";
import MobileNavOverlay from "@/components/MobileNavOverlay";

type Params = { slug: string; subslug: string };

type SanityImage = { _key?: string; _type?: string; asset?: { url?: string } };
type QuickFact = { _key?: string; label: string; value: string };

type SubService = {
  _key: string;
  title: string;
  slug?: { current?: string };
  content?: PortableTextBlock[];
  heroImage?: SanityImage;
  quickFacts?: QuickFact[];
};

export const revalidate = 60;

export async function generateStaticParams() {
  const services = await sanityClient.fetch(SERVICES_QUERY);

  const params: { slug: string; subslug: string }[] = [];
  for (const svc of services) {
    const service = await sanityClient.fetch(SERVICE_BY_SLUG_QUERY, {
      slug: svc.slug.current,
    });
    if (Array.isArray(service?.subServices)) {
      service.subServices.forEach((sub: SubService) => {
        if (sub.slug?.current) {
          params.push({
            slug: svc.slug.current,
            subslug: sub.slug.current,
          });
        }
      });
    }
  }
  return params;
}

/** ✅ Next 15: params is a Promise — await it */
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug, subslug } = await params;
  const service = await sanityClient.fetch(SERVICE_BY_SLUG_QUERY, { slug });
  const subService = service?.subServices?.find(
    (s: SubService) => s.slug?.current === subslug
  );

  return {
    title: subService?.title
      ? `${subService.title} – ${service?.title}`
      : "Workshop",
    description: service?.description,
  };
}

/** ✅ Next 15: params is a Promise — await it */
export default async function SubServicePage(
  { params }: { params: Promise<Params> }
) {
  const { slug, subslug } = await params;

  const [service, allServices, settings] = await Promise.all([
    sanityClient.fetch(SERVICE_BY_SLUG_QUERY, { slug }),
    sanityClient.fetch(SERVICES_QUERY),
    sanityClient.fetch(SETTINGS_QUERY),
  ]);

  const subService: SubService | undefined = service?.subServices?.find(
    (s: SubService) => s.slug?.current === subslug
  );

  if (!subService) {
    return (
      <div className="container py-5">
        <h1>Workshop not found</h1>
        <p className="text-muted">
          Please check the URL or go back to{" "}
          <Link href={`/services/${slug}`}>{service?.title || "the service"}</Link>.
        </p>
      </div>
    );
  }

  return (
    <main>
      {/* NAV */}
      <nav className="navbar navbar-expand-lg navbar-light py-3 sticky-top header">
        <div className="container">
          <Link href="/" className="navbar-brand fw-semibold">
            {settings?.siteName ?? "Hridmann"}
          </Link>
          <ul className="navbar-nav ms-auto d-none d-lg-flex flex-row align-items-center gap-3">
            <li className="nav-item">
              <Link className="nav-link text-dark" href="/#about">About</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-dark" href="/#services">Services</Link>
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
          <MobileNavOverlay services={allServices} brand={settings?.siteName ?? "Hridmann"} />
        </div>
      </nav>

      {/* BACK BUTTON */}
      <section className="bg-light py-3 border-bottom">
        <div className="container">
          <Link href={`/services/${slug}`} className="btn btn-outline-primary">
            ← Back to {service.title}
          </Link>
        </div>
      </section>

      {/* HERO */}
      <section className="bg-light py-5 border-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <h1 className="display-5 mb-3">{subService.title}</h1>
              {subService.content && <PortableText value={subService.content} />}
            </div>
            <div className="col-lg-6">
              {subService.heroImage?.asset?.url && (
                <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-sm">
                  <img
                    src={subService.heroImage.asset.url}
                    alt={subService.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* QUICK FACTS */}
      {Array.isArray(subService.quickFacts) && subService.quickFacts.length > 0 && (
        <section className="py-5">
          <div className="container">
            <div className="row g-5">
              <aside className="col-lg-4 ms-auto">
                <div className="card shadow-sm rounded-4">
                  <div className="card-body">
                    <h3 className="h5 mb-3">Quick facts</h3>
                    <ul className="list-unstyled small mb-4">
                      {subService.quickFacts.map((f) => (
                        <li key={f._key || `${f.label}-${f.value}`} className="d-flex justify-content-between border-bottom py-2">
                          <span>{f.label}</span>
                          <strong>{f.value}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section id="contact" className="py-5 bg-light border-top">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <div className="card rounded-4 shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h3 mb-3">Get in Touch</h2>
                  <p className="mb-3">Prefer a quick call? Drop a message with your number and we’ll reach out.</p>
                  <p className="mb-2">
                    <i className="bi bi-envelope me-2" />
                    <a href={`mailto:${settings?.contactEmail || "harshana.hridmann@gmail.com"}`}>
                      {settings?.contactEmail || "harshana.hridmann@gmail.com"}
                    </a>
                  </p>
                  {settings?.instagram && (
                    <p className="mb-0">
                      <i className="bi bi-instagram me-2" />
                      <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
                        @hridmann
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="card card-soft p-4 h-100">
                <h5 className="mb-3">{settings?.formSendLabel || "Send a Message"}</h5>
                <ContactForm label={settings?.formSendLabel} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
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

// import type { Metadata } from "next";
// import Link from "next/link";
// import { PortableText } from "@portabletext/react";
// import { sanityClient } from "@/lib/sanity";
// import {
//   SERVICE_BY_SLUG_QUERY,
//   SETTINGS_QUERY,
//   SERVICES_QUERY,
// } from "@/lib/queries";
// import type { PortableTextBlock } from "sanity";
// import ContactForm from "@/components/ContactForm";
// import MobileNavOverlay from "@/components/MobileNavOverlay";

// type Params = { slug: string; subslug: string };

// type SanityImage = { _key?: string; _type?: string; asset?: { url?: string } };
// type QuickFact = { _key?: string; label: string; value: string };

// type SubService = {
//   _key: string;
//   title: string;
//   slug?: { current?: string };
//   content?: PortableTextBlock[];
//   heroImage?: SanityImage;
//   quickFacts?: QuickFact[];
// };

// export async function generateStaticParams() {
//   const services = await sanityClient.fetch(SERVICES_QUERY);

//   const params: { slug: string; subslug: string }[] = [];
//   for (const svc of services) {
//     const service = await sanityClient.fetch(SERVICE_BY_SLUG_QUERY, {
//       slug: svc.slug.current,
//     });
//     if (Array.isArray(service?.subServices)) {
//       service.subServices.forEach((sub: SubService) => {
//         if (sub.slug?.current) {
//           params.push({
//             slug: svc.slug.current,
//             subslug: sub.slug.current,
//           });
//         }
//       });
//     }
//   }
//   return params;
// }

// // export async function generateMetadata(
// //   { params }: { params: Params }
// // ): Promise<Metadata> {
// //   const { slug, subslug } = params; // ✅ no await
// //   const service = await sanityClient.fetch(SERVICE_BY_SLUG_QUERY, { slug });
// //   const subService = service?.subServices?.find(
// //     (s: SubService) => s.slug?.current === subslug
// //   );

// //   return {
// //     title: subService?.title
// //       ? `${subService.title} – ${service?.title}`
// //       : "Workshop",
// //     description: service?.description,
// //   };
// // }

// export async function generateMetadata(
//   { params }: { params: Promise<Params> }
// ): Promise<Metadata> {
//   const { slug, subslug } = await params;   // ✅ await
//   const service = await sanityClient.fetch(SERVICE_BY_SLUG_QUERY, { slug });
//   const subService = service?.subServices?.find(
//     (s: SubService) => s.slug?.current === subslug
//   );

//   return {
//     title: subService?.title
//       ? `${subService.title} – ${service?.title}`
//       : "Workshop",
//     description: service?.description,
//   };
// }

// export default async function SubServicePage(
//   { params }: { params: Promise<Params> }
// ) {
//   const { slug, subslug } = await params;   // ✅ await

//   const [service, allServices, settings] = await Promise.all([
//     sanityClient.fetch(SERVICE_BY_SLUG_QUERY, { slug }),
//     sanityClient.fetch(SERVICES_QUERY),
//     sanityClient.fetch(SETTINGS_QUERY),
//   ]);

//   const subService: SubService | undefined = service?.subServices?.find(
//     (s: SubService) => s.slug?.current === subslug
//   );

//   if (!subService) {
//     return (
//       <div className="container py-5">
//         <h1>Workshop not found</h1>
//         <p className="text-muted">
//           Please check the URL or go back to{" "}
//           <Link href={`/services/${slug}`}>{service?.title || "the service"}</Link>.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <main>
//       {/* NAV */}
//       <nav className="navbar navbar-expand-lg navbar-light py-3 sticky-top header">
//         <div className="container">
//           <Link href="/" className="navbar-brand fw-semibold">
//             {settings?.siteName ?? "Hridmann"}
//           </Link>
//           <ul className="navbar-nav ms-auto d-none d-lg-flex flex-row align-items-center gap-3">
//             <li className="nav-item">
//               <Link className="nav-link text-dark" href="/#about">About</Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link text-dark" href="/#services">Services</Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link text-dark" href="/#testimonials">Testimonials</Link>
//             </li>
//             <li className="nav-item">
//               <Link className="nav-link text-dark" href="/#contact">Contact</Link>
//             </li>
//           </ul>
//           <MobileNavOverlay services={allServices} brand={settings?.siteName ?? "Hridmann"} />
//         </div>
//       </nav>

//       {/* BACK BUTTON */}
//       <section className="bg-light py-3 border-bottom">
//         <div className="container">
//           <Link href={`/services/${slug}`} className="btn btn-outline-primary">
//             ← Back to {service.title}
//           </Link>
//         </div>
//       </section>

//       {/* HERO */}
//       <section className="bg-light py-5 border-bottom">
//         <div className="container">
//           <div className="row align-items-center g-4">
//             <div className="col-lg-6">
//               <h1 className="display-5 mb-3">{subService.title}</h1>
//               {subService.content && <PortableText value={subService.content} />}
//             </div>
//             <div className="col-lg-6">
//               {subService.heroImage?.asset?.url && (
//                 <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-sm">
//                   <img
//                     src={subService.heroImage.asset.url}
//                     alt={subService.title}
//                     className="w-100 h-100 object-fit-cover"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* QUICK FACTS */}
//       {Array.isArray(subService.quickFacts) && subService.quickFacts.length > 0 && (
//         <section className="py-5">
//           <div className="container">
//             <div className="row g-5">
//               <aside className="col-lg-4 ms-auto">
//                 <div className="card shadow-sm rounded-4">
//                   <div className="card-body">
//                     <h3 className="h5 mb-3">Quick facts</h3>
//                     <ul className="list-unstyled small mb-4">
//                       {subService.quickFacts.map((f) => (
//                         <li key={f._key || `${f.label}-${f.value}`} className="d-flex justify-content-between border-bottom py-2">
//                           <span>{f.label}</span>
//                           <strong>{f.value}</strong>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 </div>
//               </aside>
//             </div>
//           </div>
//         </section>
//       )}

//       {/* CONTACT */}
//       <section id="contact" className="py-5 bg-light border-top">
//         <div className="container">
//           <div className="row g-4 align-items-stretch">
//             <div className="col-lg-5">
//               <div className="card rounded-4 shadow-sm h-100">
//                 <div className="card-body">
//                   <h2 className="h3 mb-3">Get in Touch</h2>
//                   <p className="mb-3">Prefer a quick call? Drop a message with your number and we’ll reach out.</p>
//                   <p className="mb-2">
//                     <i className="bi bi-envelope me-2" />
//                     <a href={`mailto:${settings?.contactEmail || "harshana.hridmann@gmail.com"}`}>
//                       {settings?.contactEmail || "harshana.hridmann@gmail.com"}
//                     </a>
//                   </p>
//                   {settings?.instagram && (
//                     <p className="mb-0">
//                       <i className="bi bi-instagram me-2" />
//                       <a href={settings.instagram} target="_blank" rel="noopener noreferrer">
//                         @hridmann
//                       </a>
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//             <div className="col-lg-7">
//               <div className="card card-soft p-4 h-100">
//                 <h5 className="mb-3">{settings?.formSendLabel || "Send a Message"}</h5>
//                 <ContactForm label={settings?.formSendLabel} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="py-4 border-top bg-white">
//         <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
//           <div>© {new Date().getFullYear()} {settings?.siteName || "Hridmann"}</div>
//           <div className="footer-note small">{settings?.footerNote || ""}</div>
//         </div>
//       </footer>
//     </main>
//   );
// }
