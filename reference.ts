export interface BaseReference {
	title: string;
	description: string;
	publishDate: string;
	author: string;
}

export interface BookReference extends BaseReference {
	isbn: string;
	publisher: string;
	image: string;
	categories: string[];
	subtitle: string;
	pageCount: number;
}

export interface WebReference extends BaseReference {
	url: string;
}

export interface YoutubeReference extends WebReference {
	videoId: string;
	channelId: string;
	topicCategories?: string[];
	channelUrl: string;
}

export enum ReferenceType {
	Book = 'Book',
	Web = 'Web',
	Youtube = 'Youtube',
}
