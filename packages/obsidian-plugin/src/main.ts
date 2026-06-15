import { Notice, Plugin, requestUrl } from 'obsidian';
import type { TFile } from 'obsidian';
import { type BurkmakSettings, BurkmakSettingTab, DEFAULT_SETTINGS } from './settings';
import { buildExportUrl } from './lib/export-url';
import { parseBurkmakId } from './lib/frontmatter';

interface ExportedNote {
  itemId: string;
  title: string;
  filename: string;
  markdown: string;
}

interface ExportBundle {
  notes: ExportedNote[];
}

export default class BurkmakPlugin extends Plugin {
  override settings: BurkmakSettings = { ...DEFAULT_SETTINGS };

  override async onload(): Promise<void> {
    await this.loadSettings();
    this.addSettingTab(new BurkmakSettingTab(this.app, this));
    this.addCommand({
      id: 'sync',
      name: 'Sync from burkmak',
      callback: () => {
        void this.sync();
      },
    });
  }

  async loadSettings(): Promise<void> {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      (await this.loadData()) as Partial<BurkmakSettings>,
    );
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private async sync(): Promise<void> {
    const { baseUrl, token, folder, readState, includeEmpty } = this.settings;

    if (!baseUrl || !token) {
      new Notice('burkmak: Set base URL and token in settings');
      return;
    }

    const url = buildExportUrl(baseUrl, {
      ...(readState ? { readState } : {}),
      includeEmpty,
    });

    let bundle: ExportBundle;
    try {
      const res = await requestUrl({
        url,
        headers: { Authorization: `Bearer ${token}` },
        throw: false,
      });

      if (res.status !== 200) {
        new Notice(`burkmak: HTTP ${res.status.toString()}`);
        return;
      }

      bundle = res.json as ExportBundle;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      new Notice(`burkmak: Request failed — ${message}`);
      return;
    }

    const { notes } = bundle;

    if (notes.length === 0) {
      new Notice('burkmak: Nothing to sync');
      return;
    }

    // Ensure target folder exists
    const folderExists = this.app.vault.getFolderByPath(folder);
    if (!folderExists) {
      try {
        await this.app.vault.createFolder(folder);
      } catch {
        // Folder may have been created between the check and the call — ignore
      }
    }

    // Build a map: burkmakId → TFile for existing files in the folder
    const existingFiles = this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(`${folder}/`));

    const idToFile = new Map<string, TFile>();
    await Promise.all(
      existingFiles.map(async (file) => {
        try {
          const content = await this.app.vault.read(file);
          const id = parseBurkmakId(content);
          if (id) idToFile.set(id, file);
        } catch {
          // Skip unreadable files
        }
      }),
    );

    let created = 0;
    let updated = 0;

    for (const note of notes) {
      try {
        const existing = idToFile.get(note.itemId);
        if (existing) {
          await this.app.vault.modify(existing, note.markdown);
          updated++;
        } else {
          await this.app.vault.create(`${folder}/${note.filename}`, note.markdown);
          created++;
        }
      } catch (error) {
        console.error(`burkmak: failed to write note ${note.itemId}:`, error);
      }
    }

    new Notice(`burkmak: ${created.toString()} created, ${updated.toString()} updated`);
  }
}
