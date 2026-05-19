---
title: "\"curl cannot do that\" — yes it can"
date: 2026-05-18
draft: false
---

I was looking at [CVE-2026-44578](https://github.com/advisories/GHSA-c4j6-fc7j-m34r) — a pre-auth SSRF in Next.js's WebSocket upgrade handler — and every PoC I found used `printf | nc` to send the exploit. The [dinosn/CVE-2026-44578](https://github.com/dinosn/CVE-2026-44578) repo states:

> `curl` cannot send absolute-form URIs. Use raw TCP: `nc`, `ncat`, `socat`, or Python sockets.

That claim hooked me. I've been using curl for years and keep discovering it can do things I assumed required custom tooling. This was another one of those moments.

## --request-target

```bash
curl --request-target "http:///latest/meta-data/" \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
  http://target:3000/
```

[`--request-target`](https://curl.se/docs/manpage.html#--request-target) sets the exact request-target in the HTTP request line. No validation, no normalization. curl sends whatever string you pass — verbatim on the wire:

```
GET http:///latest/meta-data/ HTTP/1.1\r\n
Host: target:3000\r\n
...
```

No netcat, no `\r\n` escaping, no worrying about socket buffering, proper response parsing.

## --write-out

While testing the SSRF I needed to quickly check response headers and timing without scrolling through `-v` output. [`-w` / `--write-out`](https://curl.se/docs/manpage.html#-w) handles this:

```bash
# Extract a specific response header (curl 7.84.0+)
$ curl -sw '%header{server}' -o /dev/null http://target:3000/
next.js

# HTTP status + the header you care about, one line
$ curl -sw '%{http_code} %header{content-type}\n' -o /dev/null http://target:3000/
200 text/html; charset=utf-8
```

The `%header{name}` format was added in curl 7.84.0. Before that you'd parse `--dump-header`/`-D` output or grep through `-v`. Now it's a one-liner.

For structured output, `%{json}` dumps all transfer metadata as JSON — timing, TLS details, IPs, status, redirect chains:

```bash
# Connection timing breakdown without parsing verbose output
$ curl -sw '%{json}' -o /dev/null http://target:3000/ | jq '{
    dns: .time_namelookup,
    tcp: .time_connect,
    ttfb: .time_starttransfer,
    total: .time_total,
    status: .http_code
  }'
{
  "dns": 0.001234,
  "tcp": 0.002345,
  "ttfb": 0.045678,
  "total": 0.048901,
  "status": 200
}
```

## --variable and --expand-*

[`--variable`](https://curl.se/docs/manpage.html#--variable) (curl 8.3.0, September 2023) with `--expand-*` flags turns curl into a templating engine with built-in encoding functions: `b64`, `url`, `json`, `trim` — chained with colons.

A realistic example. Say you're testing a webhook that expects a base64-encoded JSON payload in a header, and one of the JSON fields is itself base64-encoded binary data (like a signing key):

```bash
# The inner secret (binary/key material) — read from file, never in shell history
curl --variable key@/run/secrets/hmac_key \
     --expand-variable 'payload={"event":"deploy","ref":"main","key":"{{key:trim:b64}}"}' \
     --expand-header "X-Webhook-Payload: {{payload:b64}}" \
     --expand-header "Content-Type: application/json" \
     --expand-data "{{payload}}" \
     https://ci.internal/hooks/deploy
```

What this does:
1. Reads `/run/secrets/hmac_key` into variable `key` (literal bytes)
2. `--expand-variable` builds the payload string, expanding `{{key:trim:b64}}` inline — this is the key difference from `--variable` which stores literal strings without expansion
3. Sends the full payload as both body and base64-encoded in a header (for signature verification)

No subshells, no `$(base64 < file)`, no quoting hell. Variables expand only inside `--expand-*` flags — the rest of the command line is inert. No command injection via untrusted input.

Another common pattern — URL-safe base64 token from an environment variable:

```bash
curl --variable '%API_TOKEN' \
     --expand-header "Authorization: Bearer {{API_TOKEN:trim}}" \
     --expand-url "https://api.example.com/v1/status" \
     -w '%{http_code}\n' -o /dev/null
```

The `%` prefix imports from the environment and fails if the variable isn't set — no silent empty-string bugs.

## The Vulnerability (Brief)

Back to CVE-2026-44578. Next.js's self-hosted WebSocket upgrade handler proxied any request where `parsedUrl.protocol` was truthy — without checking whether routing had actually completed:

```javascript
// router-server.js — vulnerable
if (parsedUrl.protocol) {
  return await proxyRequest(req, socket, parsedUrl, head)
}
```

The HTTP handler had proper guards (`if (finished && parsedUrl.protocol)`). The WebSocket handler didn't. The [fix](https://github.com/vercel/next.js/commit/c4f69086cc8dcbd81b1dbc321c98ea874d90d6f8) adds the same checks.

`http:///path` triggers it because:
- `///` contains `//`, which triggers `normalizeRepeatedSlashes` → collapses to `http:/path`
- `url.parse("http:/path")` → `{protocol: 'http:', hostname: null, pathname: '/path'}`
- `http-proxy` gets hostname null → connects to `localhost:80`
- Sends a clean `GET /path HTTP/1.1` to whatever listens there

## What's the Impact?

The SSRF is hard-constrained to `localhost:80`. Can't reach arbitrary hosts. AWS IMDS is at `169.254.169.254`, ECS credentials at `169.254.170.2` — neither is localhost. The PoCs claiming "extracts cloud credentials" model a scenario that doesn't exist.

Practical impact depends on what's on `localhost:80`. The common answers:

**nginx** — but if nginx is on :80, it's probably the internet-facing reverse proxy in front of Next.js. nginx [rejects absolute-form URIs](https://github.com/GrrrDog/weird_proxies/blob/master/Nginx.md) with `400 Bad Request`. The exploit never reaches Next.js. Catch-22.

**HAProxy** — the [weird_proxies](https://github.com/GrrrDog/weird_proxies/blob/master/Haproxy-and-Nuster.md) research (HAProxy 1.8) documents forwarding absolute-form URIs verbatim. I tested HAProxy 3.2: it now rejects them with `400 Bad Request` by default — same as nginx. With `option accept-unsafe-violations-in-http-request` it accepts them but also *parses* the path, so path-based ACLs still apply. Either way, if HAProxy is on :80, the SSRF loops back into HAProxy itself.

**Nothing** — connection refused.

CVSS says 8.6 (pre-auth, no user interaction), and you should upgrade. But most deployment patterns either block the exploit at the proxy layer or have nothing interesting on localhost:80. The practical blast radius is smaller than the score suggests.

Affected: Next.js 13.4.13 – 15.5.15, 16.0.0 – 16.2.4 (self-hosted only). Fixed in [15.5.16](https://github.com/vercel/next.js/releases/tag/v15.5.16) and [16.2.5](https://github.com/vercel/next.js/releases/tag/v16.2.5). Vercel-hosted deployments are not affected.
