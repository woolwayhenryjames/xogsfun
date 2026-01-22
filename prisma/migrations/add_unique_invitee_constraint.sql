-- Add unique constraint to prevent multiple invitations for the same user
-- This ensures each user can only be invited once

-- First, remove any duplicate invitations (keep the earliest one for each invitee)
DELETE FROM "Invite" 
WHERE id NOT IN (
    SELECT DISTINCT ON ("inviteeId") id 
    FROM "Invite" 
    ORDER BY "inviteeId", "createdAt" ASC
);

-- Add unique constraint on inviteeId
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_inviteeId_unique" UNIQUE ("inviteeId"); 