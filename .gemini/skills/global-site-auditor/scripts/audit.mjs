import fs from 'fs';
import path from 'path';

const auditRules = [
  {
    name: 'Glare & Contrast Check',
    pattern: /text-neutral-400|text-text-muted/,
    description: 'Scanning for low-contrast text in primary sections.',
    advice: 'Consider upgrading to text-neutral-100 or text-neutral-200 for better sunlight readability.'
  },
  {
    name: 'Currency Layout Protection',
    pattern: /€/,
    exclude: /whitespace-nowrap/,
    description: 'Scanning for price displays missing non-breaking constraints.',
    advice: 'Wrap price and € symbol in a container with "flex flex-row items-baseline whitespace-nowrap".'
  },
  {
    name: 'Interface Boundary Check',
    pattern: /<header|<nav/,
    exclude: /px-6|px-8|px-10|px-12/,
    description: 'Verifying horizontal safety padding in navigation components.',
    advice: 'Ensure global navigation has at least px-6 or px-8 padding to prevent edge clipping.'
  },
  {
    name: 'Asset Transparency Check',
    pattern: /favicon\.jpg|logo\.jpg|eagle|aigle/,
    exclude: /bg-transparent|mix-blend-screen/,
    description: 'Scanning for logo wrappers that might have background artifacts.',
    advice: 'Use bg-transparent or appropriate blend modes to integrate graphics seamlessly.'
  }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

function runAudit() {
  console.log('--- GlobalSiteAuditor: Comprehensive Audit Log ---\n');
  let issuesFound = 0;

  const srcDir = path.join(process.cwd(), 'src');
  if (!fs.existsSync(srcDir)) {
    console.log('❌ "src" directory not found.');
    return;
  }

  const files = walk(srcDir);

  auditRules.forEach(rule => {
    console.log(`[Domain: ${rule.name}]`);
    console.log(`Description: ${rule.description}`);
    
    let violations = [];

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (rule.pattern.test(line)) {
          if (!rule.exclude || !rule.exclude.test(line)) {
            violations.push(`${file}:${index + 1}: ${line.trim()}`);
          }
        }
      });
    });

    if (violations.length > 0) {
      console.log(`⚠️  Found ${violations.length} potential issues:`);
      violations.slice(0, 5).forEach(v => console.log(`   - ${v.substring(0, 120)}...`));
      if (violations.length > 5) console.log(`   ... and ${violations.length - 5} more.`);
      console.log(`💡 Advice: ${rule.advice}\n`);
      issuesFound += violations.length;
    } else {
      console.log('✅ No obvious issues detected.\n');
    }
  });

  console.log('--- Audit Cycle Finished ---');
  console.log(`Summary: ${issuesFound} potential violations identified.`);
}

runAudit();
