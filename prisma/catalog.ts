// Jewelry catalog seeded from the photos in public/products.
// The first image in each list is the main photo, the rest become the gallery.
// Everything here can be edited later from the admin dashboard.

export interface CatalogProduct {
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  images: string[];
}

export interface CatalogCategory {
  category: string;
  products: CatalogProduct[];
}

const img = (slug: string, count: number) =>
  Array.from({ length: count }, (_, i) => `/products/${slug}/${i + 1}.jpg`);

export const CATALOG: CatalogCategory[] = [
  {
    category: "Stud Earrings",
    products: [
      {
        name: "Starfish Pearl Studs",
        description:
          "Little gold starfish with a pearl in the centre. The arms have a fine dotted texture you only notice up close. Easy to wear to work or to a family function, and they go with both western and desi outfits.",
        price: 950,
        unit: "pair",
        stock: 22,
        images: img("starfish-pearl-studs", 3),
      },
      {
        name: "Crystal Interlock Studs",
        description:
          "Two rounded shapes linked together and covered in tiny clear crystals, set in a gold edge. Small enough for every day but still sparkly. Comes on a stainless steel card.",
        price: 850,
        unit: "pair",
        stock: 25,
        images: img("crystal-interlock-studs", 2),
      },
      {
        name: "Black Crystal Swan Studs",
        description:
          "Swan shaped studs covered completely in small black crystals with a thin gold edge. They look dark and shiny together, which makes a nice change from the usual gold and silver.",
        price: 900,
        unit: "pair",
        stock: 18,
        images: img("black-crystal-swan-studs", 2),
      },
      {
        name: "Round Crystal Emblem Studs",
        description:
          "Round studs with a gold cross emblem in the middle and a ring of small crystals around it. A neat, balanced design that works with almost any neckline.",
        price: 850,
        unit: "pair",
        stock: 20,
        images: img("round-crystal-emblem-studs", 2),
      },
      {
        name: "Crystal Letter Studs",
        description:
          "Slanted letter shaped studs lined with small clear crystals and a gold edge. A sharper style for people who like a little sparkle without going too big.",
        price: 850,
        unit: "pair",
        stock: 20,
        images: img("crystal-letter-studs", 3),
      },
      {
        name: "Mini Double Curve Studs",
        description:
          "Tiny studs made of two curved loops facing each other, in gold with a small dark detail. Very small and light, so they are good for daily wear and for a second piercing.",
        price: 750,
        unit: "pair",
        stock: 30,
        images: img("mini-double-curve-studs", 2),
      },
    ],
  },
  {
    category: "Drop & Hoop Earrings",
    products: [
      {
        name: "Pearl Disc Drop Earrings",
        description:
          "A small pearl stud sits on top and a big textured gold disc hangs below it, with another pearl in the middle of the disc. The ridged surface catches the light well. Pick these when you want your earrings to be the main thing in the outfit.",
        price: 1650,
        unit: "pair",
        stock: 14,
        images: img("pearl-disc-drop-earrings", 3),
      },
      {
        name: "Pearl Flower Drop Earrings",
        description:
          "Wavy gold petals with a pearl in the middle of each flower. The petals have a soft, melted look, so they feel more like art than regular jewelry. Secure post backs with butterfly clutches.",
        price: 1450,
        unit: "pair",
        stock: 12,
        images: img("pearl-flower-drop-earrings", 2),
      },
      {
        name: "Square Gold Hoop Earrings",
        description:
          "Clean squared off hoops in smooth gold finish steel. Nothing fancy on them, and that is the point. They sit close to the ear and look good with simple outfits.",
        price: 1100,
        unit: "pair",
        stock: 24,
        images: img("square-gold-hoop-earrings", 2),
      },
      {
        name: "Turquoise Ribbed Hoop Earrings",
        description:
          "Open hoops with a ribbed gold finish and a blue turquoise coloured stone at the top. The ribbing gives them a vintage feel, and the blue looks great against the warm gold.",
        price: 1350,
        unit: "pair",
        stock: 10,
        images: img("turquoise-ribbed-hoop-earrings", 2),
      },
      {
        name: "Rainbow Stone Rectangle Earrings",
        description:
          "Rounded rectangles in shiny gold dotted with little stones in pink, green, blue, yellow and red. Bold and cheerful. Wear them with a plain outfit and let the earrings bring all the colour.",
        price: 1500,
        unit: "pair",
        stock: 11,
        images: img("rainbow-stone-rectangle-earrings", 2),
      },
    ],
  },
  {
    category: "Bracelets & Bangles",
    products: [
      {
        name: "Clover Link Cuff Bracelet",
        description:
          "A wide gold bracelet made of linked panels with a clover pattern cut into each one. The hinged clasp snaps shut so it stays put on your wrist. Works for parties and for plain everyday outfits alike.",
        price: 3800,
        unit: "piece",
        stock: 8,
        images: img("clover-link-cuff-bracelet", 5),
      },
      {
        name: "Rose Gold Screw Detail Bangle",
        description:
          "A slim rose gold bangle with a smooth shine, small screw style markings and tiny stones along the front. It opens on a hinge. Simple enough to wear every day and it sits nicely next to a watch.",
        price: 3200,
        unit: "piece",
        stock: 10,
        images: img("rose-gold-screw-detail-bangle", 4),
      },
      {
        name: "Leaf Cutout Bangle",
        description:
          "A rose gold bangle with leaf shapes cut out all the way around. The open pattern lets a bit of skin show through, so it never looks bulky. Closes with a push clasp.",
        price: 2900,
        unit: "piece",
        stock: 9,
        images: img("leaf-cutout-bangle", 5),
      },
      {
        name: "Wide Leaf Cutout Cuff",
        description:
          "The wider version of the leaf cutout bangle. A full band of cut out leaves in rose gold with a flat plate and hinge clasp at the front. It makes a strong statement on its own, so you do not need anything else on that wrist.",
        price: 4200,
        unit: "piece",
        stock: 6,
        images: img("wide-leaf-cutout-cuff", 4),
      },
      {
        name: "Colour Stone Chain Bracelet",
        description:
          "A fine gold chain with round coloured stones spaced along it in blue, red, green, black and white. It has an extender chain and a lobster clasp, so you can adjust the fit. Nice on its own or stacked with other bracelets.",
        price: 2200,
        unit: "piece",
        stock: 15,
        images: img("colour-stone-chain-bracelet", 3),
      },
    ],
  },
  {
    category: "Pendant Necklaces",
    products: [
      {
        name: "Black Rectangle Pendant Necklace",
        description:
          "A thin gold chain with a black rectangular pendant in a gold frame. Plain and neat. A good first necklace and an easy gift.",
        price: 1900,
        unit: "piece",
        stock: 12,
        images: img("black-rectangle-pendant-necklace", 1),
      },
      {
        name: "Pearl White Rectangle Pendant Necklace",
        description:
          "A fine gold chain with a rectangular pendant in a soft, pearly white. The swirls in the surface are slightly different on each piece. Goes well with both dark and light outfits.",
        price: 1900,
        unit: "piece",
        stock: 12,
        images: img("pearl-white-rectangle-pendant-necklace", 2),
      },
      {
        name: "Crystal Round Emblem Necklace",
        description:
          "A delicate gold chain with a round pendant. A gold cross emblem sits in the middle and a ring of small crystals goes around it. It has an adjustable clasp.",
        price: 2100,
        unit: "piece",
        stock: 14,
        images: img("crystal-round-emblem-necklace", 2),
      },
      {
        name: "Black Crescent Pendant Necklace",
        description:
          "An uneven round pendant in glossy black with a gold crescent on top, hanging from a thin rose gold chain. The shape is soft and organic, so it looks different from the usual perfectly round pendants.",
        price: 1800,
        unit: "piece",
        stock: 10,
        images: img("black-crescent-pendant-necklace", 2),
      },
      {
        name: "Pearl Crescent Pendant Necklace",
        description:
          "The same crescent design as our black one, but on a pale pearly background with a soft pink tint. A thin rose gold chain holds it. The back of the pendant is plain gold.",
        price: 1800,
        unit: "piece",
        stock: 10,
        images: img("pearl-crescent-pendant-necklace", 4),
      },
      {
        name: "Black Crystal Swan Necklace",
        description:
          "A swan pendant covered in small black crystals on a fine rose gold chain, with an adjustable clasp at the back. It is a bold little piece that still looks elegant on a plain neckline.",
        price: 2300,
        unit: "piece",
        stock: 9,
        images: img("black-crystal-swan-necklace", 4),
      },
    ],
  },
];
