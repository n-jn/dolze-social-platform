import admin from "@/lib/firebase-admin";
const db = admin.firestore();

export async function GET() {
  const snapshot = await db.collection("campaigns").get();
  const campaigns = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  return Response.json(campaigns);
}

export async function POST(req: Request) {
  const data = await req.json();
  if (!data.title || !data.startDate || !data.endDate)
    return new Response("Missing required fields", { status: 400 });

  const ref = await db.collection("campaigns").add({
    ...data,
    createdAt: new Date(),
  });
  return Response.json({ id: ref.id, ...data });
}
