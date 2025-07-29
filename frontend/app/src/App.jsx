import { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [heatmapURL, setHeatmapURL] = useState(null);
  const [crowdCount, setCrowdCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreviewURL(URL.createObjectURL(file));
    setHeatmapURL(null);
    setCrowdCount(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      alert('Please select an image first.');
      return;
    }
    setLoading(true);
    setError(null);
    setHeatmapURL(null);
    setCrowdCount(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('http://localhost:5000/predict', formData);
      const data = response.data;

      setCrowdCount(data.crowd_count);
      setHeatmapURL('http://localhost:5000' + data.heatmap_url);

      setTimeout(() => {
        if (data.crowd_count > 50) {
          window.alert('⚠️ Alert: Overcrowding detected!');
        } else {
          window.alert('✅ Crowd Level is Normal.');
        }
      }, 300);
    } catch (err) {
      setError('Upload failed. Check backend.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-100 to-purple-200">
      {/* Landing Section */}
      <section className="flex flex-col items-center justify-center text-center pt-20 pb-12 px-4">
        <h1 className="text-5xl font-extrabold text-indigo-800 mb-4 tracking-tight">Crowd Congestion Detector</h1>
        <p className="text-lg text-gray-700 max-w-xl mb-6">
          "A safer space starts with awareness. Detect. Prevent. Control."
        </p>
        <p className="text-md text-gray-600 mb-4">Upload an image to detect the level of crowd and receive instant alerts based on congestion.</p>
      </section>

      {/* Upload Section */}
      <section id="analyze" className="bg-white rounded-t-3xl shadow-inner p-8 max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="mb-6 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200"
          />

          {previewURL && (
            <img
              src={previewURL}
              alt="Preview"
              className="h-64 object-contain border rounded shadow mb-6"
            />
          )}

          <button
            onClick={handleUpload}
            disabled={loading}
            className={`px-6 py-3 rounded-full text-white font-semibold transition ${
              loading ? 'bg-gray-400' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? 'Analyzing...' : 'Upload & Analyze'}
          </button>

          {error && (
            <p className="text-red-600 mt-4 text-sm">{error}</p>
          )}

          {crowdCount !== null && (
            <p className="text-xl text-gray-800 mt-6">
              Crowd Count: <span className="font-bold text-indigo-700">{crowdCount}</span>
            </p>
          )}

          {heatmapURL && (
            <div className="mt-6 text-center">
              <p className="text-lg text-gray-600 mb-2">Heatmap Visualization:</p>
              <img
                src={heatmapURL}
                alt="Heatmap"
                className="h-64 object-contain border-2 border-indigo-300 rounded-lg shadow"
              />
            </div>
          )}
        </div>
      </section>

      
    </div>
  );
}
