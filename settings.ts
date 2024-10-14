import { App, PluginSettingTab, Setting } from 'obsidian';
import AutoReferencePlugin from './main';

export default class SettingTab extends PluginSettingTab {
	private plugin: AutoReferencePlugin;

	constructor(app: App, plugin: AutoReferencePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('References folder location')
			.setDesc('Location to save the references')
			.addText((text) =>
				text
					.setPlaceholder('Example: folder-1/folder-2')
					.setValue(this.plugin.settings.referenceFolder)
					.onChange(async (value) => {
						this.plugin.settings.referenceFolder = value;
						await this.save();
					})
			);
		new Setting(containerEl)
			.setName('Google cloud API key')
			.setDesc(
				'This API key will be used to query the youtube API to get information about a video.'
			)
			.addText((text) =>
				text.setPlaceholder('Api Key').onChange(async (value) => {
					this.plugin.settings.googleApiKey = value;
					await this.save();
				})
			);
		new Setting(containerEl)
			.setName('Web reference api')
			.setDesc('Url for the web reference api.')
			.addText((text) =>
				text
					.setPlaceholder('http://localhost:3000')
					.setValue(this.plugin.settings.webApiReferenceUrl)
					.onChange(async (value) => {
						this.plugin.settings.webApiReferenceUrl = value;
						await this.save();
					})
			);
	}

	private async save() {
		await this.plugin.saveSettings();
	}
}
