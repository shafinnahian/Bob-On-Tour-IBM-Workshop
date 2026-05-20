/* ============================================
   TODO APP - JAVASCRIPT WITH LITERATE CODING
   ============================================
   
   This file contains all the JavaScript logic for our Todo application.
   We'll use "literate coding" - a style where we explain not just WHAT
   the code does, but WHY we make certain decisions and HOW things work.
   
   This is perfect for beginners who want to understand modern JavaScript
   patterns, API interactions, and best practices.
*/

/* ============================================
   SECTION 1: CONFIGURATION & CONSTANTS
   ============================================ */

/**
 * API_BASE_URL: The base URL for our backend API
 * 
 * WHY: We store this as a constant so we can easily change it if our
 * backend moves to a different server or port. This follows the DRY
 * principle (Don't Repeat Yourself).
 * 
 * NOTE: In production, you might use environment variables instead.
 */
const API_BASE_URL = 'http://localhost:5002/api';

/**
 * State object: Stores the current state of our application
 * 
 * WHY: Instead of scattering variables throughout our code, we keep
 * all application state in one place. This makes it easier to:
 * - Debug (we can inspect one object)
 * - Maintain (all state changes happen in one place)
 * - Understand (we see all data our app needs)
 */
const state = {
    todos: [],              // Array to store all todo items
    currentFilter: 'all',   // Current filter: 'all', 'active', or 'completed'
    isLoading: false        // Track if we're currently loading data
};

/* ============================================
   SECTION 2: DOM ELEMENT REFERENCES
   ============================================ */

/**
 * DOM Elements: References to HTML elements we'll interact with
 * 
 * WHY: We cache these references at the start instead of calling
 * document.getElementById() every time we need them. This is more
 * efficient because:
 * 1. DOM queries are relatively slow
 * 2. We use these elements multiple times
 * 3. The elements don't change after page load
 * 
 * HOW: We use getElementById because it's the fastest way to get
 * a single element by its ID.
 */
const elements = {
    // Input and buttons
    todoInput: document.getElementById('todoInput'),
    addBtn: document.getElementById('addBtn'),
    
    // Todo list container
    todoList: document.getElementById('todoList'),
    
    // Filter buttons
    filterButtons: document.querySelectorAll('.filter-btn'),
    
    // Stats displays
    totalCount: document.getElementById('totalCount'),
    activeCount: document.getElementById('activeCount'),
    completedCount: document.getElementById('completedCount'),
    
    // Messages and states
    loadingIndicator: document.getElementById('loadingIndicator'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    dismissError: document.getElementById('dismissError'),
    successMessage: document.getElementById('successMessage'),
    successText: document.getElementById('successText'),
    emptyState: document.getElementById('emptyState')
};

/* ============================================
   SECTION 3: UTILITY FUNCTIONS
   ============================================ */

/**
 * showLoading() - Display the loading indicator
 * hideLoading() - Hide the loading indicator
 * 
 * WHY: These functions provide a consistent way to show/hide loading states.
 * User experience is better when users know the app is working on something.
 * 
 * HOW: We toggle the 'hidden' CSS class which has 'display: none !important'
 */
function showLoading() {
    state.isLoading = true;
    elements.loadingIndicator.classList.remove('hidden');
}

function hideLoading() {
    state.isLoading = false;
    elements.loadingIndicator.classList.add('hidden');
}

/**
 * showError(message) - Display an error message to the user
 * 
 * WHY: When things go wrong (network issues, server errors), we need to
 * inform the user in a friendly way. This is better than silent failures.
 * 
 * HOW: We update the error text and remove the 'hidden' class to show it.
 * The error auto-dismisses after 5 seconds for better UX.
 * 
 * @param {string} message - The error message to display
 */
function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    
    // Auto-dismiss after 5 seconds
    // WHY: We don't want error messages to clutter the UI forever
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 5000);
}

/**
 * showSuccess(message) - Display a success message to the user
 * 
 * WHY: Positive feedback helps users know their action was successful.
 * This improves user confidence and experience.
 * 
 * @param {string} message - The success message to display
 */
function showSuccess(message) {
    elements.successText.textContent = message;
    elements.successMessage.classList.remove('hidden');
    
    // Auto-dismiss after 3 seconds
    // WHY: Success messages can disappear faster than errors
    setTimeout(() => {
        elements.successMessage.classList.add('hidden');
    }, 3000);
}

