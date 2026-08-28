import GalleryClientWrapper from "./GalleryClientWrapper";
import "./gallery-premium.css";
import { galleryData } from "./galleryData";

export const metadata = {
  title: "Gallery | MSC SRMAP",
  description:
    "An interactive chronicle of hackathons, technical bootcamps, hardware exhibitions, and community moments hosted by Microsoft Student Community at SRM University AP.",
};

export default function GalleryPage() {
  return <GalleryClientWrapper items={galleryData} />;
}
