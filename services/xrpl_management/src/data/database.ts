import { db } from "../config/clients/firebase";
import { addDoc, collection, Timestamp, doc } from "firebase/firestore";
import { config } from "../config/config.dev";

export const writeResponseToDatabase = async (
  response: object,
  func: string,
  taskId?: string
) => {
  try {
    const docRef = await addDoc(
      collection(db, config.xrplServiceCollection),
      response
    );

    // Update document with the docRef.id
    await addDoc(collection(db, config.xrplServiceCollection, docRef.id), {
      doc_id: docRef.id,
      function: func,
      task_id: taskId,
      timestamp: Timestamp,
    });
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
};
export const createIdentifier = (): string => {
  doc(db, config.xrplServiceCollection).id;
  return doc(db, config.xrplServiceCollection).id;
};
