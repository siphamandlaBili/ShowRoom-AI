import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, Clock, Layers } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from 'components/Navbar';

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

  const setHeroCharRef = (element: HTMLSpanElement | null, index: number) => {
    if (element) {
      heroCharRefs.current[index] = element;
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.fromTo(
        ['.hero .announce', '.hero h1', '.hero .subtitle', '.hero .actions', '.hero .upload-shell'],
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
        },
      );

      gsap.fromTo(
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
    }, pageRef);

    const titleElement = heroTitleRef.current;
    const uploadShellElement = uploadShellRef.current;
    const gridOverlayElement =
      uploadShellElement?.querySelector<HTMLDivElement>('.grid-overlay') ?? null;
    const charElements = heroCharRefs.current.filter(Boolean);
    const scaleSetters = charElements.map((charElement) =>
      gsap.quickTo(charElement, 'scale', {
        duration: 0.35,
        ease: 'power3.out',
      }),
    );
    const ySetters = charElements.map((charElement) =>
      gsap.quickTo(charElement, 'y', {
        duration: 0.35,
        ease: 'power3.out',
      }),
    );

    const resetCharScale = () => {
      if (charElements.length === 0) {
        return;
      }

      scaleSetters.forEach((setScale) => {
        setScale(1);
      });

      ySetters.forEach((setY) => {
        setY(0);
      });
    };

    const handleTitleMouseMove = (event: MouseEvent) => {
      if (!titleElement || charElements.length === 0) {
        return;
      }

      const radius = 95;
      const maxScaleBoost = 0.42;
      const maxLift = 7;

      charElements.forEach((charElement, index) => {
        const charRect = charElement.getBoundingClientRect();
        const charCenterX = charRect.left + charRect.width / 2;
        const charCenterY = charRect.top + charRect.height / 2;
        const distance = Math.hypot(event.clientX - charCenterX, event.clientY - charCenterY);
        const influence = Math.max(0, 1 - distance / radius);
        const nextScale = 1 + influence * maxScaleBoost;
        const nextY = -influence * maxLift;

        scaleSetters[index](nextScale);
        ySetters[index](nextY);
      });
    };

    if (titleElement && charElements.length > 0) {
      titleElement.addEventListener('mousemove', handleTitleMouseMove);
      titleElement.addEventListener('mouseleave', resetCharScale);
    }

    let handleGridMouseMove: ((event: MouseEvent) => void) | null = null;
    let handleGridMouseLeave: (() => void) | null = null;
    let gridDriftTween: gsap.core.Tween | null = null;

    if (uploadShellElement && gridOverlayElement) {
      const setGridX = gsap.quickTo(gridOverlayElement, 'x', {
        duration: 0.45,
        ease: 'power3.out',
      });
      const setGridY = gsap.quickTo(gridOverlayElement, 'y', {
        duration: 0.45,
        ease: 'power3.out',
      });
      const setGridOpacity = gsap.quickTo(gridOverlayElement, 'opacity', {
        duration: 0.35,
        ease: 'power2.out',
      });

      gridDriftTween = gsap.to(gridOverlayElement, {
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

    return () => {
      if (titleElement && charElements.length > 0) {
        titleElement.removeEventListener('mousemove', handleTitleMouseMove);
        titleElement.removeEventListener('mouseleave', resetCharScale);
      }

      if (uploadShellElement && handleGridMouseMove && handleGridMouseLeave) {
        uploadShellElement.removeEventListener('mousemove', handleGridMouseMove);
        uploadShellElement.removeEventListener('mouseleave', handleGridMouseLeave);
      }

      if (gridDriftTween) {
        gridDriftTween.kill();
      }

      context.revert();
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
            <p>{t('hero.uploadImage')}</p>
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
            <div className="project-card group">
              <div className="preview">
                <img
                  src="https://roomify-mlhuk267-dfwu1i.puter.site/projects/1770803585402/rendered.png"
                  alt="preview"
                />
                <div className="badge">
                  <span>{t('projects.badge')}</span>
                </div>
              </div>

              <div className="card-body">
                <div>
                  <h3>Project Soweto</h3>

                  <div className="meta">
                    <Clock size={12} />
                    <span>{new Date('01.01.2026').toLocaleDateString()}</span>
                    <span>By Sipha</span>
                  </div>
                </div>

                <div className="arrow">
                  <ArrowUpRight size={16} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
