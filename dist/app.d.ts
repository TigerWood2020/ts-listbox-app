interface ListItem {
    name: string;
    price: number;
}
declare const items: ListItem[];
declare const itemInput: HTMLInputElement;
declare const priceInput: HTMLInputElement;
declare const addButton: HTMLButtonElement;
declare const deleteButton: HTMLButtonElement;
declare const editButton: HTMLButtonElement;
declare const sortButton: HTMLButtonElement;
declare const saveButton: HTMLButtonElement;
declare const loadButton: HTMLButtonElement;
declare const fileInput: HTMLInputElement;
declare const listBox: HTMLSelectElement;
declare const totalItemsCount: HTMLSpanElement;
declare const taxInput: HTMLInputElement;
declare const filterInput: HTMLInputElement;
declare const totalPriceSum: HTMLSpanElement;
declare const totalPriceWithTax: HTMLSpanElement;
declare const updateTotals: () => void;
declare const renderList: (filterText?: string) => void;
declare let editingIndex: number | null;
declare const editSelectedItem: () => void;
declare const addItem: () => void;
declare const sortListbox: () => void;
declare const deleteItem: () => void;
declare const processFileContent: (text: string) => void;
declare const handleFileSelect: (event: Event) => void;
declare const triggerFileInput: () => void;
declare const saveItemsToFile: () => void;
declare const handleDoubleClick: (event: MouseEvent) => void;
//# sourceMappingURL=app.d.ts.map