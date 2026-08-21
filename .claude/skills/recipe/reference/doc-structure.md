# Target document

**Title:** Mama G's Recipes (& more)
**File ID:** `1-DuEEfuHq5T2mX3YhBN9JPCWcciPggBf3R8HD9IoV40`
**URL:** https://docs.google.com/document/d/1-DuEEfuHq5T2mX3YhBN9JPCWcciPggBf3R8HD9IoV40/edit
**Owner:** eaglauser@gmail.com (shared with jvclapier@gmail.com)

Read it with `mcp__Google_Drive__read_file_content` using the file ID above.
Every tab is returned in one call, each tab rendered as a `# Tab Name` heading.

## Tab layout

Two organizing patterns coexist. Check which one applies before proposing a destination.

**Pattern A — category tab with one child tab per recipe.**
The category tab itself is nearly empty; each recipe lives in its own child tab.
Applies to: `Main Dishes`, `Sides`, `Breakfasts`, `Desserts`, `Dips & Dressings`, `Soups`.

**Pattern B — category tab holding several recipes inline.**
No child tabs; recipes are stacked inside the parent tab, separated by blank lines.
Applies to: `Breads`, `Drinks`.

`List of Recipes` is a plain index tab (see below), not a recipe container.

**Pattern C — `Overflow`, the catch-all.**
A running list of recipes whose home was not obvious: no matching tab, several plausible
tabs, or a matching tab that already held a real recipe. Always `append`, never
`replace` — a `replace` here erases every recipe filed before it. Each entry carries the
reason it landed there in its `note`. Entries are meant to be moved out by hand once the
user decides where they belong.

## Tab inventory

Captured 2026-08-21. Re-read the doc each run — tabs get added.

- **List of Recipes** — index
- **Main Dishes** — Shepherd's Pie · Pot Roast · Swiss Steak · Russian Chicken · Cottage Noodle Bake · Robynne's Lasagne · Meatloaf · Chicken Enchiladas · Salmon Patties · Mustard Dill Salmon · Sloppy Joes · Spare Ribs · Broccoli Chicken Casserole · Spaghetti · Tacos · Hamburgers with Gravy · Ritz Chicken · Beef Cubes & Gravy · Honey Mustard Chicken with Brussel Sprouts · Homemade Mac N Cheese · Chicken Ranch Pasta · Wingers Sticky Chicken Salad · Swiss Chicken · Quinoa Bowls · Sweet Potato Shepherd's Pie · Quinoa Enchilada Bake · Buffalo Chicken Bake · Turkey Teriyaki Meatballs · Chip Chicken · Hawaiian Haystacks · Cafe Rio Pork & Chicken
- **Sides** — Fruit Salad · Berry Spinach Salad · Lipton Potatoes · Orzo Pasta · Thanksgiving Cauliflower · Green Bean Salad · Pomegranate Salad · Baked Beans
- **Breakfasts** — Bran Muffins · Grandma Verna's Waffles · Grandpa Metcalf Pancakes · Swedish Pancakes · Sausage Souffle · Cinnamon Rolls · German Pancakes · Buttermilk Syrup
- **Desserts** — Aunt Sue's Chocolate Chip Cookies · Aunt Tanya's Frozen Fruit Dessert · Burnt Almond Fudge Ice Cream · Chocolate Marshmallow Cookies · Claire's Pumpkin Bars with Browned Butter Frosting · Cake Pops · Carrot Cake · Grandpa Glauser Cookies · Banana Bread Bars · Applesauce Cookies · Gold Rush Brownies · Mom's Oatmeal Chocolate Chip Cookies · Hurry Up Chocolate Cake · Peanut Butter Cookies · Mint Brownies · Chocolate Brownies · Peach Dessert · Hot Fudge · Emily Romrell (holds Grasshopper Pie) · Homemade Oreos · Oatmeal Carmelitas · Sugar Cookies · Texas Sheet Cake · Cookie Bars · Sea Salt Chocolate Chip Cookies
- **Breads** *(inline)* — Sourdough Bread · Peasant Bread · Banana Bread · Rolls
- **Dips & Dressings** — Toffee Fruit Dip · Veggie Dip · 7 Layer Dip · Pineapple Cheese Ball · Cowboy Caviar · Hummus · Cranberry Jalapeno Cream Cheese Dip · Fruit Dip · Salsa · Guacamole
- **Soups** — Butternut Squash Apple Soup · Lemon Chicken Soup · Chicken Noodle Soup · Beef Stew · Taco Soup · Corn Chowder · Vegetable Beef Soup · Smokey & Sweet Turkey Chili
- **Drinks** *(inline)* — French Hot Chocolate · Slush · Root Beer
- **Overflow** *(catch-all, append-only)* — recipes with no confident home

### Stub tabs

Most tabs are placeholders whose entire ingredient list reads `1½ cups white sugar`.
That is filler, not a real ingredient. A tab in this state is **empty and waiting** —
filling one is a replace, not an append, and needs no "will this overwrite something"
warning beyond noting the stub is being replaced.

## House format

A recipe inside its tab, below the `# Tab Name` heading:

```
## **Recipe Name**

### **Attributed Person**

**Ingredients**

  - 1½ cups white sugar
  - 2 eggs

**Instructions**

1.  Blend the sugar and eggs.
2.  Bake at **350°F for 27 minutes**.
```

Conventions drawn from the recipes already written up:

- `##` recipe name, `###` attribution — both bold.
- Multi-component recipes repeat `###` per component (`### **Sauce**`,
  `### **Cheese Mixture**`, `### **Browned Butter Frosting**`), each with its own
  `**Ingredients**` and `**Instructions**` block.
- Ingredients: two-space-indented `  - ` bullets, quantity first, prep notes after a
  comma (`3 tomatoes, diced`).
- Instructions: numbered, two spaces after the period.
- Bold temperatures, times, and pan sizes: `**350°F for 40 minutes**`, `**9 × 13-inch glass pan**`.
- Short recipes sometimes use a free paragraph instead of numbered steps
  (see Guacamole, Pineapple Cheese Ball). Match whichever the source photo implies.
- Fractions as `½ ¼ ⅓ ¾ ⅔`, not `1/2`.

## Attribution roster

Match a handwritten name against this list before inventing a spelling:

Linda Glauser · Linda Clapier · Verna Metcalf · Robynne Carter · Eliza Clapier ·
Amie Glauser · Claire Glauser · Jess Clapier · Emily Romrell · Karen Morgan ·
Mary Glauser · Edith Glauser · Reed Glauser · Jim Metcalf · Heather Gibb ·
Amy Walker · Jill Wankier · Gail Bown

Recipe cards often say only "Mom" or "Grandma". Do not resolve those yourself — carry
the card's wording into the QA table and ask.

## The index tab

`List of Recipes` groups titles under headers: MAINS, BREAKFAST, DESSERTS, SIDES, then
per-contributor headers (LINDA CLAPIER, ROBYNNE CARTER, JILL WANKIER, AMIE, EMS, ELIZA,
CLAIRE, ANNIE, SARAH, KAREN MORGAN, AUNT MARY), then a **POTENTIAL** list of recipes not
yet collected.

Two consequences when adding a genuinely new recipe:

1. It needs an index line, usually under both its category header and its contributor header.
2. Check **POTENTIAL** first — if the recipe is listed there, the line moves out of
   POTENTIAL into the real sections rather than being added alongside it.
