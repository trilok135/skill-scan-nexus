import logging
from supabase import create_client, Client
from config import settings

logger = logging.getLogger(__name__)

_supabase_client: Client = None


def get_supabase() -> Client:
    """Return a singleton Supabase client."""
    global _supabase_client
    if _supabase_client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
        _supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
        logger.info("Supabase client initialised ✓")
    return _supabase_client
