"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

export type GalleryImage = { src: string; thumb: string; alt: string };

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState(-1);
  if (images.length === 0) return null;
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((img, i) => (
          <li key={img.src}>
            <button type="button" onClick={() => setIndex(i)} aria-label={`Rasmni kattalashtirish: ${img.alt}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image src={img.thumb} alt={img.alt} fill sizes="(min-width:1024px) 25vw, 50vw" loading="lazy"
                className="object-cover transition duration-300 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      <Lightbox open={index >= 0} index={index} close={() => setIndex(-1)}
        slides={images.map((i) => ({ src: i.src, alt: i.alt }))} />
    </>
  );
}
