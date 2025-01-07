export interface PhoneModel {
	id: number;
	title: string;
	color: string[];
	img: string;
}

export interface Slide {
	id: number;
	textLists: string[];
	video: string;
	videoDuration: number;
}

export interface Size {
	label: string;
	value: "small" | "large";
}
