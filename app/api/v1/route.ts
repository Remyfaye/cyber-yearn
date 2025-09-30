import { handleResponse } from "../../../lib";

export function GET() {
  try {
    return handleResponse(200, "CyberLearn Api is live");
  } catch (error: unknown) {
    if (error instanceof Error) {
      return handleResponse(500, error.message);
    }
    return handleResponse(500, String(error));
  }
}
