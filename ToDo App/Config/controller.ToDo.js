// ============================================================
// TODO APP
// Firebase + DOM
// ============================================================

import { db } from "./firebase.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// 1. FIREBASE COLLECTION
// ============================================================

const tasksCollection = collection(db, "tasks");


// ============================================================
// 2. DOM ELEMENTS
// ============================================================

// Main buttons

const openAddTaskBtn =
    document.querySelector("#openAddTaskBtn");

const emptyAddTaskBtn =
    document.querySelector("#emptyAddTaskBtn");

const mobileMenuBtn =
    document.querySelector("#mobileMenuBtn");


// Task list

const taskList =
    document.querySelector("#taskList");


// Search and filter

const searchInput =
    document.querySelector("#searchInput");

const taskFilter =
    document.querySelector("#taskFilter");


// Sidebar

const sidebar =
    document.querySelector("#sidebar");

const navLinks =
    document.querySelectorAll(".nav-link");


// Task modal

const taskModal =
    document.querySelector("#taskModal");

const closeTaskModalBtn =
    document.querySelector("#closeTaskModalBtn");

const cancelTaskBtn =
    document.querySelector("#cancelTaskBtn");


// Form

const taskForm =
    document.querySelector("#taskForm");

const taskIdInput =
    document.querySelector("#taskId");

const taskTitleInput =
    document.querySelector("#taskTitle");

const taskDescriptionInput =
    document.querySelector("#taskDescription");

const taskPriorityInput =
    document.querySelector("#taskPriority");

const taskDueDateInput =
    document.querySelector("#taskDueDate");

const taskStatusInput =
    document.querySelector("#taskStatus");

const taskModalTitle =
    document.querySelector("#taskModalTitle");

const saveTaskBtn =
    document.querySelector("#saveTaskBtn");

const titleError =
    document.querySelector("#titleError");

const descriptionCounter =
    document.querySelector("#descriptionCounter");


// Loading / empty / error

const loadingState =
    document.querySelector("#loadingState");

const emptyState =
    document.querySelector("#emptyState");

const errorState =
    document.querySelector("#errorState");

const errorMessage =
    document.querySelector("#errorMessage");

const retryBtn =
    document.querySelector("#retryBtn");


// Delete modal

const deleteModal =
    document.querySelector("#deleteModal");

const cancelDeleteBtn =
    document.querySelector("#cancelDeleteBtn");

const confirmDeleteBtn =
    document.querySelector("#confirmDeleteBtn");


// Toast

const toast =
    document.querySelector("#toast");

const toastIcon =
    document.querySelector("#toastIcon");

const toastTitle =
    document.querySelector("#toastTitle");

const toastMessage =
    document.querySelector("#toastMessage");

const closeToastBtn =
    document.querySelector("#closeToastBtn");


// ============================================================
// 3. STATE
// ============================================================

let tasks = [];

let currentFilter = "all";

let taskToDelete = null;

let toastTimer = null;


// ============================================================
// 4. INITIAL LOAD
// ============================================================

loadTasks();


// ============================================================
// 5. READ TASKS FROM FIREBASE
// ============================================================

async function loadTasks() {

    showLoading();

    try {

        const snapshot =
            await getDocs(tasksCollection);


        // Firestore documents → normal JavaScript objects

        tasks = snapshot.docs.map((document) => {

            return {

                id: document.id,

                ...document.data()

            };

        });


        // Newest tasks first

        tasks.sort((a, b) => {

            const dateA =
                a.createdAt?.seconds || 0;

            const dateB =
                b.createdAt?.seconds || 0;

            return dateB - dateA;

        });


        renderTasks();

        updateStatistics();

        hideLoading();

    }

    catch (error) {

        console.error(
            "Error loading tasks:",
            error
        );

        showError(
            "Unable to load tasks. Check your Firebase configuration."
        );

    }

}


// ============================================================
// 6. RENDER TASKS
// ============================================================

function renderTasks() {

    const searchValue =
        searchInput.value
            .trim()
            .toLowerCase();


    let filteredTasks =
        tasks.filter((task) => {

            // Status filter

            if (
                currentFilter !== "all" &&
                task.status !== currentFilter
            ) {

                return false;

            }


            // Search filter

            const title =
                task.title?.toLowerCase() || "";

            const description =
                task.description?.toLowerCase() || "";


            return (
                title.includes(searchValue) ||
                description.includes(searchValue)
            );

        });


    taskList.innerHTML = "";


    if (filteredTasks.length === 0) {

        emptyState.hidden = false;

        return;

    }


    emptyState.hidden = true;


    filteredTasks.forEach((task) => {

        const taskCard =
            createTaskCard(task);

        taskList.appendChild(taskCard);

    });

}


