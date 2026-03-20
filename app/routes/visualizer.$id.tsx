import { Box, LogOut, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import Button from 'components/ui/Button';
import { generate3DView } from 'lib/ai.action';

const VisualizerId = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const { initialImage, initialRender } = location.state || {};
  const hasInitialGenerated = useRef(false);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(initialRender || null);

  const handleBack = () => navigate('/');

  const runGeneration = async () => {
    if (!initialImage) return;

    try {
      setIsProcessing(true);

      const result = await generate3DView({
        sourceImage: initialImage,
      });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        // update the project with the rendered image.
      }
    } catch (error) {
      toast.error('Generation failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!initialImage || hasInitialGenerated.current) return;

    if (initialRender) {
      setCurrentImage(initialRender);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    runGeneration();
  }, [initialImage, initialRender]);
  return (
    <div className="visualizer">
      <nav className="topbar">
        <div className="brand">
          <Box className="logo" />
          <span className="name">{t('navbar.brand')}</span>
        </div>

        <Button
          text={t('visualizer.back')}
          onClick={handleBack}
          variant="ghost"
          className="exit"
          icon={<LogOut size={16} />}
        />
      </nav>

      <section className="content">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-meta">
              <p>{t('visualizer.projectLabel')}</p>
              <h2>{t('visualizer.title')}</h2>
              <p className="note">{t('visualizer.createdBy')}</p>
            </div>

            <div className="panel-actions">
              <Button
                text={t('visualizer.export')}
                onClick={() => {}}
                variant="outline"
                className="export"
                disabled={isProcessing}
              />
              <Button
                text={t('visualizer.share')}
                onClick={() => {}}
                variant="outline"
                className="share"
                disabled={isProcessing}
              />
            </div>
          </div>

          <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
            {currentImage ? (
              <img src={currentImage} alt="AI Render" className="render-img" />
            ) : (
              <div className="render-placeholder">
                {initialImage && (
                  <img src={initialImage} alt="Original" className="render-fallback" />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="render-overlay">
                <div className="rendering-card">
                  <RefreshCcw className="spinner" />
                  <span className="title">{t('visualizer.rendering')}</span>
                  <span className="subtitle">{t('visualizer.renderingSubtitle')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default VisualizerId;
