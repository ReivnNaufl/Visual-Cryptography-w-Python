import cv2
import numpy as np
from typing import Tuple

aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
marker_size = 100  # Size of each marker in pixels
padding = 10
width = 512
height = 512

def add_aruco_marker(image: np.ndarray) -> Tuple[bytes, str, str, str]:
    # Get original image dimensions
    height, width = image.shape[:2]
    print("aruco width: " , width)
    print("aruco height: " , height)
    marker_size = height * 0.12 #12%
    padding = marker_size * 0.08 #8%

    # Generate four unique markers (0 to 3)
    markers = [cv2.aruco.generateImageMarker(aruco_dict, i, marker_size) for i in range(4)]

    # Create a white grayscale canvas
    new_width = width + 2 * (marker_size + padding)
    new_height = height + 2 * (marker_size + padding)
    canvas = np.ones((new_height, new_width), dtype=np.uint8) * 255  # Grayscale white

    # Place the image in the center
    start_x = marker_size + padding
    start_y = marker_size + padding
    canvas[start_y:start_y + height, start_x:start_x + width] = image

    # Generate four unique grayscale ArUco markers
    markers = [cv2.aruco.generateImageMarker(aruco_dict, i, marker_size) for i in range(4)]

    # Define marker corner positions
    marker_positions = [
        (padding, padding),  # Top-left
        (new_width - marker_size - padding, padding),  # Top-right
        (padding, new_height - marker_size - padding),  # Bottom-left
        (new_width - marker_size - padding, new_height - marker_size - padding)  # Bottom-right
    ]

    # Paste the markers
    for marker, (x, y) in zip(markers, marker_positions):
        canvas[y:y + marker_size, x:x + marker_size] = marker

    scale_factor = 1080 //\
         width
    resized = cv2.resize(canvas, dsize=None, fx=scale_factor, fy=scale_factor, interpolation=cv2.INTER_NEAREST)

    # Encode as grayscale PNG
    _, encoded_canvas = cv2.imencode('.png', resized)

    return (encoded_canvas.tobytes(), "image/png", width, marker_size)
   

def extract_image_inside(warped_img, orig_width, border_px=100, debug=False):
    total_width = orig_width + 2 * border_px

    warped_h, warped_w = warped_img.shape[:2]

    # Ratio of original content to total
    x_ratio = orig_width / total_width

    # Calculate pixel margins in warped image
    margin_x = int((1 - x_ratio) / 2 * warped_w)
    margin_y = int((1 - x_ratio) / 2 * warped_h)

    x_min = margin_x
    y_min = margin_y
    x_max = warped_w - margin_x
    y_max = warped_h - margin_y

    if debug:
        print(f"[crop_by_digital_design] Warped: {warped_w}x{warped_h}")
        print(f"[crop_by_digital_design] Crop: x={x_min}:{x_max}, y={y_min}:{y_max}")

    return warped_img[y_min:y_max, x_min:x_max]