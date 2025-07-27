import asyncio


from job_agent.apply.langchain import BrowserApplicationAgent


async def main():
    agent = BrowserApplicationAgent(headless=False)


if __name__ == "__main__":
    asyncio.run(main())
