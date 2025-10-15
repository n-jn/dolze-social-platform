import admin from "@/lib/firebase-admin";
const db = admin.firestore();
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const doc = await db.collection("campaigns").doc(params.id).get();

    if (!doc.exists) {
      return new Response("Campaign not found", { status: 404 });
    }

    const data = doc.data();
    return Response.json({ id: doc.id, ...data,  startDate: data.startDate.toDate(), // converts Firestore Timestamp to JS Date
      endDate: data.endDate.toDate(), });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  if (data.title) data.title = purify.sanitize(data.title);
  if (data.description) data.description = purify.sanitize(data.description);
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  if (data.startDate && isNaN(data.startDate.getTime())) {
    return new Response("Invalid startDate", { status: 400 });
  }
  if (data.endDate && isNaN(data.endDate.getTime())) {
    return new Response("Invalid endDate", { status: 400 });
  }

  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return new Response("startDate cannot be after endDate", { status: 400 });
  }

  // Prevent updating createdBy, createdAt, id
  delete data.createdBy;
  delete data.createdAt;
  delete data.id;
  
  // If no valid fields to update
  if (Object.keys(data).length === 0) {
    return new Response("No valid fields to update", { status: 400 });
  }

  // Update the campaign
  await db.collection("campaigns").doc(params.id).update({
    ...data,
    updatedAt: new Date(),
  });
  return Response.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const campaignId = params.id;

  try {
    // Delete the campaign
    await db.collection("campaigns").doc(campaignId).delete();

    // Delete all posts related to this campaign
    const postsSnapshot = await db
      .collection("posts")
      .where("campaignId", "==", campaignId)
      .get();

    const batch = db.batch();
    postsSnapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return Response.json({ success: true });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
}
