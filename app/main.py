# =========================
# IMPORTS
# =========================
from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

import os
import uuid
import smtplib
import httpx

from email.mime.text import MIMEText
from datetime import datetime, timedelta

from passlib.context import CryptContext

from .db import Base, engine, SessionLocal
from .models import User
from .models_account import Account
from .models_account_user import AccountUser
from .models_invitation import Invitation

# =========================
# APP
# =========================
app = FastAPI()

FRONTEND_URL = "http://localhost:3000"

# =========================
# MIDDLEWARE
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key="your-secret-key",
    same_site="lax"
)

# =========================
# DATABASE
# =========================
Base.metadata.create_all(bind=engine)

# =========================
# PASSWORD (NEW ✅)
# =========================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p):
    return pwd_context.hash(p)

def verify_password(p, h):
    return pwd_context.verify(p, h)

# =========================
# HELPERS
# =========================
def get_user(db, email):
    return db.query(User).filter_by(email=email).first()

def get_link(db, user_id):
    return db.query(AccountUser).filter_by(user_id=user_id).first()

def is_owner(db, email):
    user = get_user(db, email)
    if not user:
        return False
    link = get_link(db, user.id)
    return link and link.role == "OWNER"

# =========================
# EMAIL
# =========================
def send_email(to_email, subject, html):

    sender = os.getenv("EMAIL_USER")
    password = os.getenv("EMAIL_PASS")

    msg = MIMEText(html, "html")
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to_email

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender, password)
        server.send_message(msg)
        server.quit()
    except Exception as e:
        print("Email error:", e)

# =========================
# AUTH (EMAIL/PASSWORD ✅)
# =========================
@app.post("/api/register")
def register(request: Request, email: str = Form(...), password: str = Form(...)):

    db = SessionLocal()

    if get_user(db, email):
        return {"error": "User exists"}

    user = User(email=email, password=hash_password(password))
    db.add(user)
    db.commit()
    db.refresh(user)

    # create account
    acc = Account(name="Default Account")
    db.add(acc)
    db.commit()
    db.refresh(acc)

    db.add(AccountUser(
        user_id=user.id,
        account_id=acc.id,
        role="OWNER"
    ))
    db.commit()

    request.session["user"] = email

    return {"success": True}

@app.post("/api/login")
def login(request: Request, email: str = Form(...), password: str = Form(...)):

    db = SessionLocal()
    user = get_user(db, email)

    if not user or not user.password:
        return {"error": "Invalid credentials"}

    if not verify_password(password, user.password):
        return {"error": "Invalid credentials"}

    request.session["user"] = email
    return {"success": True}

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return {"success": True}

# =========================
# PASSWORD RESET ✅
# =========================
@app.post("/api/request-reset")
def request_reset(email: str = Form(...)):

    db = SessionLocal()
    user = get_user(db, email)

    if user:
        token = str(uuid.uuid4())
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()

        link = f"{FRONTEND_URL}/reset?token={token}"

        send_email(
            email,
            "Reset Password",
            f"<a href='{link}'>Reset Password</a>"
        )

    return {"success": True}

@app.post("/api/reset-password")
def reset_password(token: str = Form(...), password: str = Form(...)):

    db = SessionLocal()
    user = db.query(User).filter_by(reset_token=token).first()

    if not user:
        return {"error": "Invalid token"}

    if user.reset_token_expiry < datetime.utcnow():
        return {"error": "Expired token"}

    user.password = hash_password(password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"success": True}

# =========================
# GOOGLE AUTH ✅ FIXED
# =========================
@app.get("/login/google")
def login_google():
    return RedirectResponse(
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={os.getenv('GOOGLE_CLIENT_ID')}"
        f"&redirect_uri=http://localhost:8000/auth/google"
        f"&response_type=code"
        f"&scope=openid%20email"
        f"&prompt=select_account"
    )

