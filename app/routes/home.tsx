import { ArrowRight, ArrowUpRight, Clock, Layers } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router';
import Navbar from 'components/Navbar';
import Upload from 'components/Upload';
import { createProject, getProjects } from 'lib/puter.action';

type GsapRuntime = typeof import('gsap').default;

type ScaleSetter = (value: number) => unknown;

function applySetters(setters: ScaleSetter[], value: number) {
  for (const setter of setters) {
    setter(value);
  }
}

function updateHeroCharMagnify(
  event: MouseEvent,
  charElements: HTMLSpanElement[],
  scaleSetters: ScaleSetter[],
  ySetters: ScaleSetter[],
) {
  const radius = 95;
  const maxScaleBoost = 0.42;
  const maxLift = 7;

  for (const [index, charElement] of charElements.entries()) {
    const charRect = charElement.getBoundingClientRect();
    const charCenterX = charRect.left + charRect.width / 2;
    const charCenterY = charRect.top + charRect.height / 2;
    const distance = Math.hypot(event.clientX - charCenterX, event.clientY - charCenterY);
    const influence = Math.max(0, 1 - distance / radius);
    const nextScale = 1 + influence * maxScaleBoost;
    const nextY = -influence * maxLift;

    scaleSetters[index](nextScale);
    ySetters[index](nextY);
  }
}

