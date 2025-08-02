from typing import Any

from jinja2 import Environment, FileSystemLoader
from pydantic import BaseModel

from resume_generation.models import resume
import re

env = Environment(
    variable_start_string='(((',
    variable_end_string=')))',
    block_start_string='((*',
    block_end_string='*))',
    comment_start_string='((#',
    comment_end_string='#))',
    loader=FileSystemLoader(".")
)
template = env.get_template("resume_template.tex.j2")

LATEX_SPECIAL_CHARS = {
    "&": r"\&",
    "%": r"\%",
    "$": r"\$",
    "#": r"\#",
    "_": r"\_",
    "{": r"\{",
    "}": r"\}",
    "~": r"\textasciitilde{}",
    "^": r"\textasciicircum{}",
    "\\": r"\textbackslash{}",
}

def latex_escape(text: str) -> str:
    return re.sub(
        r"([&%$#_{}~^\\])", lambda m: LATEX_SPECIAL_CHARS[m.group()], text
    )

def escape_latex_in_model(obj: Any) -> Any:
    if isinstance(obj, str):
        return latex_escape(obj)
    elif isinstance(obj, list):
        return [escape_latex_in_model(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: escape_latex_in_model(value) for key, value in obj.items()}
    elif isinstance(obj, BaseModel):
        updated = {
            field: escape_latex_in_model(getattr(obj, field))
            for field in obj.__class__.model_fields
        }
        return obj.__class__(**updated)
    else:
        return obj  # includes None, int, datetime, etc.

with open("generated_resume.tex", "w") as f:
    f.write(template.render(resume=escape_latex_in_model(resume)))