/* ============================================
   SECTION 4: API INTERACTION FUNCTIONS
   ============================================
   
   These functions handle all communication with our backend API.
   We use async/await for cleaner asynchronous code.
*/

/**
 * fetchTodos() - Retrieve all todos from the backend
 * 
 * WHY WE USE ASYNC/AWAIT:
 * - Network requests take time (they're asynchronous)
 * - async/await makes asynchronous code look synchronous
 * - It's easier to read than callbacks or raw Promises
 * - Error handling with try/catch is more intuitive
 * 
 * HOW IT WORKS:
 * 1. 'async' keyword makes this function return a Promise
 * 2. 'await' pauses execution until the Promise resolves
 * 3. We can write sequential-looking code for async operations
 * 
 * ERROR HANDLING:
 * - try/catch block catches any errors during the fetch
 * - We check response.ok to catch HTTP errors (404, 500, etc.)
 * - We show user-friendly error messages
 * - We always hide loading indicator (in finally block)
 */
async function fetchTodos() {
    try {
        // Show loading indicator while fetching
        showLoading();
        
        /**
         * fetch() - Modern API for making HTTP requests
         * 
         * WHY: fetch() is the modern standard for HTTP requests in JavaScript
         * - Built into browsers (no library needed)
         * - Returns Promises (works great with async/await)
         * - Cleaner API than older XMLHttpRequest
         */
        const response = await fetch(`${API_BASE_URL}/todos`);
        
        /**
         * Check if the response was successful
         * 
         * WHY: fetch() doesn't throw errors for HTTP error status codes
         * (like 404 or 500). We need to check response.ok manually.
         * 
         * response.ok is true for status codes 200-299
         */
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        /**
         * Parse JSON response
         * 
         * WHY: The response body is a stream of bytes. We need to parse
         * it as JSON to get a JavaScript object we can work with.
         * 
         * HOW: response.json() returns a Promise, so we await it
         */
        const data = await response.json();
        
        // Update our application state with the fetched todos
        state.todos = data;
        
        // Re-render the UI to show the new todos
        renderTodos();
        
    } catch (error) {
        /**
         * Error handling
         * 
         * WHY: Network requests can fail for many reasons:
         * - No internet connection
         * - Server is down
         * - CORS issues
         * - Invalid JSON response
         * 
         * We catch all these errors and show a user-friendly message
         */
        console.error('Error fetching todos:', error);
        showError('Failed to load todos. Please check your connection.');
    } finally {
        /**
         * finally block
         * 
         * WHY: This code runs whether the try block succeeds or fails.
         * Perfect for cleanup tasks like hiding loading indicators.
         */
        hideLoading();
    }
}

/**
 * createTodo(title) - Create a new todo item
 * 
 * HOW THIS WORKS:
 * 1. We make a POST request to the API
 * 2. We send the todo data as JSON in the request body
 * 3. The server creates the todo and returns it
 * 4. We add the new todo to our local state
 * 5. We re-render the UI
 * 
 * @param {string} title - The title of the new todo
 */
