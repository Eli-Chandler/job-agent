from pydantic import BaseModel


class Resume(BaseModel):
    id: str
    name: str
    file_path: str

class CoverLetter(BaseModel):
    id: str
    name: str
    file_path: str
