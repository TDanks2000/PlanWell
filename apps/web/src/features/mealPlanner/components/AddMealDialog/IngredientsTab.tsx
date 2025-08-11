import { Package, PlusCircle, Search } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
	CreateIngredientMutation,
	GetIngredientsQuery,
	Ingredient,
	MealIngredient,
} from "@/types/mealPlanner";

// types moved to @/types/mealPlanner

interface IngredientsTabProps {
	ingredientSearch: string;
	setIngredientSearch: (value: string) => void;
	selectedIngredient: Ingredient | null;
	setSelectedIngredient: (ingredient: Ingredient | null) => void;
	ingredientQuantity: string;
	setIngredientQuantity: (value: string) => void;
	ingredientUnit: string;
	setIngredientUnit: (value: string) => void;
	ingredientNotes: string;
	setIngredientNotes: (value: string) => void;
	mealIngredients: MealIngredient[];
	onAddIngredient: () => void;
	onRemoveIngredient: (ingredientId: string) => void;
	showCreateIngredient: boolean;
	setShowCreateIngredient: (show: boolean) => void;
	newIngredientName: string;
	setNewIngredientName: (value: string) => void;
	newIngredientDescription: string;
	setNewIngredientDescription: (value: string) => void;
	newIngredientCategory: string;
	setNewIngredientCategory: (value: string) => void;
	newIngredientUnit: string;
	setNewIngredientUnit: (value: string) => void;
	newIngredientCalories: string;
	setNewIngredientCalories: (value: string) => void;
	newIngredientProtein: string;
	setNewIngredientProtein: (value: string) => void;
	newIngredientCarbs: string;
	setNewIngredientCarbs: (value: string) => void;
	newIngredientFat: string;
	setNewIngredientFat: (value: string) => void;
	onCreateIngredient: () => void;
	createIngredient?: CreateIngredientMutation;
	getIngredients?: GetIngredientsQuery;
}

