import { PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RouterInput, RouterOutput } from "@/utils/trpc";
import { BasicInfoTab } from "./BasicInfoTab";
import { DetailsTab } from "./DetailsTab";
import { IngredientsTab } from "./IngredientsTab";
import { TimingTab } from "./TimingTab";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

// Use tRPC generated types
type Ingredient = NonNullable<
	RouterOutput["mealPlanner"]["getIngredients"]
>[0]["ingredient"];

type MealIngredient = {
	ingredientId: string;
	ingredientName: string;
	quantity: number;
	unit?: string;
	notes?: string;
};

type CreateMealMutation = {
	isPending: boolean;
	mutateAsync: (
		args: RouterInput["mealPlanner"]["createMeal"],
	) => Promise<RouterOutput["mealPlanner"]["createMeal"]>;
};

type CreateIngredientMutation = {
	isPending: boolean;
	mutateAsync: (
		args: RouterInput["mealPlanner"]["createIngredient"],
	) => Promise<RouterOutput["mealPlanner"]["createIngredient"]>;
};

type AddMealIngredientMutation = {
	isPending: boolean;
	mutateAsync: (
		args: RouterInput["mealPlanner"]["addMealIngredient"],
	) => Promise<RouterOutput["mealPlanner"]["addMealIngredient"]>;
};

type GetIngredientsQuery = {
	data?: {
		ingredient: Ingredient;
		creator: { id: string; name: string; image?: string };
	}[];
	isLoading: boolean;
};

