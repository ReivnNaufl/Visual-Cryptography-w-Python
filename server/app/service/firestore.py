from google.cloud import firestore
import os
from pathlib import Path
from dotenv import load_dotenv

current_dir = Path(__file__).parent
env_path = current_dir.parent.parent / '.env'

load_dotenv(env_path)
print("Looking for .env at:", env_path)

cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
if not cred_path:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set.")

db = firestore.Client.from_service_account_json(current_dir.parent.parent / cred_path)

def save_share_data(share1_b64: str, share2_b64: str, name: str, width: int, marker_size: int, userid: str) -> dict:
    print("cek nama: " + name)
    # Prepare the data structure
    qr_data = {
        "share1": share1_b64,
        "share2": share2_b64,
        "metadata": {
            "original_width": width,
            "marker_size": marker_size,
            "timestamp": firestore.SERVER_TIMESTAMP
        },
        "userId": userid,
        "name": name
    }
    
    # Reference to the document (creates if doesn't exist)
    doc_ref = db.collection("QRs").document(name)
    
    # Set the data (overwrites if exists)
    write_result = doc_ref.set(qr_data)

    return {
        "document_id": doc_ref.id,
        "path": doc_ref.path,
        "write_result": write_result
    }