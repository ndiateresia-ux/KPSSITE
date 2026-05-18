#!/bin/bash
# scripts/convert-to-webp.sh

echo "🖼️  Converting images to WebP format..."

# Create optimized directories if they don't exist
mkdir -p public/images/optimized
mkdir -p public/images/optimized/gallery

# Convert all JPG images from root images folder
echo "📁 Converting root images..."
for img in public/images/*.jpg public/images/*.jpeg; do
  if [ -f "$img" ]; then
    filename=$(basename -- "$img")
    name="${filename%.*}"
    echo "  Converting: $filename"
    
    # Convert to WebP with quality 80
    convert "$img" -quality 80 -resize "1920x1080>" "public/images/optimized/$name.webp"
    
    # Also create optimized JPG fallback
    convert "$img" -quality 85 -resize "1920x1080>" "public/images/optimized/$name.jpg"
  fi
done

# Convert all JPG images from gallery folder
echo "📁 Converting gallery images..."
for img in public/images/gallery/*.jpg public/images/gallery/*.jpeg; do
  if [ -f "$img" ]; then
    filename=$(basename -- "$img")
    name="${filename%.*}"
    echo "  Converting: $filename"
    
    # Convert to WebP with quality 80 (smaller size for gallery)
    convert "$img" -quality 80 -resize "800x600>" "public/images/optimized/gallery/$name.webp"
    
    # Also create optimized JPG fallback
    convert "$img" -quality 85 -resize "800x600>" "public/images/optimized/gallery/$name.jpg"
  fi
done

# Convert all PNG images from root folder
echo "📁 Converting root PNG images..."
for img in public/images/*.png; do
  if [ -f "$img" ]; then
    filename=$(basename -- "$img")
    name="${filename%.*}"
    echo "  Converting: $filename"
    
    # Convert to WebP with quality 80
    convert "$img" -quality 80 -resize "1920x1080>" "public/images/optimized/$name.webp"
    
    # Also create optimized JPG fallback
    convert "$img" -quality 85 -resize "1920x1080>" "public/images/optimized/$name.jpg"
  fi
done

# Convert all PNG images from gallery folder
echo "📁 Converting gallery PNG images..."
for img in public/images/gallery/*.png; do
  if [ -f "$img" ]; then
    filename=$(basename -- "$img")
    name="${filename%.*}"
    echo "  Converting: $filename"
    
    # Convert to WebP with quality 80
    convert "$img" -quality 80 -resize "800x600>" "public/images/optimized/gallery/$name.webp"
    
    # Also create optimized JPG fallback
    convert "$img" -quality 85 -resize "800x600>" "public/images/optimized/gallery/$name.jpg"
  fi
done

echo "✅ Conversion complete!"
echo "📁 Root images saved in: public/images/optimized/"
echo "📁 Gallery images saved in: public/images/optimized/gallery/"