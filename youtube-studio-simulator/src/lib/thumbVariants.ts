import type { PaletteName, ThumbSpec } from '../components/thumbnails/Thumbnail';

const ALT_PALETTES: PaletteName[] = ['blood', 'gold', 'night', 'ember', 'teal', 'purple'];

/** Auto-generated alternative thumbnails (variant 0 is the original upload). */
export function variantSpec(spec: ThumbSpec, variant: number): ThumbSpec {
  if (!variant) return spec;
  const palette = ALT_PALETTES[(ALT_PALETTES.indexOf(spec.palette) + variant + 1) % ALT_PALETTES.length];
  if (variant === 1) return { ...spec, palette, flip: !spec.flip, align: spec.align === 'right' ? 'left' : 'right', arrow: !spec.arrow };
  if (variant === 2) return { ...spec, palette, text: undefined, circle: false, arrow: false, question: false };
  return { ...spec, palette, textColor: 'yellow', circle: true };
}
