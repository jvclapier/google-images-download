---
name: recipe
description: Transcribe photos of recipe cards into the "Mama G's Recipes (& more)" Google Doc. Use when the user attaches one or more photos or scans of a recipe — handwritten cards, cookbook pages, printouts — and wants them added to the recipe doc, or invokes /recipe. Reads the photos, picks the destination tab, posts without waiting for approval, and reports what it wrote and what it wasn't sure about.
---

# Recipe photo → Google Doc

Turn photos of recipe cards into correctly formatted entries in the family recipe doc.

Read `reference/doc-structure.md` before starting — it carries the doc's file ID, the tab
inventory, the house formatting conventions, and the attribution roster. Read
`config.json` for the inbox folder ID that step 3 needs.

**Post without asking.** The user does not want an approval gate. Make the best call you
can, write it, and report what you did. Judgment calls get made and disclosed, not
escalated. Two things still make it into the report every time: what you were unsure of,
and anything you decided on the user's behalf.

The one safety valve is placement: when you are not confident where a recipe belongs, it
goes to the **Overflow** tab (step 2) rather than to a guess. Never overwrite a tab that
already holds a real recipe.

## Step 1 — Read every photo

Read each attached image with the Read tool. Then group them: several photos may be one
recipe (front/back of a card, a long page shot in two halves), or one photo may hold two
recipes. A sentence that breaks off at one photo's edge and resumes at another's is the
strongest signal that they are one card.

Transcribe what is actually written, not what the recipe "should" say.

- Quantities are the whole point. A misread `1/3` for `1/2` ruins the dish. When a
  character is genuinely ambiguous, transcribe your best reading and flag it in step 4 —
  never quietly smooth it over.
- Keep the card's voice: "cook till done", "a glug of oil", "wisk", "gr. onions" all
  survive verbatim. Do not modernize, expand, correct spelling, or professionalize.
- Keep marginalia — "double this", "I put some cheese in middle", a date, a name. It
  becomes the section's `note`.
- Do not invent an oven temperature, a pan size, or a step the card omits.
- **Crossed-out text**: the strikethrough is information. Honour it — leave the item out —
  unless the method still calls for it, in which case keep the item and say so in the
  report. Never silently drop something the instructions depend on.
- Attribution: match against the roster in the reference. A card signed only "Mom",
  "Grandma", or a bare first name stays exactly that — do not promote "Sue" to
  "Aunt Sue" even when a similar name appears elsewhere in the doc. Note it in the report.
- Fractions as `½ ¼ ⅓ ¾ ⅔`. Bold temperatures, times, and pan sizes with `**...**`.

## Step 2 — Pick the destination

Read the doc with `mcp__Google_Drive__read_file_content` and the file ID from
`config.json`. One call returns every tab as a `# Tab Name` heading — build the current
tab list from that response, not from the reference's snapshot, which ages.

**Post to a matched tab** only when both hold:

- a tab clearly corresponds to this recipe (match on meaning — "Butternut squash and
  apple soup" on a card is the `Butternut Squash Apple Soup` tab), **and**
- that tab is a stub, its ingredients being the `1½ cups white sugar` placeholder.

Use `"mode": "replace"`. `Breads` and `Drinks` are the exception: they hold recipes
inline, so post to the category tab itself with `"mode": "append"`.

**Send it to `Overflow`** — `"mode": "append"`, always — when any of these is true:

- no tab corresponds to the recipe;
- two or more tabs are plausible and nothing decides between them;
- the matching tab **already holds a real recipe** (posting would destroy it);
- the card's recipe name differs materially from the tab name you'd otherwise pick.

`Overflow` is a running catch-all, so it is **never** `replace` — that would erase
everything filed before it. When filing there, put the reason in the recipe's `note`,
e.g. *"Filed to Overflow: no tab matched. Closest category: Main Dishes."* so the entry
carries its own explanation.

If `Overflow` is not in the tab list, it has not been created yet. The script cannot
create tabs — report the recipe in chat, ask the user to add an `Overflow` tab
(right-click any top-level tab → Add subtab, or add it at the top level), and post once
it exists.

Also check the index tab: if the recipe is new to `List of Recipes`, say which line to
add and under which header, and whether it should move out of **POTENTIAL**.

## Step 3 — Post

For each recipe:

1. Build the job JSON (schema below).
2. `mcp__Google_Drive__create_file` with `title` = `recipe-<slug>-<HHMMSS>.json`,
   `parentId` = the inbox folder ID, `contentMimeType` = `application/json`,
   `textContent` = the job JSON, `disableConversionToGoogleType` = `true`.
   The `recipe-` prefix is what the trigger looks for — a differently named file is
   ignored forever.
3. Wait for the trigger, which runs about once a minute.
4. Confirm with `mcp__Google_Drive__search_files` using
   `parentId = '<inbox folder id>'`. The script renames each job on the way out:
   - `DONE Main Dishes > Taco Soup — recipe-taco-soup-143022.json` — written.
   - `ERROR <message> — recipe-...json` — not written; the message says why.
   Still named `recipe-...`? The trigger has not fired yet. Check again shortly rather
   than re-sending, or the recipe lands twice.
5. Save the recipe to `recipes/<slug>.md` in the repo as a durable record, including the
   transcription notes, and commit it.

One job file per recipe, never a combined one.

### Job schema

```json
{
  "tab": ["Main Dishes", "Cottage Noodle Bake"],
  "mode": "replace",
  "recipe": {
    "title": "Cottage Noodle Bake",
    "attribution": "Sue",
    "sections": [
      {
        "heading": null,
        "ingredients": ["1 8 oz. pkg. noodles, cooked", "1½ tsp. garlic salt"],
        "instructions": ["Bake **350° 30 min.**"],
        "note": "(I put some cheese in middle)"
      }
    ]
  }
}
```

- `tab` — full path from a top-level tab. A bare title works when unambiguous.
- `mode` — `replace` for a stub tab; `append` for `Breads`, `Drinks`, and always `Overflow`.
- `sections` — one entry for a simple recipe. Multi-component recipes get one section
  per component, each with its own `heading` (`"Sauce"`, `"Browned Butter Frosting"`).
- `text` — use instead of `instructions` when the card runs its method as a paragraph
  rather than numbered steps (see Guacamole in the doc).
- `note` — italic line after the steps. Carries marginalia, and the reason when filing
  to `Overflow`. Omit when there is neither.

## Step 4 — Report

After posting, show the user:

1. **What was written and where** — tab path, mode, and a link to the doc.
2. **The transcription**, so they can eyeball it against the card.
3. **Flagged readings** — a table of every uncertain item: what you read, what else it
   might be, and where on the card it sits. An empty table means a clean read; say so
   explicitly rather than dropping the section.
4. **Decisions you made for them** — a crossed-out ingredient kept or dropped, an
   attribution that overwrites a different name on the stub, an Overflow routing and why.
   Anything the user might have chosen differently belongs here.

Corrections are cheap: a stub tab can be re-posted with `replace` at any time. Say so
when a call was close, so the user knows a fix is one message away. An `Overflow` entry
cannot be un-appended, though — the user has to delete it by hand, so mention that when
routing there.

## Batches

With several recipes at once, run steps 1–3 for all of them, then report them together,
numbered. Post every one; nothing waits on approval. If some went to `Overflow` and
others to matched tabs, group the report that way so the routing is obvious at a glance.
