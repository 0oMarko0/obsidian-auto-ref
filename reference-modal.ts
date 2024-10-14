import { App, Modal, Notice, Setting, Vault } from 'obsidian';
import { BaseReference } from './reference';
import { AutoRefSettings } from './main';
import { Strategy } from './strategies/strategy';

export interface ModalConfig {
	title: string;
	placeholder: string;
	description: string;
}

export class ReferenceModal<T extends BaseReference> extends Modal {
	private readonly settings: AutoRefSettings;
	private readonly vault: Vault;
	private readonly modalConfig: ModalConfig;
	private readonly strategy: Strategy<T>;

	constructor(
		app: App,
		settings: AutoRefSettings,
		modalConfig: ModalConfig,
		strategy: Strategy<T>
	) {
		super(app);
		this.settings = settings;
		this.modalConfig = modalConfig;
		this.vault = app.vault;
		this.strategy = strategy;
	}

	onOpen() {
		const { contentEl } = this;

		let input = '';

		contentEl.createEl('h2', { text: this.modalConfig.title });

		new Setting(contentEl)
			.setName(this.modalConfig.description)
			.addText((text) =>
				text
					.setPlaceholder(this.modalConfig.placeholder)
					.onChange(async (value) => {
						input = value;
					})
			);

		new Setting(contentEl).addButton((bc) =>
			bc.setButtonText('Submit').onClick(async () => {
				const [data, error] = await this.strategy.fetchReference(input);
				if (error) {
					new Notice(error.msg);
				}

				const path = this.vault.getFolderByPath(this.settings.referenceFolder);
				if (!path) {
					new Notice(
						`The folder ${this.settings.referenceFolder} does not exist. To resolve this issue, create the folder.`
					);
				}

				const fileName = `${this.sanitizeFileName(data?.title as string)}.md`;

				try {
					const file = await this.vault.create(
						`${this.settings.referenceFolder}/${fileName}`,
						this.strategy.toMarkdown(data)
					);
					const leaf = this.app.workspace.getLeaf(true);
					await leaf.openFile(file);
					this.close();
				} catch (e) {
					new Notice(`Unable to create the reference: ${e.toString()}`);
				}
			})
		);
	}

	sanitizeFileName(fileName: string): string {
		return fileName
			.replace(/[\\?%*:|"<>’.!@#$^&()-]/g, '') // Remove invalid characters
			.replace(/\s+/g, '_')
			.toLowerCase()
			.substring(0, 255) // Replace spaces with underscores
			.trim();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
