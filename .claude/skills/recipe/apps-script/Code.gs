/**
 * Recipe doc writer — Apps Script bound to "Mama G's Recipes (& more)".
 *
 * Claude cannot call this script over the network (this workspace's egress policy
 * blocks script.google.com), so the transport is Google Drive itself:
 *
 *   Claude  --create_file-->  [Recipe Inbox folder]  --time trigger-->  this script
 *                                     ^                                     |
 *                                     +--------- renamed DONE / ERROR <-----+
 *
 * Claude drops a JSON job in the inbox folder; a time-driven trigger picks it up,
 * writes the recipe into the right tab, and renames the job file so Claude can read
 * the outcome back with a Drive search.
 *
 * ONE-TIME SETUP: paste this file into Extensions > Apps Script, save, then run
 * setup() once and grant the permissions it asks for. It logs the inbox folder ID.
 */

const DOC_ID = '1-DuEEfuHq5T2mX3YhBN9JPCWcciPggBf3R8HD9IoV40';
const INBOX_FOLDER_NAME = 'Recipe Inbox';
const TRIGGER_MINUTES = 1;

// A tab whose ingredients are only this filler is an unfilled placeholder.
const STUB_MARKER = '1½ cups white sugar';

/* ================= setup ================= */

/** Run once from the Apps Script editor. Creates the inbox folder and the trigger. */
function setup() {
  const folder = inboxFolder();

  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processInbox') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('processInbox').timeBased().everyMinutes(TRIGGER_MINUTES).create();

  const msg = [
    'Inbox folder : ' + folder.getName(),
    'Folder ID    : ' + folder.getId(),
    'Trigger      : processInbox every ' + TRIGGER_MINUTES + ' min',
    '',
    'Give the folder ID to Claude — it goes in .claude/skills/recipe/config.json',
  ].join('\n');
  Logger.log(msg);
  return msg;
}

/** Run once to tear the automation back down. Leaves the folder and the doc alone. */
function teardown() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'processInbox') ScriptApp.deleteTrigger(t);
  });
  return 'trigger removed';
}

function inboxFolder() {
  const existing = DriveApp.getFoldersByName(INBOX_FOLDER_NAME);
  return existing.hasNext() ? existing.next() : DriveApp.createFolder(INBOX_FOLDER_NAME);
}

/* ================= the trigger ================= */

/**
 * Drain the inbox. Every job file is renamed on the way out, so a job is never
 * processed twice and the outcome is visible in the file's title.
 */
function processInbox() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return;

  try {
    const files = inboxFolder().getFiles();
    while (files.hasNext()) {
      const file = files.next();
      const name = file.getName();

      // Only untouched jobs; DONE/ERROR files stay put as a record.
      if (name.indexOf('DONE') === 0 || name.indexOf('ERROR') === 0) continue;
      if (name.indexOf('recipe-') !== 0) continue;

      try {
        const job = JSON.parse(file.getBlob().getDataAsString());
        const result = writeJob(job);
        file.setName('DONE ' + result.tabPath + ' — ' + name);
      } catch (err) {
        const message = String(err.message || err);
        file.setName('ERROR ' + message.slice(0, 120) + ' — ' + name);
      }
    }
  } finally {
    lock.releaseLock();
  }
}

/** Apply one job: find the tab, write the recipe. */
function writeJob(job) {
  if (!job.recipe) throw new Error('missing "recipe"');

  const entry = findTab(job.tab);
  if (!entry) throw new Error('no tab matching ' + JSON.stringify(job.tab));

  const body = entry.tab.asDocumentTab().getBody();
  const mode = job.mode || 'replace';

  if (mode === 'replace') {
    body.clear();
  } else if (mode !== 'append') {
    throw new Error('mode must be "replace" or "append"');
  }

  writeRecipe(body, job.recipe);

  // body.clear() leaves one empty paragraph behind; drop it so the recipe heading
  // is the first thing in the tab. Purely cosmetic — Docs refuses to remove a
  // paragraph that is the only one in its section ("Can't remove the last
  // paragraph in a document section"), and a stray blank line is not worth
  // failing an otherwise good write over.
  if (mode === 'replace' && body.getNumChildren() > 1) {
    try {
      const first = body.getChild(0);
      if (first.getType() === DocumentApp.ElementType.PARAGRAPH &&
          first.asParagraph().getText() === '') {
        first.removeFromParent();
      }
    } catch (ignored) {
      // Leading blank line stays. The recipe is already written.
    }
  }

  return { tabPath: entry.path.join(' > '), tabId: entry.tab.getId(), mode: mode };
}

/* ================= optional direct network path ================= */
/* Unused while egress to script.google.com is blocked; harmless to leave deployed. */

function doGet(e) {
  try {
    return json({ ok: true, tabs: inventory() });
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const result = writeJob(JSON.parse(e.postData.contents));
    return json({ ok: true, tab: result.tabPath, mode: result.mode });
  } catch (err) {
    return json({ ok: false, error: String(err.message || err) });
  }
}

