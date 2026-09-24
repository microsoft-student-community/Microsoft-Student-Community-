import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate Downloader — Microsoft Student Community",
  description: "Private certificate download page for a Microsoft Student Community event.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CertificateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
