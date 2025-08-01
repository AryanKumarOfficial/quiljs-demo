import { Organization, WebApplication, WithContext } from "schema-dts";

interface JsonLdProps {
  type: "Organization" | "WebApplication";
  data?: any;
}

export default function JsonLd({ type, data = {} }: JsonLdProps) {
  let jsonLd: WithContext<Organization | WebApplication>;

  if (type === "Organization") {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "RichText",
      url: "https://richtext.app",
      logo: "https://richtext.app/logo.png",
      sameAs: [
        "https://twitter.com/richtextapp",
        "https://github.com/richtextapp",
      ],
      contactPoint: {
        "@type": "ContactPoint",
        email: "support@richtext.app",
        contactType: "customer service",
      },
      ...data,
    };
  } else if (type === "WebApplication") {
    jsonLd = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "RichText",
      applicationCategory: "ProductivityApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      operatingSystem: "Any",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      description:
        "Take notes beautifully, organize effortlessly, collaborate seamlessly with RichText.",
      ...data,
    };
  } else {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
