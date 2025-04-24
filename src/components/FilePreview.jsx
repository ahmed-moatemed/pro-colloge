import { useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';
import '../styles/FilePreview.css';


pdfjsLib.GlobalWorkerOptions.workerSrc = "/node_modules/pdfjs-dist/build/pdf.worker.mjs";

// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function FilePreview({ fileurl, onClose }) {
  const canvasRef = useRef(null);
  const isImage = fileurl.match(/\.(jpg|jpeg|png)$/i);

  useEffect(() => {
    if (isImage) return;

    const loadPDF = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(fileurl).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;
      } catch (err) {
        console.error('PDF Error:', err);
      }
    };

    if (!isImage) loadPDF();
  }, [fileurl, isImage]);

  return (
    <div className="file-preview">
      <div className="preview-container">
        <button onClick={onClose} className="close-button">
          إغلاق
        </button>
        {isImage ? (
          <img src={fileurl} alt="Preview" className="preview-image" />
        ) : (
          <canvas ref={canvasRef} className="preview-canvas" />
        )}
      </div>
    </div>
  );
}

export default FilePreview;