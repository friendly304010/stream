import torch
from huggingface_hub import hf_hub_download
import cv2
import numpy as np
import os
import subprocess
import sys
import requests
import json
#test

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




# Run full pipeline
# Step 1: Analyze sperm motility in a video
video_path = "../dataset/12.mp4"  # Replace with actual file path
avg_count, motility_score = analyze_sperm_motility(video_path)


# Step 2: print out sperm count and motility score
if avg_count is not None and motility_score is not None:

    norm_mot_score = (motility_score-0.8)/7.07*100

    print(f"Average sperm count: {avg_count}, Motility score: {motility_score}, Normalized Motility score: {norm_mot_score}%")
    
    # Send results to API
    api_url = "http://localhost:3000/api/generate"
    
    # Prepare analysis data
    analysis_data = {
        "prompt": f"My sperm analysis results were the following:\nAverage Count: {avg_count:.2f}\nNormalized Motility score: {norm_mot_score:.2f}",
        "metrics": {
            "average_count": float(avg_count),
            "motility_score": float(motility_score),
            "norm_mot_score": float(norm_mot_score)
        }
    }
    
    try:
        response = requests.post(
            api_url,
            headers={"Content-Type": "application/json"},
            data=json.dumps(analysis_data)
        )
        
        # Print status code for debugging
        print(f"API Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("Analysis results sent successfully to API")
            try:
                print("API Response:", response.json())
            except json.JSONDecodeError:
                print("Received non-JSON response:", response.text)
        else:
            print(f"API request failed with status code: {response.status_code}")
            print("Response content:", response.text)
            
    except Exception as e:
        print(f"Error sending results to API: {str(e)}")
else:
    print("Error in analyzing sperm motility.")

