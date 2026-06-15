import { Plugin } from 'obsidian';
import { type BurkmakSettings, BurkmakSettingTab, DEFAULT_SETTINGS } from './settings';

export default class BurkmakPlugin extends Plugin {
  override settings: BurkmakSettings = { ...DEFAULT_SETTINGS };

  override async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new BurkmakSettingTab(this.app, this));
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<BurkmakSettings>);
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }
}
