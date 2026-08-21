---
name: save-recipe
description: Transcribe photos of recipe cards into clean copy-paste Markdown for a Google Doc. Use when the user attaches photos or scans of a recipe — handwritten cards, cookbook pages, printouts — and invokes /save-recipe, or asks for a recipe typed up to paste somewhere. Reads the images and returns formatted Markdown with no other steps.
---

# Recipe photo → copy-paste Markdown

Read the attached photos, return the recipe as Markdown the user can paste straight into
Google Docs. That is the whole job. No Drive, no tabs, no posting, no approval step.

## Read the photos

Group them first: several photos may be one recipe (front and back of a card, a page shot
in halves), or one photo may hold two. A sentence that breaks off at one photo's edge and
resumes at another's means they are one card. Say how you grouped them in one line.

Transcribe what is written, not what the recipe "should" say.

- Quantities are the whole point. `1/3` misread as `1/2` ruins the dish.
- Keep the card's voice: "cook till done", "wisk", "gr. onions", "6-8 mins" stay as
  written. Do not modernize, expand, correct spelling, or professionalize.
- Keep marginalia — "double this", "I put some cheese in middle", a date, a name — as an
  italic line at the end.
- Never invent a temperature, pan size, or step the card omits.
- Crossed-out text: leave it out, unless the method still calls for it — then keep it and
  say so below the block.
- A card signed "Mom", "Grandma", or a bare first name stays exactly that.
- Fractions as `½ ¼ ⅓ ¾ ⅔`. Bold temperatures, times, and pan sizes.

## Output

One fenced block per recipe, containing **only** what gets pasted — no commentary inside
the fence. This shape, matching the rest of the doc:

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

Below the block — outside it, so it never gets pasted — add a short **Check these**
list of anything uncertain: what you read, what else it might be, and where on the card.
Nothing uncertain? Say the read was clean. Keep this to the genuinely ambiguous; a tidy
card needs one line, not a table.

With several recipes, give each its own block with a heading above it, so they can be
copied one at a time.

Mention once per conversation, the first time: Google Docs renders pasted Markdown as
real headings and lists when **Tools → Preferences → Enable Markdown** is checked.
Without it the paste arrives as literal asterisks.
