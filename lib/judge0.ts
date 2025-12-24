import axios from "axios";
import {
  BatchSubmissionResponse,
  Judge0Result,
  LanguageMap,
  PollBatchResponse,
  Submission,
} from "./types/judge0";

export function getJudge0LanguageId(language: string) {
  const languageMap: LanguageMap = {
    PYTHON: 71,
    JAVASCRIPT: 63,
    JAVA: 62,
    CPP: 54,
    GO: 60,
  };
  return languageMap[language.toUpperCase()];
}

export async function submitBatch(
  submissions: Submission[]
): Promise<BatchSubmissionResponse> {
  const { data } = await axios.post<BatchSubmissionResponse>(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions }
  );

  console.log("Batch submission response: ", data);
  return data;
}

export async function pollBatchResults(
  tokens: string[]
): Promise<Judge0Result[]> {
  const MAX_RETRIES = 60; // 60 attempts
  const INTERVAL = 1000; // 1 second
  
  let attempts = 0;

  while (attempts < MAX_RETRIES) {
    const { data } = await axios.get<PollBatchResponse>(
      `${process.env.JUDGE0_API_URL}/submissions/batch`,
      {
        params: {
          tokens: tokens.join(","),
          base64_encoded: false,
        },
      }
    );

    console.log(data);

    const results = data.submissions;

    const isAllDone = results.every(
      (r) => r.status.id !== 1 && r.status.id !== 2
    );

    if (isAllDone) return results;

    attempts++;
    await sleep(INTERVAL);
  }
  throw new Error("Judge0 polling timed out");
}

export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
