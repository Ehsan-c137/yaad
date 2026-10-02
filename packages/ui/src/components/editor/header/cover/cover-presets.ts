import type {
  CoverCategory,
  CoverCategoryOption,
  CoverPresetItem,
} from "./cover-picker-types";

export const COVER_CATEGORIES: CoverCategoryOption[] = [
  { id: "all", labelKey: "all" },
  { id: "paintings", labelKey: "paintings", icon: "🎨" },
  { id: "nature", labelKey: "nature", icon: "🌿" },
  { id: "space", labelKey: "space", icon: "🚀" },
  { id: "architecture", labelKey: "architecture", icon: "🏛️" },
  { id: "vintage", labelKey: "vintage", icon: "📚" },
  { id: "gradients", labelKey: "gradients", icon: "🌈" },
];

export const COVER_PRESETS: CoverPresetItem[] = [
  // ── Paintings & Fine Art ──────────────────────────────────────────────────
  {
    id: "painting-sunflowers",
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=80",
    title: "Still Life Floral Oil",
    category: "paintings",
    keywords: ["flowers", "flora", "van gogh", "oil", "still life", "yellow"],
  },
  {
    id: "painting-monet-water",
    url: "https://images.unsplash.com/photo-1576769267415-9642010aa962?auto=format&fit=crop&w=1600&q=80",
    title: "Impressionist Water Reflections",
    category: "paintings",
    keywords: [
      "monet",
      "water",
      "impressionism",
      "pond",
      "lilies",
      "blue",
      "green",
    ],
  },
  {
    id: "painting-woodblock",
    url: "https://images.unsplash.com/photo-1579762715118-a6f1d4b934f1?auto=format&fit=crop&w=1600&q=80",
    title: "Ukiyo-e Woodblock Print",
    category: "paintings",
    keywords: ["japan", "hokusai", "woodblock", "traditional", "fuji", "red"],
  },
  {
    id: "painting-still-life",
    url: "https://images.unsplash.com/photo-1584727638096-042c45049ebe?auto=format&fit=crop&w=1600&q=80",
    title: "Classical Masterpiece Still Life",
    category: "paintings",
    keywords: ["dutch", "rembrandt", "museum", "dark", "fruit", "oil"],
  },
  {
    id: "painting-mountain-oil",
    url: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?auto=format&fit=crop&w=1600&q=80",
    title: "Alpine Landscape in Oil",
    category: "paintings",
    keywords: ["alps", "mountains", "landscape", "snow", "oil painting"],
  },
  {
    id: "painting-romantic-valley",
    url: "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1600&q=80",
    title: "Romantic Scenic Canvas",
    category: "paintings",
    keywords: ["nature", "valley", "romanticism", "trees", "river", "clouds"],
  },
  {
    id: "painting-classical-portrait",
    url: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1600&q=80",
    title: "Renaissance Portrait Study",
    category: "paintings",
    keywords: ["portrait", "renaissance", "face", "classical", "person"],
  },
  {
    id: "painting-botanical-flora",
    url: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?auto=format&fit=crop&w=1600&q=80",
    title: "Museum Botanical Study",
    category: "paintings",
    keywords: ["botany", "flora", "flowers", "birmingham", "scientific"],
  },
  {
    id: "painting-cherub-fresco",
    url: "https://images.unsplash.com/photo-1577083288073-40892c0860a4?auto=format&fit=crop&w=1600&q=80",
    title: "Classical Fresco & Cherub",
    category: "paintings",
    keywords: ["fresco", "angel", "cherub", "renaissance", "ceiling", "art"],
  },
  {
    id: "painting-mythology",
    url: "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?auto=format&fit=crop&w=1600&q=80",
    title: "Mythological Canvas",
    category: "paintings",
    keywords: ["myth", "greece", "rome", "fine art", "historic"],
  },
  {
    id: "painting-baroque",
    url: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1600&q=80",
    title: "Baroque Museum Painting",
    category: "paintings",
    keywords: ["baroque", "chiaroscuro", "museum", "gold", "dramatic"],
  },
  {
    id: "painting-lady-portrait",
    url: "https://images.unsplash.com/photo-1579783483458-83d02161294e?auto=format&fit=crop&w=1600&q=80",
    title: "Portrait of a Lady",
    category: "paintings",
    keywords: ["lady", "woman", "vintage", "renaissance", "dress"],
  },
  {
    id: "painting-impressionist-city",
    url: "https://images.unsplash.com/photo-1578925518470-4def7a0f08bb?auto=format&fit=crop&w=1600&q=80",
    title: "Impressionist City Rain",
    category: "paintings",
    keywords: ["paris", "rain", "city", "street", "impressionism"],
  },
  {
    id: "painting-museum-gallery",
    url: "https://images.unsplash.com/photo-1578321272176-b7bbc0679853?auto=format&fit=crop&w=1600&q=80",
    title: "Grand Museum Masterwork",
    category: "paintings",
    keywords: ["museum", "gallery", "exhibit", "frame", "heritage"],
  },
  {
    id: "painting-dutch-landscape",
    url: "https://images.unsplash.com/photo-1580136608260-4eb11f4b24fe?auto=format&fit=crop&w=1600&q=80",
    title: "Dutch Masters Horizon",
    category: "paintings",
    keywords: ["dutch", "horizon", "countryside", "pastoral", "wind"],
  },

  // ── Nature & Landscapes ───────────────────────────────────────────────────
  {
    id: "nature-ocean",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
    title: "Tropical Ocean Reef",
    category: "nature",
    keywords: ["ocean", "beach", "sand", "tropical", "sea", "blue", "water"],
  },
  {
    id: "nature-mountains",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80",
    title: "Misty Mountain Peaks",
    category: "nature",
    keywords: ["mountain", "mist", "peaks", "fog", "snow", "hiking"],
  },
  {
    id: "nature-aurora",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
    title: "Aurora Borealis Night",
    category: "nature",
    keywords: ["aurora", "northern lights", "night", "green", "sky", "stars"],
  },
  {
    id: "nature-forest",
    url: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80",
    title: "Pine Forest Mist",
    category: "nature",
    keywords: ["forest", "trees", "pine", "fog", "green", "woodland"],
  },
  {
    id: "nature-desert",
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=80",
    title: "Desert Sand Dunes",
    category: "nature",
    keywords: ["desert", "sand", "dunes", "sahara", "warm", "minimal"],
  },
  {
    id: "nature-foggy-mountains",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
    title: "Ethereal Mountain Valley",
    category: "nature",
    keywords: ["valley", "fog", "morning", "sunrise", "hills"],
  },
  {
    id: "nature-lake-reflection",
    url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80",
    title: "Alpine Lake Reflection",
    category: "nature",
    keywords: ["lake", "reflection", "water", "calm", "serene", "green"],
  },
  {
    id: "nature-coastal-water",
    url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80",
    title: "Coastal Cliff View",
    category: "nature",
    keywords: ["coast", "cliff", "sea", "islands", "travel", "scenic"],
  },

  // ── Space & Cosmos ────────────────────────────────────────────────────────
  {
    id: "space-earth",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
    title: "Earth from Orbit",
    category: "space",
    keywords: ["earth", "globe", "space", "orbit", "nasa", "blue", "night"],
  },
  {
    id: "space-nebula",
    url: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1600&q=80",
    title: "Deep Space Nebula",
    category: "space",
    keywords: ["nebula", "stars", "galaxy", "cosmic", "purple", "astronomy"],
  },
  {
    id: "space-milky-way",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1600&q=80",
    title: "Milky Way Galaxy Arch",
    category: "space",
    keywords: [
      "milky way",
      "night sky",
      "astrophotography",
      "stars",
      "universe",
    ],
  },
  {
    id: "space-deep-cluster",
    url: "https://images.unsplash.com/photo-1538370965046-79c0d6907d47?auto=format&fit=crop&w=1600&q=80",
    title: "Starry Galactic Cluster",
    category: "space",
    keywords: ["cluster", "starlight", "telescope", "dark", "cosmos"],
  },
  {
    id: "space-moon-surface",
    url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80",
    title: "Space Station Horizon",
    category: "space",
    keywords: ["iss", "satellite", "atmosphere", "horizon", "sunbeam"],
  },

  // ── Architecture & Cities ─────────────────────────────────────────────────
  {
    id: "arch-modern-facade",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80",
    title: "Modern Glass Skyscraper",
    category: "architecture",
    keywords: [
      "building",
      "skyscraper",
      "glass",
      "geometric",
      "modern",
      "blue",
    ],
  },
  {
    id: "arch-spiral-stair",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=80",
    title: "Architectural Spiral Stairs",
    category: "architecture",
    keywords: ["spiral", "stairs", "geometry", "interior", "minimal", "white"],
  },
  {
    id: "arch-city-night",
    url: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1600&q=80",
    title: "Metropolitan City Skyline",
    category: "architecture",
    keywords: [
      "city",
      "skyline",
      "urban",
      "night",
      "lights",
      "tokyo",
      "metropolis",
    ],
  },
  {
    id: "arch-museum-curves",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1600&q=80",
    title: "Curved Architectural Pavilion",
    category: "architecture",
    keywords: ["curves", "concrete", "contemporary", "design", "museum"],
  },
  {
    id: "arch-historic-street",
    url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1600&q=80",
    title: "Historic European Street",
    category: "architecture",
    keywords: ["europe", "cobblestone", "street", "historic", "architecture"],
  },

  // ── Library & Vintage ─────────────────────────────────────────────────────
  {
    id: "vintage-grand-library",
    url: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1600&q=80",
    title: "Grand Classical Library",
    category: "vintage",
    keywords: [
      "library",
      "books",
      "bookshelves",
      "knowledge",
      "reading",
      "study",
    ],
  },
  {
    id: "vintage-stacked-books",
    url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1600&q=80",
    title: "Stacked Antique Volumes",
    category: "vintage",
    keywords: ["antique", "books", "pages", "study", "vintage", "paper"],
  },
  {
    id: "vintage-cozy-reading",
    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1600&q=80",
    title: "Atmospheric Book Corner",
    category: "vintage",
    keywords: ["literature", "novels", "warm", "cozy", "academics"],
  },
  {
    id: "vintage-open-pages",
    url: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1600&q=80",
    title: "Open Book Typography",
    category: "vintage",
    keywords: ["typography", "words", "open book", "writing", "author"],
  },

  // ── Gradients & Abstract ──────────────────────────────────────────────────
  {
    id: "gradient-sunset",
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1600&q=80",
    title: "Pastel Sunset Mesh",
    category: "gradients",
    keywords: ["gradient", "sunset", "pink", "purple", "smooth", "minimal"],
  },
  {
    id: "gradient-fluid",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80",
    title: "Fluid Acrylic Flow",
    category: "gradients",
    keywords: ["fluid", "acrylic", "wave", "blue", "swirl", "liquid"],
  },
  {
    id: "gradient-waves",
    url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1600&q=80",
    title: "Color Acrylic Waves",
    category: "gradients",
    keywords: ["paint", "vibrant", "abstract", "color", "waves"],
  },
  {
    id: "gradient-impasto",
    url: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?auto=format&fit=crop&w=1600&q=80",
    title: "Oil Impasto Texture",
    category: "gradients",
    keywords: ["impasto", "texture", "brushstroke", "rough", "oil"],
  },
];

