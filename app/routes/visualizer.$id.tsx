import { Box, Globe, Lock, LogOut, RefreshCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useOutletContext, useParams } from 'react-router';
import Button from 'components/ui/Button';
import { generate3DView } from 'lib/ai.action';
import { createProject, getProjectById } from 'lib/puter.action';
import { imageUrlToPngBlob, isHostedUrl } from 'lib/utils';

const VisualizerId = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useOutletContext<AuthContext>();

  const locationState = location.state as VisualizerLocationState | null;

  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    locationState?.initialRender || null,
  );
  const [isPublic, setIsPublic] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleBack = () => navigate('/');

  const handleExport = async () => {
    if (!currentImage || isExporting) return;

    setIsExporting(true);
    try {
      const blob = await imageUrlToPngBlob(currentImage);
      if (!blob) throw new Error('blob conversion failed');

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = `${project?.name ?? `showroom-${id}`}.png`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
      toast.success(t('visualizer.exportSuccess'));
    } catch {
      toast.error(t('visualizer.exportError'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!currentImage || isSharing) return;

    if (!isPublic) {
      toast.error(t('visualizer.shareNotPublic'));
      return;
    }

    const shareUrl =
      project?.renderedImage && isHostedUrl(project.renderedImage)
        ? project.renderedImage
        : currentImage;

    setIsSharing(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('visualizer.shareSuccess'));
    } catch {
      toast.error(t('visualizer.shareError'));
    } finally {
      setIsSharing(false);
    }
  };

  const handleVisibilityToggle = async () => {
    if (!project || isTogglingVisibility) return;

    const nextVisibility = isPublic ? 'private' : 'public';
    setIsTogglingVisibility(true);

    try {
      const updatedItem: DesignItem = {
        ...project,
        renderedImage: currentImage ?? project.renderedImage ?? undefined,
        isPublic: !isPublic,
        ownerId: project.ownerId ?? userId ?? null,
      };

      const saved = await createProject({ item: updatedItem, visibility: nextVisibility });

      if (saved) {
        setProject(saved);
        setIsPublic(!isPublic);
        toast.success(
          nextVisibility === 'public' ? t('visualizer.madePublic') : t('visualizer.madePrivate'),
        );
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('visualizer.visibilityError'));
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item?.sourceImage) return;

    try {
      setIsProcessing(true);

      const result = await generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem: DesignItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: isPublic,
        };

        const saved = await createProject({
          item: updatedItem,
          visibility: isPublic ? 'public' : 'private',
        });

        if (saved) {
          setProject(saved);
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

      if (locationState?.initialImage) {
        const synthetic: DesignItem = {
          id,
          name: locationState.name ?? `Residence ${id}`,
          sourceImage: locationState.initialImage,
          renderedImage: locationState.initialRender ?? undefined,
          timestamp: Date.now(),
          ownerId: locationState.ownerId ?? null,
          isPublic: locationState.isPublic ?? false,
        };
        setProject(synthetic);
        setIsPublic(locationState.isPublic ?? false);
        setCurrentImage(locationState.initialRender || null);
        setIsProjectLoading(false);
        hasInitialGenerated.current = false;
        return;
      }

      setIsProjectLoading(true);
      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setIsPublic(fetchedProject?.isPublic ?? false);
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
    if (isProjectLoading || hasInitialGenerated.current || !project?.sourceImage) return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

  const showCompare = !isProcessing && !!currentImage && !!project?.sourceImage;

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
              <h2>{project?.name || `Residence ${id}`}</h2>
              <p className="note">{t('visualizer.createdBy')}</p>
            </div>

            <div className="panel-actions">
              {/* Visibility toggle */}
              <button
                type="button"
                className={`visibility-toggle ${isPublic ? 'is-public' : 'is-private'}`}
                onClick={handleVisibilityToggle}
                disabled={isTogglingVisibility || isProcessing || !currentImage}
                title={isPublic ? t('visualizer.makePrivate') : t('visualizer.makePublic')}
              >
                {isPublic ? (
                  <>
                    <Globe size={14} />
                    <span>{t('visualizer.public')}</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>{t('visualizer.private')}</span>
                  </>
                )}
              </button>

              <Button
                text={isExporting ? '...' : t('visualizer.export')}
                onClick={handleExport}
                variant="outline"
                className="export"
                disabled={isProcessing || isExporting || !currentImage}
              />
              <Button
                text={isSharing ? '...' : t('visualizer.share')}
                onClick={handleShare}
                variant="outline"
                className="share"
                disabled={isProcessing || isSharing || !currentImage}
              />
            </div>
          </div>

          <div className={`render-area ${isProcessing ? 'is-processing' : ''}`}>
            {showCompare ? (
              <div className="compare-wrapper">
                <p className="compare-hint">{t('visualizer.compareHint')}</p>
                <ReactCompareSlider
                  className="compare-slider"
                  itemOne={
                    <div className="compare-item">
                      <ReactCompareSliderImage
                        src={project!.sourceImage}
                        alt={t('visualizer.originalAlt')}
                        style={{ objectFit: 'contain', background: '#f4f4f5' }}
                      />
                      <span className="compare-label compare-label--left">
                        {t('visualizer.originalLabel')}
                      </span>
                    </div>
                  }
                  itemTwo={
                    <div className="compare-item">
                      <ReactCompareSliderImage
                        src={currentImage!}
                        alt={t('visualizer.renderedAlt')}
                        style={{ objectFit: 'contain', background: '#f4f4f5' }}
                      />
                      <span className="compare-label compare-label--right">
                        {t('visualizer.renderedLabel')}
                      </span>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className="render-placeholder">
                {project?.sourceImage && (
                  <img
                    src={project.sourceImage}
                    alt={t('visualizer.originalAlt')}
                    className="render-fallback"
                  />
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
