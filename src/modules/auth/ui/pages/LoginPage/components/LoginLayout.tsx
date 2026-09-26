import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useColorScheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { CONFIG } from 'app/config/globalConfig';
import { useTranslate } from 'app/providers/locales';
import { allLangs, type LangCode } from 'app/providers/locales/locales-config';
import { useSettingsContext } from 'shared/ui/Settings/context/use-settings-context';

type LoginLayoutProps = { children: ReactNode };

const ink = '#191B1F';
const cobalt = '#0C68E9';
const brandName = 'Cafe Postcode';
const brandLine = 'CAFE POSTCODE · POS';
const wordmarkFirst = 'POST';
const wordmarkSecond = 'CODE.';
// Photo: https://www.pexels.com/photo/barista-using-touchscreen-at-coffee-shop-counter-31777068/
const photoPath = `${CONFIG.assetsDir}/assets/images/login-pos-counter.jpg`;

function LoginBrand({ light }: { light: boolean }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.3 }}>
      <Box
        component="img"
        src={`${CONFIG.assetsDir}/assets/icons/admin-logo.webp`}
        alt=""
        sx={{ display: 'block', width: 38, height: 38, borderRadius: 0.75 }}
      />
      <Typography sx={{ color: light ? '#FFFFFF' : ink, fontSize: 16, fontWeight: 800, letterSpacing: -0.5 }}>
        {brandName}
      </Typography>
    </Box>
  );
}

