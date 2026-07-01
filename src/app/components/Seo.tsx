import { Helmet } from "react-helmet-async";
import { SITE_URL } from "../../lib/publicRoutes";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_TYPE,
  DEFAULT_OG_IMAGE_URL,
  DEFAULT_OG_IMAGE_WIDTH,
} from "../../lib/seo";

type SeoProps = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

export function Seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
}: SeoProps) {
  const url = `${SITE_URL}${path}`;
  const isDefaultImage = image === DEFAULT_OG_IMAGE;
  const img = isDefaultImage ? DEFAULT_OG_IMAGE_URL : image.startsWith("http") ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      {isDefaultImage && (
        <>
          <meta property="og:image:width" content={String(DEFAULT_OG_IMAGE_WIDTH)} />
          <meta property="og:image:height" content={String(DEFAULT_OG_IMAGE_HEIGHT)} />
          <meta property="og:image:type" content={DEFAULT_OG_IMAGE_TYPE} />
        </>
      )}
      <meta property="og:site_name" content="KerjaIn" />
      <meta property="og:locale" content="id_ID" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
}
