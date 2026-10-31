
export const ASSET_STATUSES = [
  "Available",
  "Assigned",
  "Under Repair",
  "Missing",
  "Retired",
  "Sold",
  "Scrapped",
];

export const ASSET_CATEGORIES = [
  "Laptop",
  "Desktop",
  "Monitor",
  "Keyboard",
  "Mouse",
  "Accessory",
  "Printer",
  "Phone",
  "Other",
];

export const ASSET_CONDITIONS = ["New", "Refurbished"];

// Assets
export const initialAssets = [
  {
    id: 1,
    tag: "AST-001",
    name: "Dell Latitude 5440",
    category: "Laptop",
    brand: "Dell",
    model: "Latitude 5440",
    serial: "DL5440-92K1",
    status: "Available",
    condition: "New",
    purchasePrice: 78500,
    maintenanceCost: 1200,
    purchaseDate: "2025-01-18",
    warrantyExpiry: "2028-01-17",
    vendor: "Dell India",
    employeeId: null,
    invoice: "dell-invoice-001.pdf",
    warrantyDoc: "dell-warranty-001.pdf",
    notes: "Issued with 65W charger",
  },
  {
    id: 2,
    tag: "AST-002",
    name: "HP EliteBook 840 G8",
    category: "Laptop",
    brand: "HP",
    model: "EliteBook 840 G8",
    serial: "HP840-7A20",
    status: "Available",
    condition: "Refurbished",
    purchasePrice: 36500,
    maintenanceCost: 2800,
    purchaseDate: "2024-06-10",
    warrantyExpiry: "2026-12-10",
    vendor: "ReTech Systems",
    employeeId: null,
    invoice: "hp-invoice.pdf",
    warrantyDoc: "hp-warranty.pdf",
    notes: "Refurbished unit; battery checked",
  },
  {
    id: 3,
    tag: "AST-003",
    name: "LG 24-inch Monitor",
    category: "Monitor",
    brand: "LG",
    model: "24MP400",
    serial: "LG24-82B7",
    status: "Assigned",
    condition: "New",
    purchasePrice: 9800,
    maintenanceCost: 0,
    purchaseDate: "2025-03-04",
    warrantyExpiry: "2028-03-03",
    vendor: "Tech World",
    employeeId: 2,
    invoice: "lg-invoice.pdf",
    warrantyDoc: "lg-warranty.pdf",
    notes: "",
  },
  {
    id: 4,
    tag: "AST-004",
    name: "Lenovo ThinkPad E14",
    category: "Laptop",
    brand: "Lenovo",
    model: "ThinkPad E14",
    serial: "LN-E14-0018",
    status: "Under Repair",
    condition: "New",
    purchasePrice: 61200,
    maintenanceCost: 3400,
    purchaseDate: "2024-09-15",
    warrantyExpiry: "2027-09-14",
    vendor: "Lenovo",
    employeeId: 1,
    invoice: "lenovo-invoice.pdf",
    warrantyDoc: "lenovo-warranty.pdf",
    notes: "Keyboard issue; sent to service centre",
  },
  {
    id: 5,
    tag: "STK-005",
    name: "Logitech Wireless Mouse",
    category: "Mouse",
    brand: "Logitech",
    model: "M650",
    serial: "",
    status: "Available",
    condition: "New",
    quantityTracked: true,
    quantity: 25,
    availableQuantity: 25,
    purchasePrice: 1850,
    maintenanceCost: 0,
    purchaseDate: "2025-11-22",
    warrantyExpiry: "2026-11-21",
    vendor: "Tech World",
    employeeId: null,
    invoice: "mouse-invoice.pdf",
    warrantyDoc: "mouse-warranty.pdf",
    notes: "",
  },
  {
    id: 6,
    tag: "AST-006",
    name: "Acer Aspire 5",
    category: "Laptop",
    brand: "Acer",
    model: "Aspire 5",
    serial: "AC-A5-7102",
    status: "Missing",
    condition: "Refurbished",
    purchasePrice: 29500,
    maintenanceCost: 900,
    purchaseDate: "2024-02-02",
    warrantyExpiry: "2025-02-01",
    vendor: "ReTech Systems",
    employeeId: 3,
    invoice: "acer-invoice.pdf",
    warrantyDoc: "acer-warranty.pdf",
    notes: "Last seen during office relocation",
  },
  {
    id: 7,
    tag: "AST-007",
    name: "HP ProDesk Desktop",
    category: "Desktop",
    brand: "HP",
    model: "ProDesk 400 G6",
    serial: "HP-PD-0044",
    status: "Available",
    condition: "New",
    purchasePrice: 44500,
    maintenanceCost: 600,
    purchaseDate: "2025-07-12",
    warrantyExpiry: "2028-07-11",
    vendor: "HP India",
    employeeId: null,
    invoice: "hp-prodesk-invoice.pdf",
    warrantyDoc: "hp-prodesk-warranty.pdf",
    notes: "",
  },
  {
    id: 8,
    tag: "AST-008",
    name: "Dell Latitude 5420",
    category: "Laptop",
    brand: "Dell",
    model: "Latitude 5420",
    serial: "DL5420-113A",
    status: "Sold",
    condition: "Refurbished",
    purchasePrice: 22000,
    maintenanceCost: 1500,
    purchaseDate: "2023-05-05",
    warrantyExpiry: "2024-05-04",
    vendor: "ReTech Systems",
    employeeId: null,
    invoice: "old-dell-invoice.pdf",
    warrantyDoc: "old-dell-warranty.pdf",
    notes: "Sold during asset disposal",
  },
  {
    id: 9,
    tag: "AST-009",
    name: "Mechanical Keyboard",
    category: "Keyboard",
    brand: "Keychron",
    model: "K2",
    serial: "KC-K2-021",
    status: "Scrapped",
    condition: "New",
    purchasePrice: 6200,
    maintenanceCost: 1100,
    purchaseDate: "2023-08-19",
    warrantyExpiry: "2024-08-18",
    vendor: "Tech World",
    employeeId: null,
    invoice: "keyboard-invoice.pdf",
    warrantyDoc: "keyboard-warranty.pdf",
    notes: "Scrapped due to liquid damage",
  },
];