// ============================================================
// 7. CREATE TASK CARD
// ============================================================

function createTaskCard(task) {

    const card =
        document.createElement("article");

    card.className = "task-card";


    // --------------------------------------------------------
    // Main section
    // --------------------------------------------------------

    const main =
        document.createElement("div");

    main.className = "task-main";


    // Complete button

    const completeButton =
        document.createElement("button");

    completeButton.type = "button";

    completeButton.className =
        "complete-task-btn";


    if (task.status === "completed") {

        completeButton.classList.add(
            "completed"
        );

        completeButton.innerHTML = "✓";

    }


    completeButton.title =
        task.status === "completed"
            ? "Mark as pending"
            : "Mark as completed";


    completeButton.addEventListener(
        "click",
        () => toggleTaskStatus(task)
    );


    // --------------------------------------------------------
    // Task info
    // --------------------------------------------------------

    const info =
        document.createElement("div");

    info.className = "task-info";


    const title =
        document.createElement("h3");

    title.className = "task-title";

    title.textContent =
        task.title || "Untitled task";


    // Completed task ला visual indication

    if (task.status === "completed") {

        title.style.textDecoration =
            "line-through";

        title.style.color =
            "#979baa";

    }


    info.appendChild(title);


    // Description

    if (task.description) {

        const description =
            document.createElement("p");

        description.className =
            "task-description";

        description.textContent =
            task.description;

        info.appendChild(description);

    }


    // Meta

    const meta =
        document.createElement("div");

    meta.className = "task-meta";


    // Priority badge

    const priority =
        document.createElement("span");

    priority.className =
        `priority-badge priority-${task.priority || "medium"}`;

    priority.textContent =
        capitalize(task.priority || "medium");


    meta.appendChild(priority);


    // Due date

    if (task.dueDate) {

        const date =
            document.createElement("span");

        date.className = "task-date";

        date.textContent =
            `📅 ${formatDate(task.dueDate)}`;

        meta.appendChild(date);

    }


    info.appendChild(meta);

    main.appendChild(completeButton);

    main.appendChild(info);


    // --------------------------------------------------------
    // Actions
    // --------------------------------------------------------

    const actions =
        document.createElement("div");

    actions.className = "task-actions";


    // Edit button

    const editButton =
        document.createElement("button");

    editButton.type = "button";

    editButton.className =
        "task-action-btn";

    editButton.innerHTML = "✏️";

    editButton.title = "Edit task";

    editButton.addEventListener(
        "click",
        () => openEditModal(task)
    );


    // Delete button

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className =
        "task-action-btn delete-task-btn";

    deleteButton.innerHTML = "🗑️";

    deleteButton.title = "Delete task";

    deleteButton.addEventListener(
        "click",
        () => openDeleteModal(task.id)
    );


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);


    // --------------------------------------------------------
    // Final card
    // --------------------------------------------------------

    card.appendChild(main);

    card.appendChild(actions);


    return card;

}


// ============================================================
// 8. ADD TASK
// ============================================================

async function addTask(taskData) {

    setSaveButtonLoading(true);


    try {

        await addDoc(
            tasksCollection,
            {

                title: taskData.title,

                description:
                    taskData.description,

                priority:
                    taskData.priority,

                dueDate:
                    taskData.dueDate,

                status:
                    taskData.status,

                createdAt:
                    serverTimestamp()

            }
        );


        closeTaskModal();

        showToast(
            "Success",
            "Task added successfully.",
            "✓"
        );


        await loadTasks();

    }

    catch (error) {

        console.error(
            "Error adding task:",
            error
        );

        showToast(
            "Error",
            "Unable to add task.",
            "!"
        );

    }

    finally {

        setSaveButtonLoading(false);

    }

}


// ============================================================
// 9. UPDATE TASK
// ============================================================

async function updateTask(taskId, taskData) {

    setSaveButtonLoading(true);


    try {

        const taskReference =
            doc(
                db,
                "tasks",
                taskId
            );


        await updateDoc(
            taskReference,
            {

                title:
                    taskData.title,

                description:
                    taskData.description,

                priority:
                    taskData.priority,

                dueDate:
                    taskData.dueDate,

                status:
                    taskData.status,

                updatedAt:
                    serverTimestamp()

            }
        );


        closeTaskModal();

        showToast(
            "Updated",
            "Task updated successfully.",
            "✓"
        );


        await loadTasks();

    }

    catch (error) {

        console.error(
            "Error updating task:",
            error
        );

        showToast(
            "Error",
            "Unable to update task.",
            "!"
        );

    }

    finally {

        setSaveButtonLoading(false);

    }

}


// ============================================================
// 10. COMPLETE / UNCOMPLETE TASK
// ============================================================

