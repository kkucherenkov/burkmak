import { readdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const COMPONENTS_DIR = path.join(import.meta.dirname, '../src/components');

interface Violation {
  component: string;
  missing: string[];
}

function auditComponents(): void {
  const entries = readdirSync(COMPONENTS_DIR);
  const dirs = entries.filter((e) => statSync(path.join(COMPONENTS_DIR, e)).isDirectory());
  const violations: Violation[] = [];

  for (const name of dirs) {
    const dir = path.join(COMPONENTS_DIR, name);
    const missing: string[] = [];

    const hasPrimaryVue = existsSync(path.join(dir, `${name}.vue`));
    const hasStories = existsSync(path.join(dir, `${name}.stories.ts`));
    const hasIndex = existsSync(path.join(dir, 'index.ts'));

    if (!hasIndex) missing.push('index.ts');
    if (!hasStories) missing.push(`${name}.stories.ts`);

    if (hasPrimaryVue) {
      if (!existsSync(path.join(dir, `${name}.spec.ts`))) {
        missing.push(`${name}.spec.ts`);
      }
    } else {
      const vueFiles = readdirSync(dir).filter((f) => f.endsWith('.vue'));
      for (const vue of vueFiles) {
        const spec = vue.replace(/\.vue$/, '.spec.ts');
        if (!existsSync(path.join(dir, spec))) {
          missing.push(spec);
        }
      }
    }

    if (missing.length > 0) {
      violations.push({ component: name, missing });
    }
  }

  if (violations.length === 0) {
    process.stderr.write(`✓ All ${String(dirs.length)} components passed the audit.\n`);
    // eslint-disable-next-line unicorn/no-process-exit -- CLI script; exit 0 = success
    process.exit(0);
  }

  process.stderr.write(
    `\n✗ Component audit failed — ${String(violations.length)} component(s) missing required files:\n\n`,
  );
  for (const { component, missing } of violations) {
    process.stderr.write(`  ${component}:\n`);
    for (const file of missing) {
      process.stderr.write(`    missing: ${file}\n`);
    }
  }
  process.stderr.write(
    '\nEach single-component folder needs: <Name>.vue, <Name>.stories.ts, <Name>.spec.ts, index.ts\n',
  );
  // eslint-disable-next-line unicorn/no-process-exit -- CLI script; exit 1 = audit failure
  process.exit(1);
}

auditComponents();
