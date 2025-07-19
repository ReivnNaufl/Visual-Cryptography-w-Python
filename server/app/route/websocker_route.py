from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.util.image_processing import b64_to_cv2_image, alpha_to_grayscale
from app.service.scanning import scan_share
from app.service.firestore import get_qr
import cv2

ws_router = APIRouter()

@ws_router.websocket("/ws/scan")
async def websocket_scan(websocket: WebSocket, qr_name: str = Query(...)):
    await websocket.accept()

    qr = await get_qr(qr_name)  # or get_qr() if it's not async

    if not qr:
        await websocket.send_text("QR not found")
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
                await websocket.send_json({
                    "success": True,
                    "image_b64": res_b64,
                    "error_rate": err
                })
                await websocket.close()
                return
            else:
                await websocket.send_json({
                    "success": False,
                    "error_rate": err
                })
    except WebSocketDisconnect:
        print("Client disconnected from /ws/scan")
