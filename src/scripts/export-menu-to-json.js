// Script to export menuData from menu.ts to menu-data.json
const fs = require('fs');
const path = require('path');

async function exportMenuData() {
  // Use ts-node to require the TypeScript file
  const { register } = require('ts-node');
  register({ transpileOnly: true });
  const menuModule = require('../lib/menu.ts');
  const menuData = menuModule.menuData;
  const outputPath = path.resolve(__dirname, '../lib/menu-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(menuData, null, 2), 'utf-8');
  console.log('✅ menu-data.json generated successfully!');
}

exportMenuData(); 