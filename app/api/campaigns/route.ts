import admin from "@/lib/firebase-admin";
const db = admin.firestore();
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const window = new JSDOM("").window;
const purify = DOMPurify(window);

export async function GET() {
  const snapshot = await db.collection("campaigns").get();
  const campaigns = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
    };
  });
  return Response.json(campaigns);
}


export async function POST(req: Request) {
  const data = await req.json();
  if (!data.title || !data.startDate || !data.endDate)
    return new Response("Missing required fields", { status: 400 });

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  
  data.title = purify.sanitize(data.title);
  data.description = purify.sanitize(data.description);
  
  const ref = await db.collection("campaigns").add({
    ...data,
    startDate,
    endDate,
    createdAt: new Date(),
  });
  return Response.json({ id: ref.id, ...data });
}
