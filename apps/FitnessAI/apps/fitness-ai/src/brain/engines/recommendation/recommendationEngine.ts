import type { UserProfile } from "../../../domain/models";
import type { BrainRecommendation, MacroTargets, MacroTotals, HydrationTargets } from "../../types";
import type { WorkoutPlan } from "../workout/workoutEngine";
import { foodKnowledgeEngine } from "../foodKnowledge/foodKnowledgeEngine";

export type RecommendationContext = {
  profile: UserProfile;
  calorieTarget: number;
  calorieRemaining: number;
  macroTargets: MacroTargets;
  macroTotals: MacroTotals;
  hydration: HydrationTargets;
  workout: WorkoutPlan;
  hourOfDay: number;
};

export type RecommendationEngine = {
  generate(ctx: RecommendationContext): BrainRecommendation[];
};

const RULES: Array<{
  id: string;
  when: (ctx: RecommendationContext) => boolean;
  build: (ctx: RecommendationContext) => BrainRecommendation;
}> = [
  {
    id: "protein-remaining-evening",
    when: (ctx) => {
      const proteinRemaining = ctx.macroTargets.proteinGoalG - ctx.macroTotals.proteinG;
      return proteinRemaining >= 25 && ctx.hourOfDay >= 16;
    },
    build: (ctx) => {
      const remaining = Math.round(ctx.macroTargets.proteinGoalG - ctx.macroTotals.proteinG);
      return {
        id: "rec-protein-dinner",
        category: "protein",
        priority: 90,
        title: "One thing for today",
        body: `You have ~${remaining} g protein left. A lean protein dinner (e.g. chicken or fish) keeps muscle on track without exceeding calories.`,
        tone: "nutrition",
        ruleId: "protein-remaining-evening",
        explanation: {
          id: "rec-protein-dinner-explain",
          engine: "recommendation",
          title: "Why protein matters tonight",
          summary: "Protein target supports your goal; remaining grams are calculated from logged intake.",
          steps: [
            { label: "Protein target", value: `${ctx.macroTargets.proteinGoalG} g` },
            { label: "Protein eaten", value: `${Math.round(ctx.macroTotals.proteinG)} g` },
            { label: "Remaining", value: `${remaining} g` },
          ],
          references: ["ISSN Position Stand (2017) — Protein and exercise."],
        },
      };
    },
  },
  {
    id: "calories-near-limit",
    when: (ctx) => ctx.calorieRemaining <= 400 && ctx.calorieRemaining > 0,
    build: (ctx) => ({
      id: "rec-calories-close",
      category: "calories",
      priority: 85,
      title: "Calories running low",
      body: `${ctx.calorieRemaining} kcal left today. Choose nutrient-dense, satisfying foods rather than grazing.`,
      tone: "nutrition",
      ruleId: "calories-near-limit",
      explanation: {
        id: "rec-calories-close-explain",
        engine: "recommendation",
        title: "Calorie balance",
        summary: "Remaining kcal = daily target − logged intake.",
        steps: [
          { label: "Daily target", value: `${ctx.calorieTarget} kcal` },
          { label: "Eaten", value: `${ctx.macroTotals.kcal} kcal` },
          { label: "Remaining", value: `${ctx.calorieRemaining} kcal` },
        ],
        references: [],
      },
    }),
  },
  {
    id: "hydration-behind",
    when: (ctx) => {
      const pct = ctx.hydration.consumedLiters / ctx.hydration.goalLiters;
      return pct < 0.5 && ctx.hourOfDay >= 12;
    },
    build: (ctx) => ({
      id: "rec-water",
      category: "hydration",
      priority: 80,
      title: "Water check-in",
      body: `You're at ${ctx.hydration.consumedLiters} L of ${ctx.hydration.goalLiters} L. A glass of water now supports energy and recovery.`,
      tone: "recovery",
      ruleId: "hydration-behind",
      explanation: {
        id: "rec-water-explain",
        engine: "recommendation",
        title: "Hydration reminder",
        summary: "Water goal derived from body weight (35 ml/kg, min 2 L).",
        steps: [
          { label: "Goal", value: `${ctx.hydration.goalLiters} L` },
          { label: "Consumed", value: `${ctx.hydration.consumedLiters} L` },
        ],
        references: ["EFSA (2010) — Dietary reference values for water."],
      },
    }),
  },
  {
    id: "workout-incomplete",
    when: (ctx) => ctx.workout.completedCount < ctx.workout.exercises.length,
    build: (ctx) => {
      const left = ctx.workout.exercises.length - ctx.workout.completedCount;
      return {
        id: "rec-workout",
        category: "workout",
        priority: 75,
        title: "Today's training",
        body:
          left === ctx.workout.exercises.length
            ? `${ctx.workout.template.title} is ready — ${ctx.workout.exercises.length} exercises, ~${ctx.workout.template.targetMinutes} min.`
            : `${left} exercise${left > 1 ? "s" : ""} left in ${ctx.workout.template.title}. Finish strong.`,
        tone: "workout",
        ruleId: "workout-incomplete",
        explanation: {
          id: "rec-workout-explain",
          engine: "recommendation",
          title: "Workout selection",
          summary: ctx.workout.template.focus,
          steps: [
            { label: "Session", value: ctx.workout.template.title },
            { label: "Completed", value: `${ctx.workout.completedCount}/${ctx.workout.exercises.length}` },
          ],
          references: [],
        },
      };
    },
  },
  {
    id: "meal-protein-snack",
    when: (ctx) => {
      const proteinRemaining = ctx.macroTargets.proteinGoalG - ctx.macroTotals.proteinG;
      return proteinRemaining >= 15 && ctx.hourOfDay >= 10 && ctx.hourOfDay < 16;
    },
    build: (_ctx) => {
      const suggestions = foodKnowledgeEngine.searchByTag("protein").slice(0, 2);
      const names = suggestions.map((f) => f.name).join(" or ");
      return {
        id: "rec-meal-snack",
        category: "meal",
        priority: 70,
        title: "Simple protein option",
        body: names
          ? `Consider ${names} — both fit a protein-forward snack from our food knowledge base.`
          : "A protein-rich snack bridges you to your daily protein target.",
        tone: "nutrition",
        ruleId: "meal-protein-snack",
        explanation: {
          id: "rec-meal-snack-explain",
          engine: "recommendation",
          title: "Meal suggestion logic",
          summary: "Foods tagged as protein with favourable macro density.",
          steps: suggestions.map((f) => ({
            label: f.name,
            value: `${f.per100g.proteinG} g protein / 100 g`,
          })),
          references: [],
        },
      };
    },
  },
  {
    id: "habit-consistency",
    when: (ctx) => ctx.profile.streakDays >= 3,
    build: (ctx) => ({
      id: "rec-habit",
      category: "habit",
      priority: 40,
      title: "Keep it simple",
      body: "Log one meal at a time. Small consistency beats perfect tracking.",
      tone: "motivation",
      ruleId: "habit-consistency",
      explanation: {
        id: "rec-habit-explain",
        engine: "recommendation",
        title: "Habit reinforcement",
        summary: `${ctx.profile.streakDays}-day logging streak supports long-term adherence.`,
        steps: [{ label: "Streak", value: `${ctx.profile.streakDays} days` }],
        references: [],
      },
    }),
  },
  {
    id: "recovery-post-workout",
    when: (ctx) =>
      ctx.workout.completedCount === ctx.workout.exercises.length && ctx.workout.exercises.length > 0,
    build: () => ({
      id: "rec-recovery",
      category: "recovery",
      priority: 60,
      title: "After training",
      body: "Stretch for five minutes and hydrate. Your muscles recover during the next 24 hours.",
      tone: "recovery",
      ruleId: "recovery-post-workout",
      explanation: {
        id: "rec-recovery-explain",
        engine: "recommendation",
        title: "Recovery guidance",
        summary: "Light mobility and hydration support standard post-exercise recovery.",
        steps: [{ label: "Action", value: "5 min stretch + water" }],
        references: [],
      },
    }),
  },
];

export const recommendationEngine: RecommendationEngine = {
  generate(ctx) {
    return RULES.filter((r) => r.when(ctx))
      .map((r) => r.build(ctx))
      .sort((a, b) => b.priority - a.priority);
  },
};