/* ================= writing ================= */

function writeRecipe(body, recipe) {
  heading(body, recipe.title, DocumentApp.ParagraphHeading.HEADING2);

  if (recipe.attribution) {
    heading(body, recipe.attribution, DocumentApp.ParagraphHeading.HEADING3);
  }

  (recipe.sections || []).forEach(function (section) {
    if (section.heading) {
      heading(body, section.heading, DocumentApp.ParagraphHeading.HEADING3);
    }

    if (section.ingredients && section.ingredients.length) {
      label(body, 'Ingredients');
      section.ingredients.forEach(function (line) {
        listItem(body, line, DocumentApp.GlyphType.BULLET);
      });
    }

    if (section.instructions && section.instructions.length) {
      label(body, 'Instructions');
      section.instructions.forEach(function (line) {
        listItem(body, line, DocumentApp.GlyphType.NUMBER);
      });
    }

    // Free-paragraph recipes (see Guacamole) carry `text` instead of numbered steps.
    if (section.text) {
      applyBold(para(body, section.text), section.text);
    }

    if (section.note) {
      para(body, section.note).editAsText().setItalic(true);
    }
  });
}

/**
 * A plain body paragraph. appendParagraph inherits the text attributes of the
 * paragraph before it, so bold/italic are cleared explicitly — otherwise a
 * paragraph following a heading silently arrives bold.
 */
function para(body, text) {
  const p = body.appendParagraph(strip(text));
  p.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  p.editAsText().setBold(false).setItalic(false);
  return p;
}

function heading(body, text, level) {
  const p = body.appendParagraph(strip(text));
  p.setHeading(level);
  // House style bolds heading text on top of the heading style.
  p.editAsText().setItalic(false).setBold(true);
  return p;
}

function label(body, text) {
  const p = body.appendParagraph(text);
  p.setHeading(DocumentApp.ParagraphHeading.NORMAL);
  p.editAsText().setItalic(false).setBold(true);
  return p;
}

function listItem(body, text, glyph) {
  const item = body.appendListItem(strip(text));
  item.setGlyphType(glyph);
  item.editAsText().setBold(false).setItalic(false);
  applyBold(item, text);
  return item;
}

/** Remove **markers** from display text. */
function strip(text) {
  return String(text).replace(/\*\*/g, '');
}

/**
 * Re-apply bold to the spans wrapped in ** in the source string, using offsets
 * computed against the already-stripped text.
 */
function applyBold(element, raw) {
  const src = String(raw);
  const t = element.editAsText();
  let out = 0;
  let i = 0;

  while (i < src.length) {
    const open = src.indexOf('**', i);
    if (open === -1) break;
    const close = src.indexOf('**', open + 2);
    if (close === -1) break;

    out += open - i;                  // plain text preceding the marker
    const len = close - (open + 2);   // length of the bolded run
    if (len > 0) t.setBold(out, out + len - 1, true);

    out += len;
    i = close + 2;
  }
}

/* ================= tabs ================= */

function allTabs() {
  const doc = DocumentApp.openById(DOC_ID);
  const flat = [];

  function walk(tabs, path) {
    tabs.forEach(function (tab) {
      const here = path.concat([tab.getTitle()]);
      flat.push({ tab: tab, path: here });
      walk(tab.getChildTabs(), here);
    });
  }

  walk(doc.getTabs(), []);
  return flat;
}

function inventory() {
  return allTabs().map(function (entry) {
    const text = entry.tab.asDocumentTab().getBody().getText();
    return {
      title: entry.tab.getTitle(),
      id: entry.tab.getId(),
      path: entry.path,
      stub: text.indexOf(STUB_MARKER) !== -1,
      chars: text.length
    };
  });
}

/**
 * Resolve a tab from a path (["Soups","Taco Soup"]), a bare title, or a tab id.
 * Returns {tab, path}, or null when nothing matches.
 */
function findTab(target) {
  if (!target) throw new Error('missing "tab"');

  const flat = allTabs();
  const path = Array.isArray(target) ? target : [target];
  const wanted = path[path.length - 1];

  for (var i = 0; i < flat.length; i++) {
    if (flat[i].tab.getId() === wanted) return flat[i];
  }

  for (var j = 0; j < flat.length; j++) {
    if (flat[j].path.join(' > ') === path.join(' > ')) return flat[j];
  }

  const norm = function (s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); };
  const candidates = flat.filter(function (entry) {
    return norm(entry.tab.getTitle()) === norm(wanted);
  });

  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1 && path.length > 1) {
    const parent = norm(path[path.length - 2]);
    const scoped = candidates.filter(function (entry) {
      return entry.path.length > 1 && norm(entry.path[entry.path.length - 2]) === parent;
    });
    if (scoped.length === 1) return scoped[0];
  }
  if (candidates.length > 1) throw new Error('ambiguous tab "' + wanted + '" — pass a full path');
  return null;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
