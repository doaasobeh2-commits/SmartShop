export const worldKitchens = [
 
  {
  id: "arabic",
  name: "Arabic",
  icon: "🫓",
  color: "#B8793A",
  kitchenImage: "/backgrounds/cuisines/arabic/kitchen.jpg",
  heroImage: "/backgrounds/cuisines/arabic/hero.jpg",
  signatureDish: {
    id: "kabsa",
    name: "Kabsa",
    image: "/backgrounds/cuisines/arabic/kabsa.jpg",
  },
  dishes: [
    {
      id: "kabsa",
      name: "Kabsa",
      image: "/backgrounds/cuisines/arabic/kabsa.jpg",
    },
    {
      id: "tabbouleh",
      name: "Tabbouleh",
      image: "/backgrounds/cuisines/arabic/tabbouleh.jpg",
    },
    {
      id: "baba-ghanoush",
      name: "Baba Ghanoush",
      image: "/backgrounds/cuisines/arabic/baba-ghanoush.jpg",
    },
],
},
{
  id: "austrian",
    name: "Austrian",
    icon: "🇦🇹",
    color: "#8B5E3C",
    kitchenImage: "/backgrounds/cuisines/austrian/kitchen.jpg",
    heroImage: "/backgrounds/cuisines/austrian/hero.jpg",
    signatureDish: {
      id: "spinatknoedel",
      name: "Spinatknödel",
      image: "/backgrounds/cuisines/austrian/spinatknoedel.jpg",
    },
  },
  {
    id: "turkish",
    name: "Turkish",
    icon: "🧿",
    color: "#0E7490",
    kitchenImage: "/backgrounds/cuisines/turkish/kitchen.jpg",
    heroImage: "/backgrounds/cuisines/turkish/hero.jpg",
    signatureDish: {
      id: "iskender-kebab",
      name: "İskender Kebab",
      image: "/backgrounds/cuisines/turkish/iskender-kebab.jpg",
    },
  },
  {
    id: "romanian",
    name: "Romanian",
    icon: "🥘",
    color: "#9A3412",
    kitchenImage: "/backgrounds/cuisines/romanian/kitchen.jpg",
    heroImage: "/backgrounds/cuisines/romanian/hero.jpg",
    signatureDish: {
      id: "sarmale",
      name: "Sarmale",
      image: "/backgrounds/cuisines/romanian/sarmale.jpg",
    },
  },
  {
    id: "mexican",
    name: "Mexican",
    icon: "🌮",
    color: "#C2410C",
    kitchenImage: "/backgrounds/cuisines/mexican/kitchen.jpg",
    heroImage: "/backgrounds/cuisines/mexican/hero.jpg",
    signatureDish: {
      id: "tacos",
      name: "Tacos",
      image: "/backgrounds/cuisines/mexican/tacos.jpg",
    },
  },
  {
    id: "japanese",
    name: "Japanese",
    icon: "🍣",
    color: "#991B1B",
    kitchenImage: "/backgrounds/cuisines/japanese/kitchen.jpg",
    heroImage: "/backgrounds/cuisines/japanese/hero.jpg",
    signatureDish: {
      id: "sushi",
      name: "Sushi",
      image: "/backgrounds/cuisines/japanese/sushi.jpg",
    },
  },
  {
    id: "healthy",
    name: "Healthy",
    icon: "🥗",
    color: "#3F7D3A",
    kitchenImage: "/backgrounds/cuisines/healthy/kitchen.jpg",
    heroImage: "/backgrounds/cuisines/healthy/hero.jpg",
    signatureDish: {
      id: "protein-bowl",
      name: "Protein Bowl",
      image: "/backgrounds/cuisines/healthy/protein-bowl.jpg",
    },
  },
  {
    id: "italian",
    name: "Italian",
    icon: "🍝",
    color: "#4D7C0F",
    kitchenImage: "/backgrounds/cuisines/italian/kitchen.jpg",
    heroImage: "/backgrounds/cuisines/italian/hero.jpg",
    signatureDish: {
      id: "pasta-carbonara",
      name: "Pasta Carbonara",
      image: "/backgrounds/cuisines/italian/pasta-carbonara.jpg",
    },
  },
];

export type WorldKitchen = (typeof worldKitchens)[number];