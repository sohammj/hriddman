"use client";

import Image from "next/image";
import Masonry from "react-masonry-css";
import { useState } from "react";
import { urlFor } from "@/lib/image";

interface SanityImage {
  _key?: string;
  asset: { _id: string; url: string };
  caption?: string;
  alt?: string;
  title?: string;
  description?: string;
}

interface MasonryGalleryProps {
  images: SanityImage[];
}

export default function MasonryGallery({ images }: MasonryGalleryProps) {
  const [index, setIndex] = useState<number | null>(null);

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    800: 2,
    500: 1,
  };

  const closeLightbox = () => setIndex(null);
  const prevImage = () =>
    setIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
  const nextImage = () =>
    setIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));

  return (
    <>
      {/* Masonry Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 overflow-hidden">
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex gap-4"
          columnClassName="space-y-4"
        >
          {images.map((img, i) => (
            <div
              key={img._key || img.asset._id || i}
              className="relative overflow-hidden rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setIndex(i)}
            >
              <Image
                src={urlFor(img).width(800).url()}
                alt={img.alt || `Gallery Image ${i + 1}`}
                width={800}
                height={800}
                className="w-full h-auto object-cover rounded-2xl"
              />
            </div>
          ))}
        </Masonry>
      </div>

      {/* LIGHTBOX OVERLAY */}
      {index !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden"
          onClick={closeLightbox}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl flex flex-col md:flex-row max-w-6xl w-[90%] h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT: Image */}
            <div className="md:w-[55%] bg-black flex items-center justify-center overflow-hidden">
              <Image
                    src={urlFor(images[index]).width(1200).url()}
                    alt={images[index].alt || "Expanded image"}
                    width={1200}
                    height={1000}
                    className="object-contain max-h-[80vh] w-auto rounded-none"
                />

              {/* Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow transition"
              >
                <i className="bi bi-chevron-left text-xl text-gray-700" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow transition"
              >
                <i className="bi bi-chevron-right text-xl text-gray-700" />
              </button>
            </div>

            {/* RIGHT: Text Content */}
            <div className="md:w-[45%] flex flex-col justify-center p-10 text-left overflow-y-auto bg-white">
              <h2 className="text-3xl font-semibold mb-4 text-gray-900 leading-snug">
                {images[index].title || ` `}
              </h2>
              <p className="text-gray-600 text-[1.05rem] leading-relaxed whitespace-pre-line tracking-wide">
                {images[index].description ||
                  images[index].caption ||
                  " "}
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition"
            >
              <i className="bi bi-x-lg text-gray-700 text-lg" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
