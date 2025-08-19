from fastapi import HTTPException

from job_agent.services.exceptions import EntityWithIdNotFoundException


class ProfileConflictException(HTTPException):
    def __init__(self, candidate_id: int):
        super().__init__(
            status_code=409,
            detail=f"Profile for candidate with id {candidate_id} already exists. Please update the existing profile instead.",
        )


class ProfileNotFoundForCandidateException(HTTPException):
    def __init__(self, candidate_id: int):
        message = f"Profile for candidate with id {candidate_id} not found."
        super().__init__(status_code=404, detail=message)
        self.candidate_id = candidate_id


class ProfileExperienceNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, experience_id: int):
        super().__init__("Experience", experience_id)


class ProfileEducationNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, education_id: int):
        super().__init__("Education", education_id)


class ProfileProjectNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, project_id: int):
        super().__init__("Project", project_id)


class ProfileSkillNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, skill_id: int):
        super().__init__("Skill", skill_id)


class ProfileCertificationNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, certification_id: int):
        super().__init__("Certification", certification_id)


class ProfileLinkNotFoundException(EntityWithIdNotFoundException):
    def __init__(self, link_id: int):
        super().__init__("Link", link_id)
