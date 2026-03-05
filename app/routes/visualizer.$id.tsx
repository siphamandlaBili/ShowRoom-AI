import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

const VisualizerId = () => {
  const { t } = useTranslation();

  const location = useLocation();
  const { initialImage, name } = location.state || {};
  return (
    <section>
      <h1>{name || t('visualizer.title')}</h1>

      <div className="visualizer">
        {initialImage && (
          <div className="image-contaier">
            <h2>{t('visualizer.sourceImage')}</h2>

            <img src={initialImage} alt="source" />
          </div>
        )}
      </div>
    </section>
  );
};

export default VisualizerId;
