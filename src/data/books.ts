export interface Book {
  id: string;
  slug: string; // URL slug for /books/[slug]
  title: string;
  author: string;
  coverImage: string; // Path to image in /public/images/
  coverWidth: number; // Intrinsic pixel width of the cover image
  coverHeight: number; // Intrinsic pixel height of the cover image
  description?: string;
  link?: string; // Optional purchase/info link
  notes?: string; // Reading notes displayed on book back
  rating?: number; // 1–5; PLACEHOLDER until real reviews are written
}

export const books: Book[] = [
  {
    id: "1",
    slug: "between-the-world-and-me",
    rating: 4.5,
    title: "Between the World and Me",
    author: "Ta-Nehisi Coates",
    coverImage: "/books/between-the-world-and-me.jpeg",
    coverWidth: 856,
    coverHeight: 1000,
    description: "A profound exploration of race and identity in America, written as a letter to his son. Coates examines the lived experience of Black bodies in a nation built on white supremacy.",
    link: "https://www.amazon.com/Between-World-Me-Ta-Nehisi-Coates/dp/0385523548",
    notes: "Powerful meditation on American identity and the Black experience. Coates' framework of 'the Plunder' illuminates historical injustices and their contemporary effects. The vulnerability in writing to his son makes abstract ideas deeply personal. Essential reading for understanding systemic racism.",
  },
  {
    id: "2",
    slug: "east-of-eden",
    rating: 5,
    title: "East of Eden",
    author: "John Steinbeck",
    coverImage: "/books/east-of-eden.jpeg",
    coverWidth: 1500,
    coverHeight: 2293,
    description: "An epic novel spanning generations in California's Salinas Valley, exploring the eternal struggle between good and evil through interconnected family sagas.",
    link: "https://www.amazon.com/East-Eden-John-Steinbeck/dp/0143039431",
    notes: "Masterwork exploring the Cain and Abel archetype across generations. Steinbeck's treatment of free will through the Trask family is profound—timshel, 'thou mayest,' captures the essence of human choice and responsibility. The parallel storylines create rich thematic echoes.",
  },
  {
    id: "3",
    slug: "hard-boiled-wonderland-and-the-end-of-the-world",
    rating: 4,
    title: "Hard-Boiled Wonderland and the End of the World",
    author: "Haruki Murakami",
    coverImage: "/books/hard-boiled-wonderland-and-the-end-of-the-world.jpeg",
    coverWidth: 1035,
    coverHeight: 1600,
    description: "Two parallel narratives interweave in this surreal novel—a hard-boiled detective story and a dreamlike journey through an isolated world, ultimately converging into profound meaning.",
    link: "https://www.amazon.com/Hard-Boiled-Wonderland-End-World-Murakami/dp/0099286424",
    notes: "Murakami's dual narrative structure brilliantly explores consciousness and disconnection. The mundane reality contrasts beautifully with the fantastical inner world. By the end, the uncertainty about which reality is real becomes the point—a meditation on the self.",
  },
  {
    id: "4",
    slug: "kafka-on-the-shore",
    rating: 4.5,
    title: "Kafka on the Shore",
    author: "Haruki Murakami",
    coverImage: "/books/kafka-on-the-shore.jpeg",
    coverWidth: 1508,
    coverHeight: 2336,
    description: "A magical realist novel alternating between two protagonists—a young man escaping his fate and an old man searching for his past—in a mysterious Japanese landscape.",
    link: "https://www.amazon.com/Kafka-Shore-Haruki-Murakami/dp/0099286927",
    notes: "A haunting exploration of destiny, love, and loss. The parallel journeys of Kafka and Nakata reveal how different people navigate life's mysteries. Murakami's prose is hypnotic, creating a liminal space where reality bends and coincidence feels inevitable.",
  },
  {
    id: "5",
    slug: "stories-of-your-life-and-others",
    rating: 5,
    title: "Stories of Your Life and Others",
    author: "Ted Chiang",
    coverImage: "/books/stories-of-your-life-and-others.jpeg",
    coverWidth: 1200,
    coverHeight: 1851,
    description: "A collection of thought-provoking science fiction stories that explore language, time, and consciousness. Features 'Story of Your Life,' which inspired the film Arrival.",
    link: "https://www.amazon.com/Stories-Your-Life-Others-Chiang/dp/0380815035",
    notes: "Chiang's stories are philosophical puzzles wrapped in compelling narratives. 'Story of Your Life' explores how language shapes perception and destiny. Each story rewards careful reading—the endings often reframe everything that came before. Dense with ideas but never heavy-handed.",
  },
  {
    id: "6",
    slug: "the-brothers-karamazov",
    rating: 5,
    title: "The Brothers Karamazov",
    author: "Fyodor Dostoevsky",
    coverImage: "/books/the-brothers-karamazov.jpeg",
    coverWidth: 1616,
    coverHeight: 2475,
    description: "A philosophical masterpiece following three brothers in 19th century Russia, grappling with faith, suffering, and morality through a complex murder mystery.",
    link: "https://www.amazon.com/Brothers-Karamazov-Fyodor-Dostoevsky/dp/0374528373",
    notes: "A towering work tackling faith, doubt, and suffering. Ivan's rebellion against God and Dostoevsky's response through faith and love remains profoundly relevant. The Grand Inquisitor chapter is a masterpiece of philosophical fiction. Dense but transformative reading.",
  },
  {
    id: "7",
    slug: "the-gene",
    rating: 4,
    title: "The Gene: An Intimate History",
    author: "Siddhartha Mukherjee",
    coverImage: "/books/the-gene.jpeg",
    coverWidth: 1400,
    coverHeight: 2131,
    description: "A comprehensive and accessible history of genetics from Darwin to CRISPR, exploring how our understanding of heredity has shaped science, society, and ourselves.",
    link: "https://www.amazon.com/Gene-Intimate-History-Siddhartha-Mukherjee/dp/1432837818",
    notes: "Mukherjee makes scientific history compelling and deeply human. From Mendel's peas to CRISPR, he shows how genetics was shaped by obsession, prejudice, and breakthrough. The ethics chapters on eugenics remain disturbingly relevant. Essential for understanding biological science.",
  },
  {
    id: "8",
    slug: "the-seven-husbands-of-evelyn-hugo",
    rating: 4,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    coverImage: "/books/the-seven-husbands-of-evelyn-hugo.jpeg",
    coverWidth: 1400,
    coverHeight: 2113,
    description: "A reclusive Hollywood icon reveals the secrets behind her seven marriages and scandalous past in this sweeping historical fiction about ambition, love, and reinvention.",
    link: "https://www.amazon.com/Seven-Husbands-Evelyn-Taylor-Jenkins/dp/B078J8WHY4",
    notes: "A masterclass in storytelling and unreliable narration. Evelyn's voice is magnetic—funny, vulnerable, and calculating all at once. The twist recontextualizes everything while the emotional core remains true. Perfect for understanding how identities are constructed.",
  },
  {
    id: "9",
    slug: "the-way-of-kings",
    rating: 4.5,
    title: "The Way of Kings",
    author: "Brandon Sanderson",
    coverImage: "/books/the-way-of-kings.jpeg",
    coverWidth: 1572,
    coverHeight: 2560,
    description: "An epic fantasy introducing the richly detailed world of Roshar, following interconnected characters across shifting kingdoms and fantastical landscapes filled with intricate magic systems.",
    link: "https://www.amazon.com/Way-Kings-Stormlight-Archive-Book-ebook/dp/B003ECQL0C",
    notes: "An immersive fantasy world with intricate world-building and magic systems. Sanderson's multiple POVs create richly layered narratives. The characters feel real despite the fantastical setting. The philosophical questions about honor and leadership elevate it beyond typical epic fantasy.",
  },
  {
    id: "10",
    slug: "when-breath-becomes-air",
    rating: 5,
    title: "When Breath Becomes Air",
    author: "Paul Kalanithi",
    coverImage: "/books/when-breath-becomes-air.jpeg",
    coverWidth: 1200,
    coverHeight: 1771,
    description: "A poignant memoir by a neurosurgeon diagnosed with terminal cancer, reflecting on mortality, meaning, and what makes life worth living at its end.",
    link: "https://www.amazon.com/When-Breath-Becomes-Paul-Kalanithi/dp/0812988558",
    notes: "A devastating and beautiful meditation on mortality, meaning, and identity. Kalanithi's voice remains warm and intellectually rigorous even facing death. His struggle between the scientist's world and the embodied experience of illness is profoundly moving. Reading this changes how you think about life.",
  },
];

// Look up a book by its URL slug. Used by the dynamic /books/[slug] routes.
export function getBookBySlug(slug: string): Book | undefined {
  return books.find((book) => book.slug === slug);
}
