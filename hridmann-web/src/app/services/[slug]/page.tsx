// src/app/services/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { sanityClient } from '@/lib/sanity'
import {
  SERVICE_BY_SLUG_QUERY,
  SERVICE_SLUGS_QUERY,
  SETTINGS_QUERY,
  SERVICES_QUERY,
} from '@/lib/queries'
import type { PortableTextBlock } from 'sanity'
import ContactForm from "@/components/ContactForm"
import MobileNavOverlay from "@/components/MobileNavOverlay"

type Slug = { current?: string }
type Params = { slug: string }

type ServiceListItem = { _id?: string; slug?: Slug; title: string }

type SanityImage = { _key?: string; _type?: string; asset?: { url?: string } }
type QuickFact = { _key?: string; label: string; value: string }
type AgendaItem = { _key?: string; title: string; duration?: string }
type RelatedRef = { _key?: string; title?: string; slug?: { current?: string } }
type SubService = { _key: string; title: string; slug?: { current?: string } }

type ServiceDoc = {
  _id: string
  title: string
  description?: string
  icon?: string
  slug?: { current?: string }
  badge?: string
  heroImage?: SanityImage
  body?: PortableTextBlock[]
  gallery?: SanityImage[]
  outcomes?: string[]
  agenda?: AgendaItem[]
  quickFacts?: QuickFact[]
  related?: RelatedRef[]
  subServices?: SubService[]
}

type Settings = {
  siteName?: string
  contactEmail?: string
  instagram?: string
  footerNote?: string
  formSendLabel?: string
}

export const revalidate = 60

/** Static params for each service page */
export async function generateStaticParams() {
  const slugs = await sanityClient.fetch<{ slug?: { current?: string } }[]>(
    SERVICE_SLUGS_QUERY
  )
  return (slugs ?? [])
    .map((s) => s.slug?.current)
    .filter(Boolean)
    .map((slug) => ({ slug: slug as string }))
}

/** ✅ Next 15: params is a Promise — await it */
export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params
  const svc = await sanityClient.fetch<ServiceDoc>(SERVICE_BY_SLUG_QUERY, { slug })
  return {
    title: svc?.title ? `${svc.title} – Services` : 'Service',
    description: svc?.description,
  }
}

