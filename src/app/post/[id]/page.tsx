import fs from "fs";
import path from "path";
import PostDetailInner from "./PostDetailInner";
import type { Post } from "./PostDetailInner";

// Static export: generate all post pages from exported JSON
export async function generateStaticParams() {
  try {
    const dataPath = path.join(process.cwd(), "public", "data", "posts.json");
    const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    return data.map((p: { id: string }) => ({ id: p.id }));
  } catch {
    return [];
  }
}

async function getPost(id: string): Promise<Post | null> {
  // Try static JSON file first (works in both dev and static modes)
  try {
    const filePath = path.join(process.cwd(), "public", "data", "posts", `${id}.json`);
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg mb-4">文章不存在</p>
        <a href="/" className="text-amber-600 hover:underline">返回首页</a>
      </div>
    );
  }

  return <PostDetailInner postId={params.id} initialPost={post} />;
}
