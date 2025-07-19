import cv2
import numpy as np
import base64

def alpha_to_grayscale(rgba: np.ndarray) -> np.ndarray:
    """Convert RGBA to grayscale by inverting alpha: opaque → black, transparent → white."""
    alpha = rgba[:, :, 3] / 255.0  # Normalize to 0–1
    gray = (255 * (1 - alpha)).astype(np.uint8)
    return gray

def b64_to_cv2_image(b64_str: str) -> np.ndarray:
    img_data = base64.b64decode(b64_str)
    np_arr = np.frombuffer(img_data, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_UNCHANGED)
    return img

def cv2_to_b64(img: np.ndarray) -> str:
    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode()