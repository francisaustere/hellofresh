/** URL of a generated image in public/img/, respecting the deploy base path. */
export function imageUrl(file: string): string {
  return `${import.meta.env.BASE_URL}img/${file}`;
}
