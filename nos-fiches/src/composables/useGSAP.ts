import gsap from "gsap";

// Shared tween defaults (ease, duration), set once.
let isReady = false;

export function useGSAP(): typeof gsap {
  if (!isReady) {
    gsap.defaults({ ease: "power3.out", duration: 0.35 });
    isReady = true;
  }
  return gsap;
}