export function meta() {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  const { t } = useTranslation();
  const heroTitle = t('hero.title');
  const heroTitleChars = Array.from(heroTitle);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const projectsRef = useRef<HTMLElement | null>(null);
  const uploadShellRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroCharRefs = useRef<HTMLSpanElement[]>([]);

  const navigate = useNavigate();
  const { isSignedIn, username } = useOutletContext<AuthContext>();
  const [projects, setProjects] = useState<DesignItem[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  const isCreatingProjectRef = useRef(false);

  // Load projects whenever the user signs in
  useEffect(() => {
    if (!isSignedIn) {
      setProjects([]);
      return;
    }
    setIsLoadingProjects(true);
    getProjects()
      .then((fetched) => setProjects(fetched))
      .catch((err) => console.error('[getProjects]', err))
      .finally(() => setIsLoadingProjects(false));
  }, [isSignedIn]);

  const handleUploadComplete = async (base64Image: string) => {
    if (isCreatingProjectRef.current) return false;

    isCreatingProjectRef.current = true;

    try {
      const newId = Date.now().toString();
      const name = `Residence-${newId}`;

      // Navigate immediately so the user isn't blocked waiting for hosting/worker
      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: base64Image,
          initialRender: null,
          name,
        },
      });

      // Save the project in the background — don't block routing on it
      const newItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
      };

      createProject({ item: newItem, visibility: 'private' })
        .then((saved) => {
          if (saved) setProjects((prev) => [saved, ...prev]);
        })
        .catch((error) => {
          console.error('[createProject]', error);
          toast.error(error instanceof Error ? error.message : 'Failed to save project.');
        });

      return true;
    } finally {
      isCreatingProjectRef.current = false;
    }
  };

  const setHeroCharRef = (element: HTMLSpanElement | null, index: number) => {
    if (element) {
      heroCharRefs.current[index] = element;
    }
  };

  useEffect(() => {
    let isActive = true;
    let context: ReturnType<GsapRuntime['context']> | null = null;
    let cleanupInteractions: (() => void) | null = null;
    let gridDriftTween: ReturnType<GsapRuntime['to']> | null = null;

    const setupGsapAnimations = async () => {
      let hasScrollTrigger = false;
      let gsapRuntime: GsapRuntime;

      if (globalThis.window === undefined) {
        return;
      }

      try {
        const gsapModule = await import('gsap');
        gsapRuntime = gsapModule.default;
      } catch {
        return;
      }

      try {
        const scrollTriggerModule = await import('gsap/ScrollTrigger');
        const scrollTriggerPlugin =
          scrollTriggerModule.ScrollTrigger ?? scrollTriggerModule.default;

        if (scrollTriggerPlugin) {
          gsapRuntime.registerPlugin(scrollTriggerPlugin);
          hasScrollTrigger = true;
        }
      } catch {
        hasScrollTrigger = false;
      }

      if (!isActive) {
        return;
      }

      context = gsapRuntime.context(() => {
        gsapRuntime.fromTo(
          [
            '.hero .announce',
            '.hero h1',
            '.hero .subtitle',
            '.hero .actions',
            '.hero .upload-shell',
          ],
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out',
          },
        );

        if (hasScrollTrigger) {
          gsapRuntime.fromTo(
            ['.projects .section-head', '.projects .project-card'],
            { y: 28, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.12,
              ease: 'power2.out',
              scrollTrigger: {
                trigger: projectsRef.current,
                start: 'top 82%',
                once: true,
              },
            },
          );
          return;
        }

        gsapRuntime.fromTo(
          ['.projects .section-head', '.projects .project-card'],
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power2.out',
            delay: 0.25,
          },
        );
      }, pageRef);

      const titleElement = heroTitleRef.current;
      const uploadShellElement = uploadShellRef.current;
      const gridOverlayElement =
        uploadShellElement?.querySelector<HTMLDivElement>('.grid-overlay') ?? null;
      const charElements = heroCharRefs.current.filter(Boolean);
      const scaleSetters = charElements.map((charElement) =>
        gsapRuntime.quickTo(charElement, 'scale', {
          duration: 0.35,
          ease: 'power3.out',
        }),
      );
      const ySetters = charElements.map((charElement) =>
        gsapRuntime.quickTo(charElement, 'y', {
          duration: 0.35,
          ease: 'power3.out',
        }),
      );

      const resetCharScale = () => {
        if (charElements.length === 0) {
          return;
        }

        applySetters(scaleSetters, 1);
        applySetters(ySetters, 0);
      };

      const handleTitleMouseMove = (event: MouseEvent) => {
        if (!titleElement || charElements.length === 0) {
          return;
        }

        updateHeroCharMagnify(event, charElements, scaleSetters, ySetters);
      };

      if (titleElement && charElements.length > 0) {
        titleElement.addEventListener('mousemove', handleTitleMouseMove);
        titleElement.addEventListener('mouseleave', resetCharScale);
      }

      let handleGridMouseMove: ((event: MouseEvent) => void) | null = null;
      let handleGridMouseLeave: (() => void) | null = null;

      if (uploadShellElement && gridOverlayElement) {
        const setGridX = gsapRuntime.quickTo(gridOverlayElement, 'x', {
          duration: 0.45,
          ease: 'power3.out',
        });
        const setGridY = gsapRuntime.quickTo(gridOverlayElement, 'y', {
          duration: 0.45,
          ease: 'power3.out',
        });
        const setGridOpacity = gsapRuntime.quickTo(gridOverlayElement, 'opacity', {
          duration: 0.35,
          ease: 'power2.out',
        });

        gridDriftTween = gsapRuntime.to(gridOverlayElement, {
          backgroundPosition: '120px 120px, 120px 120px',
          duration: 16,
          repeat: -1,
          ease: 'none',
        });

        handleGridMouseMove = (event: MouseEvent) => {
          const bounds = uploadShellElement.getBoundingClientRect();
          const ratioX = (event.clientX - bounds.left) / bounds.width - 0.5;
          const ratioY = (event.clientY - bounds.top) / bounds.height - 0.5;

          setGridX(ratioX * 16);
          setGridY(ratioY * 14);
          setGridOpacity(0.62);
        };

        handleGridMouseLeave = () => {
          setGridX(0);
          setGridY(0);
          setGridOpacity(0.4);
        };

        uploadShellElement.addEventListener('mousemove', handleGridMouseMove);
        uploadShellElement.addEventListener('mouseleave', handleGridMouseLeave);
      }

      cleanupInteractions = () => {
        if (titleElement && charElements.length > 0) {
          titleElement.removeEventListener('mousemove', handleTitleMouseMove);
          titleElement.removeEventListener('mouseleave', resetCharScale);
        }

        if (uploadShellElement && handleGridMouseMove && handleGridMouseLeave) {
          uploadShellElement.removeEventListener('mousemove', handleGridMouseMove);
          uploadShellElement.removeEventListener('mouseleave', handleGridMouseLeave);
        }
      };
    };

    void setupGsapAnimations();

    return () => {
      isActive = false;

      cleanupInteractions?.();

      if (gridDriftTween) {
        gridDriftTween.kill();
      }

      context?.revert();
    };
  }, [heroTitle]);

  return (
    <div ref={pageRef} className="home">
      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>{t('hero.introducing')}</p>
        </div>
        <h1 ref={heroTitleRef} className="hero-title">
          {heroTitleChars.map((character, index) => (
            <span
              key={`${character}-${index}`}
              className={`hero-title-char${character === ' ' ? ' hero-title-space' : ''}`}
              ref={(element) => {
                setHeroCharRef(element, index);
              }}
            >
              {character === ' ' ? '\u00A0' : character}
            </span>
          ))}
        </h1>

        <p className="subtitle">{t('hero.subtitle')}</p>

        <div className="actions">
          <a href="#upload" className="cta">
            {t('hero.getStarted')} <ArrowRight className="icon" />
          </a>
        </div>

        <div id="upload" ref={uploadShellRef} className="upload-shell">
          <div className="grid-overlay" />
          <div className="upload-card">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>
              <h3>{t('hero.upload')}</h3>
              <p>{t('hero.uploadDescription')}</p>
            </div>
            <Upload onComplete={handleUploadComplete} />
          </div>
        </div>
      </section>

      <section ref={projectsRef} className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>{t('projects.title')}</h2>
              <p>{t('projects.description')}</p>
            </div>
          </div>

          <div className="projects-grid">
            {isLoadingProjects ? (
              <p className="projects-empty">{t('projects.loading')}</p>
            ) : projects.length === 0 ? (
              <p className="projects-empty">{t('projects.empty')}</p>
            ) : (
              projects.map(({ id, name, sourceImage, renderedImage, timestamp, isPublic }) => (
                <div
                  key={id}
                  className="project-card group"
                  onClick={() =>
                    navigate(`/visualizer/${id}`, {
                      state: {
                        initialImage: sourceImage,
                        initialRender: renderedImage || null,
                        name,
                        isPublic,
                      },
                    })
                  }
                  style={{ cursor: 'pointer' }}
                >
                  <div className="preview">
                    <img src={renderedImage || sourceImage} alt={name ?? 'project'} />
                    <div className={`badge ${isPublic ? 'badge--public' : 'badge--private'}`}>
                      <span>
                        {isPublic ? t('projects.badgePublic') : t('projects.badgePrivate')}
                      </span>
                    </div>
                  </div>

                  <div className="card-body">
                    <div>
                      <h3>{name}</h3>

                      <div className="meta">
                        <Clock size={12} />
                        <span>{new Date(timestamp).toLocaleDateString()}</span>
                        {username && <span>By {username}</span>}
                      </div>
                    </div>

                    <div className="arrow">
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
