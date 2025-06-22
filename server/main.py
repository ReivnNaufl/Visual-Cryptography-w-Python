import os
import base64
from fastapi import FastAPI, File, HTTPException, UploadFile, Request, Depends, status
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from firebase_admin import credentials, auth, initialize_app
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware # Penting untuk React


from app.service.visual_cryptography import *
from app.service.qr_operations import *
from app.service.aruco_marker import *
import io

load_dotenv()

cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
if not cred_path:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set.")
cred = credentials.Certificate(cred_path)
initialize_app(cred)

app = FastAPI()

origins = [
    "http://localhost:5173",  # Alamat frontend React Anda saat development
    # Tambahkan alamat domain frontend Anda saat production di sini
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

bearer_scheme = HTTPBearer()


async def verify_firebase_token(creds: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    """
    Dependency untuk memverifikasi Firebase ID token yang dikirim di header Authorization.

    Mengembalikan decoded token jika valid.
    Memicu HTTPException jika token tidak valid.
    """
    token = creds.credentials
    try:
        # Verifikasi token menggunakan Firebase Admin SDK
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        # Tangani berbagai kemungkinan error (token kedaluwarsa, tidak valid, dll.)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication credentials: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

@app.get("/protected")
def read_protected_data(user_data: dict = Depends(verify_firebase_token)):
    """
    Endpoint ini dilindungi.
    Hanya bisa diakses dengan Firebase ID Token yang valid.
    Dependency 'verify_firebase_token' akan dijalankan terlebih dahulu.
    """
    # 'user_data' adalah payload dari token yang sudah diverifikasi (decoded_token)
    # Anda bisa mengakses informasi pengguna seperti UID
    user_uid = user_data.get("uid")
    user_email = user_data.get("email")

    return {
        "message": "Ini adalah data rahasia!",
        "user_info": {
            "uid": user_uid,
            "email": user_email
        }
    }



# Mount static and templates
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/static")


@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/1", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("index2.html", {"request": request})

@app.post("/upload/")
async def upload_image(request: Request,file: UploadFile = File(...)):
    img, found = reconstruct_qr(file)
    if found:
        share1, (share1_bytes, mime1), (share2_bytes, mime2) = split_share(img)
        share1_base64 = base64.b64encode(share1_bytes).decode("utf-8")
        share2_base64 = base64.b64encode(share2_bytes).decode("utf-8")
        aruco_bytes, mime_aruco = add_aruco_marker(share1)
        aruco_base64 = base64.b64encode(aruco_bytes).decode("utf-8")
        
        return templates.TemplateResponse("result.html", {
            "request": request,
            "share1": f"data:{mime1};base64,{share1_base64}",
            "share2": f"data:{mime2};base64,{share2_base64}",
            "aruco": f"data:{mime_aruco};base64,{aruco_base64}"
        })
    else:
        raise HTTPException(status_code=400, detail="QR Not Found")


@app.post("/merge/")
async def reconstruct(file: UploadFile = File(...),file1: UploadFile = File(...)):
    try:
        image_bytes, mime = reconstruct_shares(file, file1)
        return StreamingResponse(io.BytesIO(image_bytes), media_type=mime)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))