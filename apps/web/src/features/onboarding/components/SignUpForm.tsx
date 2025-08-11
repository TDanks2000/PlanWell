import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface SignUpFormProps {
	onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (formData.password.length < 6) {
			toast.error("Password must be at least 6 characters long");
			return;
		}

		setIsLoading(true);
		try {
			await authClient.signUp.email(
				{
					name: formData.name,
					username: formData.username,
					email: formData.email,
					password: formData.password,
				},
				{
					onSuccess: () => {
						toast.success("Account created successfully! Please sign in.");

						setFormData({
							name: "",
							email: "",
							username: "",
							password: "",
							confirmPassword: "",
						});
						onSuccess?.();
					},
					onError: (error) => {
						toast.error(error.error.message);
					},
				},
			);
		} catch (error) {
			console.error("Sign up error:", error);
			toast.error("Failed to create account. Please try again.");
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
				<Label htmlFor="name">Name</Label>
				<Input
					id="name"
					name="name"
					type="text"
					value={formData.name}
					onChange={handleInputChange}
					placeholder="Enter your name"
					required
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="username">Username</Label>
				<Input
					id="username"
					name="username"
					type="text"
					value={formData.username}
					onChange={handleInputChange}
					placeholder="Enter your username"
					required
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					name="email"
					type="email"
					value={formData.email}
					onChange={handleInputChange}
					placeholder="Enter your email"
					required
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="password">Password</Label>
				<Input
					id="password"
					name="password"
					type="password"
					value={formData.password}
					onChange={handleInputChange}
					placeholder="Enter your password"
					required
					disabled={isLoading}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="confirmPassword">Confirm Password</Label>
				<Input
					id="confirmPassword"
					name="confirmPassword"
					type="password"
					value={formData.confirmPassword}
					onChange={handleInputChange}
					placeholder="Confirm your password"
					required
					disabled={isLoading}
				/>
			</div>

			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? "Creating Account..." : "Create Account"}
			</Button>
		</form>
	);
}
