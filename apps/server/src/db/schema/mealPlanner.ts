import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { group } from "./group";

// Meal Plan table - linked to a group
export const mealPlan = sqliteTable("meal_plan", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	groupId: text("group_id")
		.notNull()
		.references(() => group.id, { onDelete: "cascade" }),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	startDate: integer("start_date", { mode: "timestamp" }),
	endDate: integer("end_date", { mode: "timestamp" }),
	isActive: integer("is_active", { mode: "boolean" })
		.$defaultFn(() => true)
		.notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

// Meal table - individual meals within a meal plan
export const meal = sqliteTable("meal", {
	id: text("id").primaryKey(),
	mealPlanId: text("meal_plan_id")
		.notNull()
		.references(() => mealPlan.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	description: text("description"),
	instructions: text("instructions"),
	prepTime: integer("prep_time"),
	cookTime: integer("cook_time"),
	servings: integer("servings"),
	mealType: text("meal_type", {
		enum: ["breakfast", "lunch", "dinner", "snack"],
	}),
	dayOfWeek: integer("day_of_week"),
	plannedDate: integer("planned_date", { mode: "timestamp" }),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

// Ingredient table - reusable ingredients
export const ingredient = sqliteTable("ingredient", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	category: text("category"),
	unit: text("unit"),
	caloriesPerUnit: real("calories_per_unit"),
	proteinPerUnit: real("protein_per_unit"),
	carbsPerUnit: real("carbs_per_unit"),
	fatPerUnit: real("fat_per_unit"),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

// Meal Ingredient junction table - ingredients used in meals
export const mealIngredient = sqliteTable("meal_ingredient", {
	id: text("id").primaryKey(),
	mealId: text("meal_id")
		.notNull()
		.references(() => meal.id, { onDelete: "cascade" }),
	ingredientId: text("ingredient_id")
		.notNull()
		.references(() => ingredient.id, { onDelete: "cascade" }),
	quantity: real("quantity").notNull(),
	unit: text("unit"),
	notes: text("notes"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

export const shoppingList = sqliteTable("shopping_list", {
	id: text("id").primaryKey(),
	mealPlanId: text("meal_plan_id")
		.notNull()
		.references(() => mealPlan.id, { onDelete: "cascade" }),
	name: text("name").notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	isCompleted: integer("is_completed", { mode: "boolean" })
		.$defaultFn(() => false)
		.notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

export const shoppingListItem = sqliteTable("shopping_list_item", {
	id: text("id").primaryKey(),
	shoppingListId: text("shopping_list_id")
		.notNull()
		.references(() => shoppingList.id, { onDelete: "cascade" }),
	ingredientId: text("ingredient_id").references(() => ingredient.id, {
		onDelete: "cascade",
	}),
	name: text("name").notNull(),
	quantity: real("quantity").notNull(),
	unit: text("unit"),
	isCompleted: integer("is_completed", { mode: "boolean" })
		.$defaultFn(() => false)
		.notNull(),
	notes: text("notes"),
	addedBy: text("added_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

export const mealPlanRelations = relations(mealPlan, ({ many, one }) => ({
	group: one(group, {
		fields: [mealPlan.groupId],
		references: [group.id],
	}),
	creator: one(user, {
		fields: [mealPlan.createdBy],
		references: [user.id],
	}),
	meals: many(meal),
	shoppingLists: many(shoppingList),
}));

export const mealRelations = relations(meal, ({ many, one }) => ({
	mealPlan: one(mealPlan, {
		fields: [meal.mealPlanId],
		references: [mealPlan.id],
	}),
	creator: one(user, {
		fields: [meal.createdBy],
		references: [user.id],
	}),
	ingredients: many(mealIngredient),
}));

export const ingredientRelations = relations(ingredient, ({ many, one }) => ({
	creator: one(user, {
		fields: [ingredient.createdBy],
		references: [user.id],
	}),
	mealIngredients: many(mealIngredient),
	shoppingListItems: many(shoppingListItem),
}));

export const mealIngredientRelations = relations(mealIngredient, ({ one }) => ({
	meal: one(meal, {
		fields: [mealIngredient.mealId],
		references: [meal.id],
	}),
	ingredient: one(ingredient, {
		fields: [mealIngredient.ingredientId],
		references: [ingredient.id],
	}),
}));

export const shoppingListRelations = relations(
	shoppingList,
	({ many, one }) => ({
		mealPlan: one(mealPlan, {
			fields: [shoppingList.mealPlanId],
			references: [mealPlan.id],
		}),
		creator: one(user, {
			fields: [shoppingList.createdBy],
			references: [user.id],
		}),
		items: many(shoppingListItem),
	}),
);

export const shoppingListItemRelations = relations(
	shoppingListItem,
	({ one }) => ({
		shoppingList: one(shoppingList, {
			fields: [shoppingListItem.shoppingListId],
			references: [shoppingList.id],
		}),
		ingredient: one(ingredient, {
			fields: [shoppingListItem.ingredientId],
			references: [ingredient.id],
		}),
		addedBy: one(user, {
			fields: [shoppingListItem.addedBy],
			references: [user.id],
		}),
	}),
);

export const groupMealPlanRelations = relations(group, ({ many }) => ({
	mealPlans: many(mealPlan),
}));
