import { TRPCError } from "@trpc/server";
import { and, desc, eq, like, lt, notInArray } from "drizzle-orm";
import { z } from "zod";
import { db, group, groupInvitation, groupMember, user } from "@/db";
import { protectedProcedure, router } from "@/lib/trpc";

// Input schemas
const createGroupSchema = z.object({
	name: z
		.string()
		.min(1, "Group name is required")
		.max(100, "Group name too long"),
	description: z.string().max(500, "Description too long").optional(),
});

const updateGroupSchema = z.object({
	id: z.string(),
	name: z
		.string()
		.min(1, "Group name is required")
		.max(100, "Group name too long")
		.optional(),
	description: z.string().max(500, "Description too long").optional(),
});

const addMemberSchema = z.object({
	groupId: z.string(),
	userId: z.string(),
	role: z.enum(["admin", "moderator", "member"]).default("member"),
});

const updateMemberRoleSchema = z.object({
	groupId: z.string(),
	userId: z.string(),
	role: z.enum(["admin", "moderator", "member"]),
});

const removeMemberSchema = z.object({
	groupId: z.string(),
	userId: z.string(),
});

const createInvitationSchema = z.object({
	groupId: z.string(),
	invitedUserId: z.string(),
	role: z.enum(["admin", "moderator", "member"]).default("member"),
	message: z.string().max(500, "Message too long").optional(),
	expiresInDays: z.number().min(1).max(30).default(7), // Default 7 days
});

const respondToInvitationSchema = z.object({
	invitationId: z.string(),
	action: z.enum(["accept", "decline"]),
});

// Helper function to check if user has permission
async function checkGroupPermission(
	userId: string,
	groupId: string,
	requiredRole: "admin" | "moderator" | "member" = "member",
) {
	const member = await db
		.select()
		.from(groupMember)
		.where(
			and(eq(groupMember.groupId, groupId), eq(groupMember.userId, userId)),
		)
		.get();

	if (!member) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You are not a member of this group",
		});
	}

	const roleHierarchy = { admin: 3, moderator: 2, member: 1 };
	const userRoleLevel =
		roleHierarchy[member.role as keyof typeof roleHierarchy];
	const requiredRoleLevel = roleHierarchy[requiredRole];

	if (userRoleLevel < requiredRoleLevel) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: `You need ${requiredRole} permissions or higher`,
		});
	}

	return member;
}

