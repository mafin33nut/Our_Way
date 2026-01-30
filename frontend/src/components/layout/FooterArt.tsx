const FOOTER_IMAGE_URL =
  'https://masterpiecer-images.s3.yandex.net/70211a85aefb11ee926906df1e8dc5af:upscaled';

type FooterArtProps = {
  className?: string;
  imageClassName?: string;
};

export function FooterArt({ className, imageClassName }: FooterArtProps) {
  const containerClass = className ?? 'mt-32 flex justify-center';
  const imgClass =
    imageClassName ?? 'w-full max-w-[520px] rounded-xl shadow-lg border border-white/10';
  return (
    <div className={containerClass}>
      <img
        src={FOOTER_IMAGE_URL}
        alt="Fantasy art"
        className={imgClass}
        loading="lazy"
      />
    </div>
  );
}
