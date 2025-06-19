import cv2
import numpy as np
from fastapi import UploadFile
from typing import Tuple

PATTERNS =  [
    # Checkered patterns (pair 0 and 1)
    np.array([[0, 255], [255, 0]], dtype=np.uint8),  # Checkered 
    np.array([[255, 0], [0, 255]], dtype=np.uint8),  # Checkered Alternate
    
    # Vertical patterns (pair 2 and 3)
    np.array([[0, 255], [0, 255]], dtype=np.uint8),  # Vertical
    np.array([[255, 0], [255, 0]], dtype=np.uint8),  # Vertical Alternate
    
    # Horizontal patterns (pair 4 and 5)
    np.array([[0, 0], [255, 255]], dtype=np.uint8),  # Horizontal
    np.array([[255, 255], [0, 0]], dtype=np.uint8)   # Horizontal Alternate
]


# def process_image(file: UploadFile) -> Tuple[bytes, str]:
#     # Convert to OpenCV image
#     contents = file.file.read()
#     np_arr = np.frombuffer(contents, np.uint8)
#     img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

#     # Simple OpenCV operation: convert to grayscale
#     gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
#     _, processed_img = cv2.imencode('.jpg', gray)

#     return processed_img.tobytes(), "image/jpeg"


def split_share(img: np.ndarray, block_size: int = 4) -> Tuple[Tuple[bytes, str], Tuple[bytes, str]]:
    _, bw_img = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

    h, w = bw_img.shape
    if h % 2 != 0: h -= 1
    if w % 2 != 0: w -= 1
    bw_img = bw_img[:h, :w]

    out_h = h * block_size
    out_w = w * block_size
    share1 = np.zeros((out_h, out_w, 4), dtype=np.uint8)
    share2 = np.zeros((out_h, out_w, 4), dtype=np.uint8)

    for i in range(h):
        for j in range(w):
            pixel = bw_img[i, j]
            index = np.random.randint(0, 6)
            indexComplement = index + 1 if index % 2 == 0 else index - 1

            p1 = PATTERNS[index]
            p2 = PATTERNS[indexComplement] if pixel == 0 else p1

            for dy in range(2):
                for dx in range(2):
                    y = i * block_size + dy * (block_size // 2)
                    x = j * block_size + dx * (block_size // 2)
                    alpha1 = 0 if p1[dy, dx] == 0 else 255
                    alpha2 = 0 if p2[dy, dx] == 0 else 255
                    share1[y:y+(block_size//2), x:x+(block_size//2)] = [0, 0, 0, alpha1]
                    share2[y:y+(block_size//2), x:x+(block_size//2)] = [0, 0, 0, alpha2]

    _, encoded_share1 = cv2.imencode('.png', share1)
    _, encoded_share2 = cv2.imencode('.png', share2)

    return (
        (encoded_share1.tobytes(), "image/png"),
        (encoded_share2.tobytes(), "image/png")
    )


def reconstruct_shares(file1: UploadFile, file2: UploadFile) -> Tuple[bytes, str]:
    contents1 = file1.file.read()
    contents2 = file2.file.read()
    img1 = cv2.imdecode(np.frombuffer(contents1, np.uint8), cv2.IMREAD_UNCHANGED)
    img2 = cv2.imdecode(np.frombuffer(contents2, np.uint8), cv2.IMREAD_UNCHANGED)

    if img1.shape != img2.shape:
        raise ValueError("Ukuran kedua share harus sama")

    if img1.shape[2] == 4:
        alpha1 = img1[:, :, 3]
        alpha2 = img2[:, :, 3]
    else:
        alpha1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)
        alpha2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)

    # XOR alpha channel untuk rekonstruksi
    reconstructed_alpha1 = cv2.bitwise_xor(alpha1, alpha2)
    reconstructed_alpha = reconstructed_alpha1

    # Buat gambar RGBA hasil rekonstruksi
    reconstructed = np.zeros((*reconstructed_alpha.shape, 4), dtype=np.uint8)
    reconstructed[:, :, :3] = 0  # Hitam
    reconstructed[:, :, 3] = reconstructed_alpha

    _, encoded = cv2.imencode('.png', reconstructed)
    return encoded.tobytes(), "image/png"



# def process_color_image(file: UploadFile) -> Tuple[Tuple[bytes, str], Tuple[bytes, str]]:
#     contents = file.file.read()
#     np_arr = np.frombuffer(contents, np.uint8)
#     img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

#     # Pastikan nilai pixel 8-bit
#     img = img.astype(np.uint8)

#     # Random noise sebagai share 1
#     share1 = np.random.randint(0, 256, img.shape, dtype=np.uint8)

#     # XOR gambar asli dengan share1 untuk mendapatkan share2
#     share2 = cv2.bitwise_xor(img, share1)

#     # Encode kedua share
#     _, encoded1 = cv2.imencode('.png', share1)
#     _, encoded2 = cv2.imencode('.png', share2)

#     return (
#         (encoded1.tobytes(), "image/png"),
#         (encoded2.tobytes(), "image/png")
#     )

# def reconstruct_color_shares(file1: UploadFile, file2: UploadFile) -> Tuple[bytes, str]:
#     contents1 = file1.file.read()
#     contents2 = file2.file.read()

#     img1 = cv2.imdecode(np.frombuffer(contents1, np.uint8), cv2.IMREAD_COLOR)
#     img2 = cv2.imdecode(np.frombuffer(contents2, np.uint8), cv2.IMREAD_COLOR)

#     # XOR kedua share
#     reconstructed = cv2.bitwise_xor(img1, img2)

#     _, encoded = cv2.imencode('.png', reconstructed)
#     return encoded.tobytes(), "image/png"
