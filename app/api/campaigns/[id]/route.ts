import admin from "@/lib/firebase-admin";
const db = admin.firestore();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json();
  await db.collection("campaigns").doc(params.id).update({
    ...data,
    updatedAt: new Date(),
  });
  return Response.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await db.collection("campaigns").doc(params.id).delete();
  return Response.json({ success: true });
}
