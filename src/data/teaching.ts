export interface TeachingResource {
  id: string;
  title: string;
  description: string;
  videoUrl: string; // YouTube or Vimeo URL
  links?: { label: string; url: string }[];
}

// Standalone talks & one-off videos that aren't part of a full course. The
// /teaching page renders this as a secondary "Talks & one-offs" section only
// when it's non-empty, so the courses grid stands alone until real talks land.
export const teachingResources: TeachingResource[] = [];
