import { Box } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router';
import type { AuthContext } from '../app/root';
import Button from './ui/Button';

const Navbar = () => {
  const { t } = useTranslation();

  const { isSignedIn, username, signIn, signOut } = useOutletContext<AuthContext>();

  const handleAuthClick = async () => {
    if (isSignedIn) {
      try {
        await signOut();
        toast.success(t('navbar.signOutSuccess'));
      } catch {
        toast.error(t('navbar.signOutError'));
      }
    } else {
      try {
        await signIn();
      } catch {
        toast.error(t('navbar.signInError'));
      }
    }
  };

  return (
    <header className="navbar">
      <nav className="inner">
        <div className="left">
          <div className="brand">
            <Box className="logo" />
            <span className="name">{t('navbar.brand')}</span>
          </div>

          <ul className="links">
            <li>
              <a href="#products">{t('navbar.product')}</a>
            </li>
            <li>
              <a href="#pricing">{t('navbar.pricing')}</a>
            </li>
            <li>
              <a href="#community">{t('navbar.community')}</a>
            </li>
          </ul>
        </div>

        <div className="actions">
          {isSignedIn && <span className="greeting">{t('navbar.greeting', { username })}</span>}
          {isSignedIn ? (
            <Button text={t('navbar.logout')} onClick={handleAuthClick} variant="cta" />
          ) : (
            <>
              <Button text={t('navbar.login')} onClick={handleAuthClick} variant="ghost" />
              <Button text={t('navbar.getStarted')} variant="cta" />
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
