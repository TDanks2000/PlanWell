import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function SignInForm() {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await authClient.signIn.email(
				{
					email: formData.email,
					password: formData.password,
				},
				{
					onSuccess: () => {
						toast.success("Signed in successfully!");
					},
					onError: (error) => {
						toast.error(error.error.message);
					},
				},
			);
		} catch (error) {
			console.error("Sign in error:", error);
			toast.error("Invalid email or password. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="signin-email" className="text-foreground">
					Email
				</Label>
				<Input
					id="signin-email"
					name="email"
					type="text"
					value={formData.email}
					onChange={handleInputChange}
					placeholder="Enter your email"
					required
					disabled={isLoading}
					className="border-border bg-background text-foreground placeholder:text-muted-foreground"
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="signin-password" className="text-foreground">
					Password
				</Label>
				<Input
					id="signin-password"
					name="password"
					type="password"
					value={formData.password}
					onChange={handleInputChange}
					placeholder="Enter your password"
					required
					disabled={isLoading}
					className="border-border bg-background text-foreground placeholder:text-muted-foreground"
				/>
			</div>

			<Button
				type="submit"
				className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
				disabled={isLoading}
			>
				{isLoading ? "Signing In..." : "Sign In"}
			</Button>
		</form>
	);
}