export const groupRouter = router({
	// Create a new group
	create: protectedProcedure
		.input(createGroupSchema)
		.mutation(async ({ ctx, input }) => {
			const groupId = crypto.randomUUID();

			const newGroup = await db
				.insert(group)
				.values({
					id: groupId,
					name: input.name,
					description: input.description,
					createdBy: ctx.session.user.id,
				})
				.returning()
				.get();

			// Add creator as admin
			await db.insert(groupMember).values({
				id: crypto.randomUUID(),
				groupId: groupId,
				userId: ctx.session.user.id,
				role: "admin",
			});

			return newGroup;
		}),

	// Get all groups for the current user
	getMyGroups: protectedProcedure.query(async ({ ctx }) => {
		const userGroups = await db
			.select({
				group: group,
				memberRole: groupMember.role,
				joinedAt: groupMember.joinedAt,
			})
			.from(groupMember)
			.innerJoin(group, eq(groupMember.groupId, group.id))
			.where(eq(groupMember.userId, ctx.session.user.id))
			.orderBy(desc(group.createdAt));

		return userGroups;
	}),

	// Get a specific group with members
	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			// Check if user is a member of this group
			await checkGroupPermission(ctx.session.user.id, input.id, "member");

			const groupData = await db
				.select()
				.from(group)
				.where(eq(group.id, input.id))
				.get();

			if (!groupData) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Group not found",
				});
			}

			const members = await db
				.select({
					id: groupMember.id,
					role: groupMember.role,
					joinedAt: groupMember.joinedAt,
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
						username: user.username,
					},
				})
				.from(groupMember)
				.innerJoin(user, eq(groupMember.userId, user.id))
				.where(eq(groupMember.groupId, input.id))
				.orderBy(groupMember.joinedAt);

			return {
				...groupData,
				members,
			};
		}),

	// Update group details (admin only)
	update: protectedProcedure
		.input(updateGroupSchema)
		.mutation(async ({ ctx, input }) => {
			await checkGroupPermission(ctx.session.user.id, input.id, "admin");

			const updatedGroup = await db
				.update(group)
				.set({
					name: input.name,
					description: input.description,
					updatedAt: new Date(),
				})
				.where(eq(group.id, input.id))
				.returning()
				.get();

			return updatedGroup;
		}),

	// Delete group (admin only)
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await checkGroupPermission(ctx.session.user.id, input.id, "admin");

			await db.delete(group).where(eq(group.id, input.id));

			return { success: true };
		}),

	// Add member to group (admin/moderator only)
	addMember: protectedProcedure
		.input(addMemberSchema)
		.mutation(async ({ ctx, input }) => {
			await checkGroupPermission(
				ctx.session.user.id,
				input.groupId,
				"moderator",
			);

			// Check if user is already a member
			const existingMember = await db
				.select()
				.from(groupMember)
				.where(
					and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.userId, input.userId),
					),
				)
				.get();

			if (existingMember) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User is already a member of this group",
				});
			}

			// Check if target user exists
			const targetUser = await db
				.select()
				.from(user)
				.where(eq(user.id, input.userId))
				.get();

			if (!targetUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			const newMember = await db
				.insert(groupMember)
				.values({
					id: crypto.randomUUID(),
					groupId: input.groupId,
					userId: input.userId,
					role: input.role,
				})
				.returning()
				.get();

			return newMember;
		}),

	// Update member role (admin only)
	updateMemberRole: protectedProcedure
		.input(updateMemberRoleSchema)
		.mutation(async ({ ctx, input }) => {
			await checkGroupPermission(ctx.session.user.id, input.groupId, "admin");

			// Prevent admin from changing their own role if they're the only admin
			if (input.userId === ctx.session.user.id) {
				const adminCount = await db
					.select({ count: groupMember.id })
					.from(groupMember)
					.where(
						and(
							eq(groupMember.groupId, input.groupId),
							eq(groupMember.role, "admin"),
						),
					)
					.all();

				if (adminCount.length === 1) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message: "Cannot change your own role as the only admin",
					});
				}
			}

			const updatedMember = await db
				.update(groupMember)
				.set({
					role: input.role,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.userId, input.userId),
					),
				)
				.returning()
				.get();

			if (!updatedMember) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Member not found",
				});
			}

			return updatedMember;
		}),

	// Remove member from group (admin/moderator only, or self-removal)
	removeMember: protectedProcedure
		.input(removeMemberSchema)
		.mutation(async ({ ctx, input }) => {
			await checkGroupPermission(ctx.session.user.id, input.groupId, "member");

			// Allow self-removal or admin/moderator removal of others
			if (input.userId !== ctx.session.user.id) {
				await checkGroupPermission(
					ctx.session.user.id,
					input.groupId,
					"moderator",
				);
			}

			// Prevent removing the only admin
			if (input.userId !== ctx.session.user.id) {
				const targetMember = await db
					.select()
					.from(groupMember)
					.where(
						and(
							eq(groupMember.groupId, input.groupId),
							eq(groupMember.userId, input.userId),
						),
					)
					.get();

				if (targetMember?.role === "admin") {
					const adminCount = await db
						.select({ count: groupMember.id })
						.from(groupMember)
						.where(
							and(
								eq(groupMember.groupId, input.groupId),
								eq(groupMember.role, "admin"),
							),
						)
						.all();

					if (adminCount.length === 1) {
						throw new TRPCError({
							code: "FORBIDDEN",
							message: "Cannot remove the only admin from the group",
						});
					}
				}
			}

			await db
				.delete(groupMember)
				.where(
					and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.userId, input.userId),
					),
				);

			return { success: true };
		}),

	// Leave group (self-removal)
	leave: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const currentMember = await checkGroupPermission(
				ctx.session.user.id,
				input.groupId,
				"member",
			);

			// Prevent leaving if you're the only admin
			if (currentMember.role === "admin") {
				const adminCount = await db
					.select({ count: groupMember.id })
					.from(groupMember)
					.where(
						and(
							eq(groupMember.groupId, input.groupId),
							eq(groupMember.role, "admin"),
						),
					)
					.all();

				if (adminCount.length === 1) {
					throw new TRPCError({
						code: "FORBIDDEN",
						message:
							"Cannot leave group as the only admin. Transfer ownership or delete the group.",
					});
				}
			}

			await db
				.delete(groupMember)
				.where(
					and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.userId, ctx.session.user.id),
					),
				);

			return { success: true };
		}),

	// Search users to add to group
	searchUsers: protectedProcedure
		.input(
			z.object({
				query: z.string().min(1, "Search query is required"),
				groupId: z.string(),
				limit: z.number().min(1).max(50).default(10),
			}),
		)
		.query(async ({ input }) => {
			// Get existing member IDs to exclude them
			const existingMembers = await db
				.select({ userId: groupMember.userId })
				.from(groupMember)
				.where(eq(groupMember.groupId, input.groupId));

			const existingMemberIds = existingMembers.map((m) => m.userId);

			const users = await db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					username: user.username,
					image: user.image,
				})
				.from(user)
				.where(
					and(
						existingMemberIds.length > 0
							? notInArray(user.id, existingMemberIds)
							: undefined,
						like(user.name, `%${input.query}%`),
					),
				)
				.limit(input.limit);

			return users;
		}),

	// Create invitation to group
	createInvitation: protectedProcedure
		.input(createInvitationSchema)
		.mutation(async ({ ctx, input }) => {
			await checkGroupPermission(
				ctx.session.user.id,
				input.groupId,
				"moderator",
			);

			// Check if user is already a member
			const existingMember = await db
				.select()
				.from(groupMember)
				.where(
					and(
						eq(groupMember.groupId, input.groupId),
						eq(groupMember.userId, input.invitedUserId),
					),
				)
				.get();

			if (existingMember) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User is already a member of this group",
				});
			}

			// Check if there's already a pending invitation
			const existingInvitation = await db
				.select()
				.from(groupInvitation)
				.where(
					and(
						eq(groupInvitation.groupId, input.groupId),
						eq(groupInvitation.invitedUserId, input.invitedUserId),
						eq(groupInvitation.status, "pending"),
					),
				)
				.get();

			if (existingInvitation) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "User already has a pending invitation to this group",
				});
			}

			// Check if target user exists
			const targetUser = await db
				.select()
				.from(user)
				.where(eq(user.id, input.invitedUserId))
				.get();

			if (!targetUser) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "User not found",
				});
			}

			const expiresAt = new Date();
			expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

			const invitation = await db
				.insert(groupInvitation)
				.values({
					id: crypto.randomUUID(),
					groupId: input.groupId,
					invitedUserId: input.invitedUserId,
					invitedByUserId: ctx.session.user.id,
					role: input.role,
					message: input.message,
					expiresAt,
				})
				.returning()
				.get();

			return invitation;
		}),

	// Get pending invitations for a group (admin/moderator only)
	getGroupInvitations: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ ctx, input }) => {
			await checkGroupPermission(
				ctx.session.user.id,
				input.groupId,
				"moderator",
			);

			// Use separate queries to avoid alias conflicts
			const invitations = await db
				.select({
					id: groupInvitation.id,
					role: groupInvitation.role,
					status: groupInvitation.status,
					message: groupInvitation.message,
					expiresAt: groupInvitation.expiresAt,
					createdAt: groupInvitation.createdAt,
					invitedUserId: groupInvitation.invitedUserId,
					invitedByUserId: groupInvitation.invitedByUserId,
				})
				.from(groupInvitation)
				.where(
					and(
						eq(groupInvitation.groupId, input.groupId),
						eq(groupInvitation.status, "pending"),
					),
				)
				.orderBy(desc(groupInvitation.createdAt));

			// Get user details for each invitation
			const invitationsWithUsers = await Promise.all(
				invitations.map(async (invitation) => {
					const [invitedUser, invitedByUser] = await Promise.all([
						db
							.select()
							.from(user)
							.where(eq(user.id, invitation.invitedUserId))
							.get(),
						db
							.select()
							.from(user)
							.where(eq(user.id, invitation.invitedByUserId))
							.get(),
					]);

					return {
						id: invitation.id,
						role: invitation.role,
						status: invitation.status,
						message: invitation.message,
						expiresAt: invitation.expiresAt,
						createdAt: invitation.createdAt,
						invitedUser: invitedUser
							? {
									id: invitedUser.id,
									name: invitedUser.name,
									email: invitedUser.email,
									username: invitedUser.username,
									image: invitedUser.image,
								}
							: null,
						invitedByUser: invitedByUser
							? {
									id: invitedByUser.id,
									name: invitedByUser.name,
									email: invitedByUser.email,
									username: invitedByUser.username,
									image: invitedByUser.image,
								}
							: null,
					};
				}),
			);

			return invitationsWithUsers;
		}),

	// Get user's pending invitations
	getMyInvitations: protectedProcedure.query(async ({ ctx }) => {
		const invitations = await db
			.select({
				id: groupInvitation.id,
				role: groupInvitation.role,
				status: groupInvitation.status,
				message: groupInvitation.message,
				expiresAt: groupInvitation.expiresAt,
				createdAt: groupInvitation.createdAt,
				group: {
					id: group.id,
					name: group.name,
					description: group.description,
				},
				invitedByUser: {
					id: user.id,
					name: user.name,
					email: user.email,
					username: user.username,
					image: user.image,
				},
			})
			.from(groupInvitation)
			.innerJoin(group, eq(groupInvitation.groupId, group.id))
			.innerJoin(user, eq(groupInvitation.invitedByUserId, user.id))
			.where(
				and(
					eq(groupInvitation.invitedUserId, ctx.session.user.id),
					eq(groupInvitation.status, "pending"),
				),
			)
			.orderBy(desc(groupInvitation.createdAt));

		return invitations;
	}),

	// Accept or decline invitation
	respondToInvitation: protectedProcedure
		.input(respondToInvitationSchema)
		.mutation(async ({ ctx, input }) => {
			const invitation = await db
				.select()
				.from(groupInvitation)
				.where(
					and(
						eq(groupInvitation.id, input.invitationId),
						eq(groupInvitation.invitedUserId, ctx.session.user.id),
						eq(groupInvitation.status, "pending"),
					),
				)
				.get();

			if (!invitation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invitation not found or already processed",
				});
			}

			// Check if invitation has expired
			if (invitation.expiresAt < new Date()) {
				await db
					.update(groupInvitation)
					.set({
						status: "expired",
						updatedAt: new Date(),
					})
					.where(eq(groupInvitation.id, input.invitationId));

				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Invitation has expired",
				});
			}

			if (input.action === "accept") {
				// Add user to group
				await db.insert(groupMember).values({
					id: crypto.randomUUID(),
					groupId: invitation.groupId,
					userId: ctx.session.user.id,
					role: invitation.role,
				});

				// Update invitation status
				await db
					.update(groupInvitation)
					.set({
						status: "accepted",
						updatedAt: new Date(),
					})
					.where(eq(groupInvitation.id, input.invitationId));

				return { success: true, action: "accepted" };
			}

			// Decline invitation
			await db
				.update(groupInvitation)
				.set({
					status: "declined",
					updatedAt: new Date(),
				})
				.where(eq(groupInvitation.id, input.invitationId));

			return { success: true, action: "declined" };
		}),

	// Cancel invitation (admin/moderator only)
	cancelInvitation: protectedProcedure
		.input(z.object({ invitationId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const invitation = await db
				.select()
				.from(groupInvitation)
				.where(eq(groupInvitation.id, input.invitationId))
				.get();

			if (!invitation) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Invitation not found",
				});
			}

			await checkGroupPermission(
				ctx.session.user.id,
				invitation.groupId,
				"moderator",
			);

			// Only allow cancellation of pending invitations
			if (invitation.status !== "pending") {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Can only cancel pending invitations",
				});
			}

			await db
				.update(groupInvitation)
				.set({
					status: "declined",
					updatedAt: new Date(),
				})
				.where(eq(groupInvitation.id, input.invitationId));

			return { success: true };
		}),

	cleanupExpiredInvitations: protectedProcedure.mutation(async () => {
		await db
			.update(groupInvitation)
			.set({
				status: "expired",
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(groupInvitation.status, "pending"),
					lt(groupInvitation.expiresAt, new Date()),
				),
			);

		return { success: true };
	}),
});
