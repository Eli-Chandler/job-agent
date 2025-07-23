import asyncio
from datetime import datetime

from pydantic import HttpUrl

from job_agent.apply.langchain import BrowserApplicationAgent
from job_agent.models import JobListing, Resume
from job_agent.models.applicant_profile import ApplicantProfile

job_listing = JobListing(
    id="woolworths-27957",
    title="Store Team Member",
    company="Woolworths Supermarkets",
    location="Albany Creek, QLD 4035, Australia",
    is_remote=False,
    url=HttpUrl("https://careers.woolworthsgroup.com.au/en_GB/apply/JobDetail/Store-Team-Member/27957"),
    source="Woolworths Careers",
    description=(
        "Join the Woolworths team at Albany Forest Dr as a Store Team Member. "
        "Your role includes customer service, stocking shelves, online order picking, "
        "and ensuring safety and cleanliness in the store. We value care, teamwork, "
        "flexibility, and customer focus."
    ),
    summary=(
        "Part-time in-store retail role at Woolworths Albany Creek. Work between "
        "Wednesday–Sunday with a mix of morning and evening shifts. Includes team perks, "
        "discounts, and support for growth within Woolworths Group."
    ),
    tags=["Retail", "Customer Service", "Part-time", "Woolworths", "Store Operations"],
    seniority="Entry-level",
    employment_type="Part-time",
    posted_at=datetime(2025, 7, 20),
    notes="Roster Option 1: Wed-Sat 4pm-9pm or Fri-Sun 7am-9pm. "
          "Includes online order picking, stocking, and checkout duties."
)

applicant_profile = ApplicantProfile(
    full_name="Mohammed Wang",
    email="mwang@gmail.com",
    phone="+61 412 345 678",
    location="Auckland, New Zealand",
    resumes=[
        Resume(
            id="resume-12345",
            name="Mohammed Wang's Resume",
            file_path="./resumes/resume-sample.pdf",
        )
    ]
)

async def main():
    agent = BrowserApplicationAgent(headless=False)

    application = await agent.apply(
        job_listing=job_listing,
        applicant_profile=applicant_profile
    )

if __name__ == "__main__":
    asyncio.run(main())