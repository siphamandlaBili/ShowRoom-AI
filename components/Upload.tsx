import { CheckCircle2, CloudUploadIcon, ImageIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router';
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from 'lib/constants';

interface UploadProps {
  onComplete?: (base64: string) => void;
}

function finishProgress(
  interval: ReturnType<typeof setInterval>,
  base64: string,
  onComplete?: (b: string) => void,
) {
  clearInterval(interval);
  setTimeout(() => onComplete?.(base64), REDIRECT_DELAY_MS);
}

const Upload = ({ onComplete }: UploadProps) => {
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const { t } = useTranslation();
  const { isSignedIn } = useOutletContext<AuthContext>();

  const startProgress = React.useCallback(
    (base64: string) => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + PROGRESS_STEP;
          if (next >= 100) {
            finishProgress(interval, base64, onComplete);
            return 100;
          }
          return next;
        });
      }, PROGRESS_INTERVAL_MS);
    },
    [onComplete],
  );

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => startProgress(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) processFile(selected);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (!isSignedIn) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  return (
    <div className="upload">
      {file ? (
        <div className="upload-status">
          <div className="status-content">
            <div className="status-icon">
              {progress === 100 ? (
                <CheckCircle2 className="check" />
              ) : (
                <ImageIcon className="image" />
              )}
            </div>

            <h3>{file.name}</h3>

            <div className="progress">
              <div className="bar" style={{ width: `${progress}%` }} />
              <p className="status-text">
                {progress < 100
                  ? t('hero.analysingFloorPlanMessage')
                  : t('hero.RedirectingMessage')}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <label
          className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
          aria-label={isSignedIn ? t('hero.uploadActive') : t('hero.uploadInactive')}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            accept=".jpg,.jpeg,.png"
            disabled={!isSignedIn}
            onChange={handleChange}
          />

          <div className="drop-content">
            <div className="drop-icon">
              <CloudUploadIcon size={20} />
            </div>
            <p>{isSignedIn ? t('hero.uploadActive') : t('hero.uploadInactive')}</p>
          </div>
        </label>
      )}
    </div>
  );
};

export default Upload;
