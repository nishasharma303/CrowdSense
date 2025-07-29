import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend for server environments

import matplotlib.pyplot as plt
import cv2
import numpy as np
import torch
from torchvision import transforms
from PIL import Image

# Preprocess the uploaded image into tensor format
def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406],
                             std=[0.229, 0.224, 0.225])
    ])
    img_tensor = transform(img).unsqueeze(0)  # Shape: (1, 3, H, W)
    return img_tensor

# Save the heatmap image from density map
def save_heatmap(density_map, output_path):
    plt.figure(figsize=(6, 4))
    plt.imshow(density_map, cmap='jet')
    plt.axis('off')
    plt.tight_layout()
    plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
    plt.close()
