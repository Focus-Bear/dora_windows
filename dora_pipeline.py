import os
import requests
import sqlite3
import json
from datetime import datetime, timedelta, timezone
UTC = timezone.utc
NOW_UTC = datetime.now(UTC)
# --------- Global Constants ----------
GITHUB_TOKEN = os.getenv("GH_TOKEN", "")
OWNER = os.getenv("OWNER") or ""
REPO = "Focus-Bear/mobile-app"
DB_FILE = "mobile_metrics.db"
HEADERS = {"Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else {}

def iso(dt):
    return dt.astimezone(UTC).isoformat() if dt else None

# --------- DB Connection ----------
conn = sqlite3.connect(DB_FILE)
c = conn.cursor()

# --------- DB Setup ----------
def setup_db():
    c.execute('''
    CREATE TABLE IF NOT EXISTS releases (
        release_id TEXT PRIMARY KEY,
        version TEXT,
        name TEXT,
        author TEXT,
        body TEXT,
        published_at TEXT,
        time_since_last_release REAL,
        pr_count INTEGER
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS pull_requests (
        pr_id TEXT PRIMARY KEY,
        repo TEXT,
        author TEXT,
        created_at TEXT,
        merged_at TEXT,
        time_to_merge REAL,
        release_id TEXT
    )
    ''')

    c.execute('''
    CREATE TABLE IF NOT EXISTS issues (
        issue_id TEXT PRIMARY KEY,
        repo TEXT,
        title TEXT,
        status TEXT,
        created_at TEXT,
        updated_at TEXT
    )
    ''')
    conn.commit()

# --------- Fetch Data from GitHub ----------
def fetch_releases(existing_ids):
    url = f"https://api.github.com/repos/{REPO}/releases"
    page = 1
    per_page = 100
    result = []
    existing_ids = set(existing_ids or [])

    while True:
        resp = requests.get(
            url,
            headers=HEADERS,
            params={"page": page, "per_page": per_page}
        )
        releases = resp.json()

        # No more data
        if not releases or len(releases) == 0:
            break

        for r in releases:
            rid = str(r["id"])

            if rid in existing_ids:
                return result
            
            published = r["published_at"]
            body = r.get("body")
            name = r.get("name")
            author = r["author"]["login"] if r.get("author") else ""
            result.append({
                "release_id": rid,
                "version": r["tag_name"],
                "name": name or "",  # optional
                "author": author,
                "body": body or "",
                "published_at": published,
                "time_since_last_release": None,
                "pr_count": 0
            })
        page += 1
    return result

def fetch_prs(existing_ids):
    existing_ids = set(existing_ids or [])
    url = f"https://api.github.com/repos/{REPO}/pulls"
    page = 1
    per_page = 100
    result = []
    while True:
        resp = requests.get(
            url,
            headers=HEADERS,
            params={"state": "all", "per_page": per_page, "page": page}
        )
        if resp.status_code != 200:
            raise Exception(f"GitHub API failed: {resp.status_code} {resp.text}")

        prs = resp.json()
        if not prs:
            break

        for pr in prs:
            pr_id = str(pr["number"])
            if pr_id in existing_ids:
                return result
            merged_at = pr.get("merged_at")
            created_at = pr["created_at"]
            time_to_merge = None
            if merged_at:
                time_to_merge = (datetime.fromisoformat(merged_at[:-1]) - datetime.fromisoformat(created_at[:-1])).total_seconds()/3600
            result.append({
                "pr_id": str(pr["number"]),
                "repo": REPO,
                "author": pr["user"]["login"],
                "created_at": created_at,
                "merged_at": merged_at,
                "time_to_merge": time_to_merge,
                "release_id": None
            })
        page += 1
    return result

def fetch_issues():
    result = []
    query = """
    query($org: String!, $project: Int!, $first: Int!, $after: String) {
      organization(login: $org) {
        projectV2(number: $project) {
          title
          items(first: $first, after: $after) {
            nodes {
              content {
                __typename
                ... on Issue {
                  number
                  title
                  repository {
                    nameWithOwner
                  }
                }
              }
              fieldValues(first: 20) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      }
    }
    """

    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
    }
    variables = {"org": OWNER, "project": 3, "first": 50, "after": None}

    while True:
        r = requests.post("https://api.github.com/graphql", headers=headers, json={"query": query, "variables": variables})
        r.raise_for_status()
        data = r.json()

        project = data["data"]["organization"]["projectV2"]
        if not project:
            break

        for issue in project["items"]["nodes"]:
            repo_name = REPO
            number = None
            title = None
            status = None

            # read issue content if present
            content = issue.get("content")
            if content:
                number = content.get("number")
                title = content.get("title")
                repo_info = content.get("repository")  # this is a dict
                if repo_info and repo_info.get("nameWithOwner"):
                    repo_name = repo_info.get("nameWithOwner")
            for fv in issue["fieldValues"]["nodes"]:
                status = fv.get("name")
                if status:
                    break

            if number and status:
                result.append({
                    "issue_id": f"{repo_name}#{number}",
                    "repo": repo_name,
                    "title": title,
                    "status": status,
                    "created_at": iso(NOW_UTC),
                    "updated_at": iso(NOW_UTC)
                })

        page = project["items"]["pageInfo"]
        if page["hasNextPage"]:
            variables["after"] = page["endCursor"]
        else:
            break
    return result

