---
name: save-recipe
description: Transcribe photos of recipe cards into the running cookbook file, recipes/COOKBOOK.md, formatted to paste into the Mama G's Recipes Google Doc. Use when the user attaches photos or scans of a recipe — handwritten cards, cookbook pages, printouts — and invokes /save-recipe, or asks for recipes typed up. Handles one card or a large batch in one go.
---

# Recipe photos → running cookbook file

Read the attached photos, then produce **two outputs every time**: the copy-paste
Markdown in chat, and an updated `recipes/COOKBOOK.md`, which mirrors the tab order of
the Google Doc. No Drive, no Apps Script, no approval step — transcribe, file, commit,
and hand back the blocks.

The point of the file is queueing: the user can send far more recipes than they paste, so
everything accumulates in one place with a checklist of what still needs pasting.

## Step 1 — Read the photos

Group them first: several photos may be one recipe (front and back of a card, a page shot
in halves), or one photo may hold two. A sentence that breaks off at one photo's edge and
resumes at another's means they are one card. State the grouping in one line.

Transcribe what is written, not what the recipe "should" say.

- Quantities are the whole point. `1/3` misread as `1/2` ruins the dish.
- Keep the card's voice: "cook till done", "wisk", "gr. onions", "6-8 mins" stay as
  written. Do not modernize, expand, correct spelling, or professionalize.
- Keep marginalia — "double this", "I put some cheese in middle", a date — as an italic
  line at the end of the recipe.
- Never invent a temperature, pan size, or step the card omits.
- Crossed-out text: leave it out, unless the method still calls for it — then keep it and
  say so in the notes.
- A card signed "Mom", "Grandma", or a bare first name stays exactly that. Never promote
  "Sue" to "Aunt Sue" because a similar name appears elsewhere.
- Fractions as `½ ¼ ⅓ ¾ ⅔`. Bold temperatures, times, and pan sizes.

## Step 2 — File it

Read `recipes/COOKBOOK.md` and add each recipe under its category heading, in the doc's
order: Main Dishes, Sides, Breakfasts, Desserts, Breads, Dips & Dressings, Soups, Drinks,
Overflow. Replace a section's `*(none yet)*` placeholder with the first recipe that lands
there.

Pick the category from the recipe itself. When no category fits, or two fit equally, put
it under **Overflow** rather than guessing — that is what it is for.

The recipe block, matching the doc's house style:

```
## **Recipe Name**

### **Attributed Person**

**Ingredients**

  - 1½ cups white sugar
  - 2 eggs

**Instructions**

1.  Cream the butter and sugar.
2.  Bake at **350° 6-8 mins.**

*(marginalia from the card)*
```

Multi-component recipes repeat `### **Component**` per part, each with its own
`**Ingredients**` and `**Instructions**`. When the card runs its method as a paragraph
rather than numbered steps, use a paragraph.

Then:

1. **Add a row to the Queue table** at the top: recipe, destination tab, `☐`. Work out
   the destination from the doc's tab list — an existing tab if one matches, otherwise
   say `Overflow` or `(new tab needed)`.
2. **Add a `## <Recipe Name>` entry under `# Transcription notes`** at the bottom, with
   the card's provenance, anything kept verbatim, and anything unresolved. Notes live
   there, never inside the recipe block, so the blocks stay clean to copy.
3. **Commit** the file with the recipe names in the message.

Keep the recipe blocks free of commentary — every character between the headings is
something the user will paste.

## Step 3 — Two outputs

Every run produces both, always:

**1. The copy-paste Markdown, in chat.** One fenced block per recipe, with a heading
above it naming the destination tab. The block holds only what gets pasted — no
commentary inside the fence. This is what the user actually copies from, so it goes in
the reply even for a large batch; never point at the file instead. Blocks are identical
to what step 2 wrote, so the two never drift.

**2. The updated file.** Already written and committed in step 2. Send it with
SendUserFile so it is one click away.

Under the blocks, add a short **Check these** list of genuinely uncertain readings —
what you read, what else it might be, where on the card. A clean card gets one line
saying so, not a table. Keep this outside the fences.

Mention once per conversation: Google Docs renders pasted Markdown as real headings and
lists when **Tools → Preferences → Enable Markdown** is checked.

## Marking things pasted

When the user says they have pasted something, flip its `☐` to `✅` in the Queue table
and commit. Leave the recipe in the file — it is the durable record, and the doc is not
backed up anywhere else.
