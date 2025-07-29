import torch
from model.CSRNet import CSRNet

def load_model(weight_path):
    model = CSRNet()
    checkpoint = torch.load(weight_path, map_location=torch.device('cpu'), weights_only=False)
    model.load_state_dict(checkpoint['state_dict'])  # 
    model.eval()
    return model
