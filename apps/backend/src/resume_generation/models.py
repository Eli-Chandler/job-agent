from datetime import datetime

from pydantic import BaseModel, HttpUrl
import re



class Resume(BaseModel):
    sections: list['ResumeSection']
    personal_information: 'ResumePersonalInformation'
    links: list['ResumeLink']

class ResumePersonalInformation(BaseModel):
    first_name: str
    last_name: str
    phone_number: str | None = None
    email: str | None = None

class ResumeLink(BaseModel):
    name: str
    link: HttpUrl

class ResumeSection(BaseModel):
    title: str
    entries: list['ResumeEntry']

class ResumeEntry(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    location: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    bullet_points: list[str]

resume = Resume(
    personal_information=ResumePersonalInformation(
        first_name="Jake",
        last_name="Ryan",
        phone_number="123-456-7890-test",
        email="jake@su.edu"
    ),
    links=[
        ResumeLink(name="LinkedIn", link=HttpUrl("https://linkedin.com/in/jake")),
        ResumeLink(name="GitHub", link=HttpUrl("https://github.com/jake"))
    ],
    sections=[
        ResumeSection(
            title="Education",
            entries=[
                ResumeEntry(
                    title="Bachelor of Arts in Computer Science, Minor in Business",
                    subtitle="Southwestern University",
                    location="Georgetown, TX",
                    start_date=datetime(2018, 8, 1),
                    end_date=datetime(2021, 5, 1),
                    bullet_points=[]
                ),
                ResumeEntry(
                    title="Associate’s in Liberal Arts",
                    subtitle="Blinn College",
                    location="Bryan, TX",
                    start_date=datetime(2014, 8, 1),
                    end_date=datetime(2018, 5, 1),
                    bullet_points=[]
                )
            ]
        ),
        ResumeSection(
            title="Experience",
            entries=[
                ResumeEntry(
                    title="Undergraduate Research Assistant",
                    subtitle="Texas A&M University",
                    location="College Station, TX",
                    start_date=datetime(2020, 6, 1),
                    end_date=None,
                    bullet_points=[
                        "Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems",
                        "Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data",
                        "Explored ways to visualize GitHub collaboration in a classroom setting"
                    ]
                ),
                ResumeEntry(
                    title="Information Technology Support Specialist",
                    subtitle="Southwestern University",
                    location="Georgetown, TX",
                    start_date=datetime(2018, 9, 1),
                    end_date=None,
                    bullet_points=[
                        "Communicate with managers to set up campus computers used on campus",
                        "Assess and troubleshoot computer problems brought by students, faculty and staff",
                        "Maintain upkeep of computers, classroom equipment, and 200 printers across campus"
                    ]
                ),
                ResumeEntry(
                    title="Artificial Intelligence Research Assistant",
                    subtitle="Southwestern University",
                    location="Georgetown, TX",
                    start_date=datetime(2019, 5, 1),
                    end_date=datetime(2019, 7, 1),
                    bullet_points=[
                        "Explored methods to generate video game dungeons based off of The Legend of Zelda",
                        "Developed a game in Java to test the generated dungeons",
                        "Contributed 50K+ lines of code to an established codebase via Git",
                        "Conducted a human subject study to determine which video game dungeon generation technique is enjoyable",
                        "Wrote an 8-page paper and gave multiple presentations on-campus",
                        "Presented virtually to the World Conference on Computational Intelligence"
                    ]
                )
            ]
        ),
        ResumeSection(
            title="Projects",
            entries=[
                ResumeEntry(
                    title="Gitlytics",
                    subtitle=None,
                    location=None,
                    start_date=datetime(2020, 6, 1),
                    end_date=None,
                    bullet_points=[
                        "Developed a full-stack web application using with Flask serving a REST API with React as the frontend",
                        "Implemented GitHub OAuth to get data from user’s repositories",
                        "Visualized GitHub data to show collaboration",
                        "Used Celery and Redis for asynchronous tasks"
                    ]
                ),
                ResumeEntry(
                    title="Simple Paintball",
                    subtitle=None,
                    location=None,
                    start_date=datetime(2018, 5, 1),
                    end_date=datetime(2020, 5, 1),
                    bullet_points=[
                        "Developed a Minecraft server plugin to entertain kids during free time for a previous job",
                        "Published plugin to websites gaining 2K+ downloads and an average 4.5/5-star review",
                        "Implemented continuous delivery using TravisCI to build the plugin upon new a release",
                        "Collaborated with Minecraft server administrators to suggest features and get feedback about the plugin"
                    ]
                )
            ]
        ),
        ResumeSection(
            title="Technical Skills",
            entries=[
                ResumeEntry(
                    bullet_points=[
                        "Languages: Java, Python, C/C++, SQL (Postgres), JavaScript, HTML/CSS, R",
                        "Frameworks: React, Node.js, Flask, JUnit, WordPress, Material-UI, FastAPI",
                        "Developer Tools: Git, Docker, TravisCI, Google Cloud Platform, VS Code, Visual Studio, PyCharm, IntelliJ, Eclipse",
                        "Libraries: pandas, NumPy, Matplotlib"
                    ]
                )
            ]
        )
    ]
)