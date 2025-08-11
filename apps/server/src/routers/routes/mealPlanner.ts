import { TRPCError } from "@trpc/server";
import { and, desc, eq, like } from "drizzle-orm";
import { z } from "zod";
import {
	db,
	groupMember,
	ingredient,
	meal,
	mealIngredient,
	mealPlan,
	shoppingList,
	shoppingListItem,
	user,
} from "@/db";
import { protectedProcedure, router } from "@/lib/trpc";

// Input schemas
const createMealPlanSchema = z.object({
	groupId: z.string(),
	name: z
		.string()
		.min(1, "Meal plan name is required")
		.max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
});

const updateMealPlanSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.min(1, "Meal plan name is required")
		.max(100, "Name too long")
		.optional(),
	description: z.string().max(500, "Description too long").optional(),
	startDate: z.date().optional(),
	endDate: z.date().optional(),
	isActive: z.boolean().optional(),
});

const createMealSchema = z.object({
	mealPlanId: z.string(),
	name: z.string().min(1, "Meal name is required").max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	instructions: z.string().max(2000, "Instructions too long").optional(),
	prepTime: z.number().min(0).optional(),
	cookTime: z.number().min(0).optional(),
	servings: z.number().min(1).optional(),
	mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
	dayOfWeek: z.number().min(0).max(6).optional(),
	plannedDate: z.string().optional(),
});

const updateMealSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.min(1, "Meal name is required")
		.max(100, "Name too long")
		.optional(),
	description: z.string().max(500, "Description too long").optional(),
	instructions: z.string().max(2000, "Instructions too long").optional(),
	prepTime: z.number().min(0).optional(),
	cookTime: z.number().min(0).optional(),
	servings: z.number().min(1).optional(),
	mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]).optional(),
	dayOfWeek: z.number().min(0).max(6).optional(),
	plannedDate: z.date().optional(),
});

const createIngredientSchema = z.object({
	name: z
		.string()
		.min(1, "Ingredient name is required")
		.max(100, "Name too long"),
	description: z.string().max(500, "Description too long").optional(),
	category: z.string().max(50, "Category too long").optional(),
	unit: z.string().max(20, "Unit too long").optional(),
	caloriesPerUnit: z.number().min(0).optional(),
	proteinPerUnit: z.number().min(0).optional(),
	carbsPerUnit: z.number().min(0).optional(),
	fatPerUnit: z.number().min(0).optional(),
});

const updateIngredientSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.min(1, "Ingredient name is required")
		.max(100, "Name too long")
		.optional(),
	description: z.string().max(500, "Description too long").optional(),
	category: z.string().max(50, "Category too long").optional(),
	unit: z.string().max(20, "Unit too long").optional(),
	caloriesPerUnit: z.number().min(0).optional(),
	proteinPerUnit: z.number().min(0).optional(),
	carbsPerUnit: z.number().min(0).optional(),
	fatPerUnit: z.number().min(0).optional(),
});

const addMealIngredientSchema = z.object({
	mealId: z.string(),
	ingredientId: z.string(),
	quantity: z.number().min(0.1, "Quantity must be greater than 0"),
	unit: z.string().max(20, "Unit too long").optional(),
	notes: z.string().max(200, "Notes too long").optional(),
});

const createShoppingListSchema = z.object({
	mealPlanId: z.string(),
	name: z
		.string()
		.min(1, "Shopping list name is required")
		.max(100, "Name too long"),
});

const addShoppingListItemSchema = z.object({
	shoppingListId: z.string(),
	ingredientId: z.string().optional(),
	name: z.string().min(1, "Item name is required").max(100, "Name too long"),
	quantity: z.number().min(0.1, "Quantity must be greater than 0"),
	unit: z.string().max(20, "Unit too long").optional(),
	notes: z.string().max(200, "Notes too long").optional(),
});

// Helper function to check if user has permission for meal plan
async function checkMealPlanPermission(
	userId: string,
	mealPlanId: string,
	requiredRole: "admin" | "moderator" | "member" = "member",
) {
	// Get the meal plan and its group
	const mealPlanData = await db
		.select({
			mealPlan: mealPlan,
			groupMember: groupMember,
		})
		.from(mealPlan)
		.innerJoin(groupMember, eq(mealPlan.groupId, groupMember.groupId))
		.where(and(eq(mealPlan.id, mealPlanId), eq(groupMember.userId, userId)))
		.get();

	if (!mealPlanData) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You don't have access to this meal plan",
		});
	}

	const roleHierarchy = { admin: 3, moderator: 2, member: 1 };
	const userRoleLevel =
		roleHierarchy[mealPlanData.groupMember.role as keyof typeof roleHierarchy];
	const requiredRoleLevel = roleHierarchy[requiredRole];

	if (userRoleLevel < requiredRoleLevel) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: `You need ${requiredRole} permissions or higher`,
		});
	}

	return mealPlanData;
}