export function IngredientsTab({
	ingredientSearch,
	setIngredientSearch,
	selectedIngredient,
	setSelectedIngredient,
	ingredientQuantity,
	setIngredientQuantity,
	ingredientUnit,
	setIngredientUnit,
	ingredientNotes,
	setIngredientNotes,
	mealIngredients,
	onAddIngredient,
	onRemoveIngredient,
	showCreateIngredient,
	setShowCreateIngredient,
	newIngredientName,
	setNewIngredientName,
	newIngredientDescription,
	setNewIngredientDescription,
	newIngredientCategory,
	setNewIngredientCategory,
	newIngredientUnit,
	setNewIngredientUnit,
	newIngredientCalories,
	setNewIngredientCalories,
	newIngredientProtein,
	setNewIngredientProtein,
	newIngredientCarbs,
	setNewIngredientCarbs,
	newIngredientFat,
	setNewIngredientFat,
	onCreateIngredient,
	createIngredient,
	getIngredients,
}: IngredientsTabProps) {
	const filteredIngredients = useMemo(() => {
		if (!getIngredients?.data) return [];
		return getIngredients.data.filter((item) =>
			item.ingredient.name
				.toLowerCase()
				.includes(ingredientSearch.toLowerCase()),
		);
	}, [getIngredients?.data, ingredientSearch]);

	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Package className="h-4 w-4" />
							Add Ingredients
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Ingredient Search */}
						<div className="space-y-2">
							<Label className="font-medium text-xs">Search Ingredients</Label>
							<div className="relative">
								<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search for ingredients..."
									value={ingredientSearch}
									onChange={(e) => setIngredientSearch(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						{/* Ingredient Selection */}
						{filteredIngredients.length > 0 && (
							<div className="space-y-2">
								<Label className="font-medium text-xs">Select Ingredient</Label>
								<div className="max-h-32 space-y-1 overflow-y-auto">
									{filteredIngredients.map((item) => (
										<button
											type="button"
											key={item.ingredient.id}
											onClick={() => setSelectedIngredient(item.ingredient)}
											className={`w-full rounded-md border p-2 text-left transition-colors ${
												selectedIngredient?.id === item.ingredient.id
													? "border-primary bg-primary/10"
													: "border-border hover:bg-muted/50"
											}`}
										>
											<div className="flex items-center justify-between">
												<span className="font-medium">
													{item.ingredient.name}
												</span>
												{item.ingredient.category && (
													<Badge variant="secondary" className="text-xs">
														{item.ingredient.category}
													</Badge>
												)}
											</div>
											{item.ingredient.description && (
												<p className="mt-1 text-muted-foreground text-xs">
													{item.ingredient.description}
												</p>
											)}
										</button>
									))}
								</div>
							</div>
						)}

						{/* Create New Ingredient */}
						{!showCreateIngredient ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setShowCreateIngredient(true)}
								className="w-full"
							>
								<PlusCircle className="mr-2 h-4 w-4" />
								Create New Ingredient
							</Button>
						) : (
							<Card className="border-dashed">
								<CardHeader className="pb-3">
									<CardTitle className="text-sm">New Ingredient</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
										<div className="space-y-1">
											<Label className="text-xs">Name *</Label>
											<Input
												value={newIngredientName}
												onChange={(e) => setNewIngredientName(e.target.value)}
												placeholder="e.g. Chicken Breast"
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">Category</Label>
											<Input
												value={newIngredientCategory}
												onChange={(e) =>
													setNewIngredientCategory(e.target.value)
												}
												placeholder="e.g. Protein, Vegetables"
											/>
										</div>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Description</Label>
										<Textarea
											value={newIngredientDescription}
											onChange={(e) =>
												setNewIngredientDescription(e.target.value)
											}
											placeholder="Brief description of the ingredient"
											className="min-h-[60px] resize-none"
										/>
									</div>
									<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
										<div className="space-y-1">
											<Label className="text-xs">Default Unit</Label>
											<Input
												value={newIngredientUnit}
												onChange={(e) => setNewIngredientUnit(e.target.value)}
												placeholder="e.g. grams, cups, pieces"
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">Calories per unit</Label>
											<Input
												type="number"
												value={newIngredientCalories}
												onChange={(e) =>
													setNewIngredientCalories(e.target.value)
												}
												placeholder="e.g. 165"
											/>
										</div>
									</div>
									<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
										<div className="space-y-1">
											<Label className="text-xs">Protein (g)</Label>
											<Input
												type="number"
												value={newIngredientProtein}
												onChange={(e) =>
													setNewIngredientProtein(e.target.value)
												}
												placeholder="e.g. 31"
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">Carbs (g)</Label>
											<Input
												type="number"
												value={newIngredientCarbs}
												onChange={(e) => setNewIngredientCarbs(e.target.value)}
												placeholder="e.g. 0"
											/>
										</div>
										<div className="space-y-1">
											<Label className="text-xs">Fat (g)</Label>
											<Input
												type="number"
												value={newIngredientFat}
												onChange={(e) => setNewIngredientFat(e.target.value)}
												placeholder="e.g. 3.6"
											/>
										</div>
									</div>
									<div className="flex gap-2">
										<Button
											size="sm"
											onClick={onCreateIngredient}
											disabled={
												!newIngredientName.trim() || createIngredient?.isPending
											}
										>
											{createIngredient?.isPending
												? "Creating..."
												: "Create Ingredient"}
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setShowCreateIngredient(false)}
										>
											Cancel
										</Button>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Quantity and Unit Inputs */}
						{selectedIngredient && (
							<div className="space-y-3 rounded-md border bg-muted/30 p-3">
								<div className="flex items-center gap-2">
									<Package className="h-4 w-4" />
									<span className="font-medium">{selectedIngredient.name}</span>
									{selectedIngredient.category && (
										<Badge variant="secondary" className="text-xs">
											{selectedIngredient.category}
										</Badge>
									)}
								</div>
								<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
									<div className="space-y-1">
										<Label className="text-xs">Quantity *</Label>
										<Input
											type="number"
											value={ingredientQuantity}
											onChange={(e) => setIngredientQuantity(e.target.value)}
											placeholder="e.g. 2"
											min="0.1"
											step="0.1"
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Unit</Label>
										<Input
											value={ingredientUnit}
											onChange={(e) => setIngredientUnit(e.target.value)}
											placeholder={selectedIngredient.unit || "e.g. pieces"}
										/>
									</div>
									<div className="space-y-1">
										<Label className="text-xs">Notes</Label>
										<Input
											value={ingredientNotes}
											onChange={(e) => setIngredientNotes(e.target.value)}
											placeholder="e.g. boneless, skinless"
										/>
									</div>
								</div>
								<Button
									size="sm"
									onClick={onAddIngredient}
									disabled={!ingredientQuantity}
									className="w-full"
								>
									Add to Meal
								</Button>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Current Ingredients List */}
				{mealIngredients.length > 0 && (
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">
								Ingredients ({mealIngredients.length})
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{mealIngredients.map((ingredient) => (
									<div
										key={ingredient.ingredientId}
										className="flex items-center justify-between rounded-md border p-2"
									>
										<div>
											<span className="font-medium">
												{ingredient.ingredientName}
											</span>
											<span className="ml-2 text-muted-foreground text-sm">
												{ingredient.quantity}
												{ingredient.unit && ` ${ingredient.unit}`}
											</span>
											{ingredient.notes && (
												<p className="mt-1 text-muted-foreground text-xs">
													{ingredient.notes}
												</p>
											)}
										</div>
										<Button
											variant="ghost"
											size="sm"
											onClick={() =>
												onRemoveIngredient(ingredient.ingredientId)
											}
										>
											Remove
										</Button>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
