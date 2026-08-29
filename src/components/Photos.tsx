type Photo = { src: string; alt: string };

const PORTRAIT = { w: 1280, h: 1920 };
const LANDSCAPE = { w: 1920, h: 1280 };

const base = "/media/fotos";

// Genera las 3 variantes por nombre (asumen .avif/.webp/.jpg pre-generados)
const variants = (file: string) => ({
  avif: `${base}/${file}.avif`,
  webp: `${base}/${file}.webp`,
  jpg: `${base}/${file}.jpg`,
});

export const placements = {
  feature: { src: `${base}/IMG_7738`, alt: "Karen y Aldo" },
  duoOne: [
    { src: `${base}/IMG_7695`, alt: "Karen y Aldo" },
    { src: `${base}/IMG_7703`, alt: "Karen y Aldo" },
  ],
  singleOne: { src: `${base}/IMG_7718`, alt: "Karen y Aldo" },
  duoTwo: [
    { src: `${base}/IMG_7727`, alt: "Karen y Aldo" },
    { src: `${base}/IMG_7735`, alt: "Karen y Aldo" },
  ],
  singleTwo: { src: `${base}/IMG_7756`, alt: "Karen y Aldo" },
  duoThree: [
    { src: `${base}/IMG_7757`, alt: "Karen y Aldo" },
    { src: `${base}/IMG_7791`, alt: "Karen y Aldo" },
  ],
  duoFour: [
    { src: `${base}/IMG_7794`, alt: "Karen y Aldo" },
    { src: `${base}/IMG_7806`, alt: "Karen y Aldo" },
  ],
};

function Picture({
  photo,
  className,
  width,
  height,
  sizes,
}: {
  photo: Photo;
  className?: string;
  width: number;
  height: number;
  sizes: string;
}) {
  const v = variants(photo.src.split("/").pop() as string);
  return (
    <picture>
      <source srcSet={v.avif} type="image/avif" />
      <source srcSet={v.webp} type="image/webp" />
      <img
        src={v.jpg}
        alt={photo.alt}
        width={width}
        height={height}
        sizes={sizes}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}

export function PhotoFeature({
  photo,
  bg = "bg-cream",
}: {
  photo: Photo;
  bg?: string;
}) {
  return (
    <div className={`reveal ${bg} py-16 sm:py-20`}>
      <div className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-2xl shadow-[0_35px_80px_-35px_rgba(56,58,45,0.5)] ring-1 ring-arena/50">
          <Picture
            photo={photo}
            width={LANDSCAPE.w}
            height={LANDSCAPE.h}
            sizes="(max-width: 896px) 100vw, 896px"
            className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        </div>
      </div>
    </div>
  );
}

export function PhotoDuo({
  photos,
  bg = "bg-cream",
}: {
  photos: Photo[];
  bg?: string;
}) {
  return (
    <div className={`reveal ${bg} py-16 sm:py-20`}>
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 sm:gap-8">
        {photos.map((p) => (
          <div
            key={p.src}
            className="overflow-hidden rounded-2xl ring-1 ring-arena/50 shadow-[0_25px_60px_-30px_rgba(56,58,45,0.45)]"
          >
            <Picture
              photo={p}
              width={PORTRAIT.w}
              height={PORTRAIT.h}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 480px"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PhotoSingle({
  photo,
  bg = "bg-cream",
}: {
  photo: Photo;
  bg?: string;
}) {
  return (
    <div className={`reveal ${bg} py-16 sm:py-20`}>
      <div className="mx-auto max-w-xl px-6">
        <div className="overflow-hidden rounded-2xl shadow-[0_30px_70px_-30px_rgba(56,58,45,0.5)] ring-1 ring-arena/50">
          <Picture
            photo={photo}
            width={PORTRAIT.w}
            height={PORTRAIT.h}
            sizes="(max-width: 576px) 100vw, 576px"
            className="h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
          />
        </div>
      </div>
    </div>
  );
}