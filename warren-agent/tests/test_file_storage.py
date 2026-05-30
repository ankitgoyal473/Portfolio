import os
from unittest.mock import patch, MagicMock


def _reset_client():
    import tools.file_storage as m
    m._client = None


ENV = {
    "SUPABASE_URL": "https://test.supabase.co",
    "SUPABASE_SERVICE_ROLE_KEY": "test-key",
}


def test_save_research_file_returns_url():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.upload.return_value = {}
            storage.from_.return_value.create_signed_url.return_value = {
                "signedURL": "https://test.supabase.co/storage/v1/object/sign/warren-research/u/R/20260531/technical.md?token=abc"
            }
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import save_research_file
            result = save_research_file(
                user_id="u", symbol="RELIANCE",
                filename="technical.md", content="# Tech\n..."
            )

    assert "supabase" in result or "signedURL" in result or "token" in result


def test_save_calls_upload_with_correct_path():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.create_signed_url.return_value = {"signedURL": "http://x"}
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import save_research_file
            save_research_file("user1", "INFY", "summary.md", "content")

            upload_call = storage.from_.return_value.upload.call_args
            path_arg = upload_call[1].get("path") or upload_call[0][0]
            assert "user1" in path_arg
            assert "INFY" in path_arg
            assert "summary.md" in path_arg


def test_get_existing_context_empty_when_no_files():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.list.return_value = []
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import get_existing_context
            result = get_existing_context("user1", "NEWSTOCK")

    assert result == ""


def test_get_existing_context_loads_most_recent():
    with patch.dict(os.environ, ENV):
        with patch("tools.file_storage.create_client") as mock_create:
            storage = MagicMock()
            storage.from_.return_value.list.return_value = [
                {"name": "20260520"}, {"name": "20260531"}
            ]
            storage.from_.return_value.download.return_value = b"# Summary content"
            mock_create.return_value.storage = storage
            _reset_client()

            from tools.file_storage import get_existing_context
            result = get_existing_context("user1", "RELIANCE")

    assert "Summary content" in result
