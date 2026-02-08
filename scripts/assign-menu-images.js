/**
 * Assigns matching food images to each menu item in menu-data.json.
 * Uses Unsplash (free) photo IDs - format: .../photo-{id}?auto=format&fit=crop&w=400&q=80
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://images.unsplash.com/photo-';
const Q = '?auto=format&fit=crop&w=400&q=80';

const IMAGE_MAP = {
  // Grilled chicken category
  'quarter-chicken': BASE + '1598103442097-8b74394b95c6' + Q,   // roast chicken
  'half-chicken': BASE + '1598103442097-8b74394b95c6' + Q,
  'full-chicken': BASE + '1598103442097-8b74394b95c6' + Q,
  'chicken-strips': BASE + '1567620832903-7fcead1c2d58' + Q,   // chicken strips/wings
  'peri-wings-5': BASE + '1567620832903-7fcead1c2d58' + Q,
  'peri-wings-10': BASE + '1567620832903-7fcead1c2d58' + Q,
  // Burgers
  'single-smash': BASE + '1550547660-d9450f859349' + Q,        // beef burger
  'double-smash': BASE + '1550547660-d9450f859349' + Q,
  'triple-smash': BASE + '1550547660-d9450f859349' + Q,
  'zinger-chicken': BASE + '1606755962773-d324e0a13086' + Q,   // chicken burger
  'peri-chicken-burger': BASE + '1606755962773-d324e0a13086' + Q,
  'meat-free-classic': BASE + '1571095397367-6e98862f6d4f' + Q, // veggie burger
  'veggie-patty': BASE + '1571095397367-6e98862f6d4f' + Q,
  // Wraps
  'grilled-chicken-wrap': BASE + '1626700051175-6818013e1d4f' + Q,
  'lamb-kofta-wrap': BASE + '1626700051175-6818013e1d4f' + Q,
  'beef-kofta-wrap': BASE + '1626700051175-6818013e1d4f' + Q,
  // Rice
  'peri-chicken-rice': BASE + '1512058564366-18510be2db19' + Q, // rice bowl
  // Kids
  'kids-popcorn': BASE + '1567620832903-7fcead1c2d58' + Q,
  'kids-cheeseburger': BASE + '1550547660-d9450f859349' + Q,
  'kids-chicken-burger': BASE + '1606755962773-d324e0a13086' + Q,
  // Sides
  'regular-fries': BASE + '1573080496219-bb080dd4f877' + Q,    // fries
  'peri-fries': BASE + '1573080496219-bb080dd4f877' + Q,
  'cheesy-fries': BASE + '1575932444877-5106bee2a599' + Q,     // loaded fries
  'coleslaw': BASE + '1546069901-ba9599a7e63c' + Q,            // coleslaw/salad
  'garlic-mayo': BASE + '1603360946369-dc4351618503' + Q,      // sauce
  'peri-dip': BASE + '1603360946369-dc4351618503' + Q,
  'bbq-sauce': BASE + '1603360946369-dc4351618503' + Q,
  // Drinks
  'cans': BASE + '1554866585-cd94860890b7' + Q,                // soda cans
  'bottles': BASE + '1622483767028-3f66f32aef97' + Q,          // bottles
  'juice-cartons': BASE + '1621506289937-a8e4df240d0b' + Q,    // juice
  // Meal deals
  'smash-burger-meal': BASE + '1568901346375-23c9450c58cd' + Q, // burger meal
  'chicken-burger-meal': BASE + '1606755962773-d324e0a13086' + Q,
  'wrap-meal': BASE + '1626700051175-6818013e1d4f' + Q,
  'rice-box-meal': BASE + '1512058564366-18510be2db19' + Q,
  'wings-combo-meal': BASE + '1567620832903-7fcead1c2d58' + Q,
};

const menuPath = path.join(__dirname, '../src/lib/menu-data.json');
const menu = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

for (const cat of menu) {
  for (const item of cat.items) {
    if (IMAGE_MAP[item.id]) {
      item.image = IMAGE_MAP[item.id];
    }
  }
}

fs.writeFileSync(menuPath, JSON.stringify(menu));
console.log('Updated menu-data.json with matching food images for all items.');
