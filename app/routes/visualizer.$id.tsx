import { Box, LogOut, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router';
import Button from 'components/ui/Button';
import { generate3DView } from 'lib/ai.action';
import { createProject, getProjectById } from 'lib/puter.action';

const VisualizerId = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useOutletContext<AuthContext>();

  // Location state is set when navigating from upload (project not yet saved)
  const locationState = location.state as VisualizerLocationState | null;

  const hasInitialGenerated = useRef(false);

  const [projectId, setProjectId] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    locationState?.initialRender || null,
  );

  const handleBack = () => navigate('/');

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item?.sourceImage) return;

    try {
      setIsProcessing(true);

      const result = await generate3DView({
        sourceImage: item.sourceImage,
      });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        };

        const saved = await createProject({ item: updatedItem, visibility: 'private' });

        if (saved) {
          setProjectId(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
          toast.success(t('visualizer.generationSuccess'));
        } else {
          toast.error(t('visualizer.saveFailed'));
        }
      }
    } catch (error) {
      toast.error('Generation failed: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      // If we arrived from the upload flow, use location state directly —
      // the project may not be persisted yet (background save still in flight)
      if (locationState?.initialImage) {
        const synthetic: DesignItem = {
          id,
          name: locationState.name ?? `Residence ${id}`,
          sourceImage: locationState.initialImage,
          renderedImage: locationState.initialRender ?? undefined,
          timestamp: Date.now(),
          ownerId: locationState.ownerId ?? null,
        };
        setProjectId(synthetic);
        setCurrentImage(locationState.initialRender || null);
        setIsProjectLoading(false);
        hasInitialGenerated.current = false;
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProjectId(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id, locationState]);

  useEffect(() => {
    if (isProjectLoading || hasInitialGenerated.current || !projectId?.sourceImage) return;

    if (projectId.renderedImage) {
      setCurrentImage(projectId.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(projectId);
  }, [projectId, isProjectLoading]);

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
              <h2>{projectId?.name || `Residence ${id}`}</h2>
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
                {projectId?.sourceImage && (
                  <img src={projectId.sourceImage} alt="Original" className="render-fallback" />
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
