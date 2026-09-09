"use client";

import { useEffect, useRef, useState } from "react";

/** Helper to preload an image into browser HTTP cache */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !src) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

/** Preload an array of image URLs in parallel */
export function preloadImages(srcs: string[]): Promise<void[]> {
  const uniqueSrcs = Array.from(new Set(srcs.filter(Boolean)));
  return Promise.all(uniqueSrcs.map((src) => preloadImage(src)));
}

export interface UseSectionPreloaderOptions {
  rootMargin?: string;
  threshold?: number;
  onIntersect?: () => void;
  enabled?: boolean;
}

export function useSectionPreloader<T extends HTMLElement = HTMLElement>(
  targetRef?: React.RefObject<T | null>,
  options: UseSectionPreloaderOptions = {}
) {
  const { rootMargin = "300px", threshold = 0, onIntersect, enabled = true } = options;
  const localRef = useRef<T | null>(null);
  const ref = targetRef ?? localRef;
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || hasTriggered || typeof window === "undefined") return;

    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      const timer = setTimeout(() => {
        setHasTriggered(true);
        onIntersect?.();
      }, 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setHasTriggered(true);
          onIntersect?.();
          observer.disconnect();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [enabled, hasTriggered, onIntersect, ref, rootMargin, threshold]);

  return { ref, hasTriggered };
}

