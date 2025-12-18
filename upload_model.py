import os
from huggingface_hub import HfApi, login

def upload_model():
    print("🚀 Starting Model Upload to Hugging Face")
    print("---------------------------------------")
    
    # 1. Get credentials
    print("Step 1: Authentication")
    token = input("Enter your Hugging Face Write Token (get it from https://huggingface.co/settings/tokens): ").strip()
    if not token:
        print("❌ Error: Token is required.")
        return

    login(token=token)
    
    # 2. Get repo details
    print("\nStep 2: Repository Details")
    username = input("Enter your Hugging Face username: ").strip()
    repo_name = input("Enter name for new model repo (e.g., fraud-detection-bert): ").strip()
    repo_id = f"{username}/{repo_name}"
    
    # 3. Upload
    print(f"\nStep 3: Uploading to {repo_id}...")
    print("This might take a while depending on your internet speed (Model is ~400MB)...")
    
    try:
        api = HfApi()
        
        # Create repo if it doesn't exist
        api.create_repo(repo_id=repo_id, exist_ok=True)
        
        # Upload folder
        api.upload_folder(
            folder_path="./results/checkpoint-best",
            repo_id=repo_id,
            repo_type="model"
        )
        
        print("\n✅ Success! Model uploaded.")
        print(f"🔗 View it here: https://huggingface.co/{repo_id}")
        print("\nIMPORTANT: Save this Model ID for deployment:")
        print(f"MODEL_PATH = {repo_id}")
        
    except Exception as e:
        print(f"\n❌ Error during upload: {e}")

if __name__ == "__main__":
    upload_model()