async function createTodo(title) {
    try {
        showLoading();
        
        /**
         * POST request with fetch()
         * 
         * WHY: We need to send data to the server, not just retrieve it.
         * POST is the HTTP method for creating new resources.
         * 
         * HOW: We pass a configuration object as the second parameter:
         * - method: 'POST' specifies the HTTP method
         * - headers: tells the server we're sending JSON
         * - body: the actual data, converted to JSON string
         */
        const response = await fetch(`${API_BASE_URL}/todos`, {
            method: 'POST',
            headers: {
                /**
                 * Content-Type header
                 * 
                 * WHY: The server needs to know what format our data is in.
                 * 'application/json' tells it we're sending JSON.
                 */
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title })
            /**
             * JSON.stringify()
             * 
             * WHY: JavaScript objects can't be sent over HTTP directly.
             * We convert them to a JSON string first.
             * 
             * HOW: { title } is shorthand for { title: title }
             * This is called "object property shorthand"
             */
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newTodo = await response.json();
        
        // Add the new todo to our state
        state.todos.push(newTodo);
        
        // Re-render to show the new todo
        renderTodos();
        
        // Show success message
        showSuccess('Todo created successfully!');
        
        // Clear the input field for the next todo
        elements.todoInput.value = '';
        
    } catch (error) {
        console.error('Error creating todo:', error);
        showError('Failed to create todo. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * updateTodo(id, updates) - Update an existing todo
 * 
 * WHY: We use PATCH instead of PUT because:
 * - PATCH updates only specified fields
 * - PUT typically replaces the entire resource
 * - PATCH is more efficient for partial updates
 * 
 * @param {number} id - The ID of the todo to update
 * @param {object} updates - Object containing fields to update
 */
async function updateTodo(id, updates) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const updatedTodo = await response.json();
        
        /**
         * Update the todo in our local state
         * 
         * HOW: We use findIndex() to locate the todo, then replace it.
         * 
         * WHY: We keep our local state in sync with the server.
         * This is called "optimistic updates" - we update the UI
         * immediately without waiting for the server.
         */
        const index = state.todos.findIndex(todo => todo.id === id);
        if (index !== -1) {
            state.todos[index] = updatedTodo;
        }
        
        renderTodos();
        showSuccess('Todo updated successfully!');
        
    } catch (error) {
        console.error('Error updating todo:', error);
        showError('Failed to update todo. Please try again.');
    } finally {
        hideLoading();
    }
}

/**
 * deleteTodo(id) - Delete a todo item
 * 
 * WHY: DELETE is the HTTP method for removing resources.
 * 
 * @param {number} id - The ID of the todo to delete
 */
async function deleteTodo(id) {
    try {
        showLoading();
        
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        /**
         * Remove the todo from our local state
         * 
         * HOW: filter() creates a new array excluding the deleted todo.
         * 
         * WHY: We use filter() instead of splice() because:
         * - It's more functional (doesn't mutate the original array)
         * - It's clearer what we're doing (keeping all except this one)
         */
        state.todos = state.todos.filter(todo => todo.id !== id);
        
        renderTodos();
        showSuccess('Todo deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting todo:', error);
        showError('Failed to delete todo. Please try again.');
    } finally {
        hideLoading();
    }
}

/* ============================================
   SECTION 5: UI RENDERING FUNCTIONS
   ============================================ */

/**
 * renderTodos() - Render the todo list based on current state and filter
 * 
 * WHY: We separate rendering logic from data logic. This makes our code:
 * - Easier to test
 * - Easier to modify
 * - More maintainable
 * 
 * HOW IT WORKS:
 * 1. Filter todos based on current filter
 * 2. Clear the existing list
 * 3. Create HTML for each todo
 * 4. Update statistics
 */
function renderTodos() {
    /**
     * Filter todos based on current filter setting
     * 
     * HOW: We use the filter() array method to create a new array
     * containing only todos that match our criteria.
     * 
     * WHY: This is a pure function - it doesn't modify the original
     * state.todos array, it creates a new filtered array.
     */
    let filteredTodos = state.todos;
    
    if (state.currentFilter === 'active') {
        filteredTodos = state.todos.filter(todo => !todo.completed);
    } else if (state.currentFilter === 'completed') {
        filteredTodos = state.todos.filter(todo => todo.completed);
    }
    
    /**
     * Clear the existing todo list
     * 
     * WHY: We rebuild the entire list each time. This is simpler than
     * trying to update individual items. For small lists, performance
     * is fine. For large lists, we'd use virtual DOM or other techniques.
     */
    elements.todoList.innerHTML = '';
    
    /**
     * Show empty state if no todos
     * 
     * WHY: Empty states improve UX by guiding users on what to do next.
     */
    if (filteredTodos.length === 0) {
        elements.emptyState.classList.remove('hidden');
        elements.todoList.classList.add('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        elements.todoList.classList.remove('hidden');
        
        /**
         * Create and append todo items
         * 
         * HOW: We use forEach() to iterate over each todo and create
         * its HTML representation.
         * 
         * WHY forEach() vs for loop:
         * - More readable
         * - More functional style
         * - Less error-prone (no index management)
         */
        filteredTodos.forEach(todo => {
            const todoItem = createTodoElement(todo);
            elements.todoList.appendChild(todoItem);
        });
    }
    
    // Update statistics display
    updateStats();
}

/**
 * createTodoElement(todo) - Create HTML element for a single todo
 * 
 * WHY: We separate this into its own function because:
 * - Single Responsibility Principle (one function, one job)
 * - Easier to test
 * - Easier to modify the todo item structure
 * 
 * HOW: We use template literals (backticks) to create HTML strings.
 * This is cleaner than string concatenation.
 * 
 * @param {object} todo - The todo object to render
 * @returns {HTMLElement} - The created list item element
 */
function createTodoElement(todo) {
    /**
     * Create the list item element
     * 
     * WHY createElement() vs innerHTML:
     * - createElement() is safer (no XSS vulnerabilities)
     * - We have more control over the element
     * - We can attach event listeners directly
     */
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    
    /**
     * Template literal for HTML content
     * 
     * WHY: Template literals (backticks) allow:
     * - Multi-line strings
     * - String interpolation with ${}
     * - Cleaner, more readable HTML
     * 
     * SECURITY NOTE: We use textContent for user input to prevent XSS
     */
    li.innerHTML = `
        <input 
            type="checkbox" 
            class="todo-checkbox" 
            ${todo.completed ? 'checked' : ''}
            data-id="${todo.id}"
        >
        <span class="todo-text">${escapeHtml(todo.title)}</span>
        <div class="todo-actions">
            <button class="btn-complete" data-id="${todo.id}">
                ${todo.completed ? 'Undo' : 'Complete'}
            </button>
            <button class="btn-delete" data-id="${todo.id}">
                Delete
            </button>
        </div>
    `;
    
    /**
     * Attach event listeners
     * 
     * WHY: We attach listeners to individual elements instead of using
     * onclick attributes because:
     * - Separation of concerns (HTML vs JavaScript)
     * - More flexible (can add multiple listeners)
     * - Easier to test
     */
    
    // Checkbox toggle listener
    const checkbox = li.querySelector('.todo-checkbox');
    checkbox.addEventListener('change', () => {
        handleToggleTodo(todo.id);
    });
    
    // Complete button listener
    const completeBtn = li.querySelector('.btn-complete');
    completeBtn.addEventListener('click', () => {
        handleToggleTodo(todo.id);
    });
    
    // Delete button listener
    const deleteBtn = li.querySelector('.btn-delete');
    deleteBtn.addEventListener('click', () => {
        handleDeleteTodo(todo.id);
    });
    
    return li;
}

/**
 * escapeHtml(text) - Escape HTML special characters
 * 
 * WHY: This prevents XSS (Cross-Site Scripting) attacks.
 * If a user enters "<script>alert('hack')</script>" as a todo,
 * we want to display it as text, not execute it.
 * 
 * HOW: We replace special HTML characters with their entity equivalents.
 * 
 * @param {string} text - The text to escape
 * @returns {string} - The escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * updateStats() - Update the statistics display
 * 
 * WHY: Users want to see their progress at a glance.
 * 
 * HOW: We calculate counts using filter() and update the DOM.
 */
function updateStats() {
    const total = state.todos.length;
    const active = state.todos.filter(todo => !todo.completed).length;
    const completed = state.todos.filter(todo => todo.completed).length;
    
    elements.totalCount.textContent = `Total: ${total}`;
    elements.activeCount.textContent = `Active: ${active}`;
    elements.completedCount.textContent = `Completed: ${completed}`;
}

/* ============================================
   SECTION 6: EVENT HANDLERS
   ============================================ */

/**
 * handleAddTodo() - Handle adding a new todo
 * 
 * WHY: We separate event handlers from the actual logic.
 * This makes the code more testable and maintainable.
 */
function handleAddTodo() {
    /**
     * Get and validate input
     * 
     * WHY: We trim() to remove leading/trailing whitespace.
     * Empty todos don't make sense, so we validate.
     */
    const title = elements.todoInput.value.trim();
    
    if (title === '') {
        showError('Please enter a todo title');
        return;
    }
    
    // Create the todo
    createTodo(title);
}

/**
 * handleToggleTodo(id) - Handle toggling todo completion status
 * 
 * @param {number} id - The ID of the todo to toggle
 */
function handleToggleTodo(id) {
    /**
     * Find the todo in our state
     * 
     * WHY: We need to know the current completion status to toggle it.
     */
    const todo = state.todos.find(t => t.id === id);
    
    if (todo) {
        // Toggle the completed status
        updateTodo(id, { completed: !todo.completed });
    }
}

/**
 * handleDeleteTodo(id) - Handle deleting a todo
 * 
 * WHY: We ask for confirmation before deleting to prevent accidents.
 * 
 * @param {number} id - The ID of the todo to delete
 */
function handleDeleteTodo(id) {
    /**
     * Confirm before deleting
     * 
     * WHY: Deleting is destructive and can't be undone.
     * We want to make sure the user really wants to delete.
     */
    if (confirm('Are you sure you want to delete this todo?')) {
        deleteTodo(id);
    }
}

/**
 * handleFilterChange(filter) - Handle changing the todo filter
 * 
 * @param {string} filter - The new filter ('all', 'active', or 'completed')
 */
function handleFilterChange(filter) {
    // Update the current filter in state
    state.currentFilter = filter;
    
    /**
     * Update active button styling
     * 
     * HOW: We remove 'active' class from all buttons, then add it
     * to the clicked button.
     */
    elements.filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });
    
    // Re-render with the new filter
    renderTodos();
}

/* ============================================
   SECTION 7: EVENT LISTENER SETUP
   ============================================ */

/**
 * setupEventListeners() - Attach all event listeners
 * 
 * WHY: We centralize event listener setup in one function.
 * This makes it clear what events we're listening for.
 */
function setupEventListeners() {
    /**
     * Add button click listener
     * 
     * WHY: We use addEventListener() instead of onclick because:
     * - We can add multiple listeners if needed
     * - We can remove listeners later if needed
     * - It's the modern, recommended approach
     */
    elements.addBtn.addEventListener('click', handleAddTodo);
    
    /**
     * Input field Enter key listener
     * 
     * WHY: Users expect to press Enter to submit forms.
     * This improves UX by supporting keyboard shortcuts.
     */
    elements.todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTodo();
        }
    });
    
    /**
     * Filter button listeners
     * 
     * HOW: We iterate over all filter buttons and attach listeners.
     * We use dataset.filter to get the filter value from the button.
     */
    elements.filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            handleFilterChange(btn.dataset.filter);
        });
    });
    
    /**
     * Error dismiss button listener
     * 
     * WHY: Users should be able to manually dismiss error messages.
     */
    elements.dismissError.addEventListener('click', () => {
        elements.errorMessage.classList.add('hidden');
    });
}

