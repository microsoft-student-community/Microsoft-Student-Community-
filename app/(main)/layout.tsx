import "./marketing.css";
import AppChrome from "@/components/AppChrome";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              document.documentElement.classList.remove('skip-loader');
            })();
          `,
        }}
      />
      <AppChrome>{children}</AppChrome>
    </>
  );
}
