"""Narration generation for pitch deck slides."""

import json
import os
from typing import List, Dict

from dotenv import load_dotenv

try:
    from openai import OpenAI
except Exception:
    OpenAI = None

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

TEMPLATE_NARRATIONS: Dict[str, List[str]] = {
    "crypto_pitch": [
        "ProofPay. Settlement layer for AI agent work. And it is already deployed live on Sui Testnet.",
        "AI agents can work, but paying them is still based on trust. ProofPay fixes that with locked acceptance criteria, verifiable delivery, and conditional release.",
        "ProofPay turns agent deliverables into payment release conditions using Sui escrow, Walrus data proofs, and AI reviewer attestations.",
        "The TraceBrief Passport is the core artifact: a verifiable work receipt that records settlement, delivery proof, review score, and agent reputation.",
        "Here is the drama. The client connects a wallet and locks two SUI. ResearchBot-01 submits a first draft, but it is missing the comparison table.",
        "The AI reviewer blocks it. Payment is frozen. The agent gets one second chance, submits a corrected version, and scores one hundred out of one hundred.",
        "The client approves, and two SUI release in one on-chain transaction. The TraceBrief Passport is now verified and immutable.",
        "ProofPay is not a marketplace, not static storage, and not just escrow. It is the settlement layer for verified AI agent work.",
        "Our contracts are live on Sui Testnet today. Our roadmap adds USDC payments, dispute resolution, zkLogin, a reputation registry, and DeepBook liquidity.",
        "Thank you. Agents can work. Walrus makes their outputs provable. Sui makes their payments settle.",
        "ProofPay. Settlement layer for AI agent work. Built on Sui, powered by Walrus.",
    ],
    "business": [
        "Every new technology wave needs a settlement layer. AI agents are no exception.",
        "ProofPay provides a trust-minimized settlement protocol for AI agent work.",
        "The TraceBrief Passport creates an auditable record of deliverables, reviews, and payments.",
        "The workflow is simple: lock criteria, deliver work, review automatically, release payment.",
        "Failed deliveries are caught before funds move.",
        "Approved deliveries trigger instant settlement.",
        "Each completed job contributes to the agent's verified reputation.",
        "ProofPay is infrastructure, not a marketplace.",
        "Future releases will add multi-currency support, dispute arbitration, and receivable financing.",
        "We are building the payment rail for verified AI work.",
    ],
    "education": [
        "Let's look at why AI agent work needs a settlement layer.",
        "ProofPay combines Sui escrow, Walrus storage, and AI review into one protocol.",
        "The TraceBrief Passport is a verifiable work receipt.",
        "First, lock payment and acceptance criteria.",
        "Then submit a deliverable and run the AI reviewer.",
        "If criteria fail, payment stays locked.",
        "If criteria pass, payment releases automatically.",
        "The result is a permanent, verifiable reputation record.",
        "This architecture can support many future use cases.",
        "In summary, ProofPay makes agent work provable and payable.",
    ],
    "product_demo": [
        "Welcome to ProofPay.",
        "This is the landing page.",
        "Here is how ProofPay works in four steps.",
        "First, the client creates a settlement and locks SUI.",
        "Next, the agent submits a deliverable to Walrus.",
        "The AI reviewer checks the delivery against locked criteria.",
        "If the delivery fails, payment remains locked.",
        "The agent can submit a corrected delivery.",
        "When the review passes, the client approves and releases payment.",
        "Finally, the TraceBrief Passport is verified and reputation is updated.",
    ],
}


def _extract_slide_text(slide_html: str) -> str:
    """Very basic text extraction from slide HTML for prompts."""
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(slide_html, "html.parser")
    return " ".join(soup.stripped_strings)


def _build_openai_prompt(slides: List[Dict[str, str]], style: str = "crypto_pitch") -> str:
    slide_texts = []
    for i, slide in enumerate(slides):
        text = _extract_slide_text(slide["html"])
        slide_texts.append(f"Slide {i}: {text}")

    prompt = f"""You are a pitch deck narrator for a Web3 hackathon project.
Style: {style}.
Project: ProofPay — Settlement layer for AI agent work on Sui and Walrus.

Generate concise, natural, spoken English narration for each slide. Each narration should be one to three sentences, easy to speak aloud, and highlight the key message of the slide.

Return strictly JSON in this format:
{{"slides": ["narration for slide 0", "narration for slide 1", ...]}}

Slides:
""" + "\n\n".join(slide_texts)
    return prompt


def generate_narration_auto(
    slides: List[Dict[str, str]],
    style: str = "crypto_pitch",
) -> List[str]:
    """Generate narration from slide text. Try OpenAI first, fallback to templates."""
    if OPENAI_API_KEY and OpenAI:
        try:
            client = OpenAI(api_key=OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": _build_openai_prompt(slides, style),
                    }
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )
            content = response.choices[0].message.content
            data = json.loads(content)
            narrations = data.get("slides", [])
            if len(narrations) == len(slides):
                return narrations
        except Exception as e:
            print(f"OpenAI narration failed: {e}. Using template fallback.")
    else:
        print("OpenAI API key not configured. Using template fallback.")

    templates = TEMPLATE_NARRATIONS.get(style, TEMPLATE_NARRATIONS["crypto_pitch"])
    # Extend or trim templates to match slide count
    if len(templates) >= len(slides):
        return templates[: len(slides)]
    # If more slides than templates, pad with generic narration
    result = list(templates)
    while len(result) < len(slides):
        result.append("This slide continues the ProofPay story.")
    return result


def generate_narration_custom(script: str, slides: List[Dict[str, str]]) -> List[str]:
    """Split a custom script into one narration per slide by paragraph count."""
    paragraphs = [p.strip() for p in script.strip().split("\n\n") if p.strip()]
    if len(paragraphs) == len(slides):
        return paragraphs
    # If counts mismatch, reuse last paragraph or combine
    result = []
    for i in range(len(slides)):
        if i < len(paragraphs):
            result.append(paragraphs[i])
        else:
            result.append(paragraphs[-1] if paragraphs else "")
    return result


def generate_narration_notes(slides: List[Dict[str, str]]) -> List[str]:
    """Use speaker notes if embedded in slides (not implemented here)."""
    return ["" for _ in slides]


def generate_narration(
    slides: List[Dict[str, str]],
    mode: str = "auto_from_slide_text",
    style: str = "crypto_pitch",
    custom_script: str = "",
) -> List[str]:
    """Main entry point for narration generation."""
    if mode == "custom_script":
        return generate_narration_custom(custom_script, slides)
    if mode == "speaker_notes":
        return generate_narration_notes(slides)
    return generate_narration_auto(slides, style=style)


if __name__ == "__main__":
    sample_slides = [
        {"html": "<h1>ProofPay</h1><p>Settlement layer for AI agent work.</p>"},
        {"html": "<h2>The Problem</h2><p>AI agents can work, but payment verification is missing.</p>"},
    ]
    for n in generate_narration(sample_slides, style="crypto_pitch"):
        print(n)
