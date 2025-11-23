"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// --- 1. Get DOM Elements ---
// Use non-null assertion (!) since we know these elements exist in index.html
const itemInput = document.getElementById('itemInput');
const addButton = document.getElementById('addButton');
const deleteButton = document.getElementById('deleteButton');
const listBox = document.getElementById('listBox');
// --- 2. Add Item Logic ---
const addItem = () => {
    const newItemText = itemInput.value.trim();
    if (newItemText) {
        // Create a new <option> element
        const newOption = document.createElement('option');
        newOption.textContent = newItemText;
        newOption.value = newItemText; // Optional: set value to text
        // Append the new option to the listbox
        listBox.appendChild(newOption);
        // Clear the input field
        itemInput.value = '';
        itemInput.focus();
    }
};
// --- 3. Delete Item Logic ---
const deleteItem = () => {
    // Get the index of the currently selected option
    const selectedIndex = listBox.selectedIndex;
    // selectedIndex is -1 if nothing is selected
    if (selectedIndex !== -1) {
        // Remove the option at the selected index
        listBox.remove(selectedIndex);
    }
};
// --- 4. Double-Click Handler ---
const handleDoubleClick = (event) => {
    const target = event.target;
    // Ensure the double-click was on an <option> item
    if (target.tagName === 'OPTION') {
        const selectedItem = target.textContent;
        console.log(`Double-clicked item: ${selectedItem}`);
        // !!! IMPORTANT SECURITY NOTE !!!
        // A web browser CANNOT execute a local Windows program directly.
        // For demonstration, we'll log the action to the console.
        // If this were a file path, a real desktop app would need to handle this.
        // E.g., window.open(selectedItem, '_blank'); for a web URL.
        console.log('Action: Simulating opening item with default program (logged to console)');
    }
};
// --- 5. Attach Event Listeners ---
addButton.addEventListener('click', addItem);
deleteButton.addEventListener('click', deleteItem);
listBox.addEventListener('dblclick', handleDoubleClick);
// Optional: Allow 'Enter' key in the textbox to trigger 'Add'
itemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItem();
    }
});
//# sourceMappingURL=app.js.map