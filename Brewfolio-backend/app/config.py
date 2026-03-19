from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str
    gemini_api_key: str
    openrouter_api_key: str
    groq_api_key: str = ""
    github_token: str = ""
    upstash_redis_rest_url: str
    upstash_redis_rest_token: str
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    jwt_secret: str
    cf_account_id: str = ""
    cf_r2_bucket: str = "brewfolio-portfolios"
    cf_r2_access_key: str = ""
    cf_r2_secret_key: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
