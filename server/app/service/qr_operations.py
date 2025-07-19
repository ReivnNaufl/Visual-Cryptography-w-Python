import cv2
import numpy as np
from pyzbar.pyzbar import decode
import qrcode
from fastapi import UploadFile
from typing import Tuple

def reconstruct_qr(file1: UploadFile) -> Tuple[np.ndarray, bool]:
    contents = file1.file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

    if img is None:
        raise ValueError("Image not found or invalid format.")

    # Decode QR code
    decoded_objects = decode(img)
    if not decoded_objects:
        return None, False

    # Take the first QR code
    qr_data = decoded_objects[0].data.decode('utf-8')
    print("QR Data:", qr_data)

    # Reconstruct QR using the decoded data
    qr = qrcode.QRCode(
        version=None,  # Auto size
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=1,  # smallest size, we only need the matrix
        border=0,  # no extra border
    )
    qr.add_data(qr_data)
    qr.make(fit=True)

    print("QR Version:", qr.version)  # Version number (1–40)
    matrix = qr.get_matrix()
    print("Matrix Size:", len(matrix), "x", len(matrix))  # Always square

    # Convert to NumPy array of 0 and 1
    binary_matrix = np.array(matrix, dtype=np.uint8)

    # Scale binary matrix to image format (0 = white, 1 = black → 255 = white, 0 = black)
    image = (1 - binary_matrix) * 255  # Flip values because QR: 1 = black, OpenCV: 0 = black

    # Optional: scale up for visibility
    scale = 1  # Adjust as needed
    image = cv2.resize(image, (image.shape[1] * scale, image.shape[0] * scale), interpolation=cv2.INTER_NEAREST)
    
    return image, True

