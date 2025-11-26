console.log("This file is tempolally an empty file");
// import { posts } from "@/app/lib/placeholder-data";
// import type { Post } from "@/app/lib/interface/Post";
// import PostDetail from '@/app/ui/PostDetail';

// async function getPost(id: string): Promise<Post | null> {
//   const res = await fetch(`api/posts/${id}`, { cache: 'no-store' });
//   if (!res.ok) {
//     if (res.status === 404) return null;
//     throw new Error('Failed to fetch post');
//   }
//   const data = await res.json();
//   return data.post;
// }

// // TODO: 後ほどtypeで指定
// export default function ShowPost({
//     params,
// }: {
//     params: {
//         id: string;
//     };
// }) {
//     const post = getPost(params.id);

//     if (!post) {
//         return <div>投稿が見つかりません</div>;
//     }

//     return <PostDetail post={post} />
// }
