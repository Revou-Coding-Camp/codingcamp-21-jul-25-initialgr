// Ensure the DOM is fully loaded before running script
document.addEventListener('DOMContentLoaded', () => {
  // --- Global Variables and DOM Element References ---
  let allTaskLists = []; // Array to store all task list objects
  let currentModalAction = ''; // Tracks the current action of the modal (addCard, addTask, viewTask)
  let currentListIdForTask = null; // Stores the ID of the list when adding a new task
  let currentViewedTask = null; // Stores the task object currently being viewed in the modal

  // Get references to key DOM elements
  const taskCardsContainer = document.getElementById('task-cards-container'); // Container for task list cards
  const addNewCardBtn = document.getElementById('add-new-card-btn'); // Button to add new task list
  const deleteAllCardsBtn = document.getElementById('delete-all-cards-btn'); // Button to delete all task lists

  // Clock elements
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');

  // Greeting and Date elements
  const greetingText = document.getElementById('greeting-text');
  const currentDateElement = document.getElementById('current-date');

  // Modal elements
  const modalBackdrop = document.getElementById('modalBackdrop'); // The semi-transparent background overlay
  const modalContent = document.getElementById('modalContent'); // The actual modal dialog box
  const modalTitle = document.getElementById('modal-title'); // Title of the modal
  const modalTaskText = document.getElementById('modal-task-text'); // Input for task/list description
  const modalDueDate = document.getElementById('modal-due-date'); // Input for task due date
  const modalSaveBtn = document.getElementById('modal-save-btn'); // Save button in modal
  const modalCancelBtn = document.getElementById('modal-cancel-btn'); // Cancel/Close button in modal

  // Profile dropdown elements
  const profileContainer = document.getElementById('profile-img-container'); // Clickable profile image
  const dropdownMenu = document.getElementById('profile-dropdown-menu'); // The dropdown menu itself

  // Task Detail View elements (within the modal)
  const viewTaskDetails = document.getElementById('view-task-details'); // Container for task details display
  const viewTaskDescription = document.getElementById('view-task-description'); // Display for task description
  const viewTaskTime = document.getElementById('view-task-time'); // Display for task time
  const viewTaskDate = document.getElementById('view-task-date'); // Display for task date

  // --- Profile Dropdown Functionality ---
  // Toggle dropdown visibility when profile image is clicked
  profileContainer.addEventListener('click', function (e) {
    e.stopPropagation(); // Prevent click from bubbling up to document and closing dropdown immediately
    dropdownMenu.classList.toggle('is-active'); // Toggle 'is-active' class for visibility
  });

  // Close dropdown when clicking anywhere outside the dropdown
  document.addEventListener('click', function () {
    dropdownMenu.classList.remove('is-active'); // Remove 'is-active' class to hide dropdown
  });

  // Prevent dropdown from closing when clicking inside it
  dropdownMenu.addEventListener('click', function (e) {
    e.stopPropagation(); // Stop propagation to prevent document click listener from firing
  });

  // --- Clock and Greeting Update Functions ---
  // Updates the position of clock hands based on current time
  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // Calculate degrees for each hand
    const secondDegrees = seconds * 6; // 360 degrees / 60 seconds = 6 deg/sec
    const minuteDegrees = (minutes * 6) + (seconds * 0.1); // 6 deg/min + 0.1 deg/sec for smooth movement
    const hourDegrees = (hours % 12 * 30) + (minutes * 0.5); // 30 deg/hour + 0.5 deg/min for smooth movement

    // Apply rotation transforms
    secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    hourHand.style.transform = `rotate(${hourDegrees}deg)`;
  }

  // Updates the greeting message based on the time of day
  function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "Good evening,"; // Default greeting

    if (hour >= 5 && hour < 12) {
      greeting = "Good morning,";
    } else if (hour >= 12 && hour < 17) {
      greeting = "Good afternoon,";
    } else if (hour >= 17 && hour < 22) {
      greeting = "Good evening,";
    } else {
      greeting = "Good night,";
    }
    greetingText.textContent = greeting;
  }

  // Updates the current date display
  function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options); // Format date for display
    currentDateElement.textContent = formattedDate;
  }

  // Initial calls to set clock, greeting, and date
  updateClock();
  updateGreeting();
  updateDate();

  // Set intervals for continuous updates
  setInterval(updateClock, 1000); // Update clock every second
  setInterval(updateGreeting, 60 * 1000); // Update greeting every minute
  setInterval(updateDate, 60 * 1000); // Update date every minute

  // --- Task Card Rendering Functions ---
  // Renders all task list cards in the main container
  function renderAllTaskCards() {
    taskCardsContainer.innerHTML = ''; // Clear existing cards

    // Display empty state message if no task lists exist
    if (allTaskLists.length === 0) {
      const emptyStateMessage = document.createElement('p');
      emptyStateMessage.classList.add('text-gray-500', 'text-center', 'w-full', 'py-8');
      emptyStateMessage.textContent = "No task lists yet. Click the '+' button above to add one!";
      taskCardsContainer.appendChild(emptyStateMessage);
      // Hide "Delete All" button
      deleteAllCardsBtn.parentElement.classList.remove('opacity-100');
      deleteAllCardsBtn.parentElement.classList.add('opacity-0', 'pointer-events-none');
      return;
    } else {
      // Show "Delete All" button if task lists exist
      deleteAllCardsBtn.parentElement.classList.remove('opacity-0', 'pointer-events-none');
      deleteAllCardsBtn.parentElement.classList.add('opacity-100');
    }

    // Loop through each task list object and create its card
    allTaskLists.forEach(listObject => {
      const cardWrapper = document.createElement('div');
      cardWrapper.classList.add('relative', 'flex-shrink-0', 'w-80', 'mr-4', 'pt-2'); // Wrapper for card and delete button

      const cardElement = document.createElement('div');
      cardElement.classList.add('w-full', 'p-6', 'rounded-2xl', 'shadow-md', 'bg-white');

      // Populate card HTML with list title and filter buttons
      cardElement.innerHTML = `
  <div class="flex justify-between items-center mb-4">
    <h3 class="text-lg font-semibold text-gray-800">${listObject.title}</h3>
    <button class="add-task-btn text-xl text-gray-600" data-list-id="${listObject.id}">
      <i class="fas fa-plus"></i>
    </button>
  </div>
  <div class="flex space-x-2 mb-4">
    <button class="filter-btn py-1 px-2 rounded-full text-sm font-medium transition-colors duration-200 border ${listObject.currentFilter === 'all' ? 'bg-blue-500 text-white border-transparent' : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'}" data-list-id="${listObject.id}" data-filter="all">All</button>
    <button class="filter-btn py-1 px-2 rounded-full text-sm font-medium transition-colors duration-200 border ${listObject.currentFilter === 'active' ? 'bg-blue-500 text-white border-transparent' : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'}" data-list-id="${listObject.id}" data-filter="active">Active</button>
    <button class="filter-btn py-1 px-2 rounded-full text-sm font-medium transition-colors duration-200 border ${listObject.currentFilter === 'completed' ? 'bg-blue-500 text-white border-transparent' : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'}" data-list-id="${listObject.id}" data-filter="completed">Completed</button>
  </div>
  <div id="${listObject.id}-list" class="task-list">
  </div>
  `;

      cardWrapper.appendChild(cardElement);

      // Create and append the delete button for the individual card
      const deleteCardButton = document.createElement('button');
      deleteCardButton.classList.add('delete-card-btn', 'absolute', 'top-0', 'right-0', 'text-red-500', 'hover:text-red-700', 'text-xl', 'p-1');
      deleteCardButton.setAttribute('data-list-id', listObject.id);
      deleteCardButton.innerHTML = '<i class="fas fa-times-circle"></i>';
      cardWrapper.appendChild(deleteCardButton);

      taskCardsContainer.appendChild(cardWrapper);

      // Get the task list container within the newly created card and render tasks
      const taskListElement = document.getElementById(`${listObject.id}-list`);
      renderTasks(listObject.tasks, taskListElement, listObject.currentFilter);
    });
  }

  // Renders individual tasks within a specific task list container
  function renderTasks(tasks, listContainer, filter) {
    listContainer.innerHTML = ''; // Clear existing tasks

    // Filter tasks based on the current filter setting (all, active, completed)
    const filteredTasks = tasks.filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true; // 'all' filter
    });

    // Display message if no tasks match the filter
    if (filteredTasks.length === 0) {
      const noTasksMessage = document.createElement('p');
      noTasksMessage.classList.add('text-gray-400', 'text-sm', 'text-center', 'py-4');
      noTasksMessage.textContent = "No tasks to display for this filter.";
      listContainer.appendChild(noTasksMessage);
      return;
    }

    // Loop through filtered tasks and create HTML for each
    filteredTasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.classList.add('custom-checkbox', 'flex', 'items-center', 'mb-3', 'pr-2');
      taskItem.dataset.taskId = task.id; // Store task ID for easy reference
      taskItem.dataset.listId = listContainer.id.replace('-list', ''); // Store parent list ID

      // Format due date for display
      const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      const dueDateHtml = dueDateText ? `<span class="text-xs text-gray-400 ml-auto">${dueDateText}</span>` : '';

      // Populate task item HTML
      taskItem.innerHTML = `
  <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
    <label class="flex items-center flex-grow ml-3 cursor-pointer overflow-hidden min-w-0">
      <span class="task-text text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis ${task.completed ? 'text-gray-400 line-through' : ''}">${task.text}</span>
    </label>
    ${dueDateHtml}
    <button class="delete-task-btn text-red-400 hover:text-red-600 ml-2">
      <i class="fas fa-times-circle"></i>
    </button>
    `;

      listContainer.appendChild(taskItem);
    });
  }

  // --- Modal Functions ---
  // Shows the modal with different content based on 'type'
  function showModal(type, listId = null, taskId = null) {
    currentModalAction = type; // Set current modal action
    currentListIdForTask = listId; // Set list ID if applicable
    modalTaskText.value = ''; // Clear input fields
    modalDueDate.value = '';

    // Hide task details view and show input fields by default for add/edit modes
    viewTaskDetails.classList.add('hidden');
    modalTaskText.classList.remove('hidden');
    modalDueDate.classList.remove('hidden');
    modalSaveBtn.classList.remove('hidden'); // Show Save button
    modalCancelBtn.textContent = 'Cancel'; // Reset Cancel button text

    // Reset input read-only states
    modalTaskText.readOnly = false;
    modalDueDate.readOnly = false;

    if (type === 'addCard') {
      modalTitle.textContent = 'Add New Task List';
      modalTaskText.placeholder = 'List title';
      modalDueDate.classList.add('hidden'); // Hide date input for new card
    } else if (type === 'addTask') {
      modalTitle.textContent = 'Add New Task';
      modalTaskText.placeholder = 'Task description';
    } else if (type === 'viewTask') {
      modalTitle.textContent = 'Task Details';
      modalTaskText.classList.add('hidden'); // Hide text input
      modalDueDate.classList.add('hidden'); // Hide date input
      modalSaveBtn.classList.add('hidden'); // Hide Save button
      modalCancelBtn.textContent = 'Close'; // Change button text to Close

      viewTaskDetails.classList.remove('hidden'); // Show task details view

      // Find and populate task details if viewing a task
      const listObject = allTaskLists.find(list => list.id === listId);
      if (listObject) {
        currentViewedTask = listObject.tasks.find(task => task.id === taskId);
        if (currentViewedTask) {
          viewTaskDescription.textContent = currentViewedTask.text; // Set task description

          if (currentViewedTask.dueDate) {
            const dueDate = new Date(currentViewedTask.dueDate);
            viewTaskDate.textContent = dueDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            });
            viewTaskTime.textContent = dueDate.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            });
          } else {
            viewTaskDate.textContent = 'No due date';
            viewTaskTime.textContent = 'No time specified';
          }
        }
      }
    }
    modalBackdrop.classList.remove('hidden'); // Show modal backdrop
    document.body.style.overflow = 'hidden'; // Prevent body scrolling
  }

  // Hides the modal
  function hideModal() {
    modalBackdrop.classList.add('hidden'); // Hide modal backdrop
    document.body.style.overflow = 'auto'; // Allow body scrolling
    // Reset modal state variables
    currentModalAction = '';
    currentListIdForTask = null;
    currentViewedTask = null;
  }

  // Handles save action based on current modal type
  function handleModalSave() {
    if (currentModalAction === 'addCard') {
      const cardTitle = modalTaskText.value.trim();
      if (cardTitle === '') {
        displayMessage("Task list title cannot be empty.", "error");
        return;
      }
      addNewTaskCard(cardTitle);
    } else if (currentModalAction === 'addTask') {
      const taskText = modalTaskText.value.trim();
      const taskDate = modalDueDate.value;
      if (taskText === '') {
        displayMessage("Task description cannot be empty.", "error");
        return;
      }
      if (taskDate === '') {
        displayMessage("Task date cannot be empty.", "error");
        return;
      }
      addNewTask(currentListIdForTask, taskText, taskDate);
    }
    hideModal(); // Always hide modal after save
  }

  // --- Task Management Functions ---
  // Adds a new task list card
  function addNewTaskCard(cardTitle) {
    const newCardId = `list-${crypto.randomUUID().substring(0, 8)}`; // Generate unique ID
    const newCard = {
      id: newCardId,
      title: cardTitle,
      currentFilter: 'active', // Default filter for new list
      tasks: [] // Empty array for tasks
    };
    allTaskLists.push(newCard); // Add to global array
    renderAllTaskCards(); // Re-render all cards
  }

  // Adds a new task to a specific task list
  function addNewTask(listId, taskText, dueDate) {
    const listObject = allTaskLists.find(list => list.id === listId); // Find the target list
    if (listObject) {
      const newTask = {
        id: crypto.randomUUID(), // Generate unique task ID
        text: taskText,
        completed: false, // Task is initially not completed
        dueDate: dueDate
      };
      listObject.tasks.push(newTask); // Add task to the list
      renderTasks(listObject.tasks, document.getElementById(`${listId}-list`), listObject.currentFilter); // Re-render tasks for that list
    }
  }

  // Toggles the completion status of a task
  function toggleTaskCompletion(taskId, listId) {
    const listObject = allTaskLists.find(list => list.id === listId);
    if (listObject) {
      const taskIndex = listObject.tasks.findIndex(task => task.id === taskId);
      if (taskIndex > -1) {
        listObject.tasks[taskIndex].completed = !listObject.tasks[taskIndex].completed; // Toggle boolean
        renderTasks(listObject.tasks, document.getElementById(`${listId}-list`), listObject.currentFilter); // Re-render tasks
      }
    }
  }

  // Deletes a specific task from a list
  function deleteTask(taskId, listId) {
    const listObject = allTaskLists.find(list => list.id === listId);
    if (listObject) {
      listObject.tasks = listObject.tasks.filter(task => task.id !== taskId); // Filter out the deleted task
      renderTasks(listObject.tasks, document.getElementById(`${listId}-list`), listObject.currentFilter); // Re-render tasks
    }
  }

  // Deletes an entire task list card
  function deleteTaskList(listId) {
    allTaskLists = allTaskLists.filter(list => list.id !== listId); // Filter out the deleted list
    renderAllTaskCards(); // Re-render all cards
    displayMessage("Task list deleted successfully!", "success"); // Show success message
  }

  // Deletes all task lists
  function deleteAllCards() {
    allTaskLists = []; // Clear the array
    renderAllTaskCards(); // Re-render to show empty state
    displayMessage("All task lists deleted!", "success"); // Show success message
  }

  // --- Utility Function for Messages ---
  // Displays a temporary, auto-dismissing message
  function displayMessage(message, type = "info") {
    const messageBox = document.createElement('div');
    messageBox.classList.add('fixed', 'top-4', 'left-1/2', '-translate-x-1/2', 'p-3', 'rounded-lg', 'shadow-lg', 'text-white', 'z-50', 'transition-all', 'duration-300', 'transform', 'scale-0');

    // Apply color based on message type
    if (type === "error") {
      messageBox.classList.add('bg-red-500');
    } else if (type === "success") {
      messageBox.classList.add('bg-green-500');
    } else {
      messageBox.classList.add('bg-blue-500');
    }
    messageBox.textContent = message;
    document.body.appendChild(messageBox);

    // Animate message in
    setTimeout(() => {
      messageBox.classList.remove('scale-0');
      messageBox.classList.add('scale-100');
    }, 10);

    // Animate message out and remove after a delay
    setTimeout(() => {
      messageBox.classList.remove('scale-100');
      messageBox.classList.add('scale-0');
      messageBox.addEventListener('transitionend', () => messageBox.remove());
    }, 3000);
  }

  // --- Initial Setup and Event Listeners ---
  renderAllTaskCards(); // Initial render of task cards on page load

  // Event listeners for main buttons
  addNewCardBtn.addEventListener('click', () => showModal('addCard')); // Show modal to add new list
  deleteAllCardsBtn.addEventListener('click', deleteAllCards); // Delete all lists
  modalSaveBtn.addEventListener('click', handleModalSave); // Handle save/add in modal
  modalCancelBtn.addEventListener('click', hideModal); // Hide modal

  // Close modal when clicking outside the modal content
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      hideModal();
    }
  });

  // Close modal when Escape key is pressed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalBackdrop.classList.contains('hidden')) {
      hideModal();
    }
  });

  // Event delegation for clicks within the task cards container
  taskCardsContainer.addEventListener('click', (event) => {
    // Add Task button click
    if (event.target.closest('.add-task-btn')) {
      const listId = event.target.closest('.add-task-btn').dataset.listId;
      showModal('addTask', listId);
    }
    // Delete Task button click
    else if (event.target.closest('.delete-task-btn')) {
      const taskItem = event.target.closest('.custom-checkbox');
      const taskId = taskItem.dataset.taskId;
      const listId = taskItem.closest('.task-list').id.replace('-list', '');
      deleteTask(taskId, listId);
    }
    // Delete Task Card button click
    else if (event.target.closest('.delete-card-btn')) {
      const listId = event.target.closest('.delete-card-btn').dataset.listId;
      deleteTaskList(listId);
    }
    // Filter button click within a card
    else if (event.target.classList.contains('filter-btn')) {
      const listId = event.target.dataset.listId;
      const filter = event.target.dataset.filter;
      const listObject = allTaskLists.find(list => list.id === listId);
      if (listObject) {
        listObject.currentFilter = filter; // Update filter
        renderAllTaskCards(); // Re-render all cards to update filter buttons and tasks
      }
    }
    // View Task Details click (anywhere on task item except checkbox or delete button)
    else if (event.target.closest('.custom-checkbox') && !event.target.classList.contains('task-checkbox') && !event.target.closest('.delete-task-btn')) {
      const taskItem = event.target.closest('.custom-checkbox');
      const taskId = taskItem.dataset.taskId;
      const listId = taskItem.dataset.listId;
      showModal('viewTask', listId, taskId);
    }
  });

  // Event delegation for checkbox changes within the task cards container
  taskCardsContainer.addEventListener('change', (event) => {
    if (event.target.classList.contains('task-checkbox')) {
      const taskItem = event.target.closest('.custom-checkbox');
      const taskId = taskItem.dataset.taskId;
      const listId = taskItem.closest('.task-list').id.replace('-list', '');
      toggleTaskCompletion(taskId, listId); // Toggle completion status
    }
  });
});
