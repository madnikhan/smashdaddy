# Menu Item Images - Setup Complete ✅

## What Was Done

### 1. **API Updated** ✅
- Fixed `/api/menu` route to return `image` field
- Added `isVegan` and `isSpicy` fields to API response

### 2. **Menu Page Enhanced** ✅
- Upgraded to use Next.js `Image` component for better performance
- Added fallback placeholder (🍔 emoji) when no image is available
- Supports both local images (`/menu-images/filename.jpg`) and external URLs
- Improved image display with proper sizing and aspect ratio

### 3. **Image Directory Created** ✅
- Created `public/menu-images/` folder for storing menu item images
- Added `.gitkeep` file to preserve the directory in git

### 4. **Next.js Config Updated** ✅
- Configured image optimization for external URLs
- Allows images from any domain

### 5. **Helper Script Created** ✅
- Created `scripts/add-menu-images.js` to bulk update menu items with images

---

## 🚀 How to Add Images

### Quick Method (Using Prisma Studio)

1. **Add your images:**
   ```bash
   # Place images in the public/menu-images/ folder
   cp your-image.jpg public/menu-images/burger.jpg
   ```

2. **Open Prisma Studio:**
   ```bash
   npx prisma studio
   ```

3. **Update menu items:**
   - Navigate to `menu_items` table
   - Find the item you want to add an image to
   - Set the `image` field to the filename (e.g., `burger.jpg`)
   - Save

### Using the Helper Script

1. **Edit the script:**
   ```bash
   # Edit scripts/add-menu-images.js
   # Add your image mappings to the imageMappings object
   ```

2. **Run the script:**
   ```bash
   node scripts/add-menu-images.js
   ```

### Using SQL Directly

```sql
-- Update a single menu item
UPDATE menu_items 
SET image = 'double-smash-burger.jpg' 
WHERE id = 'double-smash';

-- Update multiple items
UPDATE menu_items 
SET image = 'quarter-chicken.jpg' 
WHERE id = 'quarter-chicken';
```

---

## 📸 Image Requirements

### Recommended Specs:
- **Format**: JPG, PNG, or WebP
- **Size**: 800x600px to 1200x900px
- **Aspect Ratio**: 4:3 or 16:9
- **File Size**: Under 500KB (optimized)
- **Naming**: Use descriptive names (e.g., `double-smash-burger.jpg`)

### Best Practices:
- Use high-quality, well-lit photos
- Show the actual food item clearly
- Use consistent styling across all images
- Optimize images before adding (use TinyPNG or similar)

---

## 🎨 Image Display

### Current Behavior:
- ✅ Images display at 192px height (h-48)
- ✅ Fallback emoji (🍔) shows when no image
- ✅ Supports both local and external URLs
- ✅ Optimized by Next.js automatically
- ✅ Responsive sizing for mobile/tablet/desktop

### Image Paths:
- **Local images**: `/menu-images/filename.jpg`
- **External URLs**: Full URL (e.g., `https://example.com/image.jpg`)

---

## 📝 Example Workflow

1. **Prepare your images:**
   ```bash
   # Optimize and resize images
   # Name them descriptively
   ```

2. **Add to public folder:**
   ```bash
   cp burger-photo.jpg public/menu-images/double-smash-burger.jpg
   ```

3. **Update database:**
   ```bash
   # Option 1: Use Prisma Studio
   npx prisma studio
   
   # Option 2: Use SQL
   sqlite3 prisma/dev.db "UPDATE menu_items SET image = 'double-smash-burger.jpg' WHERE id = 'double-smash';"
   ```

4. **Verify:**
   - Visit `/menu` page
   - Check that images display correctly

---

## 🔧 Technical Details

### Files Modified:
1. `src/app/api/menu/route.ts` - Added image field to API response
2. `src/app/menu/page.tsx` - Enhanced image display with Next.js Image
3. `next.config.ts` - Added image optimization config
4. `public/menu-images/` - Created image directory

### Database:
- Field: `menu_items.image` (String, nullable)
- Stores: Filename for local images or full URL for external images

---

## ✅ Status

- ✅ API returns image field
- ✅ Menu page displays images
- ✅ Fallback placeholder works
- ✅ Image optimization configured
- ✅ Helper script created
- ✅ Documentation complete

**Ready to use!** Just add your images and update the database. 🎉

