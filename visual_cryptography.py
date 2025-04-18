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


def process_image2(file1: UploadFile) -> Tuple[Tuple[bytes, str], Tuple[bytes, str]]:
    # Baca isi file dan decode sebagai gambar OpenCV
    contents = file1.file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_GRAYSCALE)

    # Ubah ke citra biner (hitam-putih)
    _, bw_img = cv2.threshold(img, 127, 255, cv2.THRESH_BINARY)

    # Ukuran agar genap
    h, w = bw_img.shape
    if h % 2 != 0: h -= 1
    if w % 2 != 0: w -= 1
    bw_img = bw_img[:h, :w]

    # Inisialisasi dua share kosong (dua kali ukuran)
    share1 = np.zeros((h*2, w*2), dtype=np.uint8)
    share2 = np.zeros((h*2, w*2), dtype=np.uint8)

    # Pola untuk encoding
    patterns = {
        "white": [np.array([[255, 0], [0, 255]], dtype=np.uint8),
                  np.array([[0, 255], [255, 0]], dtype=np.uint8)],
        "black": [np.array([[255, 0], [0, 255]], dtype=np.uint8),
                  np.array([[255, 0], [0, 255]], dtype=np.uint8)]
    }

    # Buat dua share
    for i in range(h):
        for j in range(w):
            pixel = bw_img[i, j]
            pattern_type = "white" if pixel == 255 else "black"

            idx = np.random.randint(0, 2)
            p1 = patterns[pattern_type][idx]
            p2 = patterns[pattern_type][1 - idx if pattern_type == "white" else idx]

            share1[i*2:i*2+2, j*2:j*2+2] = p1
            share2[i*2:i*2+2, j*2:j*2+2] = p2

    # Encode ke JPEG
    _, encoded_share1 = cv2.imencode('.jpg', share1)
    _, encoded_share2 = cv2.imencode('.jpg', share2)

    return (
        (encoded_share1.tobytes(), "image/jpeg"),
        (encoded_share2.tobytes(), "image/jpeg")
    )



def reconstruct_from_shares(file1: UploadFile, file2: UploadFile) -> Tuple[bytes, str]:
    # Baca kedua file sebagai gambar grayscale
    contents1 = file1.file.read()
    contents2 = file2.file.read()
    img1 = cv2.imdecode(np.frombuffer(contents1, np.uint8), cv2.IMREAD_GRAYSCALE)
    img2 = cv2.imdecode(np.frombuffer(contents2, np.uint8), cv2.IMREAD_GRAYSCALE)

    # Cek ukuran sama
    if img1.shape != img2.shape:
        raise ValueError("Ukuran kedua share harus sama")

    # Gabungkan menggunakan operasi bitwise OR
    reconstructed = cv2.bitwise_or(img1, img2)

    # Encode ke JPEG
    _, encoded = cv2.imencode('.jpg', reconstructed)
    return encoded.tobytes(), "image/jpeg"


def process_color_image(file: UploadFile) -> Tuple[Tuple[bytes, str], Tuple[bytes, str]]:
    contents = file.file.read()
    np_arr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    # Pastikan nilai pixel 8-bit
    img = img.astype(np.uint8)

    # Random noise sebagai share 1
    share1 = np.random.randint(0, 256, img.shape, dtype=np.uint8)

    # XOR gambar asli dengan share1 untuk mendapatkan share2
    share2 = cv2.bitwise_xor(img, share1)

    # Encode kedua share
    _, encoded1 = cv2.imencode('.png', share1)
    _, encoded2 = cv2.imencode('.png', share2)

    return (
        (encoded1.tobytes(), "image/png"),
        (encoded2.tobytes(), "image/png")
    )

def reconstruct_color_shares(file1: UploadFile, file2: UploadFile) -> Tuple[bytes, str]:
    contents1 = file1.file.read()
    contents2 = file2.file.read()

    img1 = cv2.imdecode(np.frombuffer(contents1, np.uint8), cv2.IMREAD_COLOR)
    img2 = cv2.imdecode(np.frombuffer(contents2, np.uint8), cv2.IMREAD_COLOR)

    # XOR kedua share
    reconstructed = cv2.bitwise_xor(img1, img2)

    _, encoded = cv2.imencode('.png', reconstructed)
    return encoded.tobytes(), "image/png"