// Helper function to check if user has permission for group
async function checkGroupPermission(
	userId: string,
	groupId: string,
	requiredRole: "admin" | "moderator" | "member" = "member",
) {
	const member = await db
		.select()
		.from(groupMember)
		.where(
			and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)),
		)
		.get();

	if (!member) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You are not a member of this group",
		});
	}

	const roleHierarchy = { admin: 3, moderator: 2, member: 1 };
	const userRoleLevel =
		roleHierarchy[member.role as keyof typeof roleHierarchy];
	const requiredRoleLevel = roleHierarchy[requiredRole];

	if (userRoleLevel < requiredRoleLevel) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: `You need ${requiredRole} permissions or higher`,
		});
	}

	return member;
}

export const mealPlannerRouter = router({
	// Meal Plan Operations
	createMealPlan: protectedProcedure
		.input(createMealPlanSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if user has permission to create meal plans in this group
			await checkGroupPermission(ctx.session.user.id, input.groupId, "member");

			const mealPlanId = crypto.randomUUID();

			const newMealPlan = await db
				.insert(mealPlan)
				.values({
					id: mealPlanId,
					name: input.name,
					description: input.description,
					groupId: input.groupId,
					createdBy: ctx.session.user.id,
					startDate: input.startDate,
					endDate: input.endDate,
				})
				.returning()
				.get();

			return newMealPlan;
		}),

	getMealPlansByGroup: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ ctx, input }) => {
			await checkGroupPermission(ctx.session.user.id, input.groupId, "member");

			const mealPlans = await db
				.select({
					mealPlan: mealPlan,
					creator: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(mealPlan)
				.innerJoin(user, eq(mealPlan.createdBy, user.id))
				.where(eq(mealPlan.groupId, input.groupId))
				.orderBy(desc(mealPlan.createdAt));

			return mealPlans;
		}),

	getMealPlanById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			await checkMealPlanPermission(ctx.session.user.id, input.id, "member");

			const mealPlanData = await db
				.select({
					mealPlan: mealPlan,
					creator: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(mealPlan)
				.innerJoin(user, eq(mealPlan.createdBy, user.id))
				.where(eq(mealPlan.id, input.id))
				.get();

			if (!mealPlanData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meal plan not found",
				});
			}

			// Get meals for this meal plan
			const meals = await db
				.select({
					meal: meal,
					creator: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(meal)
				.innerJoin(user, eq(meal.createdBy, user.id))
				.where(eq(meal.mealPlanId, input.id))
				.orderBy(meal.dayOfWeek, meal.plannedDate);

			return {
				...mealPlanData,
				meals,
			};
		}),

	updateMealPlan: protectedProcedure
		.input(updateMealPlanSchema)
		.mutation(async ({ ctx, input }) => {
			await checkMealPlanPermission(ctx.session.user.id, input.id, "moderator");

			const updatedMealPlan = await db
				.update(mealPlan)
				.set({
					name: input.name,
					description: input.description,
					startDate: input.startDate,
					endDate: input.endDate,
					isActive: input.isActive,
					updatedAt: new Date(),
				})
				.where(eq(mealPlan.id, input.id))
				.returning()
				.get();

			return updatedMealPlan;
		}),

	deleteMealPlan: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await checkMealPlanPermission(ctx.session.user.id, input.id, "admin");

			await db.delete(mealPlan).where(eq(mealPlan.id, input.id));

			return { success: true };
		}),

	// Meal Operations
	createMeal: protectedProcedure
		.input(createMealSchema)
		.mutation(async ({ ctx, input }) => {
			await checkMealPlanPermission(
				ctx.session.user.id,
				input.mealPlanId,
				"member",
			);

			const mealId = crypto.randomUUID();

			const newMeal = await db
				.insert(meal)
				.values({
					id: mealId,
					mealPlanId: input.mealPlanId,
					name: input.name,
					description: input.description,
					instructions: input.instructions,
					prepTime: input.prepTime,
					cookTime: input.cookTime,
					servings: input.servings,
					mealType: input.mealType,
					dayOfWeek: input.dayOfWeek,
					plannedDate: input.plannedDate
						? new Date(input.plannedDate)
						: undefined,
					createdBy: ctx.session.user.id,
				})
				.returning()
				.get();

			return newMeal;
		}),

	getMealById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const mealData = await db
				.select({
					meal: meal,
					creator: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(meal)
				.innerJoin(user, eq(meal.createdBy, user.id))
				.where(eq(meal.id, input.id))
				.get();

			if (!mealData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meal not found",
				});
			}

			// Check permission for the meal plan
			await checkMealPlanPermission(
				ctx.session.user.id,
				mealData.meal.mealPlanId,
				"member",
			);

			// Get ingredients for this meal
			const ingredients = await db
				.select({
					mealIngredient: mealIngredient,
					ingredient: ingredient,
				})
				.from(mealIngredient)
				.innerJoin(ingredient, eq(mealIngredient.ingredientId, ingredient.id))
				.where(eq(mealIngredient.mealId, input.id));

			return {
				...mealData,
				ingredients,
			};
		}),

	updateMeal: protectedProcedure
		.input(updateMealSchema)
		.mutation(async ({ ctx, input }) => {
			const mealData = await db
				.select()
				.from(meal)
				.where(eq(meal.id, input.id))
				.get();

			if (!mealData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meal not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				mealData.mealPlanId,
				"moderator",
			);

			const updatedMeal = await db
				.update(meal)
				.set({
					name: input.name,
					description: input.description,
					instructions: input.instructions,
					prepTime: input.prepTime,
					cookTime: input.cookTime,
					servings: input.servings,
					mealType: input.mealType,
					dayOfWeek: input.dayOfWeek,
					plannedDate: input.plannedDate,
					updatedAt: new Date(),
				})
				.where(eq(meal.id, input.id))
				.returning()
				.get();

			return updatedMeal;
		}),

	deleteMeal: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const mealData = await db
				.select()
				.from(meal)
				.where(eq(meal.id, input.id))
				.get();

			if (!mealData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meal not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				mealData.mealPlanId,
				"moderator",
			);

			await db.delete(meal).where(eq(meal.id, input.id));

			return { success: true };
		}),

	// Ingredient Operations
	createIngredient: protectedProcedure
		.input(createIngredientSchema)
		.mutation(async ({ ctx, input }) => {
			const ingredientId = crypto.randomUUID();

			const newIngredient = await db
				.insert(ingredient)
				.values({
					id: ingredientId,
					name: input.name,
					description: input.description,
					category: input.category,
					unit: input.unit,
					caloriesPerUnit: input.caloriesPerUnit,
					proteinPerUnit: input.proteinPerUnit,
					carbsPerUnit: input.carbsPerUnit,
					fatPerUnit: input.fatPerUnit,
					createdBy: ctx.session.user.id,
				})
				.returning()
				.get();

			return newIngredient;
		}),

	getIngredients: protectedProcedure
		.input(
			z.object({
				search: z.string().optional(),
				category: z.string().optional(),
				limit: z.number().min(1).max(100).default(50),
			}),
		)
		.query(async ({ input }) => {
			let whereClause: ReturnType<typeof and> | undefined;

			if (input.search || input.category) {
				const conditions = [];
				if (input.search) {
					conditions.push(like(ingredient.name, `%${input.search}%`));
				}
				if (input.category) {
					conditions.push(eq(ingredient.category, input.category));
				}
				whereClause = and(...conditions);
			}

			const ingredients = await db
				.select({
					ingredient: ingredient,
					creator: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(ingredient)
				.innerJoin(user, eq(ingredient.createdBy, user.id))
				.where(whereClause)
				.orderBy(ingredient.name)
				.limit(input.limit);

			return ingredients;
		}),

	updateIngredient: protectedProcedure
		.input(updateIngredientSchema)
		.mutation(async ({ ctx, input }) => {
			const ingredientData = await db
				.select()
				.from(ingredient)
				.where(eq(ingredient.id, input.id))
				.get();

			if (!ingredientData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Ingredient not found",
				});
			}

			// Only creator can update ingredient
			if (ingredientData.createdBy !== ctx.session.user.id) {
				throw new TRPCError({
					code: "FORBIDDEN",
					message: "You can only update your own ingredients",
				});
			}

			const updatedIngredient = await db
				.update(ingredient)
				.set({
					name: input.name,
					description: input.description,
					category: input.category,
					unit: input.unit,
					caloriesPerUnit: input.caloriesPerUnit,
					proteinPerUnit: input.proteinPerUnit,
					carbsPerUnit: input.carbsPerUnit,
					fatPerUnit: input.fatPerUnit,
					updatedAt: new Date(),
				})
				.where(eq(ingredient.id, input.id))
				.returning()
				.get();

			return updatedIngredient;
		}),

	// Meal Ingredient Operations
	addMealIngredient: protectedProcedure
		.input(addMealIngredientSchema)
		.mutation(async ({ ctx, input }) => {
			const mealData = await db
				.select()
				.from(meal)
				.where(eq(meal.id, input.mealId))
				.get();

			if (!mealData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meal not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				mealData.mealPlanId,
				"member",
			);

			// Check if ingredient already exists in meal
			const existingIngredient = await db
				.select()
				.from(mealIngredient)
				.where(
					and(
						eq(mealIngredient.mealId, input.mealId),
						eq(mealIngredient.ingredientId, input.ingredientId),
					),
				)
				.get();

			if (existingIngredient) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Ingredient already added to this meal",
				});
			}

			const newMealIngredient = await db
				.insert(mealIngredient)
				.values({
					id: crypto.randomUUID(),
					mealId: input.mealId,
					ingredientId: input.ingredientId,
					quantity: input.quantity,
					unit: input.unit,
					notes: input.notes,
				})
				.returning()
				.get();

			return newMealIngredient;
		}),

	removeMealIngredient: protectedProcedure
		.input(z.object({ mealId: z.string(), ingredientId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const mealData = await db
				.select()
				.from(meal)
				.where(eq(meal.id, input.mealId))
				.get();

			if (!mealData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Meal not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				mealData.mealPlanId,
				"member",
			);

			await db
				.delete(mealIngredient)
				.where(
					and(
						eq(mealIngredient.mealId, input.mealId),
						eq(mealIngredient.ingredientId, input.ingredientId),
					),
				);

			return { success: true };
		}),

	// Shopping List Operations
	createShoppingList: protectedProcedure
		.input(createShoppingListSchema)
		.mutation(async ({ ctx, input }) => {
			await checkMealPlanPermission(
				ctx.session.user.id,
				input.mealPlanId,
				"member",
			);

			const shoppingListId = crypto.randomUUID();

			const newShoppingList = await db
				.insert(shoppingList)
				.values({
					id: shoppingListId,
					mealPlanId: input.mealPlanId,
					name: input.name,
					createdBy: ctx.session.user.id,
				})
				.returning()
				.get();

			return newShoppingList;
		}),

	getShoppingListsByMealPlan: protectedProcedure
		.input(z.object({ mealPlanId: z.string() }))
		.query(async ({ ctx, input }) => {
			await checkMealPlanPermission(
				ctx.session.user.id,
				input.mealPlanId,
				"member",
			);

			const shoppingLists = await db
				.select({
					shoppingList: shoppingList,
					creator: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(shoppingList)
				.innerJoin(user, eq(shoppingList.createdBy, user.id))
				.where(eq(shoppingList.mealPlanId, input.mealPlanId))
				.orderBy(desc(shoppingList.createdAt));

			return shoppingLists;
		}),

	getShoppingListById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const shoppingListData = await db
				.select({
					shoppingList: shoppingList,
					creator: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(shoppingList)
				.innerJoin(user, eq(shoppingList.createdBy, user.id))
				.where(eq(shoppingList.id, input.id))
				.get();

			if (!shoppingListData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Shopping list not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				shoppingListData.shoppingList.mealPlanId,
				"member",
			);

			// Get items for this shopping list
			const items = await db
				.select({
					shoppingListItem: shoppingListItem,
					ingredient: ingredient,
					addedBy: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(shoppingListItem)
				.leftJoin(ingredient, eq(shoppingListItem.ingredientId, ingredient.id))
				.innerJoin(user, eq(shoppingListItem.addedBy, user.id))
				.where(eq(shoppingListItem.shoppingListId, input.id))
				.orderBy(shoppingListItem.createdAt);

			return {
				...shoppingListData,
				items,
			};
		}),

	addShoppingListItem: protectedProcedure
		.input(addShoppingListItemSchema)
		.mutation(async ({ ctx, input }) => {
			const shoppingListData = await db
				.select()
				.from(shoppingList)
				.where(eq(shoppingList.id, input.shoppingListId))
				.get();

			if (!shoppingListData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Shopping list not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				shoppingListData.mealPlanId,
				"member",
			);

			const newItem = await db
				.insert(shoppingListItem)
				.values({
					id: crypto.randomUUID(),
					shoppingListId: input.shoppingListId,
					ingredientId: input.ingredientId,
					name: input.name,
					quantity: input.quantity,
					unit: input.unit,
					notes: input.notes,
					addedBy: ctx.session.user.id,
				})
				.returning()
				.get();

			return newItem;
		}),

	toggleShoppingListItem: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const item = await db
				.select({
					shoppingListItem: shoppingListItem,
					shoppingList: shoppingList,
				})
				.from(shoppingListItem)
				.innerJoin(
					shoppingList,
					eq(shoppingListItem.shoppingListId, shoppingList.id),
				)
				.where(eq(shoppingListItem.id, input.id))
				.get();

			if (!item) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Shopping list item not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				item.shoppingList.mealPlanId,
				"member",
			);

			const updatedItem = await db
				.update(shoppingListItem)
				.set({
					isCompleted: !item.shoppingListItem.isCompleted,
					updatedAt: new Date(),
				})
				.where(eq(shoppingListItem.id, input.id))
				.returning()
				.get();

			return updatedItem;
		}),

	deleteShoppingListItem: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const item = await db
				.select({
					shoppingListItem: shoppingListItem,
					shoppingList: shoppingList,
				})
				.from(shoppingListItem)
				.innerJoin(
					shoppingList,
					eq(shoppingListItem.shoppingListId, shoppingList.id),
				)
				.where(eq(shoppingListItem.id, input.id))
				.get();

			if (!item) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Shopping list item not found",
				});
			}

			await checkMealPlanPermission(
				ctx.session.user.id,
				item.shoppingList.mealPlanId,
				"member",
			);

			await db
				.delete(shoppingListItem)
				.where(eq(shoppingListItem.id, input.id));

			return { success: true };
		}),

	// Generate shopping list from meal plan
	generateShoppingList: protectedProcedure
		.input(z.object({ mealPlanId: z.string(), name: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await checkMealPlanPermission(
				ctx.session.user.id,
				input.mealPlanId,
				"member",
			);

			// Get all ingredients from meals in the meal plan
			const mealIngredients = await db
				.select({
					ingredientId: mealIngredient.ingredientId,
					ingredientName: ingredient.name,
					quantity: mealIngredient.quantity,
					unit: mealIngredient.unit,
				})
				.from(mealIngredient)
				.innerJoin(ingredient, eq(mealIngredient.ingredientId, ingredient.id))
				.innerJoin(meal, eq(mealIngredient.mealId, meal.id))
				.where(eq(meal.mealPlanId, input.mealPlanId));

			// Group ingredients and sum quantities
			const ingredientMap = new Map();
			mealIngredients.forEach((item) => {
				const key = item.ingredientId;
				if (ingredientMap.has(key)) {
					ingredientMap.get(key).quantity += item.quantity;
				} else {
					ingredientMap.set(key, {
						ingredientId: item.ingredientId,
						name: item.ingredientName,
						quantity: item.quantity,
						unit: item.unit,
					});
				}
			});

			// Create shopping list
			const shoppingListId = crypto.randomUUID();
			const newShoppingList = await db
				.insert(shoppingList)
				.values({
					id: shoppingListId,
					mealPlanId: input.mealPlanId,
					name: input.name,
					createdBy: ctx.session.user.id,
				})
				.returning()
				.get();

			// Add items to shopping list
			const shoppingListItems = Array.from(ingredientMap.values()).map(
				(item) => ({
					id: crypto.randomUUID(),
					shoppingListId: shoppingListId,
					ingredientId: item.ingredientId,
					name: item.name,
					quantity: item.quantity,
					unit: item.unit,
					addedBy: ctx.session.user.id,
				}),
			);

			if (shoppingListItems.length > 0) {
				await db.insert(shoppingListItem).values(shoppingListItems);
			}

			return newShoppingList;
		}),
});