// Employees
export const initialEmployees = [
  {
    id: 1,
    employeeId: "EMP-101",
    name: "Aarav Rao",
    department: "Engineering",
    email: "aarav.rao@company.com",
    active: true,
  },
  {
    id: 2,
    employeeId: "EMP-102",
    name: "Meera Nair",
    department: "Finance",
    email: "meera.nair@company.com",
    active: true,
  },
  {
    id: 3,
    employeeId: "EMP-103",
    name: "Rohan Shetty",
    department: "Operations",
    email: "rohan.shetty@company.com",
    active: true,
  },
  {
    id: 4,
    employeeId: "EMP-104",
    name: "Ananya Das",
    department: "Human Resources",
    email: "ananya.das@company.com",
    active: true,
  },
];

// Assignment history
export const initialAssignments = [
  {
    id: 1,
    assetId: 1,
    employeeId: 1,
    assignedDate: "2025-02-01",
    returnedDate: "2026-10-30",
    notes: "Previous assignment returned",
  },
  {
    id: 2,
    assetId: 3,
    employeeId: 2,
    assignedDate: "2025-03-10",
    returnedDate: "",
    notes: "Monitor for workstation",
  },
  {
    id: 3,
    assetId: 6,
    employeeId: 3,
    assignedDate: "2024-05-10",
    returnedDate: "2024-08-01",
    notes: "Asset reported missing",
  },
  {
    id: 4,
    assetId: 4,
    employeeId: 1,
    assignedDate: "2025-01-20",
    returnedDate: "2026-10-20",
    notes: "Closed because laptop was sent for repair",
  },
];

// Repair history
export const initialRepairs = [
  {
    id: 1,
    assetId: 4,
    employeeId: 1,
    reportedDate: "2026-10-20",
    note: "Keyboard keys not responding; sent to service centre",
    cost: 1800,
    completedDate: "",
  },
  {
    id: 2,
    assetId: 2,
    employeeId: null,
    reportedDate: "2025-07-12",
    note: "Battery health check and replacement",
    cost: 2800,
    completedDate: "2025-07-14",
  },
  {
    id: 3,
    assetId: 3,
    employeeId: 2,
    reportedDate: "2025-12-05",
    note: "Monitor power cable replacement",
    cost: 650,
    completedDate: "2025-12-05",
  },
];

// Empty asset form
export const emptyAsset = {
  tag: "",
  name: "",
  category: "Laptop",
  brand: "",
  model: "",
  serial: "",
  status: "Available",
  condition: "New",
  quantityTracked: false,
  quantity: 1,
  availableQuantity: 1,
  purchasePrice: "",
  maintenanceCost: "",
  purchaseDate: "",
  warrantyExpiry: "",
  vendor: "",
  employeeId: "",
  invoice: "",
  warrantyDoc: "",
  notes: "",
};

// Helpers
export const currency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const dateLabel = (value) =>
  value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export const localDateString = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

export const readSaved = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};
