-- Les anciens EDITOR (auteurs de leurs articles) deviennent AUTHOR.
-- Le rôle EDITOR désigne désormais la rédac (tous articles + à la une + technologies).
UPDATE "User" SET role = 'AUTHOR' WHERE role = 'EDITOR';
