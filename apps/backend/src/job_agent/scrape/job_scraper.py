# from abc import ABC, abstractmethod
# from typing import List
from typing import Optional

from job_agent.models import JobListing
import aiohttp
from datetime import datetime
import logging
import json
import nh3
from markdownify import markdownify as md
import re

import urllib.parse

ALLOWED_URL_SCHEMES = {"http", "https", "mailto", "tel"}


class HiringCafeJobScraper:
    _session: Optional[aiohttp.ClientSession] = None
    # _NEXT_BUILD_ID: str = "Z1keoTDB1W9ibFKAL7z8R"

    async def scrape_job(self, job_id: str) -> JobListing:
        if HiringCafeJobScraper._session is None:
            HiringCafeJobScraper._session = aiohttp.ClientSession()

        next_build_id = await self._get_build_id()

        async with HiringCafeJobScraper._session.get(
            f"https://hiring.cafe/_next/data/{next_build_id}/job/{urllib.parse.quote_plus(job_id)}.json",
            # headers=headers,
        ) as response:
            j = await response.json()

        try:
            data = j["pageProps"]["job"]
            processed_job_data = data["v5_processed_job_data"]

            return JobListing(
                title=processed_job_data["core_job_title"],
                company=processed_job_data["company_name"],
                application_url=data["apply_url"],
                description=self._description_to_markdown(data["job_information"]["description"]),
                source="hiring.cafe",
                posted_at=datetime.fromisoformat(processed_job_data["estimated_publish_date"]),
            )
        except KeyError as e:
            logging.error(f"Response format not as expected\n{json.dumps(j, indent=4)}")
            raise e

    # TODO: Cache this or something
    async def _get_build_id(self):
        """Fetch the latest build ID from the Hiring Cafe homepage."""
        async with HiringCafeJobScraper._session.get(
            "https://hiring.cafe/",
        ) as response:
            text = await response.text()
            match = re.search(r'"buildId":"([^"]+)"', text)
            if match:
                return match.group(1)
            else:
                raise RuntimeError("Build ID not found in response")

    def _description_to_markdown(self, description: str) -> str:
        """Convert HTML description to (sanitised) Markdown format."""
        cleaner = nh3.Cleaner(
            link_rel="noopener noreferrer nofollow",
            url_schemes={"http", "https", "mailto", "tel"},
        )
        clean_description = cleaner.clean(description)
        return md(clean_description)
