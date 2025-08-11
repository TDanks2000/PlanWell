import { ChefHat, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface DetailsTabProps {
	description: string;
	setDescription: (value: string) => void;
	instructions: string;
	setInstructions: (value: string) => void;
}

export function DetailsTab({
	description,
	setDescription,
	instructions,
	setInstructions,
}: DetailsTabProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<FileText className="h-4 w-4" />
							Description
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							id="description"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Describe your meal... What makes it special? What ingredients are featured? Any dietary notes?"
							autoComplete="off"
							className="min-h-[100px] resize-none"
						/>
						<p className="mt-2 text-muted-foreground text-xs">
							Optional: Add a brief description to help you remember what this
							meal is about.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<ChefHat className="h-4 w-4" />
							Cooking Instructions
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Textarea
							id="instructions"
							value={instructions}
							onChange={(e) => setInstructions(e.target.value)}
							placeholder="Step-by-step cooking instructions, special techniques, or helpful tips for preparing this meal..."
							autoComplete="off"
							className="min-h-[120px] resize-none"
						/>
						<p className="mt-2 text-muted-foreground text-xs">
							Optional: Add cooking instructions, prep notes, or any helpful
							tips for making this meal.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
