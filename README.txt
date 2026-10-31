IT Asset Management System — simplified React mockup

Run locally:
1. Install Node.js if needed.
2. Open this folder in a terminal.
3. Run: npm install
4. Run: npm run dev
5. Open the local address printed by Vite.

Pages: Dashboard, Assets, Employees, Assignments, Repairs, Reports and Settings.

Inventory tracking:
- Individually tracked: laptops, desktops and monitors. Each has its own asset tag/record.
- Quantity-tracked: mice, keyboards, cables and similar stock. One record stores the total and available quantity. Assignments reduce available quantity; returns add it back.
- For bulk items, purchase price is the per-unit price. Use the total quantity to represent the number purchased.

Repairs:
- Each repair record stores reported date, issue/note, cost and optional completion date.
- The Repairs page shows current repairs, each repair's cost and the lifetime repair cost summed from all repair records.
- Add a repair from the Repairs page or choose Under Repair in an individually tracked asset's status selector. Complete an open repair to record its completion date and final cost.

Assignments can be searched by employee name/ID and asset tag/name.

This is a frontend-only mockup. It stores changes in browser localStorage; it is not connected to Django yet. The sample data is in src/data/seedData.js and the main UI is in src/App.jsx. Styles are in src/styles.css.

To reset sample data, open Settings and choose Reset sample data. This also clears repair history saved in the browser.