/* ============================================
   SECTION 8: INITIALIZATION
   ============================================ */

/**
 * init() - Initialize the application
 * 
 * WHY: We have a single initialization function that sets up everything.
 * This makes it clear what happens when the app starts.
 * 
 * HOW: This function is called when the DOM is fully loaded.
 */
async function init() {
    console.log('Initializing Todo App...');
    
    // Set up all event listeners
    setupEventListeners();
    
    // Fetch initial todos from the server
    await fetchTodos();
    
    console.log('Todo App initialized successfully!');
}

/**
 * DOMContentLoaded event
 * 
 * WHY: We wait for the DOM to be fully loaded before running our code.
 * If we try to access elements before they exist, we'll get errors.
 * 
 * HOW: DOMContentLoaded fires when the HTML is parsed and DOM is ready,
 * but before images and stylesheets finish loading. This is faster than
 * waiting for the 'load' event.
 */
document.addEventListener('DOMContentLoaded', init);

/**
 * SUMMARY OF KEY CONCEPTS:
 * 
 * 1. ASYNC/AWAIT:
 *    - Makes asynchronous code look synchronous
 *    - Easier to read and maintain than callbacks
 *    - Works with Promises under the hood
 * 
 * 2. ERROR HANDLING:
 *    - try/catch blocks catch errors
 *    - finally blocks run regardless of success/failure
 *    - We show user-friendly error messages
 * 
 * 3. API CALLS:
 *    - fetch() is the modern way to make HTTP requests
 *    - We use different HTTP methods (GET, POST, PATCH, DELETE)
 *    - We send/receive JSON data
 * 
 * 4. STATE MANAGEMENT:
 *    - We keep all app state in one object
 *    - We update state, then re-render the UI
 *    - This is a simple version of what frameworks like React do
 * 
 * 5. SEPARATION OF CONCERNS:
 *    - Data logic (API calls) is separate from UI logic (rendering)
 *    - Event handlers are separate from business logic
 *    - This makes code easier to test and maintain
 * 
 * 6. SECURITY:
 *    - We escape HTML to prevent XSS attacks
 *    - We validate user input
 *    - We use textContent instead of innerHTML for user data
 * 
 * 7. USER EXPERIENCE:
 *    - Loading indicators show progress
 *    - Error messages explain what went wrong
 *    - Success messages confirm actions
 *    - Confirmation dialogs prevent accidents
 */

// Made with Bob
