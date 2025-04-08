import cv2
import numpy as np
from fastapi import UploadFile
from typing import Tuple

def process_image(file: UploadFile) -> Tuple[bytes, str]:
    # Convert to OpenCV image
    contents = file.file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Simple OpenCV operation: convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, processed_img = cv2.imencode('.jpg', gray)

    return processed_img.tobytes(), "image/jpeg"
