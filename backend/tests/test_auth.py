import pytest
from fastapi.testclient import TestClient
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.main import app

client = TestClient(app)

def test_password_hashing():
    pwd = "CyberShieldSecret2026!"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_generation_and_decoding():
    data = {"sub": "analyst1", "role": "analyst"}
    token = create_access_token(data)
    payload = decode_access_token(token)
    assert payload["sub"] == "analyst1"
    assert payload["role"] == "analyst"

def test_user_registration_and_login_flow():
    # 1. Register new user
    username = "soc_admin_test"
    reg_payload = {
        "username": username,
        "email": "admin_test@cybershield.local",
        "password": "Password123!",
        "role": "admin"
    }
    res_reg = client.post("/api/v1/auth/register", json=reg_payload)
    assert res_reg.status_code in [200, 400] # 400 if already created in rerun
    
    # 2. Login
    login_payload = {
        "username": username,
        "password": "Password123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    data = res_login.json()
    assert "access_token" in data
    token = data["access_token"]
    
    # 3. Read profile /me
    headers = {"Authorization": f"Bearer {token}"}
    res_me = client.get("/api/v1/auth/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["username"] == username
