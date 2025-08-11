import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const group = sqliteTable("group", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	description: text("description"),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	createdBy: text("created_by")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const groupMember = sqliteTable("group_member", {
	id: text("id").primaryKey(),
	groupId: text("group_id")
		.notNull()
		.references(() => group.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role", { enum: ["admin", "moderator", "member"] })
		.notNull()
		.$defaultFn(() => "member"),
	joinedAt: integer("joined_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

export const groupInvitation = sqliteTable("group_invitation", {
	id: text("id").primaryKey(),
	groupId: text("group_id")
		.notNull()
		.references(() => group.id, { onDelete: "cascade" }),
	invitedUserId: text("invited_user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	invitedByUserId: text("invited_by_user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	role: text("role", { enum: ["admin", "moderator", "member"] })
		.notNull()
		.$defaultFn(() => "member"),
	status: text("status", {
		enum: ["pending", "accepted", "declined", "expired"],
	})
		.notNull()
		.$defaultFn(() => "pending"),
	message: text("message"),
	expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
	createdAt: integer("created_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.$defaultFn(() => new Date())
		.notNull(),
});

export const groupRelations = relations(group, ({ many, one }) => ({
	members: many(groupMember),
	invitations: many(groupInvitation),
	creator: one(user, {
		fields: [group.createdBy],
		references: [user.id],
	}),
}));

export const groupMemberRelations = relations(groupMember, ({ one }) => ({
	group: one(group, {
		fields: [groupMember.groupId],
		references: [group.id],
	}),
	user: one(user, {
		fields: [groupMember.userId],
		references: [user.id],
	}),
}));

export const groupInvitationRelations = relations(
	groupInvitation,
	({ one }) => ({
		group: one(group, {
			fields: [groupInvitation.groupId],
			references: [group.id],
		}),
		invitedUser: one(user, {
			fields: [groupInvitation.invitedUserId],
			references: [user.id],
		}),
		invitedByUser: one(user, {
			fields: [groupInvitation.invitedByUserId],
			references: [user.id],
		}),
	}),
);
