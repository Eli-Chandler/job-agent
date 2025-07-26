from abc import ABC, abstractmethod

from job_agent.models import JobListing, Candidate, JobApplication


class ApplicationAgent(ABC):
    @abstractmethod
    async def apply(
        self, job_listing: JobListing, application_profile: Candidate
    ) -> JobApplication:
        pass
