const fs = require('fs');
const files = ['src/types.ts', 'api/_shared/types.ts'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /equipped: Partial<Record<EquipmentSlot, string>>;/g,
    `equipped: Partial<Record<EquipmentSlot, string>>;
  talents?: Record<string, number>;
  activeStance?: string;`
  );
  fs.writeFileSync(file, content);
  console.log(`Patched ${file}`);
}
