const fs = require('fs');
const path = require('path');

const files = [
  'src/actions/budgets.ts',
  'src/actions/dashboard.ts',
  'src/actions/expenses.ts',
  'src/actions/goals.ts',
  'src/actions/onboarding.ts',
  'src/actions/settings.ts',
  'src/app/(app)/budgets/page.tsx',
  'src/app/(app)/dashboard/page.tsx',
  'src/app/(app)/expenses/page.tsx',
  'src/app/(app)/layout.tsx',
  'src/app/(app)/reports/page.tsx',
  'src/app/(app)/settings/page.tsx',
  'src/app/(auth)/layout.tsx',
  'src/app/api/ai/analyze/route.ts',
  'src/app/api/ai/categorize/route.ts',
  'src/app/api/ai/chat/route.ts',
  'src/app/onboarding/page.tsx',
  'src/app/page.tsx'
];

for (const relPath of files) {
  const fullPath = path.join(__dirname, relPath);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace usage
  content = content.replace(/const\s*{\s*data\s*:\s*{\s*user\s*}\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\)/g, 'const user = await getUser()');
  content = content.replace(/const\s*{\s*data\s*:\s*{\s*user\s*}\s*,\s*error\s*}\s*=\s*await\s+supabase\.auth\.getUser\(\)/g, 'const user = await getUser()');

  // Check if getUser is now in the file
  if (content.includes('getUser()') && !content.includes('export async function getUser')) {
    // Need to add import
    if (!content.includes('import { getUser }')) {
      // Find the last import statement
      const importMatches = [...content.matchAll(/^import .*;?$/gm)];
      if (importMatches.length > 0) {
        const lastMatch = importMatches[importMatches.length - 1];
        const index = lastMatch.index + lastMatch[0].length;
        content = content.slice(0, index) + '\nimport { getUser } from \'@/actions/auth\'' + content.slice(index);
      } else {
        content = 'import { getUser } from \'@/actions/auth\'\n' + content;
      }
    }
  }

  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Refactoring complete.');
