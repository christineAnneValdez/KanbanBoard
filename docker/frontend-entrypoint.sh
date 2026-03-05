#!/bin/sh
set -eu

APP_SCHEME="${APP_SCHEME:-https}"

if [ -n "${APP_DOMAIN:-}" ]; then
  BACKEND_SUBDOMAIN="${BACKEND_SUBDOMAIN:-}"

  if [ -n "$BACKEND_SUBDOMAIN" ]; then
    BACKEND_HOST="${BACKEND_SUBDOMAIN}.${APP_DOMAIN}"
  else
    BACKEND_HOST="${APP_DOMAIN}"
  fi

  : "${NUXT_PUBLIC_API_BASE:=${APP_SCHEME}://${BACKEND_HOST}/api}"
  export NUXT_PUBLIC_API_BASE
fi

exec node .output/server/index.mjs
