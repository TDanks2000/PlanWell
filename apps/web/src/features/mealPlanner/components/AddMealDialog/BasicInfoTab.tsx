import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

interface BasicInfoTabProps {
	mealName: string;
	setMealName: (value: string) => void;
	mealDate: string;
	setMealDate: (value: string) => void;
	mealType: MealType | "none";
	setMealType: (value: MealType | "none") => void;
	dayOfWeek: "none" | "0" | "1" | "2" | "3" | "4" | "5" | "6";
	setDayOfWeek: (
		value: "none" | "0" | "1" | "2" | "3" | "4" | "5" | "6",
	) => void;
	addMealNameError: string;
	addMealDateError: string;
}

export function BasicInfoTab({
	mealName,
	setMealName,
	mealDate,
	setMealDate,
	mealType,
	setMealType,
	dayOfWeek,
	setDayOfWeek,
	addMealNameError,
	addMealDateError,
}: BasicInfoTabProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="mealName" className="font-medium text-sm">
						Meal Name *
					</Label>
					<Input
						id="mealName"
						value={mealName}
						onChange={(e) => setMealName(e.target.value)}
						placeholder="e.g. Grilled Chicken with Roasted Vegetables"
						autoComplete="off"
						autoFocus
						className="h-10"
						aria-invalid={!!addMealNameError}
						aria-describedby={
							addMealNameError ? "add-meal-name-error" : undefined
						}
					/>
					{addMealNameError && (
						<p id="add-meal-name-error" className="text-destructive text-xs">
							{addMealNameError}
						</p>
					)}
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="mealDate" className="font-medium text-sm">
							Date *
						</Label>
						<Input
							id="mealDate"
							type="date"
							value={mealDate}
							onChange={(e) => setMealDate(e.target.value)}
							className="h-10"
							aria-invalid={!!addMealDateError}
							aria-describedby={
								addMealDateError ? "add-meal-date-error" : undefined
							}
						/>
						{addMealDateError && (
							<p id="add-meal-date-error" className="text-destructive text-xs">
								{addMealDateError}
							</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="mealType" className="font-medium text-sm">
							Meal Type
						</Label>
						<Select
							value={mealType}
							onValueChange={(val) => setMealType(val as MealType | "none")}
						>
							<SelectTrigger id="mealType" className="h-10">
								<SelectValue placeholder="Select meal type" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="none">Not specified</SelectItem>
								<SelectItem value="breakfast">Breakfast</SelectItem>
								<SelectItem value="lunch">Lunch</SelectItem>
								<SelectItem value="dinner">Dinner</SelectItem>
								<SelectItem value="snack">Snack</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<Label htmlFor="dayOfWeek" className="font-medium text-sm">
						Day of Week (for recurring meals)
					</Label>
					<Select
						value={dayOfWeek}
						onValueChange={(val) => setDayOfWeek(val as typeof dayOfWeek)}
					>
						<SelectTrigger id="dayOfWeek" className="h-10">
							<SelectValue placeholder="Select day of week" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">Not specified</SelectItem>
							<SelectItem value="0">Sunday</SelectItem>
							<SelectItem value="1">Monday</SelectItem>
							<SelectItem value="2">Tuesday</SelectItem>
							<SelectItem value="3">Wednesday</SelectItem>
							<SelectItem value="4">Thursday</SelectItem>
							<SelectItem value="5">Friday</SelectItem>
							<SelectItem value="6">Saturday</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
		</div>
	);
}
