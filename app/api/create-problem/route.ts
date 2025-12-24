import { Prisma } from "@/app/generated/prisma/client";
import { UserRole } from "@/app/generated/prisma/enums";
import prisma from "@/lib/db";
import {
  getJudge0LanguageId,
  pollBatchResults,
  submitBatch,
} from "@/lib/judge0";
import { CreateProblemBody, Submission } from "@/lib/types/judge0";
import { currentUserRole, getCurrentUser } from "@/modules/auth/actions";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const userRole = await currentUserRole();
    const dbUser = await getCurrentUser();

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (userRole !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    const body: CreateProblemBody = await request.json();

    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      codeSnippets,
      referenceSolution,
    } = body;

    if (
      !title ||
      !description ||
      !difficulty ||
      !tags ||
      !examples ||
      !constraints ||
      !testCases ||
      !codeSnippets ||
      !referenceSolution
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(testCases) || testCases.length === 0) {
      return NextResponse.json(
        { error: "Atleast one test case is required!" },
        { status: 400 }
      );
    }

    for (const [languages, solutionCode] of Object.entries(referenceSolution)) {
      const languageId = getJudge0LanguageId(languages);
      if (!languageId) {
        return NextResponse.json(
          { error: "Language is not supported" },
          { status: 400 }
        );
      }

      const submissions: Submission[] = testCases.map((tc) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: tc.input,
        expected_output: tc.output,
      }));

      // submit all test cases in one batch
      const submissionResult = await submitBatch(submissions);

      const tokenMap = new Map<string, Submission>();

      const tokens = submissionResult
        .filter((res): res is { token: string } => "token" in res)
        .map((res, index) => {
          tokenMap.set(res.token, submissions[index]);
          return res.token;
        });

      if (tokens.length === 0) {
        throw new Error("No submissions were accepted by Judge0");
      }

      const results = await pollBatchResults(tokens);

      for (const result of results) {
        const ACCEPTED = 3;

        if (result.status.id !== ACCEPTED) {
          const submission = tokenMap.get(result.token);
          return NextResponse.json(
            {
              error: `Validation failed for ${result.language}`,
              testCases: {
                input: submission?.stdin,
                expected_output: submission?.expected_output,
                actualOutput: result.stdout,
                error:
                  result.stderr ||
                  result.compile_output ||
                  result.message ||
                  "Unkown error",
              },
              details: result,
            },
            { status: 400 }
          );
        }
      }
    }

    // step 3 - save to db
    const newProblem = await prisma.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,

        testCases: testCases as unknown as Prisma.InputJsonValue,
        codeSnippets: codeSnippets as Prisma.InputJsonValue,
        referenceSolution: referenceSolution as Prisma.InputJsonValue,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Problem created successfully.",
        data: newProblem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log("Database error: ", error);
    return NextResponse.json(
      { error: "Failed to save problem to database" },
      { status: 500 }
    );
  }
}
