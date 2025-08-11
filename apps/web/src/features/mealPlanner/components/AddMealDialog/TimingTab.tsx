import { Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TimingTabProps {
	prepTime: string;
	setPrepTime: (value: string) => void;
	cookTime: string;
	setCookTime: (value: string) => void;
	servings: string;
	setServings: (value: string) => void;
}

export function TimingTab({
	prepTime,
	setPrepTime,
	cookTime,
	setCookTime,
	servings,
	setServings,
}: TimingTabProps) {
	return (
		<div className="space-y-6">
			<div className="space-y-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Clock className="h-4 w-4" />
							Time Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="prepTime" className="font-medium text-xs">
									Prep Time (minutes)
								</Label>
								<Input
									id="prepTime"
									type="number"
									inputMode="numeric"
									min={0}
									value={prepTime}
									onChange={(e) => setPrepTime(e.target.value)}
									placeholder="15"
									className="h-9"
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="cookTime" className="font-medium text-xs">
									Cook Time (minutes)
								</Label>
								<Input
									id="cookTime"
									type="number"
									inputMode="numeric"
									min={0}
									value={cookTime}
									onChange={(e) => setCookTime(e.target.value)}
									placeholder="30"
									className="h-9"
								/>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="flex items-center gap-2 font-medium text-sm">
							<Users className="h-4 w-4" />
							Servings
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							<Label htmlFor="servings" className="font-medium text-xs">
								Number of Servings
							</Label>
							<Input
								id="servings"
								type="number"
								inputMode="numeric"
								min={1}
								value={servings}
								onChange={(e) => setServings(e.target.value)}
								placeholder="4"
								className="h-9 w-32"
							/>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
