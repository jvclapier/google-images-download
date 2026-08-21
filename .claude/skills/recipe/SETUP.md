# One-time setup

Five minutes, done once. After this, `/recipe` writes straight into the doc.

## Why it works this way

Claude can read every tab of the doc through the Google Drive connector, but the
connector has no write-content call — `update_file` changes only a file's title and
folder. There is no Google Docs connector installed, and this workspace's egress policy
blocks `script.google.com`, so Claude cannot call a web app directly either.

What Claude *can* do is create files in Drive. So Drive becomes the transport:

```
Claude  --create_file-->  [Recipe Inbox]  --time trigger-->  Apps Script  --> the doc
                                ^                                 |
                                +------ renamed DONE / ERROR <-----+
```

The script is bound to the doc and runs as you, so it has full edit rights and real tab
access — it writes native Google Docs headings, bullets, and numbered lists, not pasted
Markdown.

## Steps

1. Open **Mama G's Recipes (& more)** → **Extensions → Apps Script**.
2. Delete whatever is in `Code.gs` and paste in the contents of
   `apps-script/Code.gs` from this folder. Save.
3. In the function dropdown pick **`setup`**, click **Run**, and grant the permissions
   it asks for. Google will warn that the app is unverified — it is your own script;
   choose **Advanced → Go to (project name)**.
4. Open **View → Logs**. It prints something like:

   ```
   Inbox folder : Recipe Inbox
   Folder ID    : 1AbC...xyz
   Trigger      : processInbox every 1 min
   ```

5. Paste that folder ID into `config.json` in this folder, replacing `null`:

   ```json
   "inboxFolderId": "1AbC...xyz"
   ```

That's it. `setup()` created a **Recipe Inbox** folder in your Drive and a trigger that
checks it every minute.

## Checking it works

Ask Claude to post any already-transcribed recipe. Within a minute the job file in
**Recipe Inbox** should be renamed to `DONE Soups > Taco Soup — recipe-...json`, and the
tab should have the recipe in it.

If the file is renamed `ERROR ...`, the rest of the filename says what went wrong. The
usual causes:

| Message | Cause |
|---|---|
| `no tab matching [...]` | The tab does not exist yet — add it in Docs first. |
| `ambiguous tab "..."` | Two tabs share that title; the job needs a full path. |
| `mode must be...` | Malformed job file. |

Deeper failures show up in **Apps Script → Executions**.

## Known limits

- **The script cannot create tabs.** Google exposes no tab-creation API to Apps Script,
  so a genuinely new recipe needs its tab added by hand first (right-click the category
  tab → Add subtab). Filling the ~90 existing stub tabs — the bulk of the work — is
  fully automatic.
- **The index tab is not updated automatically.** Claude will tell you which line to add
  to `List of Recipes` and where.
- **Up to a minute of lag** before a job is picked up. That is the trigger interval;
  Google does not offer faster time-based triggers.
- **Everything is reversible.** The doc's version history has every write, and job files
  stay in the inbox folder as a record. `teardown()` removes the trigger.

## Turning it off

Run `teardown()` in the Apps Script editor. The folder, the doc, and the job history are
left alone; only the trigger goes away. Set `inboxFolderId` back to `null` and the skill
returns to the manual paste fallback.
