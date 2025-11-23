// --- 1. Define Data Structure and Get DOM Elements ---
interface ListItem {
    name: string;
    price: number;
}

// Data store for all items (Name + Price)
const items: ListItem[] = [];

// Get DOM Elements
const itemInput = document.getElementById('itemInput') as HTMLInputElement;
const priceInput = document.getElementById('priceInput') as HTMLInputElement;
const addButton = document.getElementById('addButton') as HTMLButtonElement;
const deleteButton = document.getElementById('deleteButton') as HTMLButtonElement;
const editButton = document.getElementById('editButton') as HTMLButtonElement; // NEW
const sortButton = document.getElementById('sortButton') as HTMLButtonElement; // NEW
const saveButton = document.getElementById('saveButton') as HTMLButtonElement; // NEW
const loadButton = document.getElementById('loadButton') as HTMLButtonElement; // NEW
const fileInput = document.getElementById('fileInput') as HTMLInputElement;    // NEW
const listBox = document.getElementById('listBox') as HTMLSelectElement;
const totalItemsCount = document.getElementById('totalItemsCount') as HTMLSpanElement; // NEW
const taxInput = document.getElementById('taxInput') as HTMLInputElement; // NEW
const filterInput = document.getElementById('filterInput') as HTMLInputElement; // NEW
const totalPriceSum = document.getElementById('totalPriceSum') as HTMLSpanElement;     
const totalPriceWithTax = document.getElementById('totalPriceWithTax') as HTMLSpanElement; // NEW

// --- 2. Calculation and UI Update Function (Modified) ---
const updateTotals = () => {
    // a. Calculate Total Sum (Pre-Tax)
    const sumPreTax = items.reduce((acc, item) => acc + item.price, 0);
    
    // b. Get Tax Rate
    // Read the tax percentage input (default to 0 if invalid)
    const taxPercentage = parseFloat(taxInput.value) || 0;
    
    // c. Calculate Total With Tax
    const taxMultiplier = 1 + (taxPercentage / 100);
    const sumWithTax = sumPreTax * taxMultiplier;

    // d. Update UI Spans
    totalItemsCount.textContent = items.length.toString();
    totalPriceSum.textContent = `$${sumPreTax.toFixed(2)}`;
    totalPriceWithTax.textContent = `$${sumWithTax.toFixed(2)}`; // NEW DISPLAY
};

// --- 3. Render Listbox Function (Modified) ---
// Now accepts an optional filter string
const renderList = (filterText: string = '') => {
    // 1. Determine which items to display
    const lowerCaseFilter = filterText.toLowerCase().trim();
    
    // Filter the global 'items' array
    const filteredItems = items.filter(item => {
        if (!lowerCaseFilter) {
            // If the filter is empty, include all items
            return true;
        }
        // Check if the item's name includes the filter text
        return item.name.toLowerCase().includes(lowerCaseFilter);
    });

    // 2. Clear the existing options
    listBox.innerHTML = ''; 
    
    // 3. Re-add options based on the filtered array
    filteredItems.forEach((item, index) => {
        const newOption = document.createElement('option');
        // Note: The index stored in the value must still refer to the index
        // in the global 'items' array, not the filtered array.
        const globalIndex = items.findIndex(i => i === item); 
        
        newOption.textContent = `${item.name} ($${item.price.toFixed(2)})`;
        newOption.value = globalIndex.toString(); 
        listBox.appendChild(newOption);
    });

    updateTotals();
};

// Define a variable to track the index of the item currently being edited
let editingIndex: number | null = null; 

const editSelectedItem = () => {
    const selectedOption = listBox.options[listBox.selectedIndex];
    
    if (selectedOption) {
        const indexToEdit = parseInt(selectedOption.value);
        const itemToEdit = items[indexToEdit];
        
        if (itemToEdit) {
            // 1. Load data into inputs
            itemInput.value = itemToEdit.name;
            priceInput.value = itemToEdit.price.toString();
            
            // 2. Set the index tracker
            editingIndex = indexToEdit;
            
            // 3. Change button text and color
            addButton.textContent = "Update Item";
            addButton.style.backgroundColor = "#ffc107"; // Yellow for update
            addButton.style.borderColor = "#ffc107";
            
            itemInput.focus();
        }
    } else {
        alert("Please select an item to edit.");
    }
};

// --- 4 MODIFIED addItem function to handle both Add and Update ---
const addItem = () => {
    const newItemName = itemInput.value.trim();
    const newPrice = parseFloat(priceInput.value);

    // Validate inputs
    if (!(newItemName && !isNaN(newPrice) && newPrice >= 0)) {
        alert("Please enter a valid item name and a non-negative price.");
        return;
    }
    
    // Logic for UPDATING an existing item
    if (editingIndex !== null) {
        items[editingIndex] = { name: newItemName, price: newPrice };
        
        // Reset the state back to 'Add' mode
        editingIndex = null;
        addButton.textContent = "Add Item";
        addButton.style.backgroundColor = "#28a745"; // Green
        addButton.style.borderColor = "#28a745";
        
    } else {
        // Logic for ADDING a new item
        items.push({ name: newItemName, price: newPrice });
    }
    
    // Re-render the list and update totals
    renderList(filterInput.value);
    
    // Clear input fields
    itemInput.value = '';
    priceInput.value = '';
    itemInput.focus();
};

