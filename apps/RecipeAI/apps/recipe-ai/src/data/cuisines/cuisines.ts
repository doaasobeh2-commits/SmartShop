/**
 * RecipeAI
 * Global Cuisine Database
 */

export interface Cuisine {
  id: string;
  name: string;
  nativeName: string;
  country: string[];
  region: string;
  description: string;
  image: string;
  banner: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  ingredients: string[];
  spices: string[];
  cookingMethods: string[];
  famousRecipes: string[];
  mealTypes: string[];
  tags: string[];
  spiceLevel: "none" | "mild" | "medium" | "hot";
  vegetarianFriendly: boolean;
  veganFriendly: boolean;
  halalFriendly: boolean;
  popularity: number;
}

export const cuisines: Cuisine[] = [
  {
    id: "arabic",
    name: "Arabic",
    nativeName: "المطبخ العربي",
    country: ["Syria", "Jordan", "Lebanon", "Palestine", "Saudi Arabia", "UAE", "Iraq", "Egypt"],
    region: "Middle East",
    description: "Traditional Arabic cuisine with rich flavors, fresh ingredients and family-style meals.",
    image: "/assets/cuisines/arabic.jpg",
    banner: "/assets/cuisines/arabic-banner.jpg",
    icon: "/assets/icons/arabic.png",
    primaryColor: "#2E7D32",
    secondaryColor: "#D4A373",
    ingredients: ["Olive Oil", "Onion", "Garlic", "Tomato", "Parsley", "Mint", "Lemon", "Rice", "Lamb", "Chicken", "Chickpeas"],
    spices: ["Cumin", "Coriander", "Cinnamon", "Sumac", "Black Pepper", "Cardamom"],
    cookingMethods: ["Grilling", "Roasting", "Boiling", "Stuffing", "Slow Cooking"],
    famousRecipes: ["Tabbouleh", "Hummus", "Baba Ghanoush", "Kabsa", "Mansaf", "Kibbeh", "Shawarma", "Falafel"],
    mealTypes: ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"],
    tags: ["Arabic", "Middle Eastern", "Family", "Traditional"],
    spiceLevel: "medium",
    vegetarianFriendly: true,
    veganFriendly: true,
    halalFriendly: true,
    popularity: 100
  },
  {
    id: "italian",
    name: "Italian",
    nativeName: "Cucina Italiana",
    country: ["Italy"],
    region: "Europe",
    description: "Traditional Italian cuisine.",
    image: "/assets/cuisines/italian.jpg",
    banner: "/assets/cuisines/italian-banner.jpg",
    icon: "/assets/icons/italian.png",
    primaryColor: "#2E7D32",
    secondaryColor: "#C62828",
    ingredients: ["Tomato", "Olive Oil", "Garlic", "Basil", "Parmesan", "Pasta"],
    spices: ["Oregano", "Basil", "Black Pepper"],
    cookingMethods: ["Boiling", "Baking", "Roasting"],
    famousRecipes: ["Pizza", "Lasagna", "Risotto", "Spaghetti Carbonara", "Tiramisu"],
    mealTypes: ["Lunch", "Dinner", "Dessert"],
    tags: ["Italian", "Mediterranean"],
    spiceLevel: "mild",
    vegetarianFriendly: true,
    veganFriendly: false,
    halalFriendly: false,
    popularity: 100
  },
  {
    id: "turkish",
    name: "Turkish",
    nativeName: "Türk Mutfağı",
    country: ["Turkey"],
    region: "Middle East & Europe",
    description: "Traditional Turkish cuisine.",
    image: "/assets/cuisines/turkish.jpg",
    banner: "/assets/cuisines/turkish-banner.jpg",
    icon: "/assets/icons/turkish.png",
    primaryColor: "#D32F2F",
    secondaryColor: "#FBC02D",
    ingredients: ["Lamb", "Yogurt", "Eggplant", "Tomato", "Pepper"],
    spices: ["Paprika", "Mint", "Sumac"],
    cookingMethods: ["Grilling", "Baking", "Roasting"],
    famousRecipes: ["Kebab", "Sarma", "Baklava", "Menemen", "Lahmacun"],
    mealTypes: ["Breakfast", "Lunch", "Dinner", "Dessert"],
    tags: ["Turkish"],
    spiceLevel: "medium",
    vegetarianFriendly: true,
    veganFriendly: false,
    halalFriendly: true,
    popularity: 95
  },
  {
    id: "austrian",
    name: "Austrian",
    nativeName: "Österreichische Küche",
    country: ["Austria"],
    region: "Europe",
    description: "Traditional Austrian cuisine.",
    image: "/assets/cuisines/austrian.jpg",
    banner: "/assets/cuisines/austrian-banner.jpg",
    icon: "/assets/icons/austrian.png",
    primaryColor: "#B71C1C",
    secondaryColor: "#FFFFFF",
    ingredients: ["Potato", "Beef", "Butter", "Flour", "Apple"],
    spices: ["Parsley", "Caraway", "Pepper"],
    cookingMethods: ["Frying", "Baking", "Boiling"],
    famousRecipes: ["Wiener Schnitzel", "Apfelstrudel", "Kaiserschmarrn", "Tafelspitz"],
    mealTypes: ["Lunch", "Dinner", "Dessert"],
    tags: ["Austrian"],
    spiceLevel: "mild",
    vegetarianFriendly: false,
    veganFriendly: false,
    halalFriendly: false,
    popularity: 80
  }
];