# Making changes safely — schema guide

This explains exactly what you can change freely, what needs a small code
update, and what to avoid, so future changes never lose existing data.

## The core rule

**The tracker reads and writes sheet columns by NAME, not position.**
This is what makes most changes safe. As long as a column's name stays
the same, its data stays connected to the app — no matter what order
the columns are in, and no matter what other columns you add around it.

## ✅ Always safe — do these anytime, no code change needed

- **Adding a new column** to any tab (e.g. adding "remarks" to `Projects`)
  → Existing rows just show blank for it until filled in. Nothing breaks.
- **Adding new rows** (a new project, a new task, a new day's DPR)
  → This is the normal, everyday use of the tracker.
- **Reordering columns** (moving "status" before "client", say)
  → The app finds columns by name, so order never matters.
- **Widening a column, changing its color/formatting in the sheet**
  → Purely cosmetic in Google Sheets, the app never sees formatting.
- **Adding a whole new tab** for something the app doesn't read yet
  → Totally inert until you also ask for that section to be wired up in
    the app — no risk to anything else in the meantime.

## ⚠️ Needs a matching code change — ask before doing these

- **Renaming a column** the app already reads (e.g. `client` → `customer`)
  → The sheet data itself is untouched, but the app will stop finding it
    under the old name until the code is updated to match.
- **Deleting a column** the app reads
  → Same as above — existing sheet data is safe, but that field will
    appear blank in the app until removed from the code too, or restored.
- **Renaming a tab** (e.g. `Projects` → `ActiveProjects`)
  → The app looks up tabs by their exact name.

None of these destroy data — Google Sheets keeps everything you've typed
regardless of what the app does. The risk is only ever "the app can't
find it right now," which is a quick fix once flagged.

## 🚫 Never do this without asking first

- Deleting an entire tab that has real data in it
- Bulk find-and-replace across a whole sheet (easy to accidentally hit
  a column header)

## How to add a new field to an existing section (step by step)

Example: adding a "remarks" field to Projects.

1. In Google Sheets, add a new column header `remarks` to the `Projects` tab.
2. That's it for the data side — nothing else needed for the column to
   exist safely.
3. If you want that field to actually show up and be editable in the
   tracker's Projects page (not just sit in the sheet), that's a small
   one-time code update — describe what you want and where, and it gets
   added without touching any other field or any existing row.

## How to add a whole new tracked section (like we did for LMC)

This is a bigger step — a new tab structure plus new screens in the app.
It's exactly the same process as before: describe the format (ideally
with a real example, like the WhatsApp DPR message you shared), and a
new section gets built that reads/writes its own dedicated tab, without
touching any of the existing sections' tabs or code.

## The one thing to keep consistent: column names in your head

Since the app matches by name, the two places that need to agree are:
- The header row in the Google Sheet
- The corresponding field name inside the app's code

You never need to look at the code yourself to check this — just always
mention the exact column name when asking for a change, and it'll be
kept in sync on both sides.
