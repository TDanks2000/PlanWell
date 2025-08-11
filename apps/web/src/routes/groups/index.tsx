import { createFileRoute } from "@tanstack/react-router";
import { GroupsPage } from "@/features/groups/components";

export const Route = createFileRoute("/groups/")({
	component: GroupsPage,
});
