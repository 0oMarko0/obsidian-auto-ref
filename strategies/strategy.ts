import { BaseReference, ReferenceType } from '../reference';
import { Err } from '../error';
import { YoutubeStrategy } from './youtube-strategy';
import { AutoRefSettings } from '../main';
import { BookStrategy } from './book-strategy';
import { WebStrategy } from './web-strategy';

export interface Strategy<T extends BaseReference> {
	fetchReference(input: string): Promise<[T | null, Err]>;
	toMarkdown(reference: T | null): string;
}

export class StrategyContext {
	private context: Map<string, Strategy<any>>;

	constructor(settings: AutoRefSettings) {
		this.context = new Map();
		this.context.set(ReferenceType.Youtube, new YoutubeStrategy(settings));
		this.context.set(ReferenceType.Book, new BookStrategy(settings));
		this.context.set(ReferenceType.Web, new WebStrategy(settings));
	}

	getStrategy(referenceType: ReferenceType) {
		return this.context.get(referenceType);
	}
}
