import os
import base64
from fastapi import FastAPI, File, HTTPException, UploadFile, Request, Depends, status, Form, Query
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from firebase_admin import credentials, auth, initialize_app
from dotenv import load_dotenv
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware # Penting untuk React
from pydantic import BaseModel

from pyzbar.pyzbar import decode
from app.service.visual_cryptography import *
from app.route.websocker_route import *
from app.service.qr_operations import *
from app.service.aruco_marker import *
from app.service.firestore import *
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

app.include_router(ws_router)

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

@app.get("/scan", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse("ws_test.html", {"request": request})

@app.post("/upload/")
async def upload_image(request: Request, file: UploadFile = File(...), name: str = Form(...), userId: str = Form(...)):
    img, found = reconstruct_qr(file)
    if found:
        share1, (share2_bytes, mime2) = split_share(img)
        share2_base64 = base64.b64encode(share2_bytes).decode("utf-8")
        aruco_bytes, mime_aruco, original_width, marker_size = add_aruco_marker(share1)
        aruco_base64 = base64.b64encode(aruco_bytes).decode("utf-8")

        res = save_share_data(aruco_base64, share2_base64, name, original_width, marker_size, userId)
        
        return templates.TemplateResponse("result.html", {
            "request": request,
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
    
class StoreName(BaseModel):
    name: str

@app.post("/users/{user_id}/add-store")
async def add_store_name_to_user(
    user_id: str, 
    store_data: StoreName,
    current_user: dict = Depends(verify_firebase_token)
):

    if current_user['uid'] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operasi tidak diizinkan. Anda hanya dapat menambahkan toko ke profil Anda sendiri."
        )
    try:
        user_doc_ref = db.collection('users').document(user_id)
        user_doc_ref.update({
            'namaToko': firestore.ArrayUnion([store_data.name])
        })
        
        return {"message": f"Toko '{store_data.name}' berhasil ditambahkan."}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal menambahkan toko: {e}"
        )
    
@app.get("/qr/user/{user_id}")
async def get_qrs(user_id: str, current_user: dict = Depends(verify_firebase_token)):
    if current_user['uid'] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operasi tidak diizinkan."
        )
    
    try:
        qrs = get_user_qrs(user_id) 
        return {"qrs": qrs}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal mendapatkan QRs user: {e}"
        )
    
@app.get("/qr/{qr_id}")
async def get_qr_detail(qr_id: str, current_user: dict = Depends(verify_firebase_token)):
    try:
        doc_ref = db.collection('QRs').document(qr_id).get()

        if not doc_ref.exists:
            raise HTTPException(status_code=404, detail="QR tidak ditemukan.")

        qr_data = doc_ref.to_dict()

        if qr_data.get('userId') != current_user['uid']:
            raise HTTPException(status_code=403, detail="Anda tidak punya izin untuk mengakses QR ini.")
            
        return qr_data

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Gagal mendapatkan detail QR: {str(e)}"
        )

@app.delete("/qr/{qr_id}", status_code=status.HTTP_200_OK)
async def delete_qr(qr_id: str, current_user: dict = Depends(verify_firebase_token)):
    try:
        qr_doc_ref = db.collection('QRs').document(qr_id)
        qr_doc = qr_doc_ref.get()

        if not qr_doc.exists:
            raise HTTPException(status_code=404, detail="QR tidak ditemukan.")

        qr_data = qr_doc.to_dict()

        if qr_data.get('userId') != current_user['uid']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Anda tidak memiliki izin untuk menghapus QR ini."
            )

        store_name_to_delete = qr_id

        qr_doc_ref.delete()

        if store_name_to_delete:
            user_doc_ref = db.collection('users').document(current_user['uid'])
            user_doc_ref.update({
                'namaToko': firestore.ArrayRemove([store_name_to_delete])
            })

        return {"message": f"QR dengan ID {qr_id} dan toko '{store_name_to_delete}' berhasil dihapus."}

    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menghapus QR: {str(e)}"
        )
    
@app.get("/public/search/stores")
async def public_search_stores(name: str = Query(..., min_length=1)):
    """
    ENDPOINT PUBLIK: Mencari toko berdasarkan awalan nama.
    Pencarian sekarang bersifat CASE-SENSITIVE.
    """
    try:
        search_term = name
        end_term = search_term + '\uf8ff'

        query = (
            db.collection('QRs')
            .where(filter=FieldFilter("name", ">=", search_term))
            .where(filter=FieldFilter("name", "<=", end_term))
            .limit(10)
        )
        # -------------------------

        docs = query.stream()
        
        results = []
        for doc in docs:
            data = doc.to_dict()
            metadata = data.get("metadata", {})
            results.append({
                "id": doc.id,
                "name": doc.id
            })
            
        return {"results": results}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal melakukan pencarian: {str(e)}"
        )

def analyze_qr_string_logic(qr_data: str) -> dict:
    """
    Menganalisis string data QR dan mengklasifikasikannya.
    Mengembalikan dictionary dengan tipe dan konten.
    """
    if qr_data.startswith("http://") or qr_data.startswith("https://"):
        return {"type": "URL", "content": qr_data}
    elif qr_data.startswith("000201"):
        return {"type": "QRIS", "content": qr_data}
    else:
        return {"type": "TEXT", "content": qr_data}


def scan_qr_from_image(file1: UploadFile) -> Tuple[str, bool]:
    """
    Membaca file gambar dan HANYA men-decode data QR.
    Tidak ada rekonstruksi.
    
    Mengembalikan: (data_qr_string, status_sukses)
    """
    try:
        contents = file1.file.read()
        np_arr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

        if img is None:
            return None, False

        decoded_objects = decode(img)
        if not decoded_objects:
            return None, False

        # Ambil data dari QR code pertama yang ditemukan
        qr_data = decoded_objects[0].data.decode('utf-8')
        return qr_data, True

    except Exception as e:
        print(f"Error di dalam scan_qr_from_image: {e}")
        return None, False
    
    
@app.post("/api/v1/scan", tags=["QR Processing"]) 
async def scan_endpoint(file: UploadFile = File(...)):
    """
    Endpoint yang disederhanakan: Menerima gambar, memindai QR, dan menganalisis data.
    """
    print("Menerima request untuk scan...")
    
    # Panggil fungsi yang lebih sederhana
    qr_data, found = scan_qr_from_image(file)

    if not found:
        print("Gagal menemukan QR code dari gambar.")
        raise HTTPException(
            status_code=422,
            detail="Tidak dapat menemukan atau membaca QR code pada gambar yang diunggah."
        )

    # Langsung proses qr_data
    print(f"SUKSES: QR data ditemukan: {qr_data}")
    try:
        analysis_data = analyze_qr_string_logic(qr_data)
        print(f"Hasil analisis: {analysis_data}")
        return {"success": True, "data": analysis_data}
    except Exception as e:
        print(f"Error saat menganalisis data QR: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Terjadi kesalahan saat memproses data QR: {e}"
        )
