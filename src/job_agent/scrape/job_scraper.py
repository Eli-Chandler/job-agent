from abc import ABC, abstractmethod
from typing import List
from job_agent.models import JobListing

class JobScraper(ABC):
    @abstractmethod
    def scrape(self, someargs) -> List[JobListing]:
        pass
