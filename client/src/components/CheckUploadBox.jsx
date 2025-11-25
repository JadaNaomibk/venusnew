// src/components/CheckUploadBox.jsx
// Small demo-only "upload check" box. This does NOT send files to backend,
// it just lets the user pick a file so the UI feels more real.

export default function CheckUploadBox({ onImageSelected }) {
  function handleFile(e) {
    const file = e.target.files[0];
    if (file) {
      onImageSelected(file.name);
    }
  }

  return (
    <div
      style={{
        border: '1px dashed #4b5563',
        padding: '1rem',
        borderRadius: '12px',
        marginTop: '0.5rem',
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: '0.5rem',
          color: '#9ca3af',
          fontSize: '0.8rem',
        }}
      >
        upload a mock check (demo only)
      </p>
      <input type="file" accept="image/*" onChange={handleFile} />
    </div>
  );
}