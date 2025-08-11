import type { RouterInput, RouterOutput } from "@/utils/trpc";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Ingredient = NonNullable<
	RouterOutput["mealPlanner"]["getIngredients"]
>[0]["ingredient"];

export type MealIngredient = {
	ingredientId: string;
	ingredientName: string;
	quantity: number;
	unit?: string;
	notes?: string;
};

export type CreateMealMutation = {
	isPending: boolean;
	mutateAsync: (
		args: RouterInput["mealPlanner"]["createMeal"],
	) => Promise<RouterOutput["mealPlanner"]["createMeal"]>;
};

export type CreateIngredientMutation = {
	isPending: boolean;
	mutateAsync: (
		args: RouterInput["mealPlanner"]["createIngredient"],
	) => Promise<RouterOutput["mealPlanner"]["createIngredient"]>;
};

export type AddMealIngredientMutation = {
	isPending: boolean;
	mutateAsync: (
		args: RouterInput["mealPlanner"]["addMealIngredient"],
	) => Promise<RouterOutput["mealPlanner"]["addMealIngredient"]>;
};

export type GetIngredientsQuery = {
	data?: {
		ingredient: Ingredient;
		creator: { id: string; name: string; image: string | null };
	}[];
	isLoading: boolean;
};
