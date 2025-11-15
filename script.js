document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskNameInput = document.getElementById('task-name');
    const taskDateInput = document.getElementById('task-date');
    const taskList = document.getElementById('task-list');
    const timeline = document.getElementById('timeline');
    const noTasksMessage = document.getElementById('no-tasks-message');
    const focusSection = document.getElementById('focus-section');
    const focusTaskText = document.getElementById('focus-task');
    const focusDateText = document.getElementById('focus-date');
    const progressBar = document.getElementById('progress-bar');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Save tasks and update UI
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks();
        renderTimeline();
        updateNoTasksMessage();
        renderFocus();
        updateProgressBar();
    };

    // Show/hide "no tasks" message
    const updateNoTasksMessage = () => {
        if (tasks.length === 0) {
            noTasksMessage.classList.remove('hidden');
        } else {
            noTasksMessage.classList.add('hidden');
        }
    };

    // Render all tasks
    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item p-4 flex items-center justify-between shadow-md ${task.completed ? 'completed' : ''}`;
            taskItem.dataset.id = task.id;

            const taskContent = document.createElement('div');
            taskContent.className = 'flex-1';
            taskContent.innerHTML = `
                <h3 class="task-text text-lg font-semibold">${task.name}</h3>
                <p class="text-sm opacity-80">${new Date(task.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            `;

            const actions = document.createElement('div');
            actions.className = 'flex items-center space-x-3';
            actions.innerHTML = `
                <button class="toggle-btn w-8 h-8 flex items-center justify-center rounded-full transition-colors ${task.completed ? 'bg-green-500' : 'bg-gray-500 hover:bg-green-400'}" title="Mark as ${task.completed ? 'Incomplete' : 'Complete'}">
                    ${task.completed ? '✔' : ''}
                </button>
                <button class="complete-btn text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md transition-all" title="Completed">
                    Completed
                </button>
                <button class="delete-btn text-red-400 hover:text-red-600 transition-colors" title="Delete Task">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            `;

            taskItem.appendChild(taskContent);
            taskItem.appendChild(actions);
            taskList.appendChild(taskItem);
        });
    };

    // Render upcoming timeline
    const renderTimeline = () => {
        timeline.innerHTML = '';
        const upcomingTasks = tasks
            .filter(task => !task.completed)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 5);

        if (upcomingTasks.length === 0) {
            timeline.innerHTML = '<p class="text-center text-gray-400">No upcoming tasks.</p>';
            return;
        }

        upcomingTasks.forEach(task => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'p-4 rounded-lg bg-gray-700 bg-opacity-30 shadow-sm';
            timelineItem.innerHTML = `
                <h3 class="font-semibold">${task.name}</h3>
                <p class="text-sm opacity-80">${new Date(task.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
            `;
            timeline.appendChild(timelineItem);
        });
    };

    // Render Today's Focus
    const renderFocus = () => {
        const today = new Date().toISOString().split('T')[0];
        const nextTask = tasks
            .filter(task => !task.completed)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .find(task => task.date >= today);

        if (nextTask) {
            focusSection.classList.remove('hidden');
            focusTaskText.textContent = nextTask.name;
            focusDateText.textContent = `Due: ${new Date(nextTask.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`;
        } else {
            focusSection.classList.add('hidden');
        }
    };

    // Update progress bar
    const updateProgressBar = () => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        progressBar.style.width = percentage + '%';
    };

    // Add new task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            name: taskNameInput.value.trim(),
            date: taskDateInput.value,
            completed: false,
        };
        tasks.push(newTask);
        taskNameInput.value = '';
        taskDateInput.value = '';
        saveTasks();
    });

    // Handle task actions
    taskList.addEventListener('click', (e) => {
        const taskId = parseInt(e.target.closest('.task-item')?.dataset.id);
        if (!taskId) return;

        // Delete task
        if (e.target.closest('.delete-btn')) {
            tasks = tasks.filter(t => t.id !== taskId);
        }

        // Toggle completion
        if (e.target.closest('.toggle-btn')) {
            const task = tasks.find(t => t.id === taskId);
            if (task) task.completed = !task.completed;
        }

        // Completed button increases progress
        if (e.target.closest('.complete-btn')) {
            const task = tasks.find(t => t.id === taskId);
            if (task && !task.completed) {
                task.completed = true;
            }
        }

        saveTasks();
    });

    // Initial render
    saveTasks();
});
