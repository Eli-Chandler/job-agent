# from abc import ABC, abstractmethod
# from typing import List
from typing import Optional

from job_agent.models import JobListing
import aiohttp
from datetime import datetime
import logging
import json

# class JobScraper(ABC):
#     @abstractmethod
#     def scrape(self, someargs) -> List[JobListing]:
#         pass

class HiringCafeJobScraper:
    _session: Optional[aiohttp.ClientSession] = None
    _NEXT_BUILD_ID: str = 'Z1keoTDB1W9ibFKAL7z8R'

    async def scrape_job(self, job_id: str) -> JobListing:
        if self._session is None:
            HiringCafeJobScraper._session = aiohttp.ClientSession()

        async with self._session.get(
            f'https://hiring.cafe/_next/data/{self._NEXT_BUILD_ID}/job/{job_id}%3D%3D.json',
            # headers=headers,
        ) as response:
            j = await response.json()

        try:
            data = j['pageProps']['job']
            processed_job_data = data['v5_processed_job_data']

            return JobListing(
                id=job_id,
                title=processed_job_data['core_job_title'],
                company=processed_job_data['company_name'],
                location=processed_job_data['formatted_workplace_location'],
                application_url=data['apply_url'],
                source="hiring.cafe",
                description=data['job_information']['description'],
                posted_at=datetime.fromisoformat(processed_job_data['estimated_publish_date']),
            )
        except KeyError as e:
            logging.error(f'Response format not as expected\n{json.dumps(j, indent=4)}')
            raise e