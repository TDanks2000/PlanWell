import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient, trpc } from "@/utils/trpc";

export const useMealPlanner = (groupId: string) => {
	const mealPlans = useQuery(
		trpc.mealPlanner.getMealPlansByGroup.queryOptions(
			{ groupId },
			{
				enabled: !!groupId,
				refetchOnWindowFocus: false,
			},
		),
	);

	const createMealPlan = useMutation(
		trpc.mealPlanner.createMealPlan.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.mealPlanner.getMealPlansByGroup.queryKey(),
				});
				toast.success("Meal plan created");
			},
			onError: (error) => {
				toast.error(error.message ?? "Failed to create meal plan");
			},
		}),
	);

	const createMeal = useMutation(
		trpc.mealPlanner.createMeal.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.mealPlanner.getMealPlanById.queryKey(),
				});
				toast.success("Meal added");
			},
			onError: (error) => {
				toast.error(error.message ?? "Failed to add meal");
			},
		}),
	);

	const createIngredient = useMutation(
		trpc.mealPlanner.createIngredient.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.mealPlanner.getIngredients.queryKey(),
				});
				toast.success("Ingredient created");
			},
			onError: (error) => {
				toast.error(error.message ?? "Failed to create ingredient");
			},
		}),
	);

	const addMealIngredient = useMutation(
		trpc.mealPlanner.addMealIngredient.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.mealPlanner.getMealById.queryKey(),
				});
				toast.success("Ingredient added to meal");
			},
			onError: (error) => {
				toast.error(error.message ?? "Failed to add ingredient to meal");
			},
		}),
	);

	const getIngredients = useQuery(
		trpc.mealPlanner.getIngredients.queryOptions(
			{ limit: 100 },
			{
				refetchOnWindowFocus: false,
			},
		),
	);

	const generateShoppingList = useMutation(
		trpc.mealPlanner.generateShoppingList.mutationOptions({
			onSuccess: () => {
				toast.success("Shopping list generated");
			},
			onError: (error) => {
				toast.error(error.message ?? "Failed to generate shopping list");
			},
		}),
	);

	return {
		mealPlans,
		createMealPlan,
		createMeal,
		createIngredient,
		addMealIngredient,
		getIngredients,
		generateShoppingList,
	};
};

export const useGroupMealPlan = (groupId: string) => {
	const mealPlans = useQuery(
		trpc.mealPlanner.getMealPlansByGroup.queryOptions(
			{ groupId },
			{ enabled: !!groupId, refetchOnWindowFocus: false },
		),
	);

	// Choose a single plan per group: prefer isActive, else latest by createdAt
	const activePlanId =
		mealPlans.data?.find((p) => p.mealPlan.isActive)?.mealPlan.id ??
		mealPlans.data?.[0]?.mealPlan.id;

	const mealPlan = useQuery(
		trpc.mealPlanner.getMealPlanById.queryOptions(
			{ id: activePlanId as string },
			{
				enabled: !!activePlanId,
				refetchOnWindowFocus: false,
			},
		),
	);

	return {
		mealPlans,
		activePlanId: activePlanId ?? null,
		mealPlan,
	};
};
