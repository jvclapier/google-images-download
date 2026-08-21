---
name: recipe
description: Transcribe photos of recipe cards into the "Mama G's Recipes (& more)" Google Doc. Use when the user attaches one or more photos or scans of a recipe — handwritten cards, cookbook pages, printouts — and wants them added to the recipe doc, or invokes /recipe. Reads the photos, shows the transcription for QA, matches the destination tab, and writes it into the doc once approved.
---

# Recipe photo → Google Doc

Turn photos of recipe cards into correctly formatted entries in the family recipe doc.

Read `reference/doc-structure.md` before starting — it carries the doc's file ID, the tab
inventory, the house formatting conventions, and the attribution roster. Read
`config.json` for the inbox folder ID that step 4 needs.

**Never write to the doc before the user approves the transcription.** The QA gate in
step 3 is the point of this skill.

## Step 1 — Read every photo

Read each attached image with the Read tool. Then group them: several photos may be one
recipe (front/back of a card, a long page shot in two halves), or one photo may hold two
recipes. State the grouping you settled on before transcribing.

Transcribe what is actually written, not what the recipe "should" say.

- Quantities are the whole point. A misread `1/3` for `1/2` ruins the dish. When a
  character is genuinely ambiguous, transcribe your best reading and flag it in step 3 —
  never quietly smooth it over.
- Keep the card's voice: "cook till done", "a glug of oil", "Mom's pan" all survive
  verbatim. Do not modernize, expand, or professionalize the wording.
- Keep marginalia — "double this", "Grandma's favorite", a date, a name. It becomes the
  section's `note`.
- Do not invent an oven temperature, a pan size, or a step the card omits. A card that
  says only "bake till golden" says exactly that.
- Fractions as `½ ¼ ⅓ ¾ ⅔`. Bold temperatures, times, and pan sizes with `**...**` —
  the writer converts those to real bold.

## Step 2 — Match the tab

Read the doc with `mcp__Google_Drive__read_file_content` and the file ID from
`config.json`. One call returns every tab as a `# Tab Name` heading — build the current
tab list from that response, not from the reference's snapshot, which ages.

Classify the destination:

- **Existing tab, stub content** — the tab exists and its ingredients are the
  `1½ cups white sugar` placeholder. The normal case. Use `"mode": "replace"`.
- **Existing tab, real content** — a recipe is already written there. Stop and show the
  user both versions; do not propose overwriting on your own.
- **No tab, category fits** — new recipe in an existing category. The script cannot
  create tabs, so ask the user to add the tab in Docs first (right-click the category
  tab → Add subtab), then post into it.
- **`Breads` / `Drinks`** — these hold recipes inline rather than in child tabs. Post to
  the category tab itself with `"mode": "append"`.
- **Listed under POTENTIAL** — the index tab's POTENTIAL section is a wishlist. If the
  recipe is there, say so; its index line moves out of POTENTIAL.

Match on meaning, not string equality — "Butternut squash and apple soup" on a card is
the `Butternut Squash Apple Soup` tab. Where two tabs are plausible, present both and let
the user pick rather than guessing.

## Step 3 — Present for QA, then stop

Show, per recipe:

1. **The transcription**, formatted as it will appear in the doc.
2. **Flagged readings** — a short table of every uncertain item: what you read, what else
   it might be, and where on the card it sits. An empty table means a clean read; say so
   explicitly rather than dropping the section.
3. **Destination** — the tab path, which case above it is, the write mode, and whether
   the index tab needs a new line.

Then stop and wait. Do not continue to step 4 in the same turn, even when the
transcription looks clean.

## Step 4 — Write to the doc (only after approval)

An Apps Script bound to the doc watches a Drive folder and files jobs into tabs. Claude
cannot call that script directly — this workspace's egress policy blocks
`script.google.com` — so the job travels through Drive, which the connector can write.

If `config.json` has `"inboxFolderId": null`, the automation is not installed yet: point
the user at `SETUP.md` and fall back to **Manual fallback** below.

For each approved recipe:

1. Build the job JSON (schema below).
2. `mcp__Google_Drive__create_file` with `title` = `recipe-<slug>-<HHMMSS>.json`,
   `parentId` = the inbox folder ID, `contentMimeType` = `application/json`,
   `textContent` = the job JSON, `disableConversionToGoogleType` = `true`.
   The `recipe-` prefix is what the trigger looks for — a differently named file is
   ignored forever.
3. Wait for the trigger, which runs about once a minute.
4. Confirm with `mcp__Google_Drive__search_files` using
   `parentId = '<inbox folder id>'`. The script renames each job on the way out:
   - `DONE Soups > Taco Soup — recipe-taco-soup-143022.json` — written.
   - `ERROR <message> — recipe-...json` — not written; the message says why.
   Still named `recipe-...`? The trigger has not fired yet. Check again shortly rather
   than re-sending, or the recipe lands twice.
5. Report the outcome with a link to the tab, and save the approved recipe to
   `recipes/<slug>.md` in the repo as a durable record.

### Job schema

```json
{
  "tab": ["Soups", "Butternut Squash Apple Soup"],
  "mode": "replace",
  "recipe": {
    "title": "Butternut Squash Apple Soup",
    "attribution": "Eliza Clapier",
    "sections": [
      {
        "heading": null,
        "ingredients": ["1 butternut squash, peeled and cubed", "2 apples, cored"],
        "instructions": ["Roast the squash at **400°F for 30 minutes**."],
        "note": "Doubles well."
      }
    ]
  }
}
```

- `tab` — full path from a top-level tab. A bare title works when unambiguous.
- `mode` — `replace` for a stub tab, `append` for `Breads` / `Drinks`.
- `sections` — one entry for a simple recipe. Multi-component recipes get one section
  per component, each with its own `heading` (`"Sauce"`, `"Browned Butter Frosting"`).
- `text` — use instead of `instructions` when the card runs its method as a paragraph
  rather than numbered steps (see Guacamole in the doc).
- `note` — italic line after the steps. Omit when the card has no marginalia.

### Manual fallback

When the automation is not installed, emit the recipe in one fenced Markdown block with
no commentary inside the fence, and one line naming the tab and whether to replace the
stub or append below the last recipe. Mention once that Google Docs renders pasted
Markdown as real headings and lists when **Tools → Preferences → Enable Markdown** is on.

## Batches

With several recipes at once, do steps 1–2 for all of them, then present every
transcription together in step 3 so the user QAs in one pass. Number them so partial
approval is answerable — "1, 3 and 4 are good, fix the sugar on 2". Post only the
approved ones and keep the rest in the QA loop. One job file per recipe, never a
combined one.
