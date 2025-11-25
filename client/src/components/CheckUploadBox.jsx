// client/src/components/CheckUploadBox.jsx
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
        marginTop: '0.5rem'
      }}
    >
      <p
        style={{
          margin: 0,
          marginBottom: '0.5rem',
          color: '#9ca3af'
        }}
      >
        upload a mock check (demo only)
      </p>
      <input type="file" accept="image/*" onChange={handleFile} />
    </div>
  );
}
