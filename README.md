# Documentation pour i18n avec Next.js 14 en utilisant `next-intl`

## Installation et configuration initiale avec router

1. **Installer les packages nécessaires:**
   ```bash
   npm install next-intl
   ```

2. **Configuration du Middleware:**
   - Créez un fichier middleware.ts pour gérer la redirection des locales.
     ```typescript
     import createIntlMiddleware from 'next-intl/middleware';

     const locales = ['en', 'fr'];
     const defaultLocale = 'fr';

     const intlMiddleware = createIntlMiddleware({
       locales,
       defaultLocale,
     });

     export default intlMiddleware;

     export const config = {
       matcher: [
         '/((?!api|_next|.*\\..*).*)',
       ],
     };
     ```

3. **Détection des locales:**
   - Utilisez des cookies ou d'autres mécanismes pour détecter et définir la locale. Implémentez une fonction pour obtenir la locale à partir des cookies dans `utils/getLocale.ts` :

     ```typescript
     import { NextRequest } from 'next/server';

     export function getLocaleFromCookies(request: NextRequest) {
       const cookie = request.cookies.get('NEXT_LOCALE');
       return cookie ? cookie.value : 'fr';
     }
     ```

4. **Utilisation des traductions:**
   - Créez des fichiers de traduction dans le répertoire `messages` dont ce répertoire est au même niveau que `src` :

     ```
     messages/
     ├── en.json
     └── fr.json
     ```

   - Exemple `fr.json` :
      ```json
      {
         "HomePage": {
            "title": "Hello world!"
         }
      }
      ```

   - Setup next.config.mjs :
      ```js
      import createNextIntlPlugin from 'next-intl/plugin';
 
      const withNextIntl = createNextIntlPlugin();
      
      /** @type {import('next').NextConfig} */
      const nextConfig = {};
      
      export default withNextIntl(nextConfig);
      ```

   - Chargez les traductions dans vos composants :

     ```typescript
     import { useTranslations } from 'next-intl';

     export default function MyComponent() {
       const t = useTranslations('HomePage');

       return <p>{t('title')}</p>;
     }
     ```

5. **Configuration du Provider:**
   - i18n.ts :
      ```js
         import {notFound} from 'next/navigation';
         import {getRequestConfig} from 'next-intl/server';
         
         // Can be imported from a shared config
         const locales = ['en', 'de'];
         
         export default getRequestConfig(async ({locale}) => {
         // Validate that the incoming `locale` parameter is valid
         if (!locales.includes(locale as any)) notFound();
         
         return {
            messages: (await import(`../messages/${locale}.json`)).default
         };
         });
      ```

   - with-routing (`app/[locale]/layout.tsx`) : 
      ```js
         import {NextIntlClientProvider} from 'next-intl';
         import {getMessages} from 'next-intl/server';
         
         export default async function LocaleLayout({
         children,
         params: {locale}
         }: {
         children: React.ReactNode;
         params: {locale: string};
         }) {
            // Providing all messages to the client
            // side is the easiest way to get started
            const messages = await getMessages();
            
            return (
               <html lang={locale}>
                  <body>
                  <NextIntlClientProvider messages={messages}>
                     {children}
                  </NextIntlClientProvider>
                  </body>
               </html>
            );
         }
      ```

6. **Middleware d'internationalisation (Update with Authjs.dev) :**
   - Mettez à jour votre fichier middleware pour inclure à la fois l'authentification et l'internationalisation dans `middleware.ts` :

     ```typescript
     import { NextRequest, NextResponse } from 'next/server';
     import { getLocaleFromCookies } from './utils/getLocale';
     import { auth } from './auth';

     export async function middleware(request: NextRequest) {
       const { pathname } = new URL(request.url);

       if (pathname.startsWith('/fr/login') || pathname.startsWith('/en/login')) {
         return intlMiddleware(request);
       }

       const session = await auth();

       const locale = getLocaleFromCookies(request);
       console.log('Locale:', locale);

       if (!session || session.expires === undefined) {
         console.log('No valid session, redirecting to login.');
         return NextResponse.redirect(`/${locale}/login`);
       }

       return intlMiddleware(request);
     }

     export const config = {
       matcher: [
         '/((?!api|_next|.*\\..*).*)',
         '/fr/dashboard',
         '/fr/dashboard/paid-leaves',
         '/en/dashboard',
         '/en/dashboard/paid-leaves',
       ],
     };
     ```

## Resources : https://next-intl-docs.vercel.app/docs/getting-started/app-router/with-i18n-routing