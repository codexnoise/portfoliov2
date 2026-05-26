import esCommon from './es/common.json'
import esHome from './es/home.json'
import esAbout from './es/about.json'
import esExperience from './es/experience.json'
import esProjects from './es/projects.json'

import enCommon from './en/common.json'
import enHome from './en/home.json'
import enAbout from './en/about.json'
import enExperience from './en/experience.json'
import enProjects from './en/projects.json'

export type Locale = 'es' | 'en'

export const LOCALES: readonly Locale[] = ['es', 'en'] as const
export const DEFAULT_LOCALE: Locale = 'es'

const translations = {
  es: {
    common: esCommon,
    home: esHome,
    about: esAbout,
    experience: esExperience,
    projects: esProjects,
  },
  en: {
    common: enCommon,
    home: enHome,
    about: enAbout,
    experience: enExperience,
    projects: enProjects,
  },
} as const

export type Translations = (typeof translations)['es']

export function getLocale(url: URL): Locale {
  const first = url.pathname.split('/').filter(Boolean)[0]
  return first === 'en' ? 'en' : 'es'
}

export function useTranslations(locale: Locale): Translations {
  return translations[locale] as Translations
}

export function localizedPath(path: string, locale: Locale): string {
  let p = path

  if (p === '/en' || p === '/en/') {
    p = '/'
  } else if (p.startsWith('/en/')) {
    p = p.slice(3)
  }

  if (locale === 'es') return p
  return p === '/' ? '/en/' : `/en${p}`
}

export function alternateUrls(url: URL): Record<Locale, string> {
  const base = url.pathname
  return {
    es: localizedPath(base, 'es'),
    en: localizedPath(base, 'en'),
  }
}
