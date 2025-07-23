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
qr_detector = cv2.QRCodeDetector()

output_width, output_height = 800, 800
dst_pts = np.array([
    [0, 0],
    [output_width - 1, 0],
    [output_width - 1, output_height - 1],
    [0, output_height - 1]
], dtype=np.float32)

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

    print("Match error:", errors / total)
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


def downsample_share(image: np.ndarray, original_shape: Tuple[int, int]) -> np.ndarray:
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    binary = cv2.adaptiveThreshold(
        image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2
    )

    resized = cv2.resize(binary, original_shape[::-1], interpolation=cv2.INTER_AREA)
    _, result = cv2.threshold(resized, 128, 255, cv2.THRESH_BINARY)
    return result


def combine_share(share1: np.ndarray, share2: np.ndarray) -> np.ndarray:
    xor = np.bitwise_xor(share1 == 0, share2 == 0)
    return cv2.bitwise_not(block_voting_majority((xor * 255).astype(np.uint8)))


def scan_qr(image: np.ndarray) -> str:
    if len(image.shape) == 3:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    data, _, _ = qr_detector.detectAndDecode(image)
    if data:
        print("Detected QR using cv2.QRCodeDetector:", data)
        return data

    decoded = decode(image)
    for obj in decoded:
        if obj.type == 'QRCODE':
            print("Detected QR using pyzbar:", obj.data.decode("utf-8"))
            return obj.data.decode("utf-8")

    print("No QR detected")
    return ""


def scan_share(frame: np.ndarray, share2: np.ndarray, width: int, marker_w: int) -> Tuple[str, float, bool]:
    print("Original frame shape:", frame.shape)

    # Grayscale once
    if len(frame.shape) == 3:
        frame_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    else:
        frame_gray = frame.copy()

    detect_size = 720
    preview = cv2.resize(frame_gray, (detect_size, detect_size))
    scale_x = frame.shape[1] / detect_size
    scale_y = frame.shape[0] / detect_size

    corners, ids, _ = detector.detectMarkers(preview)
    print("Found ArUco markers:", ids)

    if ids is not None and all(mid in ids for mid in id_to_index):
        ids = ids.flatten()
        src_pts = np.zeros((4, 2), dtype=np.float32)

        for marker_id, dst_index in id_to_index.items():
            i = np.where(ids == marker_id)[0][0]
            corner = corners[i][0] * [scale_x, scale_y]
            print(f"Marker {marker_id} corners:", corner)
            src_pts[dst_index] = corner[dst_index]

        x, y, w, h = cv2.boundingRect(src_pts)
        print("Crop region:", x, y, w, h)
        roi = frame[y:y+h, x:x+w]
        adjusted_src_pts = src_pts - [x, y]

        H, _ = cv2.findHomography(adjusted_src_pts, dst_pts, cv2.RANSAC, 5.0)
        if H is not None:
            print("Homography matrix:\n", H)
            warped = cv2.warpPerspective(roi, H, (output_width, output_height), flags=cv2.INTER_NEAREST)

            cropped = extract_image_inside(warped, width, marker_w)
            downsample = downsample_share(cropped, (width, width))

            err = compute_error_rate(downsample, share2)
            if err > 0.7:
                print("Error too high, skipping QR scan.")
                return "", err, False

            combined = combine_share(downsample, share2)
            qr_data = scan_qr(combined)
            if qr_data:
                return cv2_to_b64(combined), err, True
            else:
                return "", err, False

    print("Failed to find required ArUco markers")
    return "", 110.0, False
