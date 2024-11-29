// Import helper functions from utils
import { getTasks, createNewTask, putTask, deleteTask } from './utils/taskFunctions.js';
// Import initialData
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it 
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); //loads initialData to localStorage using .setItem 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

//Called the elements,that I'd be using throughout this script,
// from the DOM 
const elements = {
  sideBar: document.getElementById("side-bar-div"),
  logo: document.getElementById("logo"),
  headerBoardName: document.getElementById("header-board-name"),
  editBoardBtn: document.getElementById("edit-board-btn"),
  editBoardDiv: document.getElementById("editBoardDiv"),
  columnDivs: document.querySelectorAll(".column-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  addNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.querySelector("#new-task-modal-window"),
  titleInput: document.getElementById("title-input"),
  descInput: document.getElementById("desc-input"),
  statusInput: document.getElementById("select-status"),
  createTaskBtn: document.getElementById("create-task-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  editTaskModal: document.getElementsByClassName("edit-task-modal-window"),
  editTaskTitleInput: document.getElementById("edit-task-title-input"),
  editTaskDescInput: document.getElementById("edit-task-desc-input"),
  editSelectStatus: document.getElementById("edit-select-status"),
  filterDiv: document.getElementById("filterDiv"),
  saveTaskChangesBtn: document.getElementById("save-task-changes-btn"),
  deleteTaskBtn: document.getElementById("delete-task-btn"),
};



let activeBoard = ""

// Extracts unique board names from tasks by using .map() to extract the board property from 
// each task and .filter(Boolean) to exclude null or undefined values
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  // Set is used to ensure uniqueness before converting it back to an array
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ||  boards[0]; //
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container 
  boards.forEach(board => { //used forEach to dynamically create and append board btns to the DOM
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { //used an event listener to set each btn as activeBoard when clicked
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays
// them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  // uses .filer() to select tasks matching the active board 
  const filteredTasks = tasks.filter(task => task.board === boardName);

// Tasks are grouped by their status such as "to-do", "doing", and "done" and placed in the corresponding columns
  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listens for a click event on each task and opens a modal
      taskElement.addEventListener("click", () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') //added classList
    }
    else {
      btn.classList.remove('active');  //added classList
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); //changed '' to back ticks ``
  if (!column) {
    //If the column for the task's status doesn't exist, an error is logged to the console
    console.error(`Column not found for status: ${task.status}`);
    return;
  }
//Each column contains a tasks-container div to group task elements.
  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }
//A div is created for the task,its content is set to the task's title using textContent.
//a data-task-id attribute is added with the task's ID to uniquely identify each task
  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  //the task element is appended to the tasks-container,to display it in the appropriate column in the UI.
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task click event listener
  const cancelEditBtn = elements.cancelAddTaskBtn;
  cancelEditBtn.addEventListener("click",() => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task click event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it by using a click event listener
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar by using click event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false)); //fale= to hide sidebar
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));// true= to display sidebar

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Add new task form with submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
  // click event listener for the 'Add New Task' button
  //accessing addNewTaskBtn and filterDiv from elements{}
elements.addNewTaskBtn.addEventListener('click', () => {
  toggleModal(true);
  elements.filterDiv.style.display ="block"; // Also show the filter overlay
});

  // Call saveTaskChanges upon click of Save Changes button by using an event listener
  elements.saveTaskChangesBtn.addEventListener('click', () => { // Corrected eventListener
    if (currentTaskId) {
      saveTaskChanges(currentTaskId);  // Pass the current task ID
    }
  });

  // Delete task from localStorage using the deleteTask helper function and close the task modal
  elements.deleteTaskBtn.addEventListener('click', () => {
    if (currentTaskId) {
      deleteTask(currentTaskId);
      refreshTasksUI();
      toggleModal(false, elements.editTaskModal);
    }});

}
// Toggles tasks modal
// toggleModal uses conditional logic and a ternary operater to show or hide modal windows
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none"; 
} 



/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/
//This function captures user input from the modal form and creates a task object. 
function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object by calling the DOM elements
    const task = {
      id: Date.now(),
      title: elements.titleInput.value,
      description: elements.descInput.value,
      status: elements.statusInput.value,
      board: activeBoard
    };
    const newTask = createNewTask(task);//createNewTask helper function is then used to store the new task in local storage
    if (newTask) {
      addTaskToUI(newTask); //the DOM is updated dynamically using addTaskToUI.
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}

//this function toggles the sidebar and sidebar btn by using the condition show and ternary operaters
//to either hide or display it and saves it in localStorage 
function toggleSidebar(show) {
  elements.showSideBarBtn.style.display = show ? "none" : "block";
  elements.sideBar.style.display = show ? "block" : "none";
  localStorage.setItem('showSideBar', show.toString());
}
//The toggleTheme function enables users to switch between light and dark themes
function toggleTheme() {
  const body = document.body; // Get the body element
  const isLightTheme = body.classList.contains('light-theme'); // Check if dark mode is currently applied

  if (isLightTheme) {
    body.classList.remove('light-theme'); // Switch to dark mode
    localStorage.setItem('light-theme', 'active' ); // Save the preference to local storage
  } else {
    body.classList.add('light-theme'); // Switch to light mode
    localStorage.setItem('theme', 'light-theme'); // Save the preference to local storage
  }
// Add event listener to the theme switch checkbox
document.getElementById('switch').addEventListener('change', toggleTheme);

  // On page load, set the theme based on the user's previous preference
  //event listener is added to the theme switch checkbox. This ensures that toggling the switch triggers the toggleTheme function
  document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light-theme') {
      document.body.classList.add('light-theme'); // Apply dark mode if saved in local storage
      document.getElementById('switch').checked = true; // Set the checkbox to checked for light mode
    }
  });
}

//currentTaskId variable is updated with the ID of the task being edited. Which ensures 
//that the correct task is identified when the user saves changes or deletes the task later
let currentTaskId = null; 
//This function pre-fills the editing modal with the tasks detail for it to be edited
function openEditTaskModal(task) {
  // Set task details in modal inputs
  elements.editTaskTitleInput.value = task.title;
  elements.editTaskDescInput.value = task.description;
  //uses querySelector to locate the <option> element in the dropdown that matches the task's current status
  const selectedStatus = elements.editSelectStatus.querySelector(`option[value="${task.status}"]`);
  if (selectedStatus) {
    selectedStatus.selected = true;
  }
  // Store the current task's ID in a variable so it can be used later when saving changes or deleting the task
  currentTaskId = task.id;
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}


//Changes made to tasks are saved using saveTaskChanges(), which updates both local storage and the DOM
function saveTaskChanges(taskId) {
  //checking if a valid taskId is provided. If not, it exits early to avoid errors
  if (!taskId) return; 
  // Get new user inputs from the modal inputs and organizes them into an object
  const updatedTasks = {
    id: taskId,
    title: elements.editTaskTitleInput.value,
    description: elements.editTaskDescInput.value,
    status: elements.editSelectStatus.value,
    board: activeBoard,
  };

  // Update task using a helper function, pushTask, to localStorage
  putTask(taskId, updatedTask);
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}