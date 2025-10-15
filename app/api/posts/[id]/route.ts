import admin from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

const db = admin.firestore();

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return new NextResponse("Missing post ID", { status: 400 });

  try {
    const data = await req.json();

    // Only allow updating scheduledDate, content, etc.
    const updateData: Partial<typeof data> = {};
    if (data.scheduledDate) updateData.scheduledDate = data.scheduledDate;
    if (data.content) updateData.content = data.content;
    if (data.platform) updateData.platform = data.platform;

    await db.collection("posts").doc(id).update(updateData);

    return NextResponse.json({ id, ...updateData }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return new NextResponse("Missing post ID", { status: 400 });

  try {
    const doc = await db.collection("posts").doc(id).get();
    if (!doc.exists) return new NextResponse("Post not found", { status: 404 });
    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return new NextResponse("Missing post ID", { status: 400 });

  try {
    await db.collection("posts").doc(id).delete();
    return new NextResponse("Deleted", { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}
