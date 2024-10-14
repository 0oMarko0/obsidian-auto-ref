import { Strategy } from './strategy';
import { WebReference } from '../reference';
import { Err } from '../error';
import { AutoRefSettings } from '../main';

export class WebStrategy implements Strategy<WebReference> {
	private settings: AutoRefSettings;

	constructor(settings: AutoRefSettings) {
		this.settings = settings;
	}

	toMarkdown(reference: WebReference | null): string {
		if (!reference) return '';
		const template = [
			'---',
			'type: Reference',
			'refType: Web',
			`author: ${reference.author}`,
			`publishDate: ${reference.publishDate}`,
			`url: ${reference.url}`,
			'',
			'---',
			'### Summary',
			`${reference.description}`,
		];

		return template.join('\n');
	}

	async fetchReference(url: string): Promise<[WebReference | null, Err]> {
		const response = await fetch(this.settings.webApiReferenceUrl, {
			method: 'POST',
			body: JSON.stringify({ url }),
		});

		const reference = (await response.json()) as WebReference;
		reference.url = url;

		return [reference, null];
	}
}
