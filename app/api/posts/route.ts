import admin from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { Post } from "@/models/post";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);
const db = admin.firestore();

// GET all posts (optionally filtered by UID and/or campaignId)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uid = searchParams.get("uid");
  const campaignId = searchParams.get("campaignId");

  try {
    const snapshot = await db.collection("posts")
      .where("campaignId", "==", campaignId || undefined) // if campaignId is null, ignore this filter
      .get();

    if (snapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    // Map Firestore documents to Post objects
    const posts: Post[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Post, "id">;
      return {
        id: doc.id,
        ...data,
        scheduledDate: data.scheduledDate.toDate(), // converts Firestore Timestamp to JS Date
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    });

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

    data.content = purify.sanitize(data.content);
    data.platform = purify.sanitize(data.platform);
    const now = new Date();
    const scheduledDate = new Date(data.scheduledDate);
    if (isNaN(scheduledDate.getTime())) {
      return new NextResponse("Invalid scheduledDate", { status: 400 });
    }

    const post: Post = {
      ...data,
      createdAt: now,
      updatedAt: now,
      scheduledDate,
      id: "", // will be filled below,
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
