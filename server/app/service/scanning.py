import cv2
import numpy as np
from fastapi import UploadFile
from typing import Tuple
from app.service.aruco_marker import extract_image_inside
from app.util.image_processing import cv2_to_b64
from pyzbar.pyzbar import decode

aruco_dict = cv2.aruco.getPredefinedDictionary(cv2.aruco.DICT_4X4_50)
aruco_params = cv2.aruco.DetectorParameters()
detector = cv2.aruco.ArucoDetector(aruco_dict, aruco_params)

output_width, output_height = 800, 800
dst_pts = np.array([
    [0, 0],
    [output_width - 1, 0],
    [output_width - 1, output_height - 1],
    [0, output_height - 1]
], dtype=np.float32)

# Mapping marker IDs to positions
id_to_index = {
    0: 0,  # TL
    1: 1,  # TR
    3: 2,  # BR
    2: 3   # BL
}


def compute_error_rate(share1: np.ndarray, share2: np.ndarray) -> float:
    h, w = share1.shape
    assert share1.shape == share2.shape
    assert h % 2 == 0 and w % 2 == 0

    errors = 0
    total = (h // 2) * (w // 2)

    for y in range(0, h, 2):
        for x in range(0, w, 2):
            block1 = share1[y:y+2, x:x+2]
            block2 = share2[y:y+2, x:x+2]

            same = np.all(block1 == block2)
            complement = np.all(block1 == 255 - block2)

            if not (same or complement):
                errors += 1

    return errors / total

def block_voting_majority(img: np.ndarray, block_size: int = 2) -> np.ndarray:
    h, w = img.shape
    out = np.zeros_like(img)

    for y in range(0, h, block_size):
        for x in range(0, w, block_size):
            block = img[y:y+block_size, x:x+block_size]

            if block.size == 0:
                continue

            black = np.count_nonzero(block < 128)
            white = block.size - black

            value = 0 if black > white else 255
            out[y:y+block_size, x:x+block_size] = value

    return out

def downsample_share(
    image: np.ndarray,
    original_shape: Tuple[int, int],
    threshold_method: str = 'adaptive',
    tolerance: float = 1.03
) -> np.ndarray:
    import cv2
    import numpy as np

    # Convert to grayscale if needed
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Apply thresholding
    if threshold_method == 'otsu':
        _, binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    elif threshold_method == 'adaptive':
        binary = cv2.adaptiveThreshold(
            image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
    else:  # fixed
        _, binary = cv2.threshold(image, 128, 255, cv2.THRESH_BINARY)

    h, w = binary.shape
    h_orig, w_orig = original_shape
    scale_h = h / h_orig
    scale_w = w / w_orig

    reconstructed = np.zeros((h_orig, w_orig), dtype=np.uint8)

    for y in range(h_orig):
        for x in range(w_orig):
            y_start = int(y * scale_h)
            y_end = int((y + 1) * scale_h)
            x_start = int(x * scale_w)
            x_end = int((x + 1) * scale_w)

            block = binary[y_start:y_end, x_start:x_end]

            black = np.count_nonzero(block < 128)
            white = block.size - black

            if black >= white * tolerance:
                reconstructed[y, x] = 0
            elif white >= black * tolerance:
                reconstructed[y, x] = 255
            else:
                reconstructed[y, x] = 255 

    return reconstructed

def combine_share(share1: np.ndarray, share2: np.ndarray) -> np.ndarray:
    return cv2.bitwise_not(block_voting_majority(cv2.bitwise_xor(share2, share1)))

def scan_qr_with_pyzbar(image: np.ndarray) -> str:
    # Convert to grayscale if not already
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    decoded_objects = decode(image)
    
    for obj in decoded_objects:
        if obj.type == 'QRCODE':
            return obj.data.decode('utf-8')  # return the first found QR data

    return ""

def scan_share(frame:np.ndarray, share2: np.ndarray, width: int, marker_w: int) -> Tuple[str, float, bool]:
    corners, ids, _ = detector.detectMarkers(frame)

    if ids is not None and all(mid in ids for mid in id_to_index):
        ids = ids.flatten()
        src_pts = np.zeros((4, 2), dtype=np.float32)

        print("found")

        for marker_id, dst_index in id_to_index.items():
            i = np.where(ids == marker_id)[0][0]
            corner = corners[i][0]
            src_pts[dst_index] = corner[dst_index] 


        H, _ = cv2.findHomography(src_pts, dst_pts, cv2.RANSAC, 5.0)

        if H is not None:
            warped = cv2.warpPerspective(frame, H, (output_width, output_height), flags=cv2.INTER_NEAREST)
            cropped= extract_image_inside(warped, width, marker_w)
            downsample = downsample_share(cropped, (width,width))
            err = compute_error_rate(downsample, share2)
            print("err rate, ", err)
            if (err > 0.3):
                return "", err, False
            combined = combine_share(downsample, share2)
            print("pass err rate")
            qr_data = scan_qr_with_pyzbar(combined)
            if qr_data:
                return cv2_to_b64(combined), err, True
            else:
                return "", err, False           
            

    print("! found", share2.shape, width)
    return "", 110.0, False