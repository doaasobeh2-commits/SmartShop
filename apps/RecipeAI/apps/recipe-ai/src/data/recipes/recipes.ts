/**
 * RecipeAI
 * Global Recipe Database (Starter Version)
 */

export interface Recipe {
  id: string;
  cuisineId: string;

  name: string;

  description: string;

  image: string;

  difficulty: "Easy" | "Medium" | "Hard";

  cookingTime: number;

  servings: number;

  ingredients: string[];

  steps: string[];

  estimatedCost: number;

  calories: number;
}

export const recipes: Recipe[] = [
  {
    id: "tabbouleh",
    cuisineId: "arabic",
    name: "Tabbouleh",
    description: "Fresh parsley salad with tomato and bulgur.",
    image: "/assets/recipes/tabbouleh.jpg",
    difficulty: "Easy",
    cookingTime: 20,
    servings: 4,
    ingredients: [
      "Parsley",
      "Tomato",
      "Bulgur",
      "Mint",
      "Lemon",
      "Olive Oil"
    ],
    steps: [
      "Wash vegetables",
      "Chop ingredients",
      "Mix together",
      "Add lemon and olive oil",
      "Serve"
    ],
    estimatedCost: 8,
    calories: 180
  },

  {
    id: "sarma",
    cuisineId: "turkish",
    name: "Sarma",
    description: "Stuffed grape leaves.",
    image: "/assets/recipes/sarma.jpg",
    difficulty: "Medium",
    cookingTime: 90,
    servings: 6,
    ingredients: [
      "Grape Leaves",
      "Rice",
      "Onion",
      "Olive Oil"
    ],
    steps: [
      "Prepare filling",
      "Roll leaves",
      "Cook slowly",
      "Serve"
    ],
    estimatedCost: 12,
    calories: 320
  },

  {
    id: "schnitzel",
    cuisineId: "austrian",
    name: "Wiener Schnitzel",
    description: "Traditional Austrian breaded schnitzel.",
    image: "/assets/recipes/schnitzel.jpg",
    difficulty: "Medium",
    cookingTime: 30,
    servings: 2,
    ingredients: [
      "Veal",
      "Egg",
      "Breadcrumbs",
      "Flour"
    ],
    steps: [
      "Prepare meat",
      "Coat",
      "Fry",
      "Serve"
    ],
    estimatedCost: 18,
    calories: 650
  },

  {
    id: "pomodoro",
    cuisineId: "italian",
    name: "Pasta Pomodoro",
    description: "Classic Italian tomato pasta.",
    image: "/assets/recipes/pomodoro.jpg",
    difficulty: "Easy",
    cookingTime: 25,
    servings: 4,
    ingredients: [
      "Pasta",
      "Tomato",
      "Garlic",
      "Basil"
    ],
    steps: [
      "Cook pasta",
      "Prepare sauce",
      "Mix",
      "Serve"
    ],
    estimatedCost: 10,
    calories: 540
  }
];