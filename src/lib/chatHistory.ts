import { collection, getDocs, addDoc, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserChatHistory(uid: string, topic: string) {
  const q = query(
    collection(db, "chat_histories"),
    where("uid", "==", uid),
    where("topic", "==", topic),
    orderBy("timestamp", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}

export async function saveUserMessage({ uid, topic, role, content }: { uid: string, topic: string, role: string, content: string }) {
  await addDoc(collection(db, "chat_histories"), {
    uid,
    topic,
    role,
    content,
    timestamp: Date.now()
  });
}
