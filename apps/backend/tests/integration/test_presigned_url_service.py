import pytest

from job_agent.models import StoredFile
from job_agent.services.presigned_url_service import PresignedUrlService
import requests
import aiohttp


@pytest.fixture
def presigned_url_service(s3_client, db_session):
    return PresignedUrlService(db_session, s3_client)

@pytest.mark.asyncio
async def test_get_presigned_url(presigned_url_service, s3_client, s3_config, sample_resume):
    # Arrange
    await s3_client.put_object(
        Bucket=s3_config["bucket_name"], Key="test", Body=sample_resume, ContentType="application/pdf"
    )

    file = StoredFile("test", s3_config["bucket_name"], "application/pdf")

    # Act
    presigned_url = await presigned_url_service._generate_presigned_url(file)

    # Assert
    assert presigned_url is not None
    assert "test-bucket/test" in presigned_url
    assert "Signature" in presigned_url

    async with aiohttp.ClientSession() as session:
        async with session.get(presigned_url) as response:
            assert response.status == 200

        no_signature_url = presigned_url.split("?")[0]
        async with session.get(no_signature_url) as response:
            assert response.status == 403