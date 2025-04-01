import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface DarkLightSettings {
	selectedTheme: string;
	customThemes: string[];
}

const DEFAULT_SETTINGS: DarkLightSettings = {
	selectedTheme: 'default',
	customThemes: []
};

export default class DarklightPlugin extends Plugin {
	settings: DarkLightSettings;

	async onload() {
		await this.loadSettings();

		// Add ribbon icon to open settings directly
		const ribbonIconEl = this.addRibbonIcon("palette", "DarkLight Settings", async () => {
			// Open the settings modal
			this.app.workspace.trigger("open-settings");

			// Wait a bit for settings to open, then navigate to your plugin's settings tab
			setTimeout(() => {
				const settingsContainer = document.querySelector(".modal-container");
				if (settingsContainer) {
					const pluginTab = settingsContainer.querySelector(`[data-id="${this.manifest.id}"]`);
					if (pluginTab) {
						(pluginTab as HTMLElement).click();
					}
				}
			}, 200); // Adjust delay if needed

			setTimeout(() => {
				const settingsTab = document.querySelector(`.setting-item[data-id="${this.manifest.id}"]`) as HTMLElement;
				if (settingsTab) {
					settingsTab.click(); // Simulate a click to open Darklight settings
				}
			}, 500); // Wait for settings to open
			new Notice("Opening Darklight settings...");
		});



		ribbonIconEl.addClass("darklight-ribbon-icon");

		// Apply the selected theme
		this.applyTheme(this.settings.selectedTheme);

		// Add settings tab
		this.addSettingTab(new DarklightSettingTab(this.app, this));
	}

	onunload() {
		console.log("Darklight Plugin Unloaded");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	applyTheme(theme: string) {
		const styleEl = document.getElementById("darklight-theme-style");
		if (styleEl) styleEl.remove();

		const newStyleEl = document.createElement("style");
		newStyleEl.id = "darklight-theme-style";
		newStyleEl.textContent = `@import url('styles.css');`;
		document.head.appendChild(newStyleEl);
	}
}

class DarklightSettingTab extends PluginSettingTab {
	plugin: DarklightPlugin;

	constructor(app: App, plugin: DarklightPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Select Theme")
			.setDesc("Choose a pre-installed or custom theme")
			.addDropdown(dropdown => {
				dropdown.addOption("default", "Default Theme");
				this.plugin.settings.customThemes.forEach(theme => dropdown.addOption(theme, theme));
				dropdown.setValue(this.plugin.settings.selectedTheme);
				dropdown.onChange(async (value) => {
					this.plugin.settings.selectedTheme = value;
					await this.plugin.saveSettings();
					this.plugin.applyTheme(value);
				});
			});

		new Setting(containerEl)
			.setName("Add Custom Theme")
			.setDesc("Enter the name of your custom theme")
			.addText(text => {
				text.setPlaceholder("Theme Name");
				text.onChange(async (value) => {
					if (value && !this.plugin.settings.customThemes.includes(value)) {
						this.plugin.settings.customThemes.push(value);
						await this.plugin.saveSettings();
						this.display(); 
					}
				});
			});
	}
}
