import { useState, useRef } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [useLLM, setUseLLM] = useState(true)

  const [initImageBase64, setInitImageBase64] = useState(null);
  // NEW: State for the Denoising Slider
  const [denoising, setDenoising] = useState(0.5);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const rawBase64 = reader.result.split(',')[1];
        setInitImageBase64(rawBase64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsLoading(true)
    setError(null)
    setImage(null)
    setEnhancedPrompt('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          use_llm: useLLM,
          init_image: initImageBase64,
          denoising_strength: parseFloat(denoising) // Sending the slider value to Python
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to process request')
      }

      const data = await response.json()
      setImage(`data:image/png;base64,${data.image_base64}`)
      setEnhancedPrompt(data.enhanced_prompt)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image;
    link.download = `uncensored_generation_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const isEditingMode = initImageBase64 !== null;

  return (
    <div className="App" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Uncensored Image {isEditingMode ? 'Editor' : 'Generator'}</h1>
      <p>Powered by OpenRouter & Stable Diffusion</p>

      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#2a2a2a', padding: '10px', borderRadius: '4px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
            <input type="checkbox" checked={useLLM} onChange={(e) => setUseLLM(e.target.checked)} style={{ marginRight: '10px', width: '18px', height: '18px' }} disabled={isLoading} />
            <strong>Auto-Enhance Prompt</strong>
          </label>
        </div>
      </div>

      <div style={{ marginBottom: '20px', border: '2px dashed #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa', color: '#333' }}>
        <input type="file" accept="image/png, image/jpeg" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

        {isEditingMode ? (
          <div style={{ textAlign: 'center' }}>
            <p><strong>Initial Image Loaded (Editing Mode Active)</strong></p>
            <img
              src={`data:image/png;base64,${initImageBase64}`}
              alt="Input image"
              style={{ maxHeight: '150px', borderRadius: '4px', border: '2px solid #FF8C00' }}
            />

            {/* NEW: Denoising Slider */}
            <div style={{ marginTop: '20px', textAlign: 'left', backgroundColor: '#e9e9e9', padding: '15px', borderRadius: '8px' }}>
              <label>
                <strong>Denoising Strength: {denoising}</strong>
                <br />
                <input
                  type="range"
                  min="0.1" max="1.0" step="0.05"
                  value={denoising}
                  onChange={(e) => setDenoising(e.target.value)}
                  style={{ width: '100%', marginTop: '10px' }}
                  disabled={isLoading}
                />
              </label>
              <p style={{ fontSize: '13px', margin: '8px 0 0 0', color: '#555' }}>
                <strong>Tip:</strong> 0.1 barely changes the photo. 1.0 destroys it entirely. To keep faces and backgrounds looking identical while changing small details, keep this between <strong>0.2 and 0.35</strong>.
              </p>
            </div>

            <div style={{ marginTop: '15px' }}>
              <button onClick={() => setInitImageBase64(null)} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#e74c3c', color: 'white', border: 'none', marginRight: '10px', fontWeight: 'bold' }}>Remove Image</button>
              <button onClick={() => fileInputRef.current.click()} style={{ padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#ccc', color: 'black', border: 'none', fontWeight: 'bold' }}>Change Image</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p><strong>Text-to-Image Mode Active</strong></p>
            <button
              onClick={() => fileInputRef.current.click()}
              style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#4CAF50', color: 'white', border: 'none', fontWeight: 'bold' }}
            >
              🖼️ Upload Image to Edit
            </button>
            <p style={{ fontSize: '14px', color: '#666' }}>Upload an image to switch to Image-to-Image (Editing) mode.</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={isEditingMode ? "Describe how to transform the image..." : "Describe what you want to see..."}
          style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#FF8C00', color: 'white', border: 'none', fontWeight: 'bold' }}
        >
          {isLoading ? (isEditingMode ? 'Repainting...' : 'Generating...') : 'Generate'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>GPU Engine is running...</h2>
          <p>Please wait while the pixels are rendered.</p>
        </div>
      )}

      {image && !isLoading && (
        <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2>Generated Result:</h2>
          <img
            src={image}
            alt="Generated output"
            style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          />

          <button
            onClick={handleDownload}
            style={{ marginTop: '20px', padding: '12px 24px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#4CAF50', color: 'white', border: 'none', fontWeight: 'bold', width: '100%', maxWidth: '300px' }}
          >
            💾 Download Image
          </button>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1e1e1e', color: '#00ff00', borderRadius: '8px', textAlign: 'left', width: '100%' }}>
            <strong>Cognitive Layer Translation:</strong>
            <p style={{ fontFamily: 'monospace', margin: '10px 0 0 0', fontSize: '14px' }}>{enhancedPrompt}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App