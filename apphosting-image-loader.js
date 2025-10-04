'use client';
 
// https://nextjs.org/docs/app/api-reference/components/image#loader
export default function appHostingLoader({ src, width, quality }) {
  return `${src}?w=${width}&q=${quality || 75}`;
}