async function toggleTaskStatus(task) {

    try {

        const taskReference =
            doc(
                db,
                "tasks",
                task.id
            );


        const newStatus =
            task.status === "completed"
                ? "pending"
                : "completed";


        await updateDoc(
            taskReference,
            {

                status: newStatus,

                updatedAt:
                    serverTimestamp()

            }
        );


        // Local state update

        task.status = newStatus;


        renderTasks();

        updateStatistics();


        showToast(

            newStatus === "completed"
                ? "Completed"
                : "Task Reopened",

            newStatus === "completed"
                ? "Great! Task completed."
                : "Task moved back to pending.",

            "✓"

        );

    }

    catch (error) {

        console.error(
            "Error changing status:",
            error
        );

        showToast(
            "Error",
            "Unable to update task status.",
            "!"
        );

    }

}


// ============================================================
// 11. DELETE TASK
// ============================================================

async function deleteTask() {

    if (!taskToDelete) {

        return;

    }


    try {

        const taskReference =
            doc(
                db,
                "tasks",
                taskToDelete
            );


        await deleteDoc(taskReference);


        closeDeleteModal();


        showToast(
            "Deleted",
            "Task deleted successfully.",
            "✓"
        );


        await loadTasks();

    }

    catch (error) {

        console.error(
            "Error deleting task:",
            error
        );

        showToast(
            "Error",
            "Unable to delete task.",
            "!"
        );

    }

}


// ============================================================
// 12. FORM SUBMIT
// ============================================================

taskForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        clearFormError();


        const title =
            taskTitleInput.value.trim();


        // Basic validation

        if (!title) {

            titleError.textContent =
                "Task title is required.";

            taskTitleInput.focus();

            return;

        }


        const taskData = {

            title: title,

            description:
                taskDescriptionInput.value.trim(),

            priority:
                taskPriorityInput.value,

            dueDate:
                taskDueDateInput.value,

            status:
                taskStatusInput.value

        };


        const taskId =
            taskIdInput.value;


        // ID असेल = UPDATE
        // ID नसेल = ADD

        if (taskId) {

            await updateTask(
                taskId,
                taskData
            );

        }

        else {

            await addTask(taskData);

        }

    }
);


// ============================================================
// 13. OPEN ADD TASK MODAL
// ============================================================

openAddTaskBtn.addEventListener(
    "click",
    openAddModal
);


emptyAddTaskBtn.addEventListener(
    "click",
    openAddModal
);


function openAddModal() {

    taskForm.reset();


    taskIdInput.value = "";


    taskModalTitle.textContent =
        "Add New Task";


    saveTaskBtn.textContent =
        "Add Task";


    descriptionCounter.textContent =
        "0 / 500";


    clearFormError();


    taskModal.hidden = false;


    setTimeout(() => {

        taskTitleInput.focus();

    }, 50);

}


// ============================================================
// 14. OPEN EDIT MODAL
// ============================================================

function openEditModal(task) {

    taskIdInput.value =
        task.id;


    taskTitleInput.value =
        task.title || "";


    taskDescriptionInput.value =
        task.description || "";


    taskPriorityInput.value =
        task.priority || "medium";


    taskDueDateInput.value =
        task.dueDate || "";


    taskStatusInput.value =
        task.status || "pending";


    taskModalTitle.textContent =
        "Edit Task";


    saveTaskBtn.textContent =
        "Update Task";


    updateDescriptionCounter();


    clearFormError();


    taskModal.hidden = false;


    taskTitleInput.focus();

}


// ============================================================
// 15. CLOSE TASK MODAL
// ============================================================

closeTaskModalBtn.addEventListener(
    "click",
    closeTaskModal
);


cancelTaskBtn.addEventListener(
    "click",
    closeTaskModal
);


function closeTaskModal() {

    taskModal.hidden = true;

    taskForm.reset();

    taskIdInput.value = "";

    clearFormError();

    descriptionCounter.textContent =
        "0 / 500";

}


// ============================================================
// 16. DELETE MODAL
// ============================================================

function openDeleteModal(taskId) {

    taskToDelete = taskId;

    deleteModal.hidden = false;

}


function closeDeleteModal() {

    deleteModal.hidden = true;

    taskToDelete = null;

}


cancelDeleteBtn.addEventListener(
    "click",
    closeDeleteModal
);


confirmDeleteBtn.addEventListener(
    "click",
    deleteTask
);


// ============================================================
// 17. SEARCH
// ============================================================

searchInput.addEventListener(
    "input",
    renderTasks
);


// ============================================================
// 18. FILTER SELECT
// ============================================================

taskFilter.addEventListener(
    "change",
    () => {

        currentFilter =
            taskFilter.value;

        updateActiveSidebarFilter();

        renderTasks();

    }
);


