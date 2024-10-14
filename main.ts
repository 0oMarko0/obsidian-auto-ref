import { Plugin } from 'obsidian';
import { ReferenceModal } from './reference-modal';
import SettingTab from './settings';
import { StrategyContext } from './strategies/strategy';
import { ReferenceType } from './reference';
import { YoutubeStrategy } from './strategies/youtube-strategy';
import { BookStrategy } from './strategies/book-strategy';
import { WebStrategy } from './strategies/web-strategy';

export interface AutoRefSettings {
	referenceFolder: string;
	webApiReferenceUrl: string;
	googleApiKey?: string;
}

const DEFAULT_SETTINGS: AutoRefSettings = {
	referenceFolder: 'references',
	webApiReferenceUrl: 'http://localhost:3000/api/reference',
};

export default class AutoReferencePlugin extends Plugin {
	private strategyContext: StrategyContext;
	settings: AutoRefSettings;

	async onload() {
		console.log("main")
		await this.loadSettings();

		if (!this.strategyContext) {
			this.strategyContext = new StrategyContext(this.settings);
		}

		this.addSettingTab(new SettingTab(this.app, this));

		this.addCommand({
			id: 'add-youtube-reference',
			name: 'Add a youtube video',
			callback: () => {
				new ReferenceModal(
					this.app,
					this.settings,
					{
						title: 'Add a youtube reference',
						description: 'Copy the youtube url',
						placeholder: 'https://youtube...',
					},
					this.strategyContext.getStrategy(
						ReferenceType.Youtube
					) as YoutubeStrategy
				).open();
			},
		});

		this.addCommand({
			id: 'add-book-reference',
			name: 'Add a book',
			callback: () => {
				new ReferenceModal(
					this.app,
					this.settings,
					{
						title: 'Add a book',
						description: 'Only support isbn10',
						placeholder: 'ISBN',
					},
					this.strategyContext.getStrategy(ReferenceType.Book) as BookStrategy
				).open();
			},
		});

		this.addCommand({
			id: 'add-web-reference',
			name: 'Add a web page',
			callback: () => {
				new ReferenceModal(
					this.app,
					this.settings,
					{
						title: 'Add a web page',
						description: 'Add the webpage url',
						placeholder: 'https://webpage...',
					},
					this.strategyContext.getStrategy(ReferenceType.Web) as WebStrategy
				).open();
			},
		});
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
