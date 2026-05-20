---
title: "What GH Archive Knows About a Deleted Repo"
date: 2026-05-19
draft: false
---

When Krebs [reported on the leaked CISA credentials](https://krebsonsecurity.com/2026/05/cisa-admin-leaked-aws-govcloud-keys-on-github/), the repo was already gone. The GitHub account showed zero public repositories. The Wayback Machine had nothing. GitHub search returned nothing. The article included a redacted screenshot and a username-free description of a "Nightwing contractor."

Starting from just the screenshot and the article, here's what's recoverable through public sources — and what isn't.

## The Screenshot

The redacted region uses full alpha transparency with zeroed RGB values — a proper redaction, no data recovery possible. The *unredacted* parts of the same image contain:

- Commit `24f8803` · **"5 days ago"**
- Branch: `master` · Fork count: `0`
- Subdirectory being browsed: `Kubernetes-Important-Yaml-Files`
- Folder names: `AWS`, `All-Backups`, `All-Scripts`, `Backup-April-2026`, `Backup-Nov-2025`, `Create-EC2`, `Github-Actions-Runners`, `Github-Runners`, `Helm`, `Helm-Repos`, `Jenkins-Pipelines`, `Jupyter`
- File-level commit messages visible: "Adding new file", "Adding new files", "New Files"
- A second unredacted screenshot in the article shows: `importantAWStokens`, `AWS-Workspace-Firefox-Passwords.csv`

The redaction removed the username from the URL bar. Everything else was left visible.

## Finding the Username

A DuckDuckGo search for `site:github.com "Private-CISA"` returned two cached results:

```
https://github.com › khaled2222 › Private-CISA
GitHub - khaled2222/Private-CISA

https://github.com › khaled2222 › Private-CISA › releases
Releases: khaled2222/Private-CISA - GitHub
```

The repo was already deleted — these were search engine cache entries. Candidate username: `khaled2222`.

## GH Archive Confirmation

[GH Archive](https://gharchive.org) records all public GitHub events in hourly dumps, independent of GitHub. Deleted repos stay in the archive.

Searching the May 13 hourly dumps for `"Private-CISA"`:

```bash
for h in $(seq -w 0 23); do
  curl -sf "https://data.gharchive.org/2026-05-13-${h}.json.gz" \
    | gunzip | grep -F '"Private-CISA"'
done
```

Four push events, actor `khaled2222`, repo ID `1096069761`. Username confirmed independent of the search cache.

A full scan of all downloaded archive data surfaced **65 events total** — one `CreateEvent` and 64 `PushEvent`s — spanning the entire public life of the repo:

```json
{
  "type": "CreateEvent",
  "actor": { "login": "khaled2222", "id": 43212956 },
  "repo": { "id": 1096069761, "name": "khaled2222/Private-CISA" },
  "public": true,
  "created_at": "2025-11-13T22:45:49Z"
}
```

`"public": true` at creation. The repo was never private. The Krebs-reported creation date of November 13, 2025 is confirmed exactly.

## When Was the Screenshot Taken?

The screenshot shows `24f8803` labeled "5 days ago" and several files showing "2 weeks ago." GH Archive pins these:

- **"5 days ago"** → May 13 sessions (last push 22:22 UTC)
- **"2 weeks ago"** → Apr 28 / May 1 sessions

Could "5 days ago" refer to May 12? No — the complete May 12 archive (all 24 hours downloaded and verified) contains **zero events** for this repo.

The screenshot metadata has no creation timestamp — macOS embeds one, but Preview strips it when re-saving during redaction. What the EXIF does show: `User Comment: Screenshot` (macOS) and an ICC profile for an **HP E230t** external monitor.

GitHub renders "N days ago" by floor division: a commit becomes "5 days ago" after exactly 5 full days have elapsed. The last May 13 push was at 22:22 UTC, so "5 days ago" becomes valid at **May 18 22:22 UTC** (6:22 PM ET).

The article was published May 18 at 4:48 PM ET (20:48 UTC) — 1h34m *before* that threshold. At publication the label would have read "4 days ago." The most consistent explanation: the screenshot was taken or updated after ~22:22 UTC on May 18, after the article went live. The repo was still public at that point ("Public" badge visible). The article says the account went offline "shortly after *both* KrebsOnSecurity *and* Seralys notified CISA" — publishing the article was the notification.

## Commit `24f8803`

This hash appears in the screenshot as the last commit to the `Kubernetes-Important-Yaml-Files` subdirectory, labeled "5 days ago" — so it's from one of the May 13 sessions. But it never appears as a `head` in any GH Archive push event across the entire archive.

GH Archive records only the final `head` commit per push. `24f8803` is an intermediate commit within a multi-commit push, invisible to GH Archive by design. Searching the full archive by repo name confirms: every `head` SHA is accounted for, and `24f8803` is not among them.

## Commit Recovery Attempts

Git objects from deleted repos can persist as dangling until GitHub's GC runs:

```bash
SHA="cfa406cfb2e27a0da3770ac6d254cdf072994b21"  # last known HEAD

curl -s -o /dev/null -w "%{http_code}" \
  "https://github.com/khaled2222/Private-CISA/commit/${SHA}"
# 404

curl -s -o /dev/null -w "%{http_code}" \
  -H "Authorization: bearer $(gh auth token)" \
  "https://api.github.com/repos/khaled2222/Private-CISA/git/commits/${SHA}"
# 404
```

CFOR (cross-fork object reachability) requires a surviving fork. Fork count in the screenshot: `0`. No fork events in any GH Archive record. No path to the objects. Content is gone.

## The Push History

33 sessions across 64 pushes, Nov 13 2025 – May 13 2026:

| Period | Sessions | Notes |
|---|---|---|
| Nov 13 | 1 | Repo created, initial pushes same evening |
| Nov 20, 26, 28 | 3 | Sparse weekly updates |
| Dec 3–5 | 4 | Bulk load — 28 pushes in 3 days |
| Dec 16–24 | 5 | Periodic single-push maintenance |
| Jan 6–26 | 10 | Weekly cadence resumes |
| **Feb 1 – Mar 31** | **0** | **65-day gap — no activity** |
| Apr 1 – May 13 | 10 | Resumed, increasingly frequent |

The 65-day gap from Jan 26 to Apr 1 is the most striking feature. No pushes for over two months. Whether that reflects a change in workflow, a project pause, or use of a different machine during that period is unknown.

**Day-of-week distribution (64 pushes):**

```
Mon  ███ (3)
Tue  ████████████ (12)
Wed  ████████████████████████ (24)
Thu  ███████████████████ (19)
Fri  ██████ (6)
Sat  (0)
Sun  (0)
```

**Hour of day, US Eastern:**

```
11:xx  ██████ (6)
12:xx  ██ (2)
13:xx  ██████ (6)
14:xx  ████ (4)
15:xx  █████████████████ (17)
16:xx  ████████████ (12)
17:xx  █████ (5)
18:xx  ███ (3)
19:xx  █████████ (9)
```

Zero weekend activity. All pushes between 11:00 and 19:56 ET. Peak is 15:00–17:00 ET — mid-afternoon on a US East Coast workday. The longest single session is December 4: 11 pushes spanning 11:39–15:27 ET (3h48m) on a Thursday.

Caturegli's description — "synchronizing files between a work laptop and a home computer" — is the wrong mental model. Someone working from home evenings or weekends would show different hours and weekend activity. This is a work-machine pattern: pushes during office hours, Monday through Friday, for six months, with the biggest sessions on Wednesday and Thursday afternoons.

## Chain Gaps and Hidden Commits

Every PushEvent in GH Archive records two SHAs: `head` (last commit in the push) and `before` (parent of the first commit). For a single-commit push, `before` equals the previous `head` — a clean chain link. For a multi-commit push, `before` is the parent of the *first* commit, and all commits except the final `head` are invisible.

Of the 64 push events, **39 have a `before` SHA that does not match any previously recorded `head`**. Each such gap guarantees at least one unrecorded commit. The minimum total commit count is therefore **64 + 39 = 103**.

Gap density by period:

| Period | Pushes | Gaps | Min hidden |
|---|---|---|---|
| Nov 13 | 2 | 1 | 1 |
| Nov 20–28 | 4 | 0 | 0 |
| Dec 3–4 (bulk load) | 21 | 11 | 11 |
| Dec 5–24 | 5 | 4 | 4 |
| Jan 6–26 | 11 | 6 | 6 |
| Apr 1 – May 13 | 21 | 17 | 17 |

The Dec 3–4 bulk-load sessions are the densest: 11 gaps out of 21 pushes. Those two days likely contained the initial mass-upload of existing infrastructure files, with multiple commits grouped per push. The Apr–May period shows the same pattern: frequent multi-commit pushes as the repo was actively maintained.

The 21 clean chain links are consecutive single-commit pushes — typically the second or third push in a session after the session's opening multi-commit push.

## What GH Archive Can't Tell You

GH Archive records per push: actor, repo, timestamp, ref, `head` SHA, `before` SHA. It does not record:

- Commit messages
- File names or diffs
- Tree or blob SHAs
- Individual commits within a multi-commit push

`24f8803` is permanently invisible because it's intermediate within a push. The `before` hashes that don't chain to a previous `head` represent commits made between GH Archive capture windows — they exist in the repo's history, but their content is gone with the repo.

## The Durable Takeaway

The repo was named "Private-CISA" and was public from its first minute of existence. GH Archive captured a `CreateEvent` with `"public": true` within the same hour it was created.

The more durable point: **deletion is not erasure**. GH Archive independently archives every public push event with full commit SHAs and actor identity, permanently, with no authentication required. The window between a repo going public and GH Archive capturing it is under one hour. The window between deletion and GH Archive forgetting it is never.

Any repo that is public for even a single hour leaves a permanent, independently-held record of who pushed what and when.
