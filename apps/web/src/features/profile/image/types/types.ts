type Hyphen2 = `${string}-${string}`;
type Hyphen3 = `${string}-${string}-${string}`;
type Hyphen4 = `${string}-${string}-${string}-${string}`;
type Hyphen5 = `${string}-${string}-${string}-${string}-${string}`;

export type ProfileImageID = string | Hyphen2 | Hyphen3 | Hyphen4 | Hyphen5;

export type ProfileImageItem = {
	name: string;
	id: ProfileImageID;
	fileName: string;
};

export type ProfileImageWCategory = {
	[x: string]: ProfileImageItem;
};
