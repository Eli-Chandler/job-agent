from PyPDF2 import PdfReader
from browser_use import Agent
from browser_use.controller.service import Controller
from browser_use.llm import ChatOpenAI
from pydantic import BaseModel

from job_agent.apply.application_agent import ApplicationAgent
from job_agent.models import JobListing, Candidate, JobApplication, Resume


class ApplicationAgentResult(BaseModel):
    notes: str
    success: bool


class BrowserApplicationAgent(ApplicationAgent):
    def __init__(self, model: str = "gpt-4.1", headless: bool = True):
        self.model = model
        self.headless = headless

    async def apply(
        self, job_listing: JobListing, applicant_profile: Candidate
    ) -> JobApplication:
        controller = Controller(output_model=ApplicationAgentResult)
        resume_text = _convert_resume_to_text(applicant_profile.resumes[0])
        llm = ChatOpenAI(model=self.model)

        task = f"""
        Apply to the job listed below using the provided applicant profile and resume text. Follow these steps:
        1. Navigate to the job application URL: {job_listing.application_url}
        2. Use the applicant’s real name ({applicant_profile.full_name}) and email ({applicant_profile.email}) when filling out forms.
        3. Fill out all required fields in the application form, using information from the applicant profile and resume text provided below.
        4. Tailor answers to align with the job description ({job_listing.description}) where possible, emphasizing relevant skills and experiences from the resume.
        5. Upload the resume file at {applicant_profile.resumes[0].file_path} if the application requires a file upload. Fill other information according to the applicant profile and resume text.
        6. If a cover letter is required, generate a concise cover letter based on the job description and the resume text, highlighting why the applicant is a good fit.
        7. Handle any login prompts by skipping them if possible or notifying the user if credentials are required.
        8. If any issues arise (e.g., missing fields, file format errors), attempt to resolve them or skip optional fields and proceed.
        9. Submit the application and confirm submission status.

        Job Listing: {job_listing}
        Applicant Profile: {applicant_profile}
        Resume Text: {resume_text}

        Return a summary of the actions taken and if you successfully applied for the job.
        """

        agent = Agent(
            task=task,
            llm=llm,
            available_file_paths=[applicant_profile.resumes[0].file_path],
        )
        history = await agent.run()
        result: ApplicationAgentResult = history.final_result()

        return JobApplication(
            id=123,
            job_listing_id=job_listing.id,
            resume=applicant_profile.resumes[0],
            cover_letter=None,  # Assuming no cover letter is provided
            notes=result.notes,
        )


def _convert_resume_to_text(resume: Resume) -> str:
    reader = PdfReader(resume.file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text
