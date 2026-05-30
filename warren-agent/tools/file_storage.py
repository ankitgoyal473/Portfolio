import os
from datetime import datetime
from supabase import create_client, Client
from strands import tool

_client: Client | None = None
BUCKET = "warren-research"


def _get_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            os.environ["SUPABASE_URL"],
            os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        )
    return _client


@tool
def save_research_file(user_id: str, symbol: str, filename: str, content: str) -> str:
    """
    Saves a markdown research file to Supabase Storage under warren-research bucket.
    Path: {user_id}/{symbol}/{YYYYMMDD}/{filename}
    Returns a signed URL valid for 24 hours.
    """
    client = _get_client()
    date_str = datetime.now().strftime("%Y%m%d")
    path = f"{user_id}/{symbol}/{date_str}/{filename}"

    client.storage.from_(BUCKET).upload(
        path=path,
        file=content.encode("utf-8"),
        file_options={"content-type": "text/markdown", "upsert": "true"},
    )

    signed = client.storage.from_(BUCKET).create_signed_url(path, expires_in=86400)
    return signed.get("signedURL", "")


def get_existing_context(user_id: str, symbol: str) -> str:
    """
    Loads the most recent summary.md and decision_log.md for this symbol.
    Returns empty string when no prior analysis exists.
    """
    client = _get_client()
    try:
        folders = client.storage.from_(BUCKET).list(f"{user_id}/{symbol}")
        if not folders:
            return ""
        dates = sorted(
            [f["name"] for f in folders if f["name"].isdigit()], reverse=True
        )
        if not dates:
            return ""

        parts = []
        for fname in ("summary.md", "decision_log.md"):
            path = f"{user_id}/{symbol}/{dates[0]}/{fname}"
            try:
                data = client.storage.from_(BUCKET).download(path)
                parts.append(f"=== Prior {fname} ===\n{data.decode('utf-8')}")
            except Exception:
                pass
        return "\n\n".join(parts)
    except Exception:
        return ""
