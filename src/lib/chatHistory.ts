import { collection, getDocs, addDoc, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getUserChatHistory(uid: string, topic: string) {
  console.log('[getUserChatHistory]', { uid, topic });
  const q = query(
    collection(db, "chat_histories"),
    where("uid", "==", uid),
    where("topic", "==", topic),
    orderBy("timestamp", "asc")
  );
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => doc.data());
  console.log('[getUserChatHistory] result', data);
  return data;
}

export async function saveUserMessage({ uid, topic, role, content }: { uid: string, topic: string, role: string, content: string }) {
  const data = { uid, topic, role, content, timestamp: Date.now() };
  console.log('[saveUserMessage]', data);
  await addDoc(collection(db, "chat_histories"), data);
}