/** ✅ Next 15: params is a Promise — await it */
export default async function ServicePage(
  { params }: { params: Promise<Params> }
) {
  const { slug } = await params

  const [service, allServices, settings] = await Promise.all([
    sanityClient.fetch<ServiceDoc>(SERVICE_BY_SLUG_QUERY, { slug }),
    sanityClient.fetch<ServiceListItem[]>(SERVICES_QUERY),
    sanityClient.fetch<Settings>(SETTINGS_QUERY),
  ])

  if (!service) {
    return (
      <div className="container py-5">
        <h1>Service not found</h1>
        <p className="text-muted">
          Please check the URL or go back to <Link href="/#services">Services</Link>.
        </p>
      </div>
    )
  }

  const related = (service.related || []).filter((r) => r?.slug?.current)

  return (
    <main>
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
                {allServices?.map((s, i) => (
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


      {/* HERO */}
      <section className="bg-light py-5 border-bottom">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              {service.badge && (
                <span className="badge text-bg-dark rounded-pill">{service.badge}</span>
              )}
              <h1 className="display-5 mt-3 mb-2">{service.title}</h1>
              {service.description && (
                <p className="lead text-secondary">{service.description}</p>
              )}
              <div className="d-flex gap-2 mt-3">
                <a href="#contact" className="btn btn-primary flex-fill">Book a discovery call</a>
                <Link href="/#testimonials" className="btn btn-outline-primary flex-fill">Read testimonials</Link>
              </div>
            </div>
            <div className="col-lg-6">
              {service.heroImage?.asset?.url && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={service.heroImage.asset.url}
                  alt={service.title}
                  className="w-100 rounded-4 shadow-sm"
                  style={{ display: "block" }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <section className="py-5">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              {Array.isArray(service.body) && service.body.length > 0 && (
                <div className="mb-5">
                  <h2 className="h3 mb-3">Overview</h2>
                  <PortableText value={service.body} />
                </div>
              )}

              {!!service.agenda?.length && (
                <div className="mb-5">
                  <h2 className="h3 mb-3">Agenda</h2>
                  <ol className="ps-3">
                    {service.agenda.map((step) => (
                      <li key={step._key || `${step.title}-${step.duration || 'x'}`} className="mb-2">
                        <strong>{step.title}</strong>
                        {step.duration ? <> <span className="text-muted">({step.duration})</span></> : null}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {!!service.outcomes?.length && (
                <div className="mb-5">
                  <h2 className="h3 mb-3">What you’ll get</h2>
                  <ul className="list-unstyled">
                    {service.outcomes.map((item, idx) => (
                      <li key={`outcome-${idx}`} className="d-flex align-items-start gap-2 mb-2">
                        <i className="bi bi-check2-circle fs-5 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!!service.gallery?.length && (
                <div className="mb-2">
                  <div className="row g-3">
                    {service.gallery
                      .filter((img) => !!img?.asset?.url)
                      .map((img, i) => (
                        <div className="col-sm-6 col-lg-4" key={img._key || `${img.asset?.url}-${i}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.asset!.url!}
                            alt={`${service.title} image ${i + 1}`}
                            className="w-100 rounded-4"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {service.slug?.current === "journey-oriented-training-and-workshops" &&
                Array.isArray(service.subServices) && service.subServices.length > 0 && (
                  <div className="mb-5">
                    <h2 className="h3 mb-3">Workshops</h2>
                    <div className="row g-4">
                      {service.subServices.map((sub) =>
                        sub.slug?.current ? (
                          <div key={sub._key} className="col-md-6">
                            <div className="card h-100 p-4 rounded-4 shadow-sm">
                              <h3 className="h5">{sub.title}</h3>
                              <Link
                                href={`/services/${service.slug?.current}/${sub.slug.current}`}
                                className="stretched-link text-decoration-none"
                              >
                                Learn more →
                              </Link>
                            </div>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
              )}
            </div>

            {/* SIDEBAR */}
            <aside className="col-lg-4">
              <div className="position-sticky" style={{ top: '96px' }}>
                <div className="card shadow-sm rounded-4">
                  <div className="card-body">
                    <h3 className="h5 mb-3">Quick facts</h3>
                    {!!service.quickFacts?.length ? (
                      <ul className="list-unstyled small mb-4">
                        {service.quickFacts.map((f) => (
                          <li
                            key={f._key || `${f.label}-${f.value}`}
                            className="d-flex justify-content-between border-bottom py-2"
                          >
                            <span>{f.label}</span>
                            <strong>{f.value}</strong>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted small">Let’s tailor this to your team.</p>
                    )}
                    <a href="#contact" className="btn btn-primary w-100 mb-2">Get a custom quote</a>
                    <Link href="/#testimonials" className="btn btn-outline-primary w-100 mb-2">Read testimonials</Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* RELATED */}
      {!!related.length && (
        <section className="py-5 bg-body-tertiary border-top" aria-labelledby="related">
          <div className="container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 id="related" className="h4 mb-0">Related services</h2>
              <a href="#contact" className="btn btn-sm btn-outline-secondary">Contact us</a>
            </div>
            <div className="row g-4">
              {related.map((r) => {
                const href = `/services/${r.slug!.current!}`
                const key = r._key || r.slug!.current!
                return (
                  <div className="col-md-4" key={key}>
                    <Link className="card h-100 text-decoration-none rounded-4" href={href}>
                      <div className="card-body p-4">
                        <h3 className="h5 mb-1">{r.title || 'Service'}</h3>
                        <p className="text-secondary small mb-0">Learn more →</p>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT WIDGET */}
      <section id="contact" className="py-5 bg-light border-top">
        <div className="container">
          <div className="row g-4 align-items-stretch">
            <div className="col-lg-5">
              <div className="card rounded-4 shadow-sm h-100">
                <div className="card-body">
                  <h2 className="h3 mb-3">Get in Touch</h2>
                  <p className="mb-3">
                    Prefer a quick call? Drop a message with your number and we’ll reach out.
                  </p>
                  <p className="mb-2">
                    <i className="bi bi-envelope me-2" />
                    <a href={`mailto:${settings?.contactEmail || 'harshana.hridmann@gmail.com'}`}>
                      {settings?.contactEmail || 'harshana.hridmann@gmail.com'}
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
                <h5 className="mb-3">{settings?.formSendLabel || 'Send a Message'}</h5>
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
  )
}

// // src/app/services/[slug]/page.tsx
// import type { Metadata } from 'next'
// import Link from 'next/link'
// import { PortableText } from '@portabletext/react'
// import { sanityClient } from '@/lib/sanity'
// import {
//   SERVICE_BY_SLUG_QUERY,
//   SERVICE_SLUGS_QUERY,
//   SETTINGS_QUERY,
// } from '@/lib/queries'
// import type { PortableTextBlock } from 'sanity'
// import ContactForm from "@/components/ContactForm"

// // + imports
// import MobileNavOverlay from "@/components/MobileNavOverlay"
// import { SERVICES_QUERY } from "@/lib/queries"

// type Slug = { current?: string }
// type ServiceListItem = { _id?: string; slug?: Slug; title: string }
// type SubService = {
//   _key: string
//   title: string
//   slug?: { current?: string }
// }

// type Params = { slug: string }

// type SanityImage = { _key?: string; _type?: string; asset?: { url?: string } }
// type QuickFact = { _key?: string; label: string; value: string }
// type AgendaItem = { _key?: string; title: string; duration?: string }
// type RelatedRef = { _key?: string; title?: string; slug?: { current?: string } }

// type ServiceDoc = {
//   _id: string
//   title: string
//   description?: string
//   icon?: string
//   slug?: { current?: string }
//   badge?: string
//   heroImage?: SanityImage
//   body?: PortableTextBlock[]
//   gallery?: SanityImage[]
//   outcomes?: string[]
//   agenda?: AgendaItem[]
//   quickFacts?: QuickFact[]
//   related?: RelatedRef[]
//   subServices?: SubService[]
// }

// type Settings = {
//   siteName?: string
//   contactEmail?: string
//   instagram?: string
//   footerNote?: string
//   formSendLabel?: string
// }

// /** Next.js 15: still fine to return plain objects here */
// export async function generateStaticParams() {
//   const slugs = await sanityClient.fetch<{ slug?: { current?: string } }[]>(
//     SERVICE_SLUGS_QUERY
//   )
//   return (slugs ?? [])
//     .map((s) => s.slug?.current)
//     .filter(Boolean)
//     .map((slug) => ({ slug: slug as string }))
// }

// /** ✅ FIX: params is a plain object (not Promise) */
// export async function generateMetadata(
//   { params }: { params: Params }
// ): Promise<Metadata> {
//   const { slug } = params
//   const svc = await sanityClient.fetch<ServiceDoc>(SERVICE_BY_SLUG_QUERY, {
//     slug,
//   })
//   return {
//     title: svc?.title ? `${svc.title} – Services` : 'Service',
//     description: svc?.description,
//   }
// }

// /** ✅ FIX: params is a plain object (not Promise) */
// export default async function ServicePage(
//   { params }: { params: Params }
// ) {
//   const { slug } = params

//   const [service, allServices, settings] = await Promise.all([
//     sanityClient.fetch<ServiceDoc>(SERVICE_BY_SLUG_QUERY, { slug }),
//     sanityClient.fetch<ServiceListItem[]>(SERVICES_QUERY),
//     sanityClient.fetch<Settings>(SETTINGS_QUERY),
//   ])

//   if (!service) {
//     return (
//       <div className="container py-5">
//         <h1>Service not found</h1>
//         <p className="text-muted">
//           Please check the URL or go back to <Link href="/#services">Services</Link>.
//         </p>
//       </div>
//     )
//   }

//   const related = (service.related || []).filter((r) => r?.slug?.current)

//   return (
//     <main>
//       {/* NAV */}
//       <nav className="navbar navbar-expand-lg navbar-light  py-3 sticky-top header">
//         <div className="container">
//           <Link href="/" className="navbar-brand fw-semibold">
//             {settings?.siteName ?? "Hridmann"}
//           </Link>
//           <ul className="navbar-nav ms-auto d-none d-lg-flex flex-row align-items-center gap-3">
//             <li className="nav-item">
//               <Link className="nav-link text-dark" href="/#about">About</Link>
//             </li>
//             <li className="nav-item dropdown position-static">
//               <Link className="nav-link text-dark px-0" href="/#services">
//                 Services
//               </Link>
//               <ul
//                 className="dropdown-menu shadow border-0 rounded-3 p-2 menu-elev"
//                 style={{ minWidth: "20rem" }}
//               >
//                 {allServices?.map((s, i) => (
//                   <li key={s._id ?? s.slug?.current ?? i}>
//                     {s.slug?.current ? (
//                       <Link className="dropdown-item rounded-2 py-2" href={`/services/${s.slug.current}`}>
//                         {s.title}
//                       </Link>
//                     ) : (
//                       <span className="dropdown-item rounded-2 py-2 disabled">{s.title}</span>
//                     )}
//                   </li>
//                 ))}
//               </ul>
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

//       {/* HERO */}
//       <section className="bg-light py-5 border-bottom">
//         <div className="container">
//           <div className="row align-items-center g-4">
//             <div className="col-lg-6">
//               {service.badge && (
//                 <span className="badge text-bg-dark rounded-pill">{service.badge}</span>
//               )}
//               <h1 className="display-5 mt-3 mb-2">{service.title}</h1>
//               {service.description && (
//                 <p className="lead text-secondary">{service.description}</p>
//               )}
//               <div className="d-flex gap-2 mt-3">
//                 <a href="#contact" className="btn btn-primary flex-fill">Book a discovery call</a>
//                 <Link href="/#testimonials" className="btn btn-outline-primary flex-fill">Read testimonials</Link>
//               </div>
//             </div>
//             <div className="col-lg-6">
//               {service.heroImage?.asset?.url && (
//                 <div className="ratio ratio-16x9 rounded-4 overflow-hidden shadow-sm">
//                   {/* eslint-disable-next-line @next/next/no-img-element */}
//                   <img
//                     src={service.heroImage.asset.url}
//                     alt={service.title}
//                     className="w-100 h-100 object-fit-cover"
//                   />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* BODY */}
//       <section className="py-5">
//         <div className="container">
//           <div className="row g-5">
//             <div className="col-lg-8">
//               {Array.isArray(service.body) && service.body.length > 0 && (
//                 <div className="mb-5">
//                   <h2 className="h3 mb-3">Overview</h2>
//                   <PortableText value={service.body} />
//                 </div>
//               )}

//               {!!service.agenda?.length && (
//                 <div className="mb-5">
//                   <h2 className="h3 mb-3">Agenda</h2>
//                   <ol className="ps-3">
//                     {service.agenda.map((step) => (
//                       <li key={step._key || `${step.title}-${step.duration || 'x'}`} className="mb-2">
//                         <strong>{step.title}</strong>
//                         {step.duration ? <> <span className="text-muted">({step.duration})</span></> : null}
//                       </li>
//                     ))}
//                   </ol>
//                 </div>
//               )}

//               {!!service.outcomes?.length && (
//                 <div className="mb-5">
//                   <h2 className="h3 mb-3">What you’ll get</h2>
//                   <ul className="list-unstyled">
//                     {service.outcomes.map((item, idx) => (
//                       <li key={`outcome-${idx}`} className="d-flex align-items-start gap-2 mb-2">
//                         <i className="bi bi-check2-circle fs-5 mt-1" />
//                         <span>{item}</span>
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {!!service.gallery?.length && (
//                 <div className="mb-2">
//                   <div className="row g-3">
//                     {service.gallery
//                       .filter((img) => !!img?.asset?.url)
//                       .map((img, i) => (
//                         <div className="col-sm-6 col-lg-4" key={img._key || `${img.asset?.url}-${i}`}>
//                           {/* eslint-disable-next-line @next/next/no-img-element */}
//                           <img
//                             src={img.asset!.url!}
//                             alt={`${service.title} image ${i + 1}`}
//                             className="w-100 rounded-4"
//                           />
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               )}

//               {service.slug?.current === "journey-oriented-training-and-workshops" &&
//                 Array.isArray(service.subServices) && service.subServices.length > 0 && (
//                   <div className="mb-5">
//                     <h2 className="h3 mb-3">Workshops</h2>
//                     <div className="row g-4">
//                       {service.subServices.map((sub) =>
//                         sub.slug?.current ? (
//                           <div key={sub._key} className="col-md-6">
//                             <div className="card h-100 p-4 rounded-4 shadow-sm">
//                               <h3 className="h5">{sub.title}</h3>
//                               <Link
//                                 href={`/services/${service.slug?.current}/${sub.slug.current}`}
//                                 className="stretched-link text-decoration-none"
//                               >
//                                 Learn more →
//                               </Link>
//                             </div>
//                           </div>
//                         ) : null
//                       )}
//                     </div>
//                   </div>
//               )}
//             </div>

//             {/* SIDEBAR */}
//             <aside className="col-lg-4">
//               <div className="position-sticky" style={{ top: '96px' }}>
//                 <div className="card shadow-sm rounded-4">
//                   <div className="card-body">
//                     <h3 className="h5 mb-3">Quick facts</h3>
//                     {!!service.quickFacts?.length ? (
//                       <ul className="list-unstyled small mb-4">
//                         {service.quickFacts.map((f) => (
//                           <li
//                             key={f._key || `${f.label}-${f.value}`}
//                             className="d-flex justify-content-between border-bottom py-2"
//                           >
//                             <span>{f.label}</span>
//                             <strong>{f.value}</strong>
//                           </li>
//                         ))}
//                       </ul>
//                     ) : (
//                       <p className="text-muted small">Let’s tailor this to your team.</p>
//                     )}
//                     <a href="#contact" className="btn btn-primary w-100 mb-2">Get a custom quote</a>
//                     <Link href="/#testimonials" className="btn btn-outline-primary w-100 mb-2">Read testimonials</Link>
//                   </div>
//                 </div>
//               </div>
//             </aside>
//           </div>
//         </div>
//       </section>

//       {/* RELATED */}
//       {!!related.length && (
//         <section className="py-5 bg-body-tertiary border-top" aria-labelledby="related">
//           <div className="container">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <h2 id="related" className="h4 mb-0">Related services</h2>
//               <a href="#contact" className="btn btn-sm btn-outline-secondary">Contact us</a>
//             </div>
//             <div className="row g-4">
//               {related.map((r) => {
//                 const href = `/services/${r.slug!.current!}`
//                 const key = r._key || r.slug!.current!
//                 return (
//                   <div className="col-md-4" key={key}>
//                     <Link className="card h-100 text-decoration-none rounded-4" href={href}>
//                       <div className="card-body p-4">
//                         <h3 className="h5 mb-1">{r.title || 'Service'}</h3>
//                         <p className="text-secondary small mb-0">Learn more →</p>
//                       </div>
//                     </Link>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>
//         </section>
//       )}

//       {/* CONTACT WIDGET */}
//       <section id="contact" className="py-5 bg-light border-top">
//         <div className="container">
//           <div className="row g-4 align-items-stretch">
//             <div className="col-lg-5">
//               <div className="card rounded-4 shadow-sm h-100">
//                 <div className="card-body">
//                   <h2 className="h3 mb-3">Get in Touch</h2>
//                   <p className="mb-3">
//                     Prefer a quick call? Drop a message with your number and we’ll reach out.
//                   </p>
//                   <p className="mb-2">
//                     <i className="bi bi-envelope me-2" />
//                     <a href={`mailto:${settings?.contactEmail || 'harshana.hridmann@gmail.com'}`}>
//                       {settings?.contactEmail || 'harshana.hridmann@gmail.com'}
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
//                 <h5 className="mb-3">{settings?.formSendLabel || 'Send a Message'}</h5>
//                 <ContactForm label={settings?.formSendLabel} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="py-4 border-top bg-white">
//         <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
//           <div>© {new Date().getFullYear()} {settings?.siteName || 'Hridmann'}</div>
//           <div className="footer-note small">{settings?.footerNote || '  '}</div>
//         </div>
//       </footer>
//     </main>
//   )
// }
