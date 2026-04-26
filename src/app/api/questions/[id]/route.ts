import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { QuestionService } from "@/modules/questions/question.service";
import { z } from "zod";

const updateQuestionSchema = z.object({
  content: z.string().optional(),
  status: z.enum(["PENDENTE", "RESPONDIDO"]).optional(),
  answer: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const questionService = new QuestionService();
    const question = await questionService.getQuestionById(id);

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json({ question });
  } catch (error) {
    console.error("Error getting question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const data = updateQuestionSchema.parse(body);

    const questionService = new QuestionService();
    const question = await questionService.updateQuestion(id, data);

    return NextResponse.json({ question });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error updating question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const questionService = new QuestionService();
    await questionService.deleteQuestion(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
