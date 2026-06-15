#!/bin/bash
# Build static site - temporarily moves API routes out during build

cd "$(dirname "$0")"

# Step 0: Stop any running node servers
echo "=== Stopping servers ==="
taskkill //F //IM node.exe 2>/dev/null
sleep 2

# Step 1: Export data from database
echo "=== Exporting data ==="
node scripts/export-data.js

# Step 2: Temporarily move API routes and admin pages
echo "=== Moving API routes ==="
mkdir -p _build_temp
rm -rf _build_temp/api _build_temp/admin _build_temp/auth.ts _build_temp/prisma.ts
cp -r src/app/api _build_temp/api 2>/dev/null && rm -rf src/app/api
cp -r src/app/admin _build_temp/admin 2>/dev/null && rm -rf src/app/admin
cp src/lib/auth.ts _build_temp/auth.ts 2>/dev/null && rm -f src/lib/auth.ts
cp src/lib/prisma.ts _build_temp/prisma.ts 2>/dev/null && rm -f src/lib/prisma.ts

# Step 3: Temporarily add output: 'export' to config
echo "=== Adding export config ==="
node -e "const fs=require('fs');let c=fs.readFileSync('next.config.js','utf8');if(!c.includes('output:')){c=c.replace('const nextConfig = {','const nextConfig = {\n  output: \"export\",');fs.writeFileSync('next.config.js',c);}"

# Step 4: Build
echo "=== Building ==="
rm -rf out .next
env -u TURBOPACK -u NODE_ENV -u __NEXT_PRIVATE_STANDALONE_CONFIG npm run build

# Step 5: Remove output: 'export' from config
echo "=== Removing export config ==="
node -e "const fs=require('fs');let c=fs.readFileSync('next.config.js','utf8');c=c.replace(/  output: \"export\",?\n/,'');fs.writeFileSync('next.config.js',c);"

# Step 6: Restore API routes
echo "=== Restoring API routes ==="
rm -rf src/app/api src/app/admin src/lib/auth.ts src/lib/prisma.ts
mv _build_temp/api src/app/api 2>/dev/null
mv _build_temp/admin src/app/admin 2>/dev/null
mv _build_temp/auth.ts src/lib/auth.ts 2>/dev/null
mv _build_temp/prisma.ts src/lib/prisma.ts 2>/dev/null
rm -rf _build_temp

# Step 7: Copy uploads and tag-taxonomy to out
echo "=== Copying assets ==="
if [ -d "public/uploads" ]; then
  cp -r public/uploads out/uploads
fi
if [ -f "public/tag-taxonomy.json" ]; then
  cp public/tag-taxonomy.json out/tag-taxonomy.json
fi

echo "=== Done ==="
