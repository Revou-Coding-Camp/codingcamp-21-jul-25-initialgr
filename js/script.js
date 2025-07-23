document.addEventListener('DOMContentLoaded', () => {
  let allTaskLists = [];
  const taskCardsContainer = document.getElementById('task-cards-container');
  const addNewCardBtn = document.getElementById('add-new-card-btn');
  const deleteAllCardsBtn = document.getElementById('delete-all-cards-btn');
  const hourHand = document.getElementById('hour-hand');
  const minuteHand = document.getElementById('minute-hand');
  const secondHand = document.getElementById('second-hand');
  const greetingText = document.getElementById('greeting-text');
  const currentDateElement = document.getElementById('current-date');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalContent = document.getElementById('modalContent');
  const modalTitle = document.getElementById('modal-title');
  const modalTaskText = document.getElementById('modal-task-text'); // Input field
  const modalDueDate = document.getElementById('modal-due-date');     // Input field
  const modalSaveBtn = document.getElementById('modal-save-btn');
  const modalCancelBtn = document.getElementById('modal-cancel-btn');
  const profileContainer = document.getElementById('profile-img-container');
  const dropdownMenu = document.getElementById('profile-dropdown-menu');

  // Toggle dropdown when profile image is clicked
  profileContainer.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdownMenu.classList.toggle('is-active');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', function () {
    dropdownMenu.classList.remove('is-active');
  });

  // Prevent dropdown from closing when clicking inside it
  dropdownMenu.addEventListener('click', function (e) {
    e.stopPropagation();
  });

  // View Task Detail elements
  const viewTaskDetails = document.getElementById('view-task-details');
  // const viewTaskTitle = document.getElementById('view-task-title');
  const viewTaskDescription = document.getElementById('view-task-description');
  // const viewTaskLocation = document.getElementById('view-task-location');
  const viewTaskTime = document.getElementById('view-task-time');
  const viewTaskDate = document.getElementById('view-task-date');

  let currentModalAction = '';
  let currentListIdForTask = null;
  let currentViewedTask = null; // To store the task being viewed

  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const secondDegrees = seconds * 6;
    const minuteDegrees = (minutes * 6) + (seconds * 0.1);
    const hourDegrees = (hours % 12 * 30) + (minutes * 0.5);

    secondHand.style.transform = `rotate(${secondDegrees}deg)`;
    minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
    hourHand.style.transform = `rotate(${hourDegrees}deg)`;
  }

  function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = "Good evening,";

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

  function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('en-US', options);
    currentDateElement.textContent = formattedDate;
  }

  updateClock();
  updateGreeting();
  updateDate();

  setInterval(updateClock, 1000);
  setInterval(updateGreeting, 60 * 1000);
  setInterval(updateDate, 60 * 1000);

  function renderAllTaskCards() {
    taskCardsContainer.innerHTML = '';

    if (allTaskLists.length === 0) {
      const emptyStateMessage = document.createElement('p');
      emptyStateMessage.classList.add('text-gray-500', 'text-center', 'w-full', 'py-8');
      emptyStateMessage.textContent = "No task lists yet. Click the '+' button above to add one!";
      taskCardsContainer.appendChild(emptyStateMessage);
      deleteAllCardsBtn.parentElement.classList.remove('opacity-100');
      deleteAllCardsBtn.parentElement.classList.add('opacity-0', 'pointer-events-none');
      return;
    } else {
      deleteAllCardsBtn.parentElement.classList.remove('opacity-0', 'pointer-events-none');
      deleteAllCardsBtn.parentElement.classList.add('opacity-100');
    }

    allTaskLists.forEach(listObject => {
      const cardWrapper = document.createElement('div');
      cardWrapper.classList.add('relative', 'flex-shrink-0', 'w-80', 'mr-4', 'pt-2');

      const cardElement = document.createElement('div');
      cardElement.classList.add('w-full', 'p-6', 'rounded-2xl', 'shadow-md', 'bg-white');

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
              <!-- Tasks will be dynamically inserted here -->
            </div>
          `;

      cardWrapper.appendChild(cardElement);
      taskCardsContainer.appendChild(cardWrapper);

      const taskListElement = document.getElementById(`${listObject.id}-list`);
      renderTasks(listObject.tasks, taskListElement, listObject.currentFilter);
    });
  }

  function renderTasks(tasks, listContainer, filter) {
    listContainer.innerHTML = '';

    const filteredTasks = tasks.filter(task => {
      if (filter === 'active') return !task.completed;
      if (filter === 'completed') return task.completed;
      return true;
    });

    if (filteredTasks.length === 0) {
      const noTasksMessage = document.createElement('p');
      noTasksMessage.classList.add('text-gray-400', 'text-sm', 'text-center', 'py-4');
      noTasksMessage.textContent = "No tasks to display for this filter.";
      listContainer.appendChild(noTasksMessage);
      return;
    }

    filteredTasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.classList.add('custom-checkbox', 'flex', 'items-center', 'mb-3', 'pr-2');
      taskItem.dataset.taskId = task.id;
      taskItem.dataset.listId = listContainer.id.replace('-list', ''); // Store listId on taskItem

      const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
      const dueDateHtml = dueDateText ? `<span class="text-xs text-gray-400 ml-auto">${dueDateText}</span>` : '';

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

  function showModal(type, listId = null, taskId = null) {
    currentModalAction = type;
    currentListIdForTask = listId;
    modalTaskText.value = '';
    modalDueDate.value = '';

    // Hide view-task-details and show input fields by default
    viewTaskDetails.classList.add('hidden');
    modalTaskText.classList.remove('hidden');
    modalDueDate.classList.remove('hidden');
    modalSaveBtn.classList.remove('hidden'); // Show Save button by default
    modalCancelBtn.textContent = 'Cancel'; // Reset Cancel button text

    // Reset input states for add/edit
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
      modalTaskText.classList.add('hidden');
      modalDueDate.classList.add('hidden');
      modalSaveBtn.classList.add('hidden');
      modalCancelBtn.textContent = 'Close';

      viewTaskDetails.classList.remove('hidden');

      const listObject = allTaskLists.find(list => list.id === listId);
      if (listObject) {
        currentViewedTask = listObject.tasks.find(task => task.id === taskId);
        if (currentViewedTask) {
          // viewTaskTitle.textContent = currentViewedTask.text;
          viewTaskDescription.textContent = currentViewedTask.text;

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
    modalBackdrop.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function hideModal() {
    modalBackdrop.classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentModalAction = '';
    currentListIdForTask = null;
    currentViewedTask = null; // Clear viewed task
  }

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
      addNewTask(currentListIdForTask, taskText, taskDate);
    }
    hideModal();
  }

  function addNewTaskCard(cardTitle) {
    const newCardId = `list-${crypto.randomUUID().substring(0, 8)}`;
    const newCard = {
      id: newCardId,
      title: cardTitle,
      currentFilter: 'active',
      tasks: []
    };
    allTaskLists.push(newCard);
    renderAllTaskCards();
  }

  function addNewTask(listId, taskText, dueDate) {
    const listObject = allTaskLists.find(list => list.id === listId);
    if (listObject) {
      const newTask = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false,
        dueDate: dueDate
      };
      listObject.tasks.push(newTask);
      renderTasks(listObject.tasks, document.getElementById(`${listId}-list`), listObject.currentFilter);
    }
  }

  function toggleTaskCompletion(taskId, listId) {
    const listObject = allTaskLists.find(list => list.id === listId);
    if (listObject) {
      const taskIndex = listObject.tasks.findIndex(task => task.id === taskId);
      if (taskIndex > -1) {
        listObject.tasks[taskIndex].completed = !listObject.tasks[taskIndex].completed;
        renderTasks(listObject.tasks, document.getElementById(`${listId}-list`), listObject.currentFilter);
      }
    }
  }

  function deleteTask(taskId, listId) {
    const listObject = allTaskLists.find(list => list.id === listId);
    if (listObject) {
      listObject.tasks = listObject.tasks.filter(task => task.id !== taskId);
      renderTasks(listObject.tasks, document.getElementById(`${listId}-list`), listObject.currentFilter);
    }
  }

  function deleteAllCards() {
    allTaskLists = [];
    renderAllTaskCards();
  }

  function displayMessage(message, type = "info") {
    const messageBox = document.createElement('div');
    messageBox.classList.add('fixed', 'bottom-4', 'left-1/2', '-translate-x-1/2', 'p-3', 'rounded-lg', 'shadow-lg', 'text-white', 'z-50', 'transition-all', 'duration-300', 'transform', 'scale-0');

    if (type === "error") {
      messageBox.classList.add('bg-red-500');
    } else if (type === "success") {
      messageBox.classList.add('bg-green-500');
    } else {
      messageBox.classList.add('bg-blue-500');
    }
    messageBox.textContent = message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
      messageBox.classList.remove('scale-0');
      messageBox.classList.add('scale-100');
    }, 10);

    setTimeout(() => {
      messageBox.classList.remove('scale-100');
      messageBox.classList.add('scale-0');
      messageBox.addEventListener('transitionend', () => messageBox.remove());
    }, 3000);
  }

  renderAllTaskCards();

  addNewCardBtn.addEventListener('click', () => showModal('addCard'));
  deleteAllCardsBtn.addEventListener('click', deleteAllCards);
  modalSaveBtn.addEventListener('click', handleModalSave);
  modalCancelBtn.addEventListener('click', hideModal);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      hideModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalBackdrop.classList.contains('hidden')) {
      hideModal();
    }
  });

  taskCardsContainer.addEventListener('click', (event) => {
    if (event.target.closest('.add-task-btn')) {
      const listId = event.target.closest('.add-task-btn').dataset.listId;
      showModal('addTask', listId);
    }
    else if (event.target.closest('.delete-task-btn')) {
      const taskItem = event.target.closest('.custom-checkbox');
      const taskId = taskItem.dataset.taskId;
      const listId = taskItem.closest('.task-list').id.replace('-list', '');
      deleteTask(taskId, listId);
    }
    else if (event.target.classList.contains('filter-btn')) {
      const listId = event.target.dataset.listId;
      const filter = event.target.dataset.filter;
      const listObject = allTaskLists.find(list => list.id === listId);
      if (listObject) {
        listObject.currentFilter = filter;
        renderAllTaskCards();
      }
    }
    else if (event.target.closest('.custom-checkbox') && !event.target.classList.contains('task-checkbox') && !event.target.closest('.delete-task-btn')) {
      const taskItem = event.target.closest('.custom-checkbox');
      const taskId = taskItem.dataset.taskId;
      const listId = taskItem.dataset.listId;
      showModal('viewTask', listId, taskId);
    }
  });

  taskCardsContainer.addEventListener('change', (event) => {
    if (event.target.classList.contains('task-checkbox')) {
      const taskItem = event.target.closest('.custom-checkbox');
      const taskId = taskItem.dataset.taskId;
      const listId = taskItem.closest('.task-list').id.replace('-list', '');
      toggleTaskCompletion(taskId, listId);
    }
  });
});
