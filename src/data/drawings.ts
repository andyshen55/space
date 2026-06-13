// Drawings shown on the /art page as a swipeable "infinite stack of paper".
//
// To use your own work: drop the image files into `public/drawings/` (JPG, PNG,
// or SVG — any aspect ratio is fine, the card centers and contains them) and
// edit the list below. These six entries are placeholder line-art SVGs; replace
// them one by one or all at once. Order here is the order of the stack.

export interface Drawing {
  id: string;
  title: string;
  image: string; // path under /public, e.g. "/drawings/sketch-01.svg"
  alt: string; // accessible description / caption
  year?: string;
  medium?: string;
}

export const drawings: Drawing[] = [
  {
    id: "1",
    title: "Three-quarter portrait",
    image: "/drawings/sketch-01.svg",
    alt: "Line-drawn portrait of a face in three-quarter view",
    medium: "Ink",
  },
  {
    id: "2",
    title: "Houseplant",
    image: "/drawings/sketch-02.svg",
    alt: "A leafy potted plant resting on a windowsill",
    medium: "Ink",
  },
  {
    id: "3",
    title: "Mountains at dusk",
    image: "/drawings/sketch-03.svg",
    alt: "A mountain range with a low sun and a lake below",
    medium: "Ink",
  },
  {
    id: "4",
    title: "Hand study",
    image: "/drawings/sketch-04.svg",
    alt: "A gesture study of an open hand",
    medium: "Ink",
  },
  {
    id: "5",
    title: "Doodle no. 5",
    image: "/drawings/sketch-05.svg",
    alt: "An abstract doodle of spirals, marks, and a small circle",
    medium: "Ink",
  },
  {
    id: "6",
    title: "Mug and book",
    image: "/drawings/sketch-06.svg",
    alt: "A still life of a coffee mug beside a stacked book",
    medium: "Ink",
  },
];
