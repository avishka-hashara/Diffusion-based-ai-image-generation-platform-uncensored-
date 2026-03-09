import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [image, setImage] = useState(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // NEW: State for the Raw Bypass toggle (defaults to true)
  const [useLLM, setUseLLM] = useState(true)

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
        // NEW: Sending the toggle state to the backend
        body: JSON.stringify({ prompt: prompt, use_llm: useLLM })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.detail || 'Failed to generate image')
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

  return (
    <div className="App" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1>Uncensored Image Generator</h1>
      <p>Powered by OpenRouter & Stable Diffusion</p>

      {/* NEW: The Raw Bypass Checkbox */}
      <div style={{ marginBottom: '15px', textAlign: 'left', backgroundColor: '#2a2a2a', padding: '10px', borderRadius: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: 'white' }}>
          <input
            type="checkbox"
            checked={useLLM}
            onChange={(e) => setUseLLM(e.target.checked)}
            style={{ marginRight: '10px', width: '18px', height: '18px' }}
            disabled={isLoading}
          />
          <strong>Auto-Enhance Prompt with LLM</strong>
          <span style={{ marginLeft: '10px', fontSize: '13px', color: '#aaa' }}>(Turn OFF to bypass censorship filters and send raw text directly to the GPU)</span>
        </label>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={useLLM ? "Describe what you want to see..." : "Enter raw, comma-separated tags (e.g., masterpiece, 1girl, highly detailed, neon lighting)..."}
          style={{ flex: 1, padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', backgroundColor: '#FF8C00', color: 'white', border: 'none', fontWeight: 'bold' }}
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {isLoading && (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>{useLLM ? 'Translating prompt and warming' : 'Warming'} up the GPU...</h2>
          <p>Please wait. The RTX 4050 is rendering your pixels.</p>
        </div>
      )}

      {image && !isLoading && (
        <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            <strong>{useLLM ? 'Cognitive Layer Translation (What the GPU actually saw):' : 'Raw Prompt Sent to GPU:'}</strong>
            <p style={{ fontFamily: 'monospace', margin: '10px 0 0 0', fontSize: '14px' }}>{enhancedPrompt}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App