"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarContextValue {
  imageLoaded: boolean;
  setImageLoaded: (loaded: boolean) => void;
}

const AvatarContext = React.createContext<AvatarContextValue>({
  imageLoaded: false,
  setImageLoaded: () => {},
});

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);

  return (
    <AvatarContext.Provider value={{ imageLoaded, setImageLoaded }}>
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-900",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt = "", ...props }, ref) => {
  const { setImageLoaded } = React.useContext(AvatarContext);
  const [hasError, setHasError] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    setHasError(false);
    if (!src) {
      setImageLoaded(false);
      return;
    }
    // Check if the image is already loaded from cache
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setImageLoaded(true);
    }
  }, [src, setImageLoaded]);

  if (!src || hasError) {
    return null;
  }

  return (
    <img
      ref={(node) => {
        imgRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLImageElement | null>).current = node;
        }
        if (node && node.complete && node.naturalWidth > 0) {
          setImageLoaded(true);
        }
      }}
      src={src}
      alt={alt}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
      onLoad={() => setImageLoaded(true)}
      onError={() => {
        setHasError(true);
        setImageLoaded(false);
      }}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { imageLoaded } = React.useContext(AvatarContext);

  if (imageLoaded) {
    return null;
  }

  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-0 flex h-full w-full items-center justify-center rounded-full bg-neutral-800 text-white font-medium select-none pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
AvatarFallback.displayName = "AvatarFallback";

export const AvatarDemo = () => {
  return (
    <Avatar>
      <AvatarImage
        src="https://cdn.21st.dev/assets/mirror/ec/ec81be4cc810190ce4d240fcc57295965c5cebaa8751558595ade91eb62c09a4.png"
        alt="Hallie Richards"
      />
      <AvatarFallback className="text-xs">HR</AvatarFallback>
    </Avatar>
  );
};

export { Avatar, AvatarImage, AvatarFallback };
export default AvatarDemo;

