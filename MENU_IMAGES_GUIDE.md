# Menu Item Images Guide

## 📸 Adding Images to Menu Items

The menu system supports images for all menu items. Here's how to add them:

### Option 1: Using Static Images (Recommended for Development)

1. **Place images in the `public/menu-images/` folder**
   - Image files should be named descriptively (e.g., `quarter-chicken.jpg`, `double-smash-burger.png`)
   - Supported formats: `.jpg`, `.jpeg`, `.png`, `.webp`
   - Recommended size: 800x600px or 1200x900px

2. **Update the database with image paths**
   - Use Prisma Studio: `npx prisma studio`
   - Navigate to `menu_items` table
   - Update the `image` field with the filename (e.g., `quarter-chicken.jpg`)

3. **Or use SQL directly:**
   ```sql
   UPDATE menu_items 
   SET image = 'quarter-chicken.jpg' 
   WHERE id = 'quarter-chicken';
   ```

### Option 2: Using External URLs

You can also use external image URLs:
- Update the `image` field in the database with the full URL
- Example: `https://example.com/images/burger.jpg`

### Option 3: Using Image Upload API (Future Enhancement)

An image upload API endpoint can be created to:
- Upload images to cloud storage (AWS S3, Cloudinary, etc.)
- Store image URLs in the database
- Handle image optimization and resizing

## 🎨 Image Guidelines

### Recommended Specifications:
- **Format**: JPG (for photos) or PNG (for graphics)
- **Size**: 800x600px to 1200x900px
- **Aspect Ratio**: 4:3 or 16:9
- **File Size**: Under 500KB (optimized)
- **Quality**: High quality, well-lit photos

### Best Practices:
- Use consistent lighting and background
- Show the actual food item clearly
- Use high-resolution images
- Optimize images before uploading (use tools like TinyPNG)
- Consider using WebP format for better compression

## 📁 Current Image Structure

```
public/
  └── menu-images/
      ├── quarter-chicken.jpg
      ├── double-smash-burger.jpg
      ├── peri-wings.jpg
      └── ...
```

## 🔧 Database Schema

The `menu_items` table has an `image` field:
- **Type**: String (nullable)
- **Format**: Filename (for local images) or full URL (for external images)

## 💡 Example: Adding an Image

1. **Add image file:**
   ```bash
   # Place your image in public/menu-images/
   cp ~/Downloads/burger-photo.jpg public/menu-images/double-smash-burger.jpg
   ```

2. **Update database via Prisma Studio:**
   - Run: `npx prisma studio`
   - Open `menu_items` table
   - Find the item (e.g., "Double Smash Burger")
   - Set `image` field to: `double-smash-burger.jpg`

3. **Or via SQL:**
   ```sql
   UPDATE menu_items 
   SET image = 'double-smash-burger.jpg' 
   WHERE id = 'double-smash';
   ```

## 🚀 Quick Start

1. Add your images to `public/menu-images/`
2. Update the database with image filenames
3. Refresh the menu page to see images

## 📝 Notes

- Images are automatically displayed on the menu page
- If an image fails to load, a fallback icon is shown
- Images are optimized by Next.js automatically
- For production, consider using a CDN or cloud storage

