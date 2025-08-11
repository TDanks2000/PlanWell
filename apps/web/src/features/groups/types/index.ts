import type { RouterInput, RouterOutput } from "@/utils/trpc";

// Extract types from tRPC router outputs
export type Group = RouterOutput["group"]["getById"];
export type GroupMember = NonNullable<Group>["members"][0];
export type GroupInvitation = RouterOutput["group"]["getMyInvitations"][0];
export type UserGroup = RouterOutput["group"]["getMyGroups"][0];
export type User = RouterOutput["group"]["searchUsers"][0];

// Extract input types from tRPC router inputs
export type CreateGroupInput = RouterInput["group"]["create"];
export type UpdateGroupInput = RouterInput["group"]["update"];
export type AddMemberInput = RouterInput["group"]["addMember"];
export type UpdateMemberRoleInput = RouterInput["group"]["updateMemberRole"];
export type RemoveMemberInput = RouterInput["group"]["removeMember"];
export type CreateInvitationInput = RouterInput["group"]["createInvitation"];
export type RespondToInvitationInput =
	RouterInput["group"]["respondToInvitation"];
export type SearchUsersInput = RouterInput["group"]["searchUsers"];

// Re-export the role type for convenience
export type GroupRole = "admin" | "moderator" | "member";
