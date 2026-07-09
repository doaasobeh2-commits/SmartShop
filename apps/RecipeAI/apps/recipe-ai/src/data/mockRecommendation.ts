import type { MealRecommendation, WeekDayPlan } from "@recipe-ai/core/types";

export const mockRecommendation: MealRecommendation = {
  id: "lemon-herb-chicken",
  title: "Lemon Herb Roast Chicken",
  reason: "Uses the peppers before they turn — ready in 45 minutes.",
  prepMinutes: 45,
  cuisine: "Mediterranean",
  ingredients: [
    {
      id: "garlic",
      name: "Garlic",
      detail: "4 cloves available",
      status: "have",
      freshness: "Fresh",
    },
    {
      id: "olive-oil",
      name: "Olive oil",
      detail: "Half bottle remaining",
      status: "have",
    },
    {
      id: "pasta",
      name: "Pasta",
      detail: "500 g in pantry",
      status: "have",
    },
    {
      id: "tomatoes",
      name: "Tomatoes",
      detail: "Need to buy",
      status: "need",
    },
  ],
  steps: [
    {
      order: 1,
      instruction: "Heat the oven to 200°C. Pat the chicken dry and season generously with salt.",
    },
    {
      order: 2,
      instruction: "Rub with olive oil, lemon zest, minced garlic, and fresh herbs.",
      timerMinutes: 5,
    },
    {
      order: 3,
      instruction: "Roast until the skin is golden and the juices run clear.",
      timerMinutes: 35,
    },
    {
      order: 4,
      instruction: "Rest for ten minutes. Serve with roasted vegetables from the pan.",
      timerMinutes: 10,
    },
  ],
  tips: ["Let the chicken come to room temperature before roasting for even cooking."],
  storageTip: "Keeps well refrigerated for up to 3 days. Slice cold for salads.",
};

export const defaultWeekPlan: WeekDayPlan[] = [
  { day: "Monday", mealTitle: "Lemon Herb Roast Chicken" },
  { day: "Tuesday", mealTitle: "Tomato Basil Pasta" },
  { day: "Wednesday", mealTitle: "Vegetable Lentil Soup" },
  { day: "Thursday", mealTitle: "Grilled Salmon with Herbs" },
  { day: "Friday", mealTitle: "Chicken Shawarma Bowl" },
  { day: "Saturday", mealTitle: "Mushroom Risotto" },
  { day: "Sunday", mealTitle: "Slow Roasted Lamb" },
];
