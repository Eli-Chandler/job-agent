from io import BytesIO

from PyPDF2 import PdfReader
from openai import OpenAI

from resume_generation.latex import render_latex_resume
from resume_generation.models import ResumeTemplate

client = OpenAI()

def resume_to_schema(resume_text: str) -> ResumeTemplate:
    response = client.responses.parse(
        model="gpt-4.1-2025-04-14",
        input=[
            {"role": "system", "content": "Convert this text representation of a PDF resume to the provided format. Be space efficient, do not unnecessarily break into bullet points."},
            {
                "role": "user",
                "content": resume_text,
            },
        ],
        text_format=ResumeTemplate
    )

    if response.output_parsed is None:
       raise Exception("Failed to extract text from pdf")

    return response.output_parsed


def _extract_text_content_from_pdf(filepath):
        reader = PdfReader(filepath)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text

resume_text = _extract_text_content_from_pdf("./RocketLabResume.pdf")
resume = resume_to_schema(resume_text)

print(resume)

render_latex_resume(resume)
