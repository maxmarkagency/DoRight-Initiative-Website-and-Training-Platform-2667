// Routes whose top section is a dark (bg-primary or darker) hero/band can host
// a header that starts transparent and turns to glass on scroll, matching Home.
// Routes with a light/white top section need the glass header immediately, or
// white nav text has nothing to contrast against.
const LIGHT_TOP_PATTERNS = [
  /^\/course\//,
  /^\/training\/course\//,
  /^\/blog\/.+/,
  /^\/media\/podcast\/.+/,
];

export function hasTransparentHero(pathname) {
  return !LIGHT_TOP_PATTERNS.some((pattern) => pattern.test(pathname));
}
