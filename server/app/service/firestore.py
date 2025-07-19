from google.cloud import firestore
import os
from pathlib import Path
from dotenv import load_dotenv
from google.cloud.firestore_v1 import FieldFilter

current_dir = Path(__file__).parent
env_path = current_dir.parent.parent / '.env'

load_dotenv(env_path)
print("Looking for .env at:", env_path)

cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
if not cred_path:
    raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY_PATH environment variable not set.")

db = firestore.Client.from_service_account_json(current_dir.parent.parent / cred_path)

def save_share_data(share1_b64: str, share2_b64: str, name: str, width: int, marker_size: int, userid: str) -> dict:
    # Prepare the data structure
    qr_data = {
        "public_share": share1_b64,
        "private_share": share2_b64,
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

def get_user_qrs(userId: str, limit: int = 100) -> list:
    query = (
        db.collection('QRs')
        .where(filter=FieldFilter("userId", "==", userId))
        .order_by('metadata.timestamp')
        .limit(limit)
    )

    docs = query.stream()
    qrList = []

    for doc in docs:
        data = doc.to_dict()
        qrList.append({
            "id": doc.id,
            "public_share": data.get("public_share"),
            "metadata": data.get("metadata"),
            "timestamp": data.get("timestamp")
        })

    return qrList

async def get_qr(name: str) -> dict | None:
    query = (
        db.collection('QRs')
        .where(filter=FieldFilter("name", "==", name))
        .limit(1)
    )

    docs_stream = query.stream()

    for doc in docs_stream:
        data = doc.to_dict()
        qr = {
            "id": doc.id,
            "private_share": data.get("private_share"),
            "metadata": data.get("metadata"),
        }
        return qr 

    return None