@app.get("/auth/google")
async def auth_google(request: Request):

    code = request.query_params.get("code")

    async with httpx.AsyncClient() as client:
        token_res = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uri": "http://localhost:8000/auth/google",
                "grant_type": "authorization_code",
            }
        )

    access_token = token_res.json().get("access_token")

    async with httpx.AsyncClient() as client:
        res = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )

    email = res.json().get("email")

    return login_or_create_user(email, request)

# =========================
# SHARED LOGIN
# =========================
def login_or_create_user(email, request: Request):

    db = SessionLocal()

    user = get_user(db, email)

    if not user:
        user = User(email=email)
        db.add(user)
        db.commit()
        db.refresh(user)

        acc = Account(name="Default Account")
        db.add(acc)
        db.commit()
        db.refresh(acc)

        db.add(AccountUser(
            user_id=user.id,
            account_id=acc.id,
            role="OWNER"
        ))
        db.commit()

    request.session["user"] = email

    return RedirectResponse(FRONTEND_URL)

# =========================
# INVITE SYSTEM
# =========================
@app.post("/api/invite")
def invite(request: Request, email: str = Form(...), role: str = Form(...)):

    db = SessionLocal()
    current = request.session.get("user")

    if not is_owner(db, current):
        return {"error": "Not authorized"}

    admin = get_user(db, current)
    link = get_link(db, admin.id)

    token = str(uuid.uuid4())

    inv = Invitation(
        email=email,
        token=token,
        account_id=link.account_id,
        role=role,
        status="PENDING",
        expires_at=datetime.utcnow() + timedelta(hours=1)
    )

    db.add(inv)
    db.commit()

    send_email(
        email,
        "You're invited",
        f"<a href='{FRONTEND_URL}/accept?token={token}'>Accept Invite</a>"
    )

    return {"success": True}

# =========================
# INVITE INFO
# =========================
@app.get("/api/invite-info")
def invite_info(token: str):

    db = SessionLocal()

    invite = db.query(Invitation).filter_by(token=token).first()

    if not invite:
        return {"error": "Invalid invite"}

    if invite.expires_at < datetime.utcnow():
        return {"error": "Invite expired"}

    return {
        "email": invite.email,
        "role": invite.role
    }

# =========================
# ACCEPT INVITE
# =========================
@app.post("/api/accept-invite")
def accept(request: Request, token: str = Form(...)):

    db = SessionLocal()
    email = request.session.get("user")

    if not email:
        return {"error": "Not logged"}

    invite = db.query(Invitation).filter_by(token=token).first()

    if not invite:
        return {"error": "Invalid invite"}

    if email.lower() != invite.email.lower():
        return {"error": "Wrong account"}

    user = get_user(db, email)

    if not db.query(AccountUser).filter_by(
        user_id=user.id,
        account_id=invite.account_id
    ).first():
        db.add(AccountUser(
            user_id=user.id,
            account_id=invite.account_id,
            role=invite.role
        ))

    invite.status = "ACCEPTED"
    db.commit()

    return {"success": True}

# =========================
# REVOKE INVITE
# =========================
@app.post("/api/revoke-invite")
def revoke(invite_id: int = Form(...)):

    db = SessionLocal()

    inv = db.query(Invitation).filter_by(id=invite_id).first()

    if inv:
        db.delete(inv)
        db.commit()

    return {"success": True}

# =========================
# DASHBOARD
# =========================
@app.get("/api/dashboard")
def dashboard(request: Request):

    email = request.session.get("user")

    if not email:
        return {"error": "Not authenticated"}

    db = SessionLocal()

    user = get_user(db, email)
    link = get_link(db, user.id)

    invites = db.query(Invitation).filter(
        Invitation.account_id == link.account_id
    ).all()

    return {
        "user_email": email,
        "invites": [
            {
                "id": i.id,
                "email": i.email,
                "role": i.role,
                "status": i.status,
                "expires_at": i.expires_at.isoformat() + "Z"
            }
            for i in invites
        ]
    }