import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";

export function OnboardingScreen() {
	const [activeTab, setActiveTab] = useState("signup");

	return (
		<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/50 p-4">
			<div className="w-full max-w-md">
				<div className="mb-8 text-center">
					<h1 className="mb-2 font-bold text-3xl text-foreground">
						Welcome to PlanWell
					</h1>
					<p className="text-muted-foreground">
						Your personal meal planning companion
					</p>
				</div>

				<Card className="border-border shadow-lg">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl text-foreground">
							Get Started
						</CardTitle>
						<CardDescription className="text-muted-foreground">
							Create an account or sign in to start planning your meals
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="signup">Sign Up</TabsTrigger>
								<TabsTrigger value="signin">Sign In</TabsTrigger>
							</TabsList>
							<TabsContent value="signup" className="mt-6">
								<SignUpForm onSuccess={() => setActiveTab("signin")} />
							</TabsContent>
							<TabsContent value="signin" className="mt-6">
								<SignInForm />
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