export function filterPresets(
  presets: CoverPresetItem[],
  category: "all" | CoverCategory,
  searchQuery: string,
): CoverPresetItem[] {
  let list = presets;

  if (category !== "all") {
    list = list.filter((item) => item.category === category);
  }

  const query = searchQuery.trim().toLowerCase();

  if (query) {
    list = list.filter((item) => {
      const titleMatch = item.title.toLowerCase().includes(query);
      const categoryMatch = item.category.toLowerCase().includes(query);
      const keywordMatch = item.keywords?.some((k) =>
        k.toLowerCase().includes(query),
      );
      return titleMatch || categoryMatch || Boolean(keywordMatch);
    });
  }

  return list;
}

export function getRandomPreset(
  presets: CoverPresetItem[],
  category: "all" | CoverCategory = "all",
): CoverPresetItem | undefined {
  const pool =
    category === "all"
      ? presets
      : presets.filter((item) => item.category === category);

  if (pool.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}

export function getRandomUnsplashUrl(): string {
  return `https://images.unsplash.com/photo-${Date.now()}?auto=format&fit=crop&w=1600&q=80`;
}

export function getCoverPreviewUrl(url: string, width = 150): string {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("unsplash.com")) {
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("q", "75");
      return parsed.toString();
    }
  } catch {
    if (url.includes("images.unsplash.com")) {
      return url.replace(/w=\d+/, `w=${width}`).replace(/q=\d+/, "q=75");
    }
  }

  return url;
}

/**
 * Transforms an image URL to a high-resolution version suitable for the full-width page cover banner.
 */
export function getCoverFullUrl(url: string, width = 1600): string {
  if (!url) return "";

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("unsplash.com")) {
      parsed.searchParams.set("w", String(width));
      parsed.searchParams.set("auto", "format");
      parsed.searchParams.set("fit", "crop");
      parsed.searchParams.set("q", "80");
      return parsed.toString();
    }
  } catch {
    if (url.includes("images.unsplash.com")) {
      return url.replace(/w=\d+/, `w=${width}`).replace(/q=\d+/, "q=80");
    }
  }

  return url;
}
