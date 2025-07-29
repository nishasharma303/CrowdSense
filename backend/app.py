from flask import Flask, request, jsonify
from flask_cors import CORS  # <-- Import CORS
import torch
import os
from utils.image_process import preprocess_image, save_heatmap
from utils.model_loader import load_model

# Configuration
UPLOAD_FOLDER = 'uploads/'
HEATMAP_FOLDER = 'static/heatmaps'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(HEATMAP_FOLDER, exist_ok=True)

# Initialize Flask App
app = Flask(__name__)
CORS(app)  # <-- Enable CORS for all routes

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load pretrained model
model = load_model('weights/PartBmodel_best.pth.tar')

@app.route('/')
def index():
    return 'CSRNet Crowd Counting API is running!'

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)

    try:
        # Preprocess image
        img_tensor = preprocess_image(filepath)

        # Predict using CSRNet
        with torch.no_grad():
            output = model(img_tensor)

        count = float(output.sum().item())

        # Postprocess and save heatmap
        density_map = output.squeeze().cpu().numpy()
        heatmap_filename = f'heatmap_{file.filename}'
        heatmap_path = os.path.join(HEATMAP_FOLDER, heatmap_filename)
        save_heatmap(density_map, heatmap_path)

        return jsonify({
            'crowd_count': round(count, 2),
            'heatmap_url': f'/static/heatmaps/{heatmap_filename}'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
