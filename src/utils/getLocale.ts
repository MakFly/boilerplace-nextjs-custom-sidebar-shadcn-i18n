import { NextRequest } from "next/server";

export function getLocaleFromCookies(request: NextRequest) {
  const cookie = request.cookies.get("NEXT_LOCALE");
  return cookie ? cookie.value : "fr";
}
