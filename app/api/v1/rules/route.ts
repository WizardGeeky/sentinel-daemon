import { NextRequest, NextResponse } from "next/server";
import { getRules, saveRule, deleteRule } from "@/daemon/store";
import { learnRule } from "@/daemon/rule-learner";
import { LearnRuleRequestSchema } from "@/lib/types";
import { createLogger } from "@/lib/logger";

const logger = createLogger("api/rules");

// GET /api/v1/rules - List all rules
export async function GET() {
  try {
    const rules = getRules();
    return NextResponse.json({ rules, count: rules.length });
  } catch (err) {
    logger.error("Failed to get rules", { error: String(err) });
    return NextResponse.json({ error: "Failed to get rules" }, { status: 500 });
  }
}

// POST /api/v1/rules - Learn a new rule
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = LearnRuleRequestSchema.parse(body);

    const rule = await learnRule(validated.text);
    saveRule(rule);

    logger.info("New rule created via API", { ruleId: rule.id });

    return NextResponse.json({ rule, message: "Rule learned and saved" }, { status: 201 });
  } catch (err) {
    logger.error("Failed to learn rule", { error: String(err) });
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}

// DELETE /api/v1/rules/:id
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID parameter required" }, { status: 400 });
    }

    deleteRule(id);
    logger.info("Rule deleted via API", { ruleId: id });

    return NextResponse.json({ message: "Rule deleted" });
  } catch (err) {
    logger.error("Failed to delete rule", { error: String(err) });
    return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
  }
}