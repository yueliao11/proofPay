import { Criterion, ReviewCheck, ReviewResult, DeliveryManifest } from "./types";

export function deterministicReview(
  criteria: Criterion[],
  manifest: DeliveryManifest,
  reviewerName = "AI Reviewer v0.1"
): ReviewResult {
  const content = manifest.content.toLowerCase();
  const summary = manifest.summary.toLowerCase();
  const checks: ReviewCheck[] = criteria.map((c) => {
    const text = c.text.toLowerCase();
    let status: "pass" | "fail" = "pass";
    let reason = `Criterion satisfied: ${c.text}`;

    if (text.includes("comparison table")) {
      const hasTable = content.includes("|") && content.includes("---");
      status = hasTable ? "pass" : "fail";
      reason = hasTable
        ? "A structured markdown comparison table is included."
        : "The delivery discusses competitors but does not include a structured comparison table.";
    } else if (text.includes("at least 5 competitor")) {
      const matches = content.match(/\*\*.+?\*\*/g) || [];
      const count = matches.length;
      status = count >= 5 ? "pass" : "fail";
      reason = status === "pass" ? `The delivery includes ${count} competitor projects.` : `Only ${count} competitor projects found; at least 5 required.`;
    } else if (text.includes("executive summary")) {
      status = content.includes("executive summary") ? "pass" : "fail";
      reason = status === "pass" ? "An executive summary is included." : "No executive summary section found.";
    } else if (text.includes("recommendation")) {
      status = content.includes("recommendation") ? "pass" : "fail";
      reason = status === "pass" ? "The report includes recommendations for builders." : "No recommendation section found.";
    } else if (text.includes("walkthrough") || text.includes("demo link")) {
      const hasLink = /https?:\/\/[^\s]+/.test(content) || /https?:\/\/[^\s]+/.test(summary);
      status = hasLink ? "pass" : "fail";
      reason = hasLink ? "A demo walkthrough link is provided." : "No walkthrough or demo link is provided.";
    }

    return { criterion: c.text, status, reason };
  });

  const criticalChecks = checks.filter((_, i) => criteria[i].critical);
  const allCriticalPass = criticalChecks.every((c) => c.status === "pass");
  const passRate = checks.filter((c) => c.status === "pass").length / checks.length;
  const score = Math.round(allCriticalPass ? 80 + Math.floor(passRate * 20) - (1 - passRate) * 8 : Math.max(40, Math.round(passRate * 80)));
  const clampedScore = Math.min(100, Math.max(0, score));
  const passed = clampedScore >= 80;

  return {
    settlementId: "",
    agent: "",
    reviewer: reviewerName,
    score: clampedScore,
    result: passed ? "pass" : "needs_revision",
    paymentRecommendation: passed ? "release_payment" : "do_not_release",
    checks,
    attestation: {
      method: "sha256",
      payloadHash: `0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`,
      signature: `demo-ai-reviewer-signature-${passed ? "passed" : "failed"}`,
    },
    reviewReportBlobId: `0xwalrusreviewreport${passed ? "passing" : "failed"}${Math.random().toString(16).slice(2, 60).padEnd(60, "0")}`,
  };
}

export async function llmReview(
  criteria: Criterion[],
  manifest: DeliveryManifest,
  apiKey?: string
): Promise<ReviewResult> {
  if (!apiKey) {
    return deterministicReview(criteria, manifest);
  }

  const prompt = `You are an AI reviewer for ProofPay.
Your job is to evaluate whether an AI agent delivery satisfies the locked acceptance criteria.
Return JSON only.
Acceptance Criteria:
${JSON.stringify(criteria.map((c) => ({ text: c.text, critical: c.critical })))}
Delivery Manifest:
${JSON.stringify({ fileName: manifest.fileName, summary: manifest.summary, contentType: manifest.contentType })}
Delivery Content:
${manifest.content}
Evaluate each criterion as pass or fail.
Give a score from 0 to 100.
Set payment_recommendation to "release_payment" only if all critical criteria pass.
Set payment_recommendation to "do_not_release" if any critical criterion is missing.
Output JSON shape: { score: number, result: "pass" | "needs_revision", payment_recommendation: "release_payment" | "do_not_release", checks: [{ criterion: string, status: "pass" | "fail", reason: string }] }.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) throw new Error("LLM request failed");
    const data = await response.json();
    const raw = JSON.parse(data.choices[0].message.content);
    return {
      settlementId: "",
      agent: "",
      reviewer: "AI Reviewer v0.1 (LLM)",
      score: Math.min(100, Math.max(0, Number(raw.score) || 0)),
      result: raw.result === "pass" ? "pass" : "needs_revision",
      paymentRecommendation: raw.payment_recommendation === "release_payment" ? "release_payment" : "do_not_release",
      checks: (raw.checks || []).map((c: any) => ({
        criterion: String(c.criterion || ""),
        status: c.status === "pass" ? "pass" : "fail",
        reason: String(c.reason || ""),
      })),
      attestation: {
        method: "sha256",
        payloadHash: `0x${Math.random().toString(16).slice(2, 66).padEnd(64, "0")}`,
        signature: "llm-ai-reviewer-signature",
      },
      reviewReportBlobId: `0xwalrusreviewreportllm${Math.random().toString(16).slice(2, 60).padEnd(60, "0")}`,
    };
  } catch {
    return deterministicReview(criteria, manifest);
  }
}
