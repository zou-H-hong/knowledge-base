const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const outDir = path.join(__dirname, "..", "public", "data");

// Convert absolute localhost URLs to relative paths for deployment
function normalizeUrl(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.pathname;
    }
  } catch {}
  return url;
}

async function main() {
  // Ensure output directory exists
  fs.mkdirSync(path.join(outDir, "posts"), { recursive: true });

  // Fetch all posts with media
  const posts = await prisma.post.findMany({
    include: {
      media: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Write posts index (for homepage)
  const indexData = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content.slice(0, 200), // preview only
    type: p.type,
    category: p.category,
    coverUrl: normalizeUrl(p.coverUrl),
    coverImage: normalizeUrl(p.coverImage),
    images: p.images || "",
    mediaUrl: normalizeUrl(p.mediaUrl),
    tags: p.tags || "",
    createdAt: p.createdAt.toISOString(),
  }));
  fs.writeFileSync(
    path.join(outDir, "posts.json"),
    JSON.stringify(indexData, null, 2)
  );
  console.log(`Exported ${indexData.length} posts to public/data/posts.json`);

  // Write individual post files (for detail pages)
  for (const post of posts) {
    const postData = {
      id: post.id,
      title: post.title,
      content: post.content,
      type: post.type,
      category: post.category,
      coverUrl: normalizeUrl(post.coverUrl),
      coverImage: normalizeUrl(post.coverImage),
      images: post.images || "",
      mediaUrl: normalizeUrl(post.mediaUrl),
      tags: post.tags || "",
      createdAt: post.createdAt.toISOString(),
      media: post.media.map((m) => ({
        id: m.id,
        url: normalizeUrl(m.url),
        fileType: m.fileType,
        fileName: m.fileName,
      })),
    };
    fs.writeFileSync(
      path.join(outDir, "posts", `${post.id}.json`),
      JSON.stringify(postData, null, 2)
    );
  }
  console.log(`Exported ${posts.length} individual post files`);

  // Note: uploads are copied to out/ by the build script AFTER build completes
  // (out/ is deleted during build, so copying here would be lost)

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
