import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/modules/auth/auth.utils";
import { QuestionService } from "@/modules/questions/question.service";
import { PregnancyService } from "@/modules/pregnancy/pregnancy.service";
import { z } from "zod";

const questionSchema = z.object({
  content: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const { content } = questionSchema.parse(body);

    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ error: "No active pregnancy found" }, { status: 404 });
    }

    const questionService = new QuestionService();
    const question = await questionService.createQuestion(pregnancy.id, content);

    return NextResponse.json({ question });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error creating question:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const pregnancyService = new PregnancyService();
    const pregnancy = await pregnancyService.getActivePregnancy(user.id);

    if (!pregnancy) {
      return NextResponse.json({ questions: [] });
    }

    const questionService = new QuestionService();
    const questions = await questionService.getQuestions(pregnancy.id);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error getting questions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
