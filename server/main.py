import base64
from fastapi import FastAPI, File, HTTPException, UploadFile, Request
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.service.visual_cryptography import *
from app.service.qr_operations import *
import io

app = FastAPI()

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
        (share1_bytes, mime1), (share2_bytes, mime2) = split_share(img)
        share1_base64 = base64.b64encode(share1_bytes).decode("utf-8")
        share2_base64 = base64.b64encode(share2_bytes).decode("utf-8")
        
        return templates.TemplateResponse("result.html", {
            "request": request,
            "share1": f"data:{mime1};base64,{share1_base64}",
            "share2": f"data:{mime2};base64,{share2_base64}"
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