const sortListbox = () => {
    items.sort((a, b) => a.name.localeCompare(b.name));
    
    renderList(filterInput.value);
    console.log("Listbox sorted alphabetically by name.");
};

// --- 5. Delete Item Logic ---
const deleteItem = () => {
    // Get the value of the selected option, which holds the index in the 'items' array
    const selectedOption = listBox.options[listBox.selectedIndex];
    
    if (selectedOption) {
        const indexToDelete = parseInt(selectedOption.value);
        
        // Remove the item from the data array using its index
        items.splice(indexToDelete, 1);
        
        // Re-render the list (which automatically updates the totals)
        renderList(filterInput.value);
    }
};

// --- 6. Load Items Logic (NEW) ---

// Function to handle the file content once it's read
const processFileContent = (text: string) => {
    // Clear the existing items before loading new ones
    items.length = 0; 

    const lines = text.split('\n');
    
    // Skip the first line (the "Item Name,Price" header)
    for (let i = 1; i < lines.length; i++) {
        // *** FIX 1: Check if the line exists before trimming ***
        const currentLine = lines[i]; 
        if (!currentLine) continue; // Skip if the line itself is undefined/null

        const line = currentLine.trim();
        if (!line) continue; // Skip empty lines

        // Split the line by the comma delimiter
        const parts = line.split(',');
        
        if (parts.length === 2) {
            
            // *** FIX 2 & 3: Ensure array elements exist before using them ***
            const partName = parts[0];
            const partPrice = parts[1];
            
            // This ensures partName and partPrice are not undefined
            if (!partName || !partPrice) continue;

            const name = partName.trim();
            const price = parseFloat(partPrice.trim());

            // Validate the data before adding
            if (name && !isNaN(price)) {
                items.push({ name: name, price: price });
            }
        }
    }
    
    // Re-render the list and update totals with the new data
    renderList();
    console.log(`Loaded ${items.length} items from file.`);
};


// Function triggered when the user selects a file
const handleFileSelect = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    
    // This check ensures 'files' exists and has at least one element.
    if (files && files.length > 0) {
        const file = files[0];
        
        // *** FIX 4: Check if 'file' is actually defined before proceeding ***
        if (file) {
            const reader = new FileReader();

            reader.onload = (e) => {
                const content = e.target?.result as string;
                if (content) {
                    processFileContent(content);
                }
            };

            // Read the file as text. TypeScript now knows 'file' is not undefined.
            reader.readAsText(file);
        }
    }
};

// Function to trigger the hidden file input click
const triggerFileInput = () => {
    fileInput.click();
};

// --- 7. Save Items Logic (NEW) ---
const saveItemsToFile = () => {
    if (items.length === 0) {
        alert("The list is empty. Nothing to save.");
        return;
    }

    // 1. Compile Data into a Text String
    // Create a header row for the file
    let fileContent = "Item Name,Price\n";
    
    // Iterate through the data array and format each item
    items.forEach(item => {
        // Format: "Hat,15.99"
        fileContent += `${item.name},${item.price.toFixed(2)}\n`;
    });

    // 2. Create a Blob (Binary Large Object)
    // The Blob represents the file data to be downloaded.
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });

    // 3. Create a Download Link and Trigger Click
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'listbox_items.txt'; // Set the default filename for the download

    // Simulate a click on the link to trigger the download
    document.body.appendChild(a);
    a.click();

    // Clean up the temporary URL object and link element
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`Successfully prepared ${items.length} items for download.`);
};

// --- 8. Double-Click Handler (Updated) ---
const handleDoubleClick = (event: MouseEvent) => {
    const target = event.target as HTMLOptionElement;
    
    if (target.tagName === 'OPTION') {
        // Get the index from the listbox option's value
        const selectedIndexInArray = parseInt(target.value);
        
        // Lookup the item object in the data array
        const selectedItem = items[selectedIndexInArray];

        // *** FIX: Add a check here to ensure selectedItem is not undefined ***
        if (selectedItem) {
            console.log(`Double-clicked Item: ${selectedItem.name}`);
            console.log(`Simulating opening item with price: $${selectedItem.price.toFixed(2)}`);
        } else {
            // Optional: log an error if the data lookup failed
            console.error("Error: Could not find item data for the selected option.");
        }
        // *******************************************************************
    }
};

// --- 9. Attach Event Listeners ---
addButton.addEventListener('click', addItem);
deleteButton.addEventListener('click', deleteItem);
editButton.addEventListener('click', editSelectedItem); // NEW
sortButton.addEventListener('click', sortListbox);      // NEW
saveButton.addEventListener('click', saveItemsToFile);  // NEW LISTENER
loadButton.addEventListener('click', triggerFileInput); // NEW: Button triggers the hidden input
fileInput.addEventListener('change', handleFileSelect); // NEW: Input handles the file reading
listBox.addEventListener('dblclick', handleDoubleClick);
// NEW: Call renderList whenever the filter input changes
filterInput.addEventListener('input', (e) => {
    const filterValue = (e.target as HTMLInputElement).value;
    renderList(filterValue);
});

// New: Any change to the tax percentage should recalculate totals immediately
taxInput.addEventListener('input', updateTotals);

// Allow 'Enter' key in price field to trigger 'Add'
priceInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItem();
    }
});