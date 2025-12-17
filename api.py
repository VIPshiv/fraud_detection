from flask import Flask, request, jsonify
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from flask_cors import CORS

print("Starting Flask app...")

app = Flask(__name__)
CORS(app)
print("Flask app initialized with CORS.")

# Load model and tokenizer
print("Loading tokenizer...")
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
print("Tokenizer loaded.")
print("Loading model...")
model = BertForSequenceClassification.from_pretrained('./results/checkpoint-best')
print("Model loaded successfully.")

@app.route('/')
def home():
    return jsonify({'message': 'Welcome to FraudShield API. Use POST /predict to make predictions.'})

@app.route('/predict', methods=['POST'])
def predict():
    print("Received a prediction request.", flush=True)
    data = request.get_json()
    conversation = data.get('conversation', '')
    
    if not conversation:
        print("No conversation provided.", flush=True)
        return jsonify({'error': 'No conversation provided'}), 400
    
    if len(conversation) > 5000:
        print("Input too long.", flush=True)
        return jsonify({'error': 'Input too long'}), 400
    
    print("Tokenizing input...", flush=True)
    encoding = tokenizer(
        conversation,
        add_special_tokens=True,
        max_length=256,
        return_token_type_ids=False,
        padding='max_length',
        truncation=True,
        return_attention_mask=True,
        return_tensors='pt'
    )
    print("Input tokenized.", flush=True)
    
    print("Running model prediction...", flush=True)
    with torch.no_grad():
        outputs = model(encoding['input_ids'], attention_mask=encoding['attention_mask'])
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1).tolist()[0]
        prediction = logits.argmax().item()
        confidence = probs[prediction] * 100
        fraud_prob = probs[1] * 100
        not_fraud_prob = probs[0] * 100
    print("Prediction completed.", flush=True)
    
    return jsonify({
        'label': 'Fraud' if prediction == 1 else 'Not Fraud',
        'confidence': confidence,
        'fraud_prob': fraud_prob,
        'not_fraud_prob': not_fraud_prob
    })

if __name__ == '__main__':
    print("Starting Flask server on http://0.0.0.0:5000...", flush=True)
    app.run(host='0.0.0.0', port=5000, debug=True)