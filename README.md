# ITAM Interactive Mockup

A minimal, responsive React mockup for an IT Asset Management System. It uses sample data and browser local storage; it is not connected to Django or a production database.

## Run locally

Requirements: Node.js and npm.

1. Extract this ZIP.
2. Open PowerShell in the extracted `itam-mockup` folder.
3. Run:

```powershell
npm install
npm run dev
```

4. Open the local address printed by Vite (usually `http://localhost:5173`).

## Included interactions

- Dashboard with total, available, assigned, under-repair, missing, and warranty-expiring counts.
- Asset search and status/category filters.
- Add/edit asset details, purchase price, maintenance cost, new/refurbished condition, warranty expiry and document file-name selection.
- Assignment and return workflow.
- Employee creation and employee details.
- Repair tracking and completing a repair.
- Mark assets as sold or scrapped.
- Reports with CSV export.
- Browser local storage to retain mockup changes between refreshes.
- Reset sample data from Settings.

## Mockup limitations

- Data is saved only in this browser, not in Django or SQLite.
- Document selection records the filename only. Files are not uploaded or stored.
- This is a prototype for discussing requirements, not production-ready software.
- Status transitions, financial records and disposal workflows will need business-rule review before backend implementation.
