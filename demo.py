import asyncio
from datetime import datetime

from pydantic import HttpUrl

from job_agent.apply.langchain import BrowserApplicationAgent
from job_agent.models import JobListing, Resume, Candidate


async def main():
    agent = BrowserApplicationAgent(headless=False)


if __name__ == "__main__":
    asyncio.run(main())
