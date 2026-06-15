import { type App, PluginSettingTab, Setting } from 'obsidian';
import type BurkmakPlugin from './main';

export interface BurkmakSettings {
  baseUrl: string;
  token: string;
  folder: string;
  readState: '' | 'unread' | 'read' | 'archived';
  includeEmpty: boolean;
}

export const DEFAULT_SETTINGS: BurkmakSettings = {
  baseUrl: 'http://localhost:3000/api/v1',
  token: '',
  folder: 'burkmak',
  readState: '',
  includeEmpty: false,
};

export class BurkmakSettingTab extends PluginSettingTab {
  private readonly plugin: BurkmakPlugin;

  constructor(app: App, plugin: BurkmakPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  override display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('Base URL')
      .setDesc('Your burkmak API base URL (e.g. http://localhost:3000/api/v1).')
      .addText((text) => {
        text
          .setPlaceholder('http://localhost:3000/api/v1')
          .setValue(this.plugin.settings.baseUrl)
          .onChange(async (value) => {
            this.plugin.settings.baseUrl = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Personal Access Token')
      .setDesc('Create a PAT in burkmak Settings → Access Tokens.')
      .addText((text) => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('bpat_…')
          .setValue(this.plugin.settings.token)
          .onChange(async (value) => {
            this.plugin.settings.token = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Target folder')
      .setDesc('Vault folder where synced notes are written (created if needed).')
      .addText((text) => {
        text
          .setPlaceholder('burkmak')
          .setValue(this.plugin.settings.folder)
          .onChange(async (value) => {
            this.plugin.settings.folder = value;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Read state filter')
      .setDesc('Only sync articles in this state. "All" syncs everything.')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('', 'All')
          .addOption('unread', 'Unread')
          .addOption('read', 'Read')
          .addOption('archived', 'Archived')
          .setValue(this.plugin.settings.readState)
          .onChange(async (value) => {
            this.plugin.settings.readState = value as BurkmakSettings['readState'];
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName('Include articles without highlights')
      .setDesc('When enabled, articles with no highlights are also synced.')
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.includeEmpty).onChange(async (value) => {
          this.plugin.settings.includeEmpty = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
