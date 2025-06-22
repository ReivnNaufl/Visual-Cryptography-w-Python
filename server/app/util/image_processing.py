import cv2
import numpy as np

def alpha_to_grayscale(rgba: np.ndarray) -> np.ndarray:
    """Convert RGBA to grayscale by inverting alpha: opaque → black, transparent → white."""
    alpha = rgba[:, :, 3] / 255.0  # Normalize to 0–1
    gray = (255 * (1 - alpha)).astype(np.uint8)
    return gray
