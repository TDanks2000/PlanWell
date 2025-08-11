import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/useSession";

export const Route = createFileRoute("/profile/")({
	component: ProfilePage,
});

function ProfilePage() {
	const { session } = useSession();

	const initials = useMemo(() => {
		const name = session?.user?.name || session?.user?.email || "User";
		return name
			.split(" ")
			.map((p) => p[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
	}, [session?.user?.name, session?.user?.email]);

	const [name, setName] = useState("");
	const [bio, setBio] = useState("");

	useEffect(() => {
		setName(session?.user?.name || "");
	}, [session?.user?.name]);

	function onSave() {
		toast.success("Profile saved");
	}

	function onChangePhoto() {
		toast.info("Profile photo upload coming soon");
	}

	return (
		<div className="container mx-auto w-full max-w-5xl px-4 py-8">
			<div className="mb-6">
				<h1 className="text-balance font-semibold text-2xl md:text-3xl">
					Profile
				</h1>
				<p className="mt-1 text-muted-foreground text-sm">
					Manage your personal information and public details.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<Card className="lg:col-span-1">
					<CardHeader>
						<CardTitle>Overview</CardTitle>
						<CardDescription>Your basic account information</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col items-center gap-4">
							<Avatar className="h-20 w-20 text-lg">
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<Button
								variant="outline"
								onClick={onChangePhoto}
								className="w-full sm:w-auto"
							>
								Change photo
							</Button>
							<div className="w-full space-y-2 rounded-md border p-3 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Email</span>
									<span className="truncate">{session?.user?.email}</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">User ID</span>
									<span className="truncate">{session?.user?.id}</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="lg:col-span-2">
					<CardHeader>
						<CardTitle>Edit profile</CardTitle>
						<CardDescription>
							These details may be visible to your group members.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="space-y-2 sm:col-span-2">
								<Label htmlFor="name">Display name</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="Your name"
								/>
							</div>
							<div className="space-y-2 sm:col-span-2">
								<Label htmlFor="bio">Bio</Label>
								<Textarea
									id="bio"
									value={bio}
									onChange={(e) => setBio(e.target.value)}
									placeholder="Tell others a bit about you"
									rows={4}
								/>
							</div>
						</div>
						<div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:justify-end">
							<Button onClick={onSave} className="w-full sm:w-auto">
								Save changes
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
