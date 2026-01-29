const FOOTER_IMAGE_URL =
  'https://masterpiecer-images.s3.yandex.net/70211a85aefb11ee926906df1e8dc5af:upscaled';

export function FooterArt() {
  return (
    <div className="mt-64 flex justify-center">
      <img
        src={FOOTER_IMAGE_URL}
        alt="Fantasy art"
        className="w-full max-w-[520px] rounded-xl shadow-lg border border-white/10"
        loading="lazy"
      />
    </div>
  );
}
