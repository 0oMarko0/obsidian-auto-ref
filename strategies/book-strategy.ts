import { Strategy } from './strategy';
import { BookReference } from '../reference';
import { Err } from 'error';
import { AutoRefSettings } from '../main';
import { handleApiError } from './youtube-api';

interface VolumeInfo {
	title: string;
	subtitle: string;
	authors: string[];
	publisher: string;
	publishedDate: string;
	description: string;
	industryIdentifiers: IndustryIdentifier[];
	pageCount: number;
	printType: string;
	categories: string[];
	averageRating: number;
	ratingsCount: number;
	maturityRating: string;
	allowAnonLogging: boolean;
	contentVersion: string;
	imageLinks: ImageLinks;
	language: string;
	previewLink: string;
	infoLink: string;
	canonicalVolumeLink: string;
}

interface IndustryIdentifier {
	type: string;
	identifier: string;
}

interface ImageLinks {
	smallThumbnail: string;
	thumbnail: string;
}

export class BookStrategy implements Strategy<BookReference> {
	private settings: AutoRefSettings;
	constructor(settings: AutoRefSettings) {
		this.settings = settings;
	}

	toMarkdown(reference: BookReference | null): string {
		if (!reference) return '';
		const template = [
			'---',
			'type: Reference',
			'refType: Book',
			`author: ${reference.author}`,
			`categories: ${reference.categories.join(', ')}`,
			`pageCount: ${reference.pageCount}`,
			`ISBN: ${reference.isbn}`,
			`publisher: ${reference.publisher}`,
			'',
			'---',
			'### Summary',
			`${reference.description}`,
			'',
			`![](${reference.image})`,
		];

		return template.join('\n');
	}

	async fetchReference(isbn: string): Promise<[BookReference | null, Err]> {
		if (!this.validateIsbn(isbn)) {
			return [null, { msg: 'Invalid ISBN' }];
		}
		const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&key=${this.settings.googleApiKey}`;
		try {
			const response = await fetch(apiUrl);

			await handleApiError(response);

			const body = await response.json();

			const book = body.items[0].volumeInfo as VolumeInfo;

			if (body.totalItems > 0) {
				return [
					{
						title: book.title,
						author: book.authors.join(', '),
						publisher: book.publisher,
						publishDate: book.publishedDate,
						description: book.description,
						isbn: isbn,
						image: book.imageLinks.thumbnail,
						categories: book.categories,
						subtitle: book.subtitle,
						pageCount: book.pageCount,
					},
					null,
				];
			} else {
				return [null, { msg: 'No book found for this ISBN' }];
			}
		} catch (error) {
			return [null, { msg: `Error fetching book data: ${error}` }];
		}
	}

	private validateIsbn(isbn: string) {
		return /^(97(8|9))?\d{9}(\d|X)$/.test(isbn);
	}
}
