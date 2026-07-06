import mechanic from "@/assets/mechanic.jpg";
import plumber from "@/assets/plumber.jpg";
import electrician from "@/assets/electrician.jpg";
import carpenter from "@/assets/carpenter.jpg";

export type Artisan = {
  id: string;
  name: string;
  trade: string;
  category: "Mechanic" | "Plumber" | "Electrician" | "Painter" | "Laborer" | "Carpenter";
  years: number;
  rating: number;
  reviews: number;
  jobs: number;
  distanceKm: number;
  rateNaira: number;
  area: string;
  photo: string;
  verified: true;
  skills: string[];
  about: string;
  reviewList: { name: string; text: string; stars: number; date: string }[];
};

export const ARTISANS: Artisan[] = [
  {
    id: "chinedu-okafor",
    name: "Chinedu Okafor",
    trade: "Expert Roadside Mechanic",
    category: "Mechanic",
    years: 9,
    rating: 4.9,
    reviews: 214,
    jobs: 302,
    distanceKm: 0.8,
    rateNaira: 4000,
    area: "Ikeja, Lagos",
    photo: mechanic,
    verified: true,
    skills: ["Engine Diagnostics", "Battery Jump", "Tyre Change", "Radiator"],
    about:
      "Nine years fixing cars along Ikeja and Third Mainland Bridge. Fast response for roadside breakdowns — I carry my full toolkit on the bike.",
    reviewList: [
      { name: "Ade O.", stars: 5, date: "3 days ago", text: "Came within 20 minutes when my car died on Third Mainland. Fair price too." },
      { name: "Ngozi E.", stars: 5, date: "2 weeks ago", text: "Very honest about what was wrong. Fixed the alternator on the spot." },
    ],
  },
  {
    id: "ifeanyi-kalu",
    name: "Ifeanyi Kalu",
    trade: "Certified Master Plumber",
    category: "Plumber",
    years: 8,
    rating: 4.8,
    reviews: 142,
    jobs: 198,
    distanceKm: 1.4,
    rateNaira: 3500,
    area: "Lekki Phase 1, Lagos",
    photo: plumber,
    verified: true,
    skills: ["Pipe Repair", "Pump Install", "Drainage", "Leak Detection"],
    about:
      "Residential and industrial plumbing across Lagos Island and Lekki. Specialized in leak detection and pump installation.",
    reviewList: [
      { name: "Tolu A.", stars: 5, date: "1 week ago", text: "Traced a hidden leak that two others missed. Very thorough." },
      { name: "Emeka K.", stars: 4, date: "1 month ago", text: "Solid job on our overhead tank. Arrived on time." },
    ],
  },
  {
    id: "amaka-eze",
    name: "Amaka Eze",
    trade: "Licensed Electrician",
    category: "Electrician",
    years: 6,
    rating: 4.9,
    reviews: 168,
    jobs: 220,
    distanceKm: 2.1,
    rateNaira: 5000,
    area: "Surulere, Lagos",
    photo: electrician,
    verified: true,
    skills: ["House Wiring", "Solar Install", "Inverter", "Fault Finding"],
    about:
      "Certified electrician focused on safe household wiring, inverter setup and solar. I don't leave a job until every outlet passes test.",
    reviewList: [
      { name: "Bola R.", stars: 5, date: "5 days ago", text: "Rewired our whole flat neatly — no cut walls. Very professional." },
    ],
  },
  {
    id: "tunde-johnson",
    name: "Tunde Johnson",
    trade: "Carpenter & Woodwork",
    category: "Carpenter",
    years: 12,
    rating: 4.7,
    reviews: 96,
    jobs: 140,
    distanceKm: 3.2,
    rateNaira: 3200,
    area: "Yaba, Lagos",
    photo: carpenter,
    verified: true,
    skills: ["Furniture", "Doors", "Cabinets", "Repairs"],
    about:
      "Custom furniture and door fittings. Twelve years working with hardwood across Yaba and Mainland.",
    reviewList: [
      { name: "Kemi S.", stars: 5, date: "2 weeks ago", text: "Built a beautiful wardrobe exactly to spec. Highly recommend." },
    ],
  },
];

export const CATEGORIES = [
  { key: "Mechanic", emoji: "🔧", tint: "yellow" },
  { key: "Plumber", emoji: "🚰", tint: "green" },
  { key: "Electrician", emoji: "⚡", tint: "yellow" },
  { key: "Painter", emoji: "🎨", tint: "green" },
  { key: "Laborer", emoji: "👷", tint: "yellow" },
  { key: "Carpenter", emoji: "🪚", tint: "green" },
  { key: "Welder", emoji: "🔥", tint: "yellow" },
  { key: "AC Tech", emoji: "❄️", tint: "green" },
] as const;

export function getArtisan(id: string) {
  return ARTISANS.find((a) => a.id === id);
}