# --------- Store Data Incrementally ----------
def store_releases_incremental(releases):
    for r in releases:
        c.execute('SELECT 1 FROM releases WHERE release_id=?', (r["release_id"],))
        if not c.fetchone():
            c.execute('''INSERT INTO releases (release_id, version, name, author, body, published_at, time_since_last_release, pr_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)''', (r["release_id"], r["version"], r["name"], r["author"], r["body"],r["published_at"], r["time_since_last_release"], r["pr_count"]))
    conn.commit()

def store_prs_incremental(prs):
    for pr in prs:
        c.execute('SELECT merged_at, release_id FROM pull_requests WHERE pr_id=?', (pr["pr_id"],))
        existing = c.fetchone()
        if existing:
            _, existing_release_id = existing
            if pr["release_id"] != existing_release_id:
                c.execute('UPDATE pull_requests SET release_id=? WHERE pr_id=?', (pr["release_id"], pr["pr_id"]))
        else:
            c.execute('''
            INSERT INTO pull_requests (pr_id, repo, author, created_at, merged_at, time_to_merge, release_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (pr["pr_id"], pr["repo"], pr["author"], pr["created_at"], pr["merged_at"], pr["time_to_merge"], pr["release_id"]))
    conn.commit()

def store_issues_incremental(issues):
    for issue in issues:
        c.execute('SELECT title, status FROM issues WHERE issue_id=?', (issue["issue_id"],))
        existing = c.fetchone()
        if existing:
            existing_title, existing_status = existing
            if existing_status != issue["status"]:
                c.execute('''
                UPDATE issues SET status=?, updated_at=?
                WHERE issue_id=?
                ''', ( issue["status"], iso(NOW_UTC), issue["issue_id"]))

        else:
            c.execute('''
            INSERT INTO issues (issue_id, repo, title, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ''', (issue["issue_id"], issue["repo"], issue["title"], issue["status"], issue["created_at"], iso(NOW_UTC)))
    conn.commit()

# --------- Export DB to JSON ----------
def export_db_to_json():
    tables = ["releases", "pull_requests", "issues"]
    all_data = {}
    for table in tables:
        cur = conn.cursor()
        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()
        columns = [desc[0] for desc in cur.description]
        all_data[table] = [dict(zip(columns, row)) for row in rows]

    with open("mobile_metrics.json", "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=4)
    print("Exported all tables to JSON: mobile_metrics.json",)

# --------- Main Function ----------
def main():
    setup_db()
    c.execute("SELECT release_id FROM releases")
    rows = c.fetchall()
    existing_release_ids = set(str(row[0]) for row in rows)
    releases = fetch_releases(existing_release_ids)

    c.execute("SELECT pr_id FROM pull_requests")
    rows = c.fetchall()
    existing_pr_ids = set(str(row[0]) for row in rows)
    prs = fetch_prs(existing_pr_ids)

    issues = fetch_issues()

    c.execute("SELECT * FROM pull_requests WHERE release_id IS NULL")
    unreleased_prs = c.fetchall()
    columns = [desc[0] for desc in c.description]

    c.execute("SELECT published_at FROM releases ORDER BY published_at DESC LIMIT 1")
    row = c.fetchone()
    last_published_at = None
    if row:
        last_published_at = datetime.fromisoformat(row[0][:-1]) 
    releases.sort(key=lambda r: r["published_at"])

    for rel in releases:
        published_dt = datetime.fromisoformat(rel["published_at"][:-1])
        if last_published_at:
            rel["time_since_last_release"] = (published_dt - last_published_at).days
        else:
            rel["time_since_last_release"] = 0
        last_published_at = published_dt

    unreleased_prs_dicts = [
        dict(zip(columns, row))
        for row in unreleased_prs]
    all_prs = prs + unreleased_prs_dicts
    for pr in all_prs:
        if pr["merged_at"]:
            merged_dt = datetime.fromisoformat(pr["merged_at"][:-1])
            for r in releases:
                release_dt = datetime.fromisoformat(r["published_at"][:-1])
                if merged_dt <= release_dt:
                    pr["release_id"] = r["release_id"]
                    r["pr_count"] += 1
                    break

    store_releases_incremental(releases)
    store_prs_incremental(prs)
    store_issues_incremental(issues)

    export_db_to_json()

    conn.close()
    print("GitHub mobile metrics updated successfully.")

# --------- Entry Point ----------
if __name__ == "__main__":
    main()
