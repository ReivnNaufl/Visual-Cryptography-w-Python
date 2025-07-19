from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.util.image_processing import b64_to_cv2_image, alpha_to_grayscale
from app.service.scanning import scan_share
from app.service.firestore import get_qr
import cv2
import numpy as np
from pyzbar.pyzbar import decode

ws_router = APIRouter()

@ws_router.websocket("/ws/scan")
async def websocket_scan(websocket: WebSocket, qr_name: str = Query(...)):
    await websocket.accept()

    qr = await get_qr(qr_name)

    if not qr:
        await websocket.send_json({"success": False, "message": "QR not found"})
        await websocket.close()
        return

    share2 = qr["private_share"]
    metadata = qr["metadata"]
    width = metadata["original_width"]
    marker_w = metadata["marker_size"]

    try:
        while True:
            b64_data = await websocket.receive_text()

            # Convert base64 to OpenCV image
            img = b64_to_cv2_image(b64_data)
            share2_arr = alpha_to_grayscale(b64_to_cv2_image(share2))
            res_b64, err, success = scan_share(img, share2_arr, width, marker_w)

            if success:
                reconstructed_img = b64_to_cv2_image(res_b64)
                if reconstructed_img.ndim == 3:
                    gray_img = cv2.cvtColor(reconstructed_img, cv2.COLOR_BGR2GRAY)
                else:
                    gray_img = reconstructed_img 
                decoded_objects = decode(gray_img)

                if not decoded_objects:
                    await websocket.send_json({
                        "success": False,
                        "message": "QR berhasil direkonstruksi tetapi tidak bisa di-decode",
                        "error_rate": err
                    })
                    await websocket.close()
                    return

                qr_data = decoded_objects[0].data.decode('utf-8')
                analysis_data = analyze_qr_string_logic(qr_data)

                await websocket.send_json({
                    "success": True,
                    "data": analysis_data
                })
                await websocket.close()
                return
            else:
                await websocket.send_json({
                    "success": False,
                    "message": "Gagal merekonstruksi QR",
                    "error_rate": err
                })

    except WebSocketDisconnect:
        print("Client disconnected from /ws/scan")


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