interface AddMealDialogProps {
	activePlanId: string | null;
	createMeal: CreateMealMutation;
	createIngredient?: CreateIngredientMutation;
	addMealIngredient?: AddMealIngredientMutation;
	getIngredients?: GetIngredientsQuery;
	defaultDate?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function AddMealDialog({
	activePlanId,
	createMeal,
	createIngredient,
	addMealIngredient,
	getIngredients,
	defaultDate,
	open: controlledOpen,
	onOpenChange,
}: AddMealDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = typeof controlledOpen === "boolean";
	const open = isControlled ? (controlledOpen as boolean) : internalOpen;

	// Basic meal info
	const [mealName, setMealName] = useState("");
	const [mealDate, setMealDate] = useState(defaultDate ?? "");
	const [mealType, setMealType] = useState<MealType | "none">("none");
	const [dayOfWeek, setDayOfWeek] = useState<
		"none" | "0" | "1" | "2" | "3" | "4" | "5" | "6"
	>("none");

	// Details
	const [description, setDescription] = useState("");
	const [instructions, setInstructions] = useState("");

	// Timing
	const [prepTime, setPrepTime] = useState("");
	const [cookTime, setCookTime] = useState("");
	const [servings, setServings] = useState("");

	// Validation
	const [triedAddMeal, setTriedAddMeal] = useState(false);

	// Ingredient management
	const [ingredientSearch, setIngredientSearch] = useState("");
	const [selectedIngredient, setSelectedIngredient] =
		useState<Ingredient | null>(null);
	const [ingredientQuantity, setIngredientQuantity] = useState("");
	const [ingredientUnit, setIngredientUnit] = useState("");
	const [ingredientNotes, setIngredientNotes] = useState("");
	const [mealIngredients, setMealIngredients] = useState<MealIngredient[]>([]);
	const [showCreateIngredient, setShowCreateIngredient] = useState(false);

	// New ingredient form
	const [newIngredientName, setNewIngredientName] = useState("");
	const [newIngredientDescription, setNewIngredientDescription] = useState("");
	const [newIngredientCategory, setNewIngredientCategory] = useState("");
	const [newIngredientUnit, setNewIngredientUnit] = useState("");
	const [newIngredientCalories, setNewIngredientCalories] = useState("");
	const [newIngredientProtein, setNewIngredientProtein] = useState("");
	const [newIngredientCarbs, setNewIngredientCarbs] = useState("");
	const [newIngredientFat, setNewIngredientFat] = useState("");

	const addMealNameError = useMemo(() => {
		if (!triedAddMeal) return "";
		if (mealName.trim().length === 0) return "Meal name is required.";
		return "";
	}, [triedAddMeal, mealName]);

	const addMealDateError = useMemo(() => {
		if (!triedAddMeal) return "";
		if (mealDate.trim().length === 0) return "Please select a date.";
		return "";
	}, [triedAddMeal, mealDate]);

	function resetForm() {
		setTriedAddMeal(false);
		setMealName("");
		setMealDate(defaultDate ?? "");
		setMealType("none");
		setDescription("");
		setInstructions("");
		setPrepTime("");
		setCookTime("");
		setServings("");
		setDayOfWeek("none");
		setMealIngredients([]);
		setIngredientSearch("");
		setSelectedIngredient(null);
		setIngredientQuantity("");
		setIngredientUnit("");
		setIngredientNotes("");
		setShowCreateIngredient(false);
		setNewIngredientName("");
		setNewIngredientDescription("");
		setNewIngredientCategory("");
		setNewIngredientUnit("");
		setNewIngredientCalories("");
		setNewIngredientProtein("");
		setNewIngredientCarbs("");
		setNewIngredientFat("");
	}

	function handleOpenChange(val: boolean) {
		if (isControlled) {
			onOpenChange?.(val);
		} else {
			setInternalOpen(val);
		}
		if (!val) resetForm();
	}

	function handleAddIngredient() {
		if (!selectedIngredient || !ingredientQuantity) return;

		const newMealIngredient: MealIngredient = {
			ingredientId: selectedIngredient.id,
			ingredientName: selectedIngredient.name,
			quantity: Number(ingredientQuantity),
			unit: ingredientUnit || undefined,
			notes: ingredientNotes || undefined,
		};

		setMealIngredients([...mealIngredients, newMealIngredient]);
		setSelectedIngredient(null);
		setIngredientQuantity("");
		setIngredientUnit("");
		setIngredientNotes("");
	}

	function handleRemoveIngredient(ingredientId: string) {
		setMealIngredients(
			mealIngredients.filter((ing) => ing.ingredientId !== ingredientId),
		);
	}

	async function handleCreateIngredient() {
		if (!createIngredient || !newIngredientName.trim()) return;

		try {
			const newIngredient = await createIngredient.mutateAsync({
				name: newIngredientName.trim(),
				description: newIngredientDescription.trim() || undefined,
				category: newIngredientCategory.trim() || undefined,
				unit: newIngredientUnit.trim() || undefined,
				caloriesPerUnit: newIngredientCalories
					? Number(newIngredientCalories)
					: undefined,
				proteinPerUnit: newIngredientProtein
					? Number(newIngredientProtein)
					: undefined,
				carbsPerUnit: newIngredientCarbs
					? Number(newIngredientCarbs)
					: undefined,
				fatPerUnit: newIngredientFat ? Number(newIngredientFat) : undefined,
			});

			setSelectedIngredient(newIngredient);
			setShowCreateIngredient(false);
			setNewIngredientName("");
			setNewIngredientDescription("");
			setNewIngredientCategory("");
			setNewIngredientUnit("");
			setNewIngredientCalories("");
			setNewIngredientProtein("");
			setNewIngredientCarbs("");
			setNewIngredientFat("");
		} catch (error) {
			console.error("Failed to create ingredient:", error);
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-2">
					<PlusCircle className="h-4 w-4" aria-hidden="true" /> Add Meal
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle className="text-xl">Add New Meal</DialogTitle>
					<p className="text-muted-foreground text-sm">
						Create a new meal for your plan. Fill in the basic details and add
						optional information to make your meal planning more comprehensive.
					</p>
				</DialogHeader>

				<Tabs defaultValue="basic" className="w-full">
					<TabsList className="grid w-full grid-cols-4">
						<TabsTrigger value="basic">Basic Info</TabsTrigger>
						<TabsTrigger value="ingredients">Ingredients</TabsTrigger>
						<TabsTrigger value="details">Details</TabsTrigger>
						<TabsTrigger value="timing">Timing & Servings</TabsTrigger>
					</TabsList>

					<TabsContent value="basic" className="mt-6 space-y-6">
						<BasicInfoTab
							mealName={mealName}
							setMealName={setMealName}
							mealDate={mealDate}
							setMealDate={setMealDate}
							mealType={mealType}
							setMealType={setMealType}
							dayOfWeek={dayOfWeek}
							setDayOfWeek={setDayOfWeek}
							addMealNameError={addMealNameError}
							addMealDateError={addMealDateError}
						/>
					</TabsContent>

					<TabsContent value="ingredients" className="mt-6 space-y-6">
						<IngredientsTab
							ingredientSearch={ingredientSearch}
							setIngredientSearch={setIngredientSearch}
							selectedIngredient={selectedIngredient}
							setSelectedIngredient={setSelectedIngredient}
							ingredientQuantity={ingredientQuantity}
							setIngredientQuantity={setIngredientQuantity}
							ingredientUnit={ingredientUnit}
							setIngredientUnit={setIngredientUnit}
							ingredientNotes={ingredientNotes}
							setIngredientNotes={setIngredientNotes}
							mealIngredients={mealIngredients}
							onAddIngredient={handleAddIngredient}
							onRemoveIngredient={handleRemoveIngredient}
							showCreateIngredient={showCreateIngredient}
							setShowCreateIngredient={setShowCreateIngredient}
							newIngredientName={newIngredientName}
							setNewIngredientName={setNewIngredientName}
							newIngredientDescription={newIngredientDescription}
							setNewIngredientDescription={setNewIngredientDescription}
							newIngredientCategory={newIngredientCategory}
							setNewIngredientCategory={setNewIngredientCategory}
							newIngredientUnit={newIngredientUnit}
							setNewIngredientUnit={setNewIngredientUnit}
							newIngredientCalories={newIngredientCalories}
							setNewIngredientCalories={setNewIngredientCalories}
							newIngredientProtein={newIngredientProtein}
							setNewIngredientProtein={setNewIngredientProtein}
							newIngredientCarbs={newIngredientCarbs}
							setNewIngredientCarbs={setNewIngredientCarbs}
							newIngredientFat={newIngredientFat}
							setNewIngredientFat={setNewIngredientFat}
							onCreateIngredient={handleCreateIngredient}
							createIngredient={createIngredient}
							getIngredients={getIngredients}
						/>
					</TabsContent>

					<TabsContent value="details" className="mt-6 space-y-6">
						<DetailsTab
							description={description}
							setDescription={setDescription}
							instructions={instructions}
							setInstructions={setInstructions}
						/>
					</TabsContent>

					<TabsContent value="timing" className="mt-6 space-y-6">
						<TimingTab
							prepTime={prepTime}
							setPrepTime={setPrepTime}
							cookTime={cookTime}
							setCookTime={setCookTime}
							servings={servings}
							setServings={setServings}
						/>
					</TabsContent>
				</Tabs>

				<DialogFooter className="mt-6">
					<DialogClose asChild>
						<Button variant="secondary">Cancel</Button>
					</DialogClose>
					<Button
						aria-busy={createMeal.isPending}
						disabled={
							createMeal.isPending ||
							!activePlanId ||
							mealName.trim().length === 0 ||
							mealDate.trim().length === 0
						}
						onClick={async () => {
							setTriedAddMeal(true);
							if (!activePlanId) return;
							if (mealName.trim().length === 0 || mealDate.trim().length === 0)
								return;

							await createMeal.mutateAsync({
								mealPlanId: activePlanId,
								name: mealName.trim(),
								plannedDate: mealDate,
								mealType: (mealType === "none" ? undefined : mealType) as
									| MealType
									| undefined,
								description: description.trim() || undefined,
								instructions: instructions.trim() || undefined,
								prepTime: prepTime !== "" ? Number(prepTime) : undefined,
								cookTime: cookTime !== "" ? Number(cookTime) : undefined,
								servings: servings !== "" ? Number(servings) : undefined,
								dayOfWeek: dayOfWeek !== "none" ? Number(dayOfWeek) : undefined,
							});
							handleOpenChange(false);
						}}
					>
						{createMeal.isPending ? "Adding…" : "Add Meal"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default AddMealDialog;
