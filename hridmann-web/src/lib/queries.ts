// import { groq } from 'next-sanity'

export const HOME_QUERY = groq`*[_type == "home"][0]{
  heroTitle,
  heroSubtitle,
  heroBadge,
  aboutTitle,
  aboutBody,
  portrait,
  aboutPortrait,
  focusAreas,
  certifications,
  servicesTitle,
  servicesSubtitle,
  testimonialsTitle,
  testimonialsSubtitle,
  contactTitle,
  contactHelpText,
}`

// export const SERVICES_QUERY = groq`*[_type == "service"] | order(title asc){
//   _id,
//   title,
//   description,
//   icon,
//   slug,
// }`

export const TESTIMONIALS_QUERY = groq`*[_type == "testimonial"] | order(_createdAt desc){
  name,
  role,
  message,
  photo
}`

// export const SETTINGS_QUERY = groq`*[_type == "settings"][0]{
//   siteName,
//   contactEmail,
//   instagram,
//   footerNote,
//   navAboutLabel,
//   navServicesLabel,
//   navTestimonialsLabel,
//   navContactLabel,
//   ctaExploreLabel,
//   ctaContactLabel,
//   formSendLabel,
//   logo { asset->{ _ref, url } },
//   "navigation": *[_type == "nav"][0]{
//     items[]{ _key, href, label }
//   }
// }`

// export const SERVICE_SLUGS_QUERY = groq`*[_type == "service" && defined(slug.current)]{
//   "slug": slug.current
// }`



// export const SERVICE_BY_SLUG_QUERY = groq`*[_type == "service" && slug.current == $slug][0]{
//   _id,
//   title,
//   description,
//   icon,
//   "slug": slug,
//   "heroImage": heroImage{ asset->{ url } },
//   body,
//   "gallery": gallery[]{ _key, asset->{ url } },
//   badge,
//   outcomes[],
//   agenda[]{ _key, title, duration },
//   quickFacts[]{ _key, label, value },
//   subServices[]{
//     _key,
//     title,
//     slug,
//     content,
//     "heroImage": heroImage{ asset->{ url } },
//     outcomes[],
//     agenda[]{ _key, title, duration },
//     quickFacts[]{ _key, label, value }
//   },
//   "related": related[]->{
//     _key,
//     title,
//     "slug": slug
//   }
// }`;

import { groq } from "next-sanity";

export const SERVICES_QUERY = groq`*[_type == "service"] | order(title asc){
  _id,
  title,
  description,
  icon,
  slug,
}`;

export const SERVICE_SLUGS_QUERY = groq`*[_type == "service" && defined(slug.current)]{
  "slug": slug.current
}`;

export const SERVICE_BY_SLUG_QUERY = groq`
  *[_type == "service" && slug.current == $slug][0]{
    _id,
    title,
    description,
    icon,
    slug,
    heroImage{ asset->{ url } },
    body,
    gallery[]{ _key, asset->{ url } },
    badge,
    outcomes[],
    agenda[]{ _key, title, duration },
    quickFacts[]{ _key, label, value },
    subServices[]{
      _key,
      title,
      slug { current },   // ✅ force only current
      content,
      heroImage{ asset->{ url } },
      outcomes[],
      agenda[]{ _key, title, duration },
      quickFacts[]{ _key, label, value }
    },
    related[]->{
      _key,
      title,
      slug { current }   // ✅ same here for consistency
    }
  }
`;


export const SETTINGS_QUERY = groq`*[_type == "settings"][0]{
  siteName,
  contactEmail,
  instagram,
  footerNote,
  navAboutLabel,
  navServicesLabel,
  navTestimonialsLabel,
  navContactLabel,
  ctaExploreLabel,
  ctaContactLabel,
  formSendLabel,
  logo { asset->{ _ref, url } },
  "navigation": *[_type == "nav"][0]{
    items[]{ _key, href, label }
  }
}`;


export const EVENTS_QUERY = `
  *[_type == "event"] | order(date desc) {
    _id,
    title,
    description,
    date,
    bannerExpiry,
    flyer,
    link
  }
`;