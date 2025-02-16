import torch
from huggingface_hub import hf_hub_download
import cv2
import numpy as np
import os
from dotenv import load_dotenv
import subprocess
import sys
import requests
import json
from web3 import Web3
from eth_account import Account
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile

# Load environment variables at the start
load_dotenv()

# Analysis mode flag - set to "dummy" for testing, "real" for actual analysis
ANALYSIS_MODE = "real"

# Verify environment variables are loaded
private_key = os.getenv('PRIVATE_KEY')
if not private_key:
    print("Warning: PRIVATE_KEY not found in environment variables")

# Add after line 19
EIGEN_AGENT_URL = os.getenv('EIGEN_AGENT_URL', 'http://localhost:3000')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def install_dependencies():
   """Install required packages using pip3"""
   required_packages = [
       "gitpython>=3.1.30",
       "setuptools>=70.0.0",
       "ultralytics"
   ]
   for package in required_packages:
       subprocess.check_call([sys.executable, "-m", "pip", "install", package])


def get_or_download_model():
   """Download the model if it doesn't exist locally"""
   local_model_path = "best.pt"  # Local path to save the model
  
   # Check if model already exists locally
   if not os.path.exists(local_model_path):
       print("Downloading model from Hugging Face...")
       local_model_path = hf_hub_download(
           repo_id="SimulaMet-HOST/VISEM-Tracking",
           filename="best_checkpoints/yolov5n/weights/best.pt",
           repo_type="dataset"
       )
   else:
       print("Using existing model from local storage")
  
   return local_model_path


# Install dependencies if needed
try:
   import git
except ImportError:
   print("Installing required dependencies...")
   install_dependencies()


# Get the model
checkpoint_path = get_or_download_model()


# Load the YOLOv5 model using torch.hub
model = torch.hub.load("ultralytics/yolov5", "custom", path=checkpoint_path, force_reload=False, source="github")
# Check if the model loaded successfuly
print("Model loaded successfully!")


# We'll analyze sperm motility by detecting and counting sperm in video frames.
def analyze_sperm_motility(video_path):
   cap = cv2.VideoCapture(video_path)
  
   sperm_counts = []
  
   while cap.isOpened():
       ret, frame = cap.read()
       if not ret:
           break
      
       # Run YOLO model on each frame
       results = model(frame)


       # Extract the number of sperm from the results
       # Using results.xyxy[0] to get the bounding boxes of the detected objects
       sperm_count = len(results.xyxy[0])  # Number of detected sperm
       sperm_counts.append(sperm_count)


   cap.release()


   # Calculate average sperm count and motility score
   if len(sperm_counts) == 0:
       return None, None  # No sperm detected in any frame
   
   average_sperm_count = np.mean(sperm_counts)
   motility_score = np.std(sperm_counts)  # Higher std = better motility


   return average_sperm_count, motility_score


