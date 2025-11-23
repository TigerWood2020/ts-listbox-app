"use strict";
// Data store for all items (Name + Price)
var items = [];
// Get DOM Elements
var itemInput = document.getElementById('itemInput');
var priceInput = document.getElementById('priceInput');
var addButton = document.getElementById('addButton');
var deleteButton = document.getElementById('deleteButton');
var editButton = document.getElementById('editButton'); // NEW
var sortButton = document.getElementById('sortButton'); // NEW
var saveButton = document.getElementById('saveButton'); // NEW
var loadButton = document.getElementById('loadButton'); // NEW
var fileInput = document.getElementById('fileInput'); // NEW
var listBox = document.getElementById('listBox');
var totalItemsCount = document.getElementById('totalItemsCount'); // NEW
var taxInput = document.getElementById('taxInput'); // NEW
var filterInput = document.getElementById('filterInput'); // NEW
var totalPriceSum = document.getElementById('totalPriceSum');
var totalPriceWithTax = document.getElementById('totalPriceWithTax'); // NEW
// --- 2. Calculation and UI Update Function (Modified) ---
var updateTotals = function () {
    // a. Calculate Total Sum (Pre-Tax)
    var sumPreTax = items.reduce(function (acc, item) { return acc + item.price; }, 0);
    // b. Get Tax Rate
    // Read the tax percentage input (default to 0 if invalid)
    var taxPercentage = parseFloat(taxInput.value) || 0;
    // c. Calculate Total With Tax
    var taxMultiplier = 1 + (taxPercentage / 100);
    var sumWithTax = sumPreTax * taxMultiplier;
    // d. Update UI Spans
    totalItemsCount.textContent = items.length.toString();
    totalPriceSum.textContent = "$".concat(sumPreTax.toFixed(2));
    totalPriceWithTax.textContent = "$".concat(sumWithTax.toFixed(2)); // NEW DISPLAY
};
// --- 3. Render Listbox Function (Modified) ---
// Now accepts an optional filter string
var renderList = function (filterText) {
    if (filterText === void 0) { filterText = ''; }
    // 1. Determine which items to display
    var lowerCaseFilter = filterText.toLowerCase().trim();
    // Filter the global 'items' array
    var filteredItems = items.filter(function (item) {
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
    filteredItems.forEach(function (item, index) {
        var newOption = document.createElement('option');
        // Note: The index stored in the value must still refer to the index
        // in the global 'items' array, not the filtered array.
        var globalIndex = items.findIndex(function (i) { return i === item; });
        newOption.textContent = "".concat(item.name, " ($").concat(item.price.toFixed(2), ")");
        newOption.value = globalIndex.toString();
        listBox.appendChild(newOption);
    });
    updateTotals();
};
// Define a variable to track the index of the item currently being edited
var editingIndex = null;
var editSelectedItem = function () {
    var selectedOption = listBox.options[listBox.selectedIndex];
    if (selectedOption) {
        var indexToEdit = parseInt(selectedOption.value);
        var itemToEdit = items[indexToEdit];
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
    }
    else {
        alert("Please select an item to edit.");
    }
};
// --- 4 MODIFIED addItem function to handle both Add and Update ---
var addItem = function () {
    var newItemName = itemInput.value.trim();
    var newPrice = parseFloat(priceInput.value);
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
    }
    else {
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
var sortListbox = function () {
    items.sort(function (a, b) { return a.name.localeCompare(b.name); });
    renderList(filterInput.value);
    console.log("Listbox sorted alphabetically by name.");
};
// --- 5. Delete Item Logic ---
var deleteItem = function () {
    // Get the value of the selected option, which holds the index in the 'items' array
    var selectedOption = listBox.options[listBox.selectedIndex];
    if (selectedOption) {
        var indexToDelete = parseInt(selectedOption.value);
        // Remove the item from the data array using its index
        items.splice(indexToDelete, 1);
        // Re-render the list (which automatically updates the totals)
        renderList(filterInput.value);
    }
};
// --- 6. Load Items Logic (NEW) ---
// Function to handle the file content once it's read
var processFileContent = function (text) {
    // Clear the existing items before loading new ones
    items.length = 0;
    var lines = text.split('\n');
    // Skip the first line (the "Item Name,Price" header)
    for (var i = 1; i < lines.length; i++) {
        // *** FIX 1: Check if the line exists before trimming ***
        var currentLine = lines[i];
        if (!currentLine)
            continue; // Skip if the line itself is undefined/null
        var line = currentLine.trim();
        if (!line)
            continue; // Skip empty lines
        // Split the line by the comma delimiter
        var parts = line.split(',');
        if (parts.length === 2) {
            // *** FIX 2 & 3: Ensure array elements exist before using them ***
            var partName = parts[0];
            var partPrice = parts[1];
            // This ensures partName and partPrice are not undefined
            if (!partName || !partPrice)
                continue;
            var name_1 = partName.trim();
            var price = parseFloat(partPrice.trim());
            // Validate the data before adding
            if (name_1 && !isNaN(price)) {
                items.push({ name: name_1, price: price });
            }
        }
    }
    // Re-render the list and update totals with the new data
    renderList();
    console.log("Loaded ".concat(items.length, " items from file."));
};
// Function triggered when the user selects a file
var handleFileSelect = function (event) {
    var files = event.target.files;
    // This check ensures 'files' exists and has at least one element.
    if (files && files.length > 0) {
        var file = files[0];
        // *** FIX 4: Check if 'file' is actually defined before proceeding ***
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var _a;
                var content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
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
var triggerFileInput = function () {
    fileInput.click();
};
// --- 7. Save Items Logic (NEW) ---
var saveItemsToFile = function () {
    if (items.length === 0) {
        alert("The list is empty. Nothing to save.");
        return;
    }
    // 1. Compile Data into a Text String
    // Create a header row for the file
    var fileContent = "Item Name,Price\n";
    // Iterate through the data array and format each item
    items.forEach(function (item) {
        // Format: "Hat,15.99"
        fileContent += "".concat(item.name, ",").concat(item.price.toFixed(2), "\n");
    });
    // 2. Create a Blob (Binary Large Object)
    // The Blob represents the file data to be downloaded.
    var blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    // 3. Create a Download Link and Trigger Click
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'listbox_items.txt'; // Set the default filename for the download
    // Simulate a click on the link to trigger the download
    document.body.appendChild(a);
    a.click();
    // Clean up the temporary URL object and link element
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Successfully prepared ".concat(items.length, " items for download."));
};
// --- 8. Double-Click Handler (Updated) ---
var handleDoubleClick = function (event) {
    var target = event.target;
    if (target.tagName === 'OPTION') {
        // Get the index from the listbox option's value
        var selectedIndexInArray = parseInt(target.value);
        // Lookup the item object in the data array
        var selectedItem = items[selectedIndexInArray];
        // *** FIX: Add a check here to ensure selectedItem is not undefined ***
        if (selectedItem) {
            console.log("Double-clicked Item: ".concat(selectedItem.name));
            console.log("Simulating opening item with price: $".concat(selectedItem.price.toFixed(2)));
        }
        else {
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
sortButton.addEventListener('click', sortListbox); // NEW
saveButton.addEventListener('click', saveItemsToFile); // NEW LISTENER
loadButton.addEventListener('click', triggerFileInput); // NEW: Button triggers the hidden input
fileInput.addEventListener('change', handleFileSelect); // NEW: Input handles the file reading
listBox.addEventListener('dblclick', handleDoubleClick);
// NEW: Call renderList whenever the filter input changes
filterInput.addEventListener('input', function (e) {
    var filterValue = e.target.value;
    renderList(filterValue);
});
// New: Any change to the tax percentage should recalculate totals immediately
taxInput.addEventListener('input', updateTotals);
// Allow 'Enter' key in price field to trigger 'Add'
priceInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        addItem();
    }
});
//# sourceMappingURL=app.js.map