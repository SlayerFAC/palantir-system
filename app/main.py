from fastapi import FastAPI, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth

import os
import uuid
from datetime import datetime, timedelta

from .db import Base, engine, SessionLocal
from .models import User
from .models_account import Account
from .models_account_user import AccountUser
from .models_invitation import Invitation
from .models_log import ActivityLog


# ======================
# APP SETUP
# ======================

app = FastAPI()
app.add_middleware(SessionMiddleware, secret_key="your-secret-key")

templates = Jinja2Templates(directory="app/templates")
Base.metadata.create_all(bind=engine)


# ======================
# HELPERS
# ======================

def get_user_role(db, email):
    user = db.query(User).filter_by(email=email).first()
    if not user:
        return None

    link = db.query(AccountUser).filter_by(user_id=user.id).first()
    return link.role if link else None


def is_owner(db, email):
    return get_user_role(db, email) == "OWNER"


def log_action(db, actor, action, target):
    db.add(ActivityLog(
        actor=actor,
        action=action,
        target=target
    ))
    db.commit()


# ======================
# OAUTH
# ======================

oauth = OAuth()

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)


# ======================
# HOME
# ======================

@app.get("/", response_class=HTMLResponse)
def home(request: Request):

    user_email = request.session.get("user")

    if not user_email:
        return HTMLResponse('<h1>Palantir</h1><a href="/login">Login with Google</a>')

    db = SessionLocal()

    try:
        # ✅ FIX: handle session/db mismatch
        user = db.query(User).filter_by(email=user_email).first()
        if not user:
            request.session.clear()
            return RedirectResponse("/login", status_code=303)

        account_link = db.query(AccountUser).filter_by(user_id=user.id).first()
        if not account_link:
            return HTMLResponse("No account linked")

        account = db.query(Account).filter_by(id=account_link.account_id).first()

        users = db.query(User).all()
        invites = db.query(Invitation).all()
        logs = db.query(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(20).all()

        users_with_roles = []
        for u in users:
            link = db.query(AccountUser).filter_by(user_id=u.id).first()
            role = link.role if link else "VIEWER"

            users_with_roles.append({
                "id": u.id,
                "email": u.email,
                "role": role
            })

        return templates.TemplateResponse(
            request=request,
            name="dashboard.html",
            context={
                "users": users_with_roles,
                "invites": invites,
                "logs": logs,
                "account": account,
                "user_email": user_email,
                "current_role": get_user_role(db, user_email)
            }
        )

    finally:
        db.close()


# ======================
# LOGIN
# ======================

@app.get("/login")
async def login(request: Request):
    return await oauth.google.authorize_redirect(request, request.url_for("auth"))


@app.get("/auth")
async def auth(request: Request):

    try:
        token = await oauth.google.authorize_access_token(request)

        resp = await oauth.google.get(
            "https://openidconnect.googleapis.com/v1/userinfo",
            token=token
        )

        email = resp.json().get("email")

        db = SessionLocal()

        try:
            user = db.query(User).filter_by(email=email).first()

            if not user:
                user = User(email=email)
                db.add(user)
                db.commit()
                db.refresh(user)

                account = Account(name=f"{email}'s Account")
                db.add(account)
                db.commit()
                db.refresh(account)

                db.add(AccountUser(
                    user_id=user.id,
                    account_id=account.id,
                    role="OWNER"
                ))
                db.commit()

            request.session["user"] = email

        finally:
            db.close()

        return RedirectResponse("/", status_code=303)

    except Exception as e:
        return HTMLResponse(f"<pre>{str(e)}</pre>")


# ======================
# LOGOUT
# ======================

@app.get("/logout")
def logout(request: Request):
    request.session.clear()
    return RedirectResponse("/")


# ======================
# INVITE USER
# ======================

@app.post("/invite")
def invite_user(request: Request, email: str = Form(...), role: str = Form("VIEWER")):

    db = SessionLocal()

    try:
        admin_email = request.session.get("user")

        if not is_owner(db, admin_email):
            return HTMLResponse("Not authorized", status_code=403)

        admin_user = db.query(User).filter_by(email=admin_email).first()
        account_link = db.query(AccountUser).filter_by(user_id=admin_user.id).first()

        invite = Invitation(
            email=email,
            token=str(uuid.uuid4()),
            account_id=account_link.account_id,
            role=role,
            status="PENDING",
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )

        db.add(invite)
        db.commit()

        log_action(db, admin_email, "INVITED", email)

    finally:
        db.close()

    return RedirectResponse("/", status_code=303)


# ======================
# CHANGE ROLE
# ======================

@app.post("/change-role")
def change_role(request: Request, user_id: int = Form(...), role: str = Form(...)):

    db = SessionLocal()

    try:
        if not is_owner(db, request.session.get("user")):
            return HTMLResponse("Not authorized", status_code=403)

        link = db.query(AccountUser).filter_by(user_id=user_id).first()
        link.role = role
        db.commit()

        target = db.query(User).filter_by(id=user_id).first()
        log_action(db, request.session.get("user"), f"ROLE -> {role}", target.email)

    finally:
        db.close()

    return RedirectResponse("/", status_code=303)


# ======================
# REMOVE USER
# ======================

@app.post("/remove-user")
def remove_user(request: Request, user_id: int = Form(...)):

    db = SessionLocal()

    try:
        if not is_owner(db, request.session.get("user")):
            return HTMLResponse("Not authorized", status_code=403)

        target = db.query(User).filter_by(id=user_id).first()

        link = db.query(AccountUser).filter_by(user_id=user_id).first()
        if link:
            db.delete(link)
            db.commit()

        log_action(db, request.session.get("user"), "REMOVED USER", target.email)

    finally:
        db.close()

    return RedirectResponse("/", status_code=303)


# ======================
# CANCEL INVITE
# ======================

@app.post("/cancel-invite")
def cancel_invite(request: Request, invite_id: int = Form(...)):

    db = SessionLocal()

    try:
        if not is_owner(db, request.session.get("user")):
            return HTMLResponse("Not authorized", status_code=403)

        invite = db.query(Invitation).filter_by(id=invite_id).first()

        if invite:
            log_action(db, request.session.get("user"), "CANCELLED INVITE", invite.email)

            db.delete(invite)
            db.commit()

    finally:
        db.close()

    return RedirectResponse("/", status_code=303)