def mint_analysis_nft(avg_count, norm_mot_score, recipient_address):
    try:
        # Connect to Sepolia testnet
        w3 = Web3(Web3.HTTPProvider('https://ethereum-sepolia-rpc.publicnode.com'))
        
        if not w3.is_connected():
            raise Exception("Failed to connect to Ethereum network")
        
        # Contract address on Sepolia
        contract_address = "0x125B503d97949BEA16EB829306d72d473AFC7fEE"
        
        # Simplified ABI with just the mintNFT function we need
        abi = [
            {
                "inputs": [
                    {"internalType": "address", "name": "recipient", "type": "address"},
                    {"internalType": "uint256", "name": "averageCount", "type": "uint256"},
                    {"internalType": "uint256", "name": "normalizedMotilityScore", "type": "uint256"}
                ],
                "name": "mintNFT",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ]
        
        # Create contract instance
        contract = w3.eth.contract(address=contract_address, abi=abi)
        
        # Get private key from environment variable
        private_key = os.getenv('PRIVATE_KEY')
        if not private_key:
            raise Exception("Private key not found in environment variables")
            
        account = Account.from_key(private_key)
        
        # Get current nonce
        nonce = w3.eth.get_transaction_count(account.address)
        
        # Convert scores to integers for blockchain
        # Ensure values are valid numbers before conversion
        if not isinstance(avg_count, (int, float)) or not isinstance(norm_mot_score, (int, float)):
            raise ValueError("Invalid input values for average count or motility score")
            
        avg_count_wei = int(avg_count * (10 ** 18))  # Convert to wei equivalent
        norm_mot_score_int = int(norm_mot_score)
        
        # Get current gas price and increase it by 20%
        gas_price = int(w3.eth.gas_price * 1.2)
        
        # Build transaction
        transaction = contract.functions.mintNFT(
            recipient_address,
            avg_count_wei,
            norm_mot_score_int
        ).build_transaction({
            'chainId': 11155111,  # Sepolia chain ID
            'gas': 2000000,
            'maxFeePerGas': gas_price,
            'maxPriorityFeePerGas': int(gas_price * 0.1),
            'nonce': nonce,
            'from': account.address,
            'type': 2  # EIP-1559 transaction type
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
        
        if receipt is None:
            raise Exception("Transaction failed - no receipt received")
            
        return receipt
        
    except Exception as e:
        print(f"Error in mint_analysis_nft: {str(e)}")
        raise Exception(f"Failed to mint NFT: {str(e)}")


def get_eigen_verification(avg_count, motility_score):
    try:
        prompt = f"""Analyze sperm sample results:
        - Average count: {avg_count} sperm cells
        - Motility score: {motility_score}%
        
        Please provide:
        1. Clinical interpretation of these values
        2. Comparison to WHO standards
        3. Specific recommendations for improvement if needed
        4. Overall fertility assessment
        """
        
        response = requests.post(
            f"{EIGEN_AGENT_URL}/api/generate",
            json={"prompt": prompt},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error from Eigen Agent: {response.text}")
            return None
            
    except Exception as e:
        print(f"Failed to get Eigen verification: {e}")
        return None


@app.post("/analyze")
async def analyze_video(video: UploadFile = File(...)):
    try:
        if ANALYSIS_MODE == "dummy":
            # Dummy values for testing
            avg_count = 45.67
            motility_score = 5.89
            norm_mot_score = 75.0  # High score for testing (Gold NFT)
            
            # Mint NFT with dummy values
            recipient_address = "0x17FBa2Fc71ba51c5a8d6c0191Abc2784f4953067"
            receipt = mint_analysis_nft(avg_count, norm_mot_score, recipient_address)
            
            # Determine grade based on normalized score
            grade = "Gold" if norm_mot_score >= 70 else "Silver" if norm_mot_score >= 40 else "Bronze"
            
            return {
                'average_count': float(avg_count),
                'motility_score': float(norm_mot_score),
                'grade': grade,
                'transaction_hash': receipt['transactionHash'].hex(),
                'eigen_verification': {
                    "status": "success",
                    "data": {
                        "verified": True,
                        "timestamp": "2024-03-19T12:00:00Z"
                    }
                }
            }
        
        # If not in dummy mode, proceed with real analysis
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            content = await video.read()
            temp_video.write(content)
            video_path = temp_video.name

        # Real analysis code
        avg_count, motility_score = analyze_sperm_motility(video_path)
        
        if avg_count is None or motility_score is None:
            return JSONResponse(
                status_code=400,
                content={'error': 'No sperm detected in video'}
            )
        
        # Calculate normalized motility score
        norm_mot_score = (motility_score-0.8)/7.07*100
        
        # Mint NFT
        recipient_address = "0x17FBa2Fc71ba51c5a8d6c0191Abc2784f4953067"
        receipt = mint_analysis_nft(avg_count, norm_mot_score, recipient_address)
        
        # Determine grade
        grade = "Gold" if norm_mot_score >= 70 else "Silver" if norm_mot_score >= 40 else "Bronze"
        
        # Get Eigen verification
        eigen_result = get_eigen_verification(avg_count, norm_mot_score)
        if not eigen_result:
            return JSONResponse(
                status_code=500,
                content={'error': 'Failed to get Eigen verification'}
            )

        return {
            'average_count': float(avg_count),
            'motility_score': float(norm_mot_score),
            'grade': grade,
            'transaction_hash': receipt['transactionHash'].hex(),
            'eigen_verification': eigen_result
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={'error': str(e)}
        )
    
    finally:
        # Clean up temporary file only if it was created
        if 'video_path' in locals():
            os.unlink(video_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5001)

