import pytest
from pydantic import EmailStr, HttpUrl

from job_agent.services.candidate_service import (
    CandidateService,
    CreateCandidateRequest,
    CandidateLoginRequest,
    AddOrUpdateSocialRequest,
)
from job_agent.models import Candidate, CandidateSocialLink
from job_agent.services.exceptions import (
    CandidateNotFoundException,
    WrongCredentialsException,
    CandidateEmailTakenException,
    SocialLinkNotFoundException,
)

from job_agent.services.candidate_service import _hash_password

@pytest.mark.asyncio
async def test_create_user__should_work__when_email_not_taken(db_session):
    # Arrange
    service = CandidateService(db_session)
    request = CreateCandidateRequest(
        first_name="Jane",
        last_name="Doe",
        phone="1234567890",
        email="jane@example.com",
        password="securepassword"
    )

    # Act
    dto = await service.create_user(request)

    # Assert
    assert dto is not None
    assert dto.email == request.email

    db_candidate = await db_session.get(Candidate, dto.id)
    assert db_candidate is not None
    assert db_candidate.first_name == "Jane"
    assert db_candidate.email == "jane@example.com"


@pytest.mark.asyncio
async def test_create_user__should_raise__when_email_taken(db_session):
    # Arrange
    service = CandidateService(db_session)
    existing = Candidate(
        first_name="John",
        last_name="Smith",
        phone="0000000000",
        email="john@example.com",
        hashed_password="hashed"
    )
    db_session.add(existing)
    await db_session.commit()

    request = CreateCandidateRequest(
        first_name="John",
        last_name="Smith",
        phone="0000000000",
        email="john@example.com",
        password="password"
    )

    # Act & Assert
    with pytest.raises(CandidateEmailTakenException):
        await service.create_user(request)


@pytest.mark.asyncio
async def test_get_user_by_email_and_password__should_work(db_session):
    # Arrange
    hashed = _hash_password("password123")
    candidate = Candidate(
        first_name="Alice",
        last_name="Wong",
        phone="555-0101",
        email="alice@example.com",
        hashed_password=hashed
    )
    db_session.add(candidate)
    await db_session.commit()

    service = CandidateService(db_session)
    request = CandidateLoginRequest(email="alice@example.com", password="password123")

    # Act
    dto = await service.get_user_by_email_and_password(request)

    # Assert
    assert dto is not None
    assert dto.id == candidate.id
    assert dto.email == "alice@example.com"


@pytest.mark.asyncio
async def test_get_user_by_email_and_password__should_raise__when_email_not_found(db_session):
    # Arrange
    service = CandidateService(db_session)

    # Act & Assert
    with pytest.raises(CandidateNotFoundException):
        await service.get_user_by_email_and_password(
            CandidateLoginRequest(email="nobody@example.com", password="anything")
        )


@pytest.mark.asyncio
async def test_get_user_by_email_and_password__should_raise__when_password_wrong(db_session):
    # Arrange
    from job_agent.services.candidate_service import _hash_password
    candidate = Candidate(
        first_name="Wrong",
        last_name="Pass",
        phone="1231231234",
        email="wrongpass@example.com",
        hashed_password=_hash_password("rightpassword")
    )
    db_session.add(candidate)
    await db_session.commit()

    service = CandidateService(db_session)

    # Act & Assert
    with pytest.raises(WrongCredentialsException):
        await service.get_user_by_email_and_password(
            CandidateLoginRequest(email="wrongpass@example.com", password="wrongpassword")
        )


@pytest.mark.asyncio
async def test_get_candidate_by_id__should_work(db_session):
    # Arrange
    candidate = Candidate(
        first_name="Emily",
        last_name="Chan",
        phone="1234567890",
        email="emily@example.com",
        hashed_password="irrelevant"
    )
    db_session.add(candidate)
    await db_session.commit()

    service = CandidateService(db_session)

    # Act
    dto = await service.get_candidate_by_id(candidate.id)

    # Assert
    assert dto.id == candidate.id


@pytest.mark.asyncio
async def test_get_candidate_by_id__should_raise__when_not_found(db_session):
    # Arrange
    service = CandidateService(db_session)

    # Act & Assert
    with pytest.raises(CandidateNotFoundException):
        await service.get_candidate_by_id(999999)


@pytest.mark.asyncio
async def test_add_or_update_social_link__should_add_when_not_exists(db_session):
    # Arrange
    candidate = Candidate(
        first_name="Anna",
        last_name="Taylor",
        phone="9999999999",
        email="anna@example.com",
        hashed_password="irrelevant"
    )
    db_session.add(candidate)
    await db_session.commit()

    service = CandidateService(db_session)
    request = AddOrUpdateSocialRequest(name="LinkedIn", link=HttpUrl("https://linkedin.com/in/anna"))

    # Act
    dto = await service.add_or_update_social_link(candidate.id, request)

    # Assert
    assert dto.name == "LinkedIn"
    assert dto.link == "https://linkedin.com/in/anna"

    query = await db_session.execute(
        CandidateSocialLink.__table__.select().where(CandidateSocialLink.candidate_id == candidate.id)
    )
    socials = query.fetchall()
    assert any(s.name == "LinkedIn" for s in socials)


@pytest.mark.asyncio
async def test_add_or_update_social_link__should_update_when_exists(db_session):
    # Arrange
    candidate = Candidate(
        first_name="Liam",
        last_name="Wright",
        phone="1010101010",
        email="liam@example.com",
        hashed_password="irrelevant"
    )
    social = CandidateSocialLink(name="GitHub", link="https://github.com/old", candidate=candidate)
    db_session.add(candidate)
    db_session.add(social)
    await db_session.commit()

    service = CandidateService(db_session)
    request = AddOrUpdateSocialRequest(name="GitHub", link="https://github.com/new")

    # Act
    dto = await service.add_or_update_social_link(candidate.id, request)

    # Assert
    assert dto.name == "GitHub"
    assert dto.link == "https://github.com/new"

    updated = await db_session.get(CandidateSocialLink, dto.id)
    assert updated.link == "https://github.com/new"


@pytest.mark.asyncio
async def test_add_or_update_social_link__should_raise__when_candidate_not_found(db_session):
    # Arrange
    service = CandidateService(db_session)
    request = AddOrUpdateSocialRequest(name="LinkedIn", link=HttpUrl("https://linkedin.com"))

    # Act & Assert
    with pytest.raises(CandidateNotFoundException):
        await service.add_or_update_social_link(12345, request)


@pytest.mark.asyncio
async def test_delete_social_link__should_work__when_exists(db_session):
    # Arrange
    candidate = Candidate(
        first_name="Eli",
        last_name="Fox",
        phone="1111111111",
        email="eli@example.com",
        hashed_password="irrelevant"
    )
    social = CandidateSocialLink(name="Twitter", link="https://twitter.com/eli", candidate=candidate)
    db_session.add(candidate)
    db_session.add(social)
    await db_session.commit()

    service = CandidateService(db_session)

    # Act
    await service.delete_social_link(candidate.id, social.id)

    # Assert
    deleted = await db_session.get(CandidateSocialLink, social.id)
    assert deleted is None


@pytest.mark.asyncio
async def test_delete_social_link__should_raise__when_not_found(db_session):
    # Arrange
    service = CandidateService(db_session)

    # Act & Assert
    with pytest.raises(SocialLinkNotFoundException):
        await service.delete_social_link(1234, 5678)