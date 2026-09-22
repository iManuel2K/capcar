import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { resolveLocale } from "@/i18n/resolve-locale";
import { localeCookie } from "@/i18n/config";
import en from "../messages/hardening/en.json";
import de from "../messages/hardening/de.json";
import el from "../messages/hardening/el.json";
import sq from "../messages/hardening/sq.json";
import ja from "../messages/hardening/ja.json";

function passportUnavailableResponse(
  request: NextRequest,
  status: 404 | 503 = 404,
) {
  const locale = resolveLocale(
    request.cookies.get(localeCookie)?.value,
    request.headers.get("accept-language"),
  );
  const t = { en, de, el, sq, ja }[locale].Hardening.Passport;
  return new NextResponse(
    `<!doctype html>
<html lang="${locale}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow" />
    <title>${t.title} | CapCar</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #0b0e0c; color: #f4f5f2; font-family: Arial, sans-serif; }
      main { display: grid; min-height: 100dvh; place-items: center; padding: 2rem 1.25rem; text-align: center; }
      section { max-width: 36rem; }
      .brand { color: #f4f5f2; font-size: 1.25rem; font-weight: 700; letter-spacing: -.04em; }
      .icon { margin: 3rem auto 0; color: #ff667a; font-size: 2rem; line-height: 1; }
      .eyebrow { margin: 1.5rem 0 0; color: rgba(255,255,255,.42); font-size: .75rem; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; }
      h1 { margin: .75rem 0 0; font-size: clamp(2.5rem, 8vw, 3.75rem); font-weight: 500; letter-spacing: -.05em; line-height: 1; }
      .copy { margin: 1.25rem auto 0; color: rgba(255,255,255,.52); line-height: 1.75; }
      a { display: inline-flex; min-height: 3rem; align-items: center; margin-top: 2rem; border-radius: .75rem; background: #e72d45; color: white; font-size: .875rem; font-weight: 700; padding: 0 1.25rem; text-decoration: none; }
      a:focus-visible { outline: 3px solid #f4f5f2; outline-offset: 4px; }
    </style>
  </head>
  <body>
    <main>
      <section aria-labelledby="passport-unavailable-title">
        <div class="brand">CapCar</div>
        <div class="icon" aria-hidden="true">&#8856;</div>
        <p class="eyebrow">${t.title}</p>
        <h1 id="passport-unavailable-title">${status === 404 ? t.missing : t.outage}</h1>
        <p class="copy">${status === 404 ? t.missingBody : t.outageBody}</p>
        <a href="/">${t.home}</a>
      </section>
    </main>
  </body>
</html>`,
    {
      status,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
        "cache-control": "private, no-store, max-age=0",
        vary: "Cookie, Accept-Language",
        ...(status === 503 ? { "retry-after": "30" } : {}),
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  const passportMatch = request.nextUrl.pathname.match(/^\/passport\/([^/]+)$/);
  const passport = passportMatch && passportMatch[1] !== "unavailable";
  if (
    passport &&
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      passportMatch[1],
    )
  )
    return passportUnavailableResponse(request);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    return passport
      ? passportUnavailableResponse(request, 503)
      : NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookies) {
        cookies.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookies.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  if (passport) {
    try {
      const { data, error } = await supabase
        .from("vehicle_passports")
        .select("share_id")
        .eq("share_id", passportMatch[1])
        .eq("is_public", true)
        .abortSignal(AbortSignal.timeout(5_000))
        .maybeSingle();

      if (error) return passportUnavailableResponse(request, 503);
      if (!data) return passportUnavailableResponse(request);
      response.headers.set("Cache-Control", "private, no-store, max-age=0");
      return response;
    } catch {
      return passportUnavailableResponse(request, 503);
    }
  }

  const { data } = await supabase.auth.getUser();
  const protectedRoute =
    request.nextUrl.pathname === "/account" ||
    request.nextUrl.pathname === "/garage" ||
    request.nextUrl.pathname.startsWith("/garage/") ||
    request.nextUrl.pathname === "/notifications";
  if (protectedRoute && !data.user) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/login";
    signIn.search = "";
    signIn.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    return NextResponse.redirect(signIn);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
