import crypto from 'crypto';

const MONO_SERVICE_URL = process.env.MONO_SERVICE_URL || 'http://localhost:8080';

export const writeResponseToDatabase = async (
  response: object,
  func: string,
  taskId?: string
) => {
  try {
    const payload = {
      response,
      function: func,
      task_id: taskId
    };

    const res = await fetch(`${MONO_SERVICE_URL}/api/xrpl/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.doc_id;
  } catch (e) {
    console.error("Error logging XRPL event: ", e);
    return null;
  }
};

export const createIdentifier = (): string => {
  return crypto.randomUUID();
};
