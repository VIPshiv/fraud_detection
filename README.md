# Fraud Detection System

A full-stack application that detects fraudulent conversations in real-time using a fine-tuned BERT model. The system consists of a React frontend for the user interface and a Flask backend that serves the PyTorch model predictions.

## 🚀 Features

- **Real-time Analysis**: Instantly analyzes conversation transcripts for fraud indicators.
- **Visual Dashboard**: React-based UI to view conversations and their fraud probability.
- **Deep Learning Model**: Powered by a BERT model fine-tuned on custom fraud/non-fraud datasets.
- **REST API**: Flask backend handling inference requests.

## 🛠️ Tech Stack

- **Frontend**: React, Vite
- **Backend**: Flask, Flask-CORS
- **AI/ML**: PyTorch, Transformers (Hugging Face), BERT
- **Data Processing**: Pandas, NumPy

## 📂 Project Structure

```
fraud_detection/
├── api.py                 # Flask backend entry point
├── fraud_dec/             # React frontend application
├── train_and_predict.ipynb # Notebook for model training
├── generate_convo.ipynb   # Notebook for generating synthetic data
├── fraud/                 # Dataset: Fraudulent conversation samples
├── not_fraud/             # Dataset: Non-fraudulent conversation samples
├── results/               # Trained model checkpoints
└── requirements.txt       # Python dependencies
```

## ⚡ Getting Started

### Prerequisites

- Python 3.12+
- Node.js & npm

### 1. Backend Setup

1.  Create and activate a virtual environment:
    ```bash
    python -m venv .venv
    # Windows
    .\.venv\Scripts\Activate
    # Mac/Linux
    source .venv/bin/activate
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Run the Flask API:
    ```bash
    python api.py
    ```
    The API will start at `http://localhost:5000`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd fraud_dec
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173` (default Vite port).

## 🧠 Model Training

The model is trained using the `train_and_predict.ipynb` notebook. It uses the datasets located in `fraud/` and `not_fraud/` to fine-tune a `bert-base-uncased` model. The best model is saved to `results/checkpoint-best`.

## 📝 License

[MIT](https://choosealicense.com/licenses/mit/)
