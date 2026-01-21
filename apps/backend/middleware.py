# backend/middleware.py
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from models import User
from sqlmodel import select
import os
from typing import Optional
from datetime import datetime

# JWT configuration - should match the secret used by Better Auth
SECRET_KEY = os.getenv("BETTER_AUTH_JWT_SECRET", "fallback-secret-for-dev")
ALGORITHM = "HS256"

# Import database engine to access user data
from database import engine

security = HTTPBearer()

class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)

        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid authentication scheme."
                )
            token = credentials.credentials
            user_id = self.verify_jwt(token)
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token or expired token."
                )

            # Store user ID in request state
            request.state.user_id = user_id
            return credentials.credentials
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid authorization code."
            )

    def verify_jwt(self, jwtoken: str) -> Optional[str]:
        try:
            payload = jwt.decode(jwtoken, SECRET_KEY, algorithms=[ALGORITHM])
            # For Better Auth, the user ID is typically in the 'sub' field
            user_id = payload.get('sub')
            return user_id
        except JWTError:
            return None

def get_current_user_id(request: Request) -> str:
    return getattr(request.state, 'user_id', None)

async def jwt_middleware(request: Request, call_next):
    # Extract token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        response = await call_next(request)
        return response

    token = auth_header.split(" ")[1]

    # Verify the JWT token
    user_id = verify_jwt_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or expired token."
        )

    # Store user_id in request state
    request.state.user_id = user_id

    response = await call_next(request)
    return response


def verify_jwt_token(jwtoken: str) -> Optional[str]:
    try:
        payload = jwt.decode(jwtoken, SECRET_KEY, algorithms=[ALGORITHM])
        # For Better Auth, the user ID is typically in the 'sub' field
        user_id = payload.get('sub')
        return user_id
    except JWTError:
        return None