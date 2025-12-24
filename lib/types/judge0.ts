import { Difficulty } from "@/app/generated/prisma/enums";

type ReferenceSolution = Record<string, string>;

type CodeSnippets = Record<string, string>;

interface TestCase {
  input: string;
  output: string;
}

export interface CreateProblemBody {
  title: string;
  description: string;
  difficulty: Difficulty;
  tags: string[];
  examples: string;
  constraints: string;
  testCases: TestCase[];
  codeSnippets: CodeSnippets;
  referenceSolution: ReferenceSolution;
}

export interface LanguageMap {
  [key: string]: number;
};

export interface Submission {
  source_code: string;
  language_id: number;
  stdin: string;
  expected_output: string;
}

type SubmissionToken = {
  token: string
}

type SubmissionValidationErrors = {
  [K in Exclude<string, "token">]: string[];
}

export type BatchSubmissionResponse = Array<
  SubmissionToken | SubmissionValidationErrors
>

interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0Result {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: Judge0Status;
  language: string;
}

export interface PollBatchResponse {
  submissions: Judge0Result[];
}
