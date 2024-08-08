import createIntlMiddleware from "next-intl/middleware";

const locales = ["en", "fr"];
const defaultLocale = "fr";

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
});

export default intlMiddleware;

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