function LoginLanguageSwitcher({ dark }: { dark: boolean }) {
  const { t, currentLang, onChangeLang } = useTranslate('auth');
  const labels: Record<LangCode, string> = { uz: 'UZ', 'uz-Cyrl': 'ЎЗ', ru: 'RU' };

  return (
    <Box
      component="nav"
      aria-label={t('loginVisual.languageLabel')}
      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {allLangs.map((lang) => {
        const selected = currentLang.value === lang.value;

        return (
          <ButtonBase
            key={lang.value}
            type="button"
            aria-label={lang.label}
            aria-pressed={selected}
            onClick={() => void onChangeLang(lang.value)}
            sx={{
              minWidth: 36,
              height: 34,
              px: 0.5,
              borderBottom: '2px solid',
              borderColor: selected ? cobalt : 'transparent',
              color: selected ? (dark ? '#FFFFFF' : ink) : dark ? '#AEB8C3' : '#7A858E',
              fontSize: 12,
              fontWeight: selected ? 800 : 650,
              letterSpacing: 0.35,
              '&:hover': { color: dark ? '#FFFFFF' : ink },
              '&:focus-visible': { outline: `2px solid ${cobalt}`, outlineOffset: 3 },
            }}>
            {labels[lang.value]}
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function ModeIcon({ mode }: { mode: 'light' | 'dark' }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round">
      {mode === 'light' ? (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </>
      ) : (
        <path d="M20.3 15.4A8.6 8.6 0 0 1 8.6 3.7a8.7 8.7 0 1 0 11.7 11.7Z" />
      )}
    </svg>
  );
}

function LoginModeSwitcher({ dark }: { dark: boolean }) {
  const { t } = useTranslate('auth');
  const { setMode } = useColorScheme();
  const settings = useSettingsContext();

  const changeMode = (nextMode: 'light' | 'dark') => {
    setMode(nextMode);
    settings.setState({ mode: nextMode });
  };

  return (
    <Box
      role="group"
      aria-label={t('loginVisual.themeLabel')}
      sx={{
        display: 'flex',
        p: '2px',
        border: '1px solid',
        borderColor: dark ? '#46515E' : '#D9E0E7',
        borderRadius: 1,
      }}>
      {(['light', 'dark'] as const).map((mode) => {
        const selected = dark === (mode === 'dark');

        return (
          <ButtonBase
            key={mode}
            type="button"
            title={t(mode === 'light' ? 'loginVisual.lightMode' : 'loginVisual.darkMode')}
            aria-label={t(mode === 'light' ? 'loginVisual.lightMode' : 'loginVisual.darkMode')}
            aria-pressed={selected}
            onClick={() => changeMode(mode)}
            sx={{
              width: 34,
              height: 30,
              borderRadius: 0.625,
              bgcolor: selected ? (dark ? '#354A65' : '#E8F1FF') : 'transparent',
              color: selected ? (dark ? '#FFFFFF' : cobalt) : dark ? '#AEB8C3' : '#64707A',
              transition: 'background-color 160ms ease, color 160ms ease',
              '&:focus-visible': { outline: `2px solid ${cobalt}`, outlineOffset: 2 },
            }}>
            <ModeIcon mode={mode} />
          </ButtonBase>
        );
      })}
    </Box>
  );
}

export function LoginLayout({ children }: LoginLayoutProps) {
  const { t } = useTranslate('auth');
  const { colorScheme } = useColorScheme();
  const dark = colorScheme === 'dark';

  return (
    <Box
      component="main"
      sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '61% 39%' } }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          minHeight: '100dvh',
          overflow: 'hidden',
          bgcolor: ink,
        }}>
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${photoPath})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 48%',
            filter: 'grayscale(0.65)',
            opacity: 0.58,
          }}
        />
        <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(17, 19, 23, 0.70)' }} />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            px: { md: 6, lg: 9 },
            pt: '35px',
            pb: '51px',
          }}>
          <LoginBrand light />
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 5 }}>
            <Typography sx={{ color: '#7CB7FF', fontSize: 12, fontWeight: 800, letterSpacing: 2.8, mb: 3.5 }}>
              {brandLine}
            </Typography>
            <Typography
              sx={{
                color: '#FFFFFF',
                fontSize: { md: 78, lg: 104, xl: 118 },
                fontWeight: 850,
                letterSpacing: { md: -5, lg: -7 },
                lineHeight: 0.88,
                textShadow: '0 2px 20px rgba(0, 0, 0, 0.12)',
              }}>
              {wordmarkFirst}
              <br />
              {wordmarkSecond}
            </Typography>
            <Box sx={{ width: 86, height: 3, bgcolor: '#4D9BFF', mt: 6, mb: 3.25 }} />
            <Typography sx={{ maxWidth: 390, color: '#DBDFE3', fontSize: { md: 17, lg: 19 }, lineHeight: 1.5 }}>
              {t('loginVisual.caption')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 26, height: '1px', bgcolor: '#8B929B' }} />
            <Typography sx={{ color: '#C2C7CD', fontSize: 11, fontWeight: 750, letterSpacing: 1.5 }}>
              {t('loginVisual.adminLabel')}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'relative',
          minWidth: 0,
          bgcolor: dark ? '#171C23' : '#FFFFFF',
          borderLeft: { md: `7px solid ${cobalt}` },
        }}>
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            alignItems: 'center',
            height: 92,
            px: 3,
            bgcolor: ink,
            borderBottom: `3px solid ${cobalt}`,
          }}>
          <LoginBrand light />
        </Box>
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            height: 56,
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            borderBottom: '1px solid',
            borderColor: dark ? '#303943' : '#EFF1F3',
          }}>
          <LoginModeSwitcher dark={dark} />
          <LoginLanguageSwitcher dark={dark} />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: 35,
            left: { md: 40, lg: 64 },
          }}>
          <LoginModeSwitcher dark={dark} />
        </Box>
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            position: 'absolute',
            top: 35,
            right: { md: 40, lg: 64 },
          }}>
          <LoginLanguageSwitcher dark={dark} />
        </Box>
        <Box
          sx={{
            minHeight: { xs: 'calc(100dvh - 148px)', md: '100dvh' },
            display: 'flex',
            alignItems: 'center',
            px: { xs: 3, sm: 7, md: 5, lg: 8 },
            py: { xs: 6, md: 8 },
          }}>
          <Box sx={{ width: '100%', maxWidth: 410, mx: 'auto' }}>{children}</Box>
        </Box>
      </Box>
    </Box>
  );
}