// ============================================================
// 19. SIDEBAR FILTER
// ============================================================

navLinks.forEach((link) => {

    link.addEventListener(
        "click",
        () => {

            currentFilter =
                link.dataset.filter;


            taskFilter.value =
                currentFilter;


            updateActiveSidebarFilter();

            renderTasks();

        }
    );

});


function updateActiveSidebarFilter() {

    navLinks.forEach((link) => {

        link.classList.toggle(

            "active",

            link.dataset.filter ===
                currentFilter

        );

    });

}


// ============================================================
// 20. STATISTICS
// ============================================================

function updateStatistics() {

    const total =
        tasks.length;


    const pending =
        tasks.filter(
            task => task.status === "pending"
        ).length;


    const completed =
        tasks.filter(
            task => task.status === "completed"
        ).length;


    // Main statistics

    document.querySelector(
        "#totalTaskCount"
    ).textContent = total;


    document.querySelector(
        "#totalPendingCount"
    ).textContent = pending;


    document.querySelector(
        "#totalCompletedCount"
    ).textContent = completed;


    // Sidebar counts

    document.querySelector(
        "#allTaskCount"
    ).textContent = total;


    document.querySelector(
        "#pendingTaskCount"
    ).textContent = pending;


    document.querySelector(
        "#completedTaskCount"
    ).textContent = completed;

}


// ============================================================
// 21. DESCRIPTION CHARACTER COUNTER
// ============================================================

taskDescriptionInput.addEventListener(
    "input",
    updateDescriptionCounter
);


function updateDescriptionCounter() {

    const length =
        taskDescriptionInput.value.length;


    descriptionCounter.textContent =
        `${length} / 500`;

}


// ============================================================
// 22. FORM ERROR
// ============================================================

function clearFormError() {

    titleError.textContent = "";

}


// ============================================================
// 23. SAVE BUTTON LOADING
// ============================================================

function setSaveButtonLoading(isLoading) {

    saveTaskBtn.disabled =
        isLoading;


    if (isLoading) {

        saveTaskBtn.textContent =
            "Saving...";

    }

    else {

        saveTaskBtn.textContent =
            taskIdInput.value
                ? "Update Task"
                : "Add Task";

    }

}


// ============================================================
// 24. LOADING STATE
// ============================================================

function showLoading() {

    loadingState.hidden = false;

    errorState.hidden = true;

    emptyState.hidden = true;

    taskList.innerHTML = "";

}


function hideLoading() {

    loadingState.hidden = true;

}


// ============================================================
// 25. ERROR STATE
// ============================================================

function showError(message) {

    loadingState.hidden = true;

    emptyState.hidden = true;

    errorState.hidden = false;

    taskList.innerHTML = "";

    errorMessage.textContent =
        message;

}


// ============================================================
// 26. RETRY
// ============================================================

retryBtn.addEventListener(
    "click",
    loadTasks
);


// ============================================================
// 27. TOAST
// ============================================================

function showToast(
    title,
    message,
    icon = "✓"
) {

    clearTimeout(toastTimer);


    toastTitle.textContent =
        title;


    toastMessage.textContent =
        message;


    toastIcon.textContent =
        icon;


    toast.hidden = false;


    toastTimer = setTimeout(
        () => {

            toast.hidden = true;

        },
        3000
    );

}


closeToastBtn.addEventListener(
    "click",
    () => {

        toast.hidden = true;

    }
);


// ============================================================
// 28. MOBILE SIDEBAR
// ============================================================

mobileMenuBtn.addEventListener(
    "click",
    () => {

        sidebar.classList.toggle(
            "open"
        );

    }
);


// Sidebar filter click केल्यावर mobile मध्ये close

navLinks.forEach((link) => {

    link.addEventListener(
        "click",
        () => {

            sidebar.classList.remove(
                "open"
            );

        }
    );

});


// ============================================================
// 29. CLOSE MODAL BY CLICKING OUTSIDE
// ============================================================

taskModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === taskModal
        ) {

            closeTaskModal();

        }

    }
);


deleteModal.addEventListener(
    "click",
    (event) => {

        if (
            event.target === deleteModal
        ) {

            closeDeleteModal();

        }

    }
);


// ============================================================
// 30. ESC KEY
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key !== "Escape") {

            return;

        }


        if (!taskModal.hidden) {

            closeTaskModal();

        }


        if (!deleteModal.hidden) {

            closeDeleteModal();

        }

    }
);


// ============================================================
// 31. HELPER FUNCTIONS
// ============================================================

function capitalize(value) {

    if (!value) {

        return "";

    }


    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


function formatDate(dateString) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(`${dateString}T00:00:00`);


    if (Number.isNaN(date.getTime())) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}