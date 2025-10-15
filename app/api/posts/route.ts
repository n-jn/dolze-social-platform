import admin from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { Post } from "@/models/post";

const db = admin.firestore();

// GET all posts (optionally filtered by UID)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");

  try {
    let query = db.collection("posts") as FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;
    if (uid) query = query.where("createdBy", "==", uid);

    const snapshot = await query.get();
    const posts: Post[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Post, "id">),
    }));

    return NextResponse.json(posts, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}

// POST a new post
export async function POST(req: NextRequest) {
  try {
    const data = (await req.json()) as Omit<Post, "id" | "createdAt" | "updatedAt">;

    const now = new Date();
    const post: Post = {
      ...data,
      createdAt: now,
      updatedAt: now,
      id: "", // will be filled below using doc.id
    };

    const docRef = db.collection("posts").doc();
    post.id = docRef.id;

    // write the document including the id
    await docRef.set(post);

    return NextResponse.json(post, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}
