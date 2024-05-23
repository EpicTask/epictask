import { describe, beforeEach, test, it, jest, expect } from "@jest/globals";
import { writeResponseToDatabase } from "../controllers/database";
import { Timestamp, addDoc, collection } from "firebase/firestore";
import { db } from "../config/clients/firebase";
import { config } from "../config/config.dev";

jest.mock("firebase/firestore", () => ({
  addDoc: jest.fn(),
  collection: jest.fn(),
}));

jest.mock("../src/firebase", () => ({
  db: jest.fn(),
  config: {
    xrplServiceCollection: "xrpl_service",
  },
}));

describe("writeResponseToDatabase", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should write response to database and return document ID", async () => {
    const response = { data: "example" };
    const func = "exampleFunc";
    const taskId = "exampleTaskId";
    const docRef = { id: "exampleDocId" };

    // Mock the collection function
    (collection as jest.Mock).mockReturnValueOnce({
      doc: jest.fn().mockReturnValueOnce({
        addDoc: jest.fn(),
      }),
    });

    const result = await writeResponseToDatabase(response, func, taskId);

    expect(addDoc).toHaveBeenCalledWith(
      collection(db, config.xrplServiceCollection),
      response
    );

    expect(addDoc).toHaveBeenCalledWith(
      collection(db, config.xrplServiceCollection, docRef.id),
      {
        doc_id: docRef.id,
        function: func,
        task_id: taskId,
        timestamp: Timestamp, // You need to define Timestamp here
      }
    );

    expect(result).toEqual(docRef.id);
  });

  it("should handle error and return null", async () => {
    const response = { data: "example" };
    const func = "exampleFunc";
    const taskId = "exampleTaskId";
    const error = new Error("Example error");

    const result = await writeResponseToDatabase(response, func, taskId);

    expect(addDoc).toHaveBeenCalledWith(
      collection(db, config.xrplServiceCollection),
      response
    );

    expect(console.error).toHaveBeenCalledWith(
      "Error adding document: ",
      error
    );

    expect(result).toBeNull();
  });
});
