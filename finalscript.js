//Function to generate uuid
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  document.addEventListener("DOMContentLoaded", function () {
    //Loading tasks from local storage
    //localStorage.clear();
    loadTasks();
  
    // Setting the date
    setDate();
  
    // Event delegation for task interactions
    const taskContainer = document.querySelector(".taskcontainer .task-table");
    const completedTaskContainer = document.querySelector(
      ".cptaskcontainer .task-table"
    );
    const taskInput = document.getElementById("taskinput");
    const addBtn = document.getElementById("addButton");
      

    //toggle importance, complete, and undo
    taskContainer.addEventListener("click", function (event) {
      const target = event.target;
      if (target.closest(".cpbtarea")) {
        complete(target.closest("tr"));
      } else if (target.closest(".starcontent i")) {
        toggleImportance(target);
      }
    });

    completedTaskContainer.addEventListener("click", function (event) {
      if (event.target.closest(".cpbtarea")) {
        undo(event.target.closest("tr"));
      } else if (event.target.closest(".starcontent i")) {
        toggleImportance(event.target);
      }
    });

    taskInput.addEventListener("input", function () {
      addBtnAllow(addBtn, taskInput);
    });
  
    taskInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        addTask();
      }
    });
  
    addBtn.addEventListener("click", function () {
      addTask();
    });
  });
  

  function setDate() {
    const d = new Date();
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedDate = `${weekdays[d.getDay()]}, ${
      months[d.getMonth()]
    } ${d.getDate()}`;
    document.getElementById("todayDate").innerHTML = formattedDate;
  }
  
  function addTask() {
    const taskInput = document.getElementById("taskinput");
    if (taskInput.value !== "") {
      const taskContainer = document.querySelector(".taskcontainer .task-table tbody");
      const newrow = document.createElement("tr");
      newrow.className = "taskrow";
      newrow.id = uuidv4(); //generating uuid
      newrow.innerHTML = `
          <td class="cpbtarea">
            <div class="cpbtcontent">
              <span class="material-symbols-outlined psCb">radio_button_unchecked</span>
              <span class="material-symbols-outlined cpBt">check_circle</span>
            </div>
          </td>
          <td class="tasktitle">
            <div class="titlect">
              <p task-id="${newrow.id}">${taskInput.value}</p>
              <input type="text" task-id="${newrow.id}" class="editInput" style="display: none" />
              <span class="material-symbols-outlined infoIcon" title="Open details">info</span>
            </div>
          </td>
          <td class="duedate">
            <div class="duedatect">
              <p>06/03/2024</p>
              <span class="material-symbols-outlined calIcon">calendar_month</span>
            </div>
          </td>
          <td class="impcb">
            <div class="starcontent">
              <i class="fa-regular fa-star imp1" title="Mark task as importance"></i>
            </div>
          </td>
          <td name="non-select"></td>
        `;
      
      taskContainer.append(newrow);
      taskInput.value = "";
      addCellFocusListeners(
        newrow.querySelectorAll('td:not([name="non-select"])')
      );
      //Savign task to storage
      saveTask(newrow);

      //adding edit features
      let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
      let task = tasks.find(t => t.id === newrow.id);
      const taskTitle = newrow.querySelector(`p[task-id="${task.id}"]`);
      taskArea = taskTitle.closest('.tasktitle');
      taskArea.addEventListener("dblclick", function () {
        editTask(task);
      });
    }
  }
  
  function toggleImportance(star) {
    star.classList.toggle("fa-regular");
    star.classList.toggle("fa-solid");

    updatedTask = star.closest('tr');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let task = tasks.find(t => t.id === updatedTask.id);

    if (star.classList.contains("fa-solid")) {
      star.setAttribute("title", "Remove importance");
      task.importance = true;
      updateStorage(task);
    } else {
      star.setAttribute("title", "Mark task as importance");
      task.importance = false;
      updateStorage(task);
    }
    moveTaskToTop(star.closest("tr"));
  }
  
  function moveTaskToTop(taskRow) {
    if(checkContainer(taskRow) === 'cptaskcontainer'){
      taskRow.closest(".task-table").prepend(taskRow);
    } else{
      taskRow.closest(".task-table tbody").prepend(taskRow);
    }
  }
  
  function complete(taskRow) {
    addCellFocusListeners(
      taskRow.querySelectorAll('td:not([name="non-select"])')
    );
    const completedTaskContainer = document.querySelector(
      ".cptaskcontainer .task-table"
    );
    completedTaskContainer.append(taskRow);
    const cpbtContent = taskRow.querySelector(".cpbtcontent");
    cpbtContent.innerHTML = '<i class="fa-solid fa-circle-check undo"></i>';
    let tasktitle = taskRow.querySelector('.tasktitle .titlect p');
    tasktitle.className = 'cptitle';
    //Updating storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let task = tasks.find(t => t.id === taskRow.id);
    task.completed = true;
    updateStorage(task); 
  }
  function undo(taskRow) {
    const taskContainer = document.querySelector(".taskcontainer .task-table");
    const cpbtContent = taskRow.querySelector(".cpbtcontent");
    cpbtContent.innerHTML =
      '<span class="material-symbols-outlined psCb">radio_button_unchecked</span><span class="material-symbols-outlined cpBt">check_circle</span>';
    let tasktitle = taskRow.querySelector('.tasktitle .titlect p');
    tasktitle.className = 'cptitle';
    taskContainer.prepend(taskRow);

     //Updating storage
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let task = tasks.find(t => t.id === taskRow.id);
    task.completed = false;
    updateStorage(task); 
  }
  
  //Add button allow
  function addBtnAllow(addButton, taskInput) {
    addButton.disabled = true;
    if (taskInput.value !== "") {
      addButton.style.color = "blue";
      addButton.style.cursor = "pointer";
      addButton.disabled = false;
    } else {
      addButton.style.color = "gray";
      addButton.style.cursor = "not-allowed";
      addButton.disabled = true;
    }
  }
  
  function addCellFocusListeners(cells) {
    cells.forEach((cell) => {
      cell.setAttribute("tabindex", "0");
      cell.addEventListener("focus", () => {
        cell.style.outline = "0.5px solid black";
      });
      cell.addEventListener("blur", () => {
        cell.style.outline = "none";
      });
    });
  }

  
  function checkContainer(element) {
    if (element.closest(".cptaskcontainer")) {
        return "cptaskcontainer";
    } else if (element.closest(".taskcontainer")) {
        return "taskcontainer";
    } else {
        return null;
    }
    }
  
  function saveTask(taskrow) {
    let existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
    let task = {
      id: taskrow.id,
      title: taskrow.querySelector(".tasktitle .titlect p").innerText,
      dueDate: taskrow.querySelector(".duedate p").innerText,
      importance: false,
      completed: false,
    };
  
    existingTasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(existingTasks));
  }
  
  function loadTasks() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const taskContainer = document.querySelector(".taskcontainer .task-table tbody");
    const cpTaskContainer = document.querySelector(".cptaskcontainer .task-table");
  
    tasks.forEach((task) => {
      const newrow = document.createElement("tr");
      newrow.className = "taskrow";
      newrow.innerHTML = `
        <td class="cpbtarea" data-task-id="">
          <div class="cpbtcontent">
            <span class="material-symbols-outlined psCb">radio_button_unchecked</span>
            <span class="material-symbols-outlined cpBt">check_circle</span>
          </div>
        </td>
        <td class="tasktitle">
          <div class="titlect">
            <p task-id="${task.id}">${task.title}</p>
            <input type="text" task-id="${task.id}" value="${task.title}" class="editInput" style="display: none" />
            <span class="material-symbols-outlined infoIcon" title="Open details">info</span>
          </div>
        </td>
        <td class="duedate">
          <div class="duedatect">
            <p>${task.dueDate}</p>
            <span class="material-symbols-outlined calIcon">calendar_month</span>
          </div>
        </td>
        <td class="impcb">
          <div class="starcontent">
            <i class="fa-regular fa-star imp1" title="Mark task as importance"></i>
          </div>
        </td>
        <td name="non-select"></td>
      `;
      
      addCellFocusListeners(
        newrow.querySelectorAll('td:not([name="non-select"])')
      );

      //Checking if task is completed or not
      const cpbtContent = newrow.querySelector(".cpbtcontent");
      if (task.completed === false) {
        taskContainer.append(newrow);
        cpbtContent.innerHTML =
      '<span class="material-symbols-outlined psCb">radio_button_unchecked</span><span class="material-symbols-outlined cpBt">check_circle</span>';
      } else {
        cpTaskContainer.prepend(newrow);
        cpbtContent.innerHTML = '<i class="fa-solid fa-circle-check undo"></i>';
      }

      //Adding editTask features

      const taskTitle = newrow.querySelector(`p[task-id="${task.id}"]`);
      taskArea = taskTitle.closest('.tasktitle');
      taskArea.addEventListener("dblclick", function () {
        editTask(task);
      });
    });
  }
  
function editTask(task) {
    const taskTitle = document.querySelector(`p[task-id="${task.id}"]`);
    taskTitle.style.display = "none";
    const taskTitleInput = document.querySelector(`input[task-id="${task.id}"]`);
    taskTitleInput.style.display = "inherit";
    taskTitleInput.focus();
    
    //Setting cursor at the end of the input
    taskTitleInput.selectionStart = taskTitleInput.value.length;
    taskTitleInput.selectionEnd = taskTitleInput.value.length;
  
    taskTitleInput.addEventListener("blur", function () {
      taskTitle.textContent = taskTitleInput.value.trim() || taskTitleInput.value();
      if (checkContainer(taskTitle) === "cptaskcontainer") {
        taskTitle.className = "cptitle";
      }
      taskTitle.style.display = 'inherit'; //Showing the task title
      taskTitleInput.style.display = "none"; //hiding the input
      task.title = taskTitle.innerText; //update the storage
      updateStorage(task); 
    });
  
    taskTitleInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        taskTitle.textContent = taskTitleInput.value.trim() || taskTitleInput.value();
        if (checkContainer(taskTitle) === "cptaskcontainer") {
          taskTitle.className = "cptitle";
        }
        taskTitle.style.display = 'inherit'; //Showing the task title
        taskTitleInput.style.display = "none"; //hiding the input
        task.title = taskTitle.innerText; //update the storage
        updateStorage(task); 
      }
    });
}

function updateStorage(updatedTask) {
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let task = tasks.find(t => t.id === updatedTask.id);
  if (task) {
      task.title = updatedTask.title;
      task.dueDate = updatedTask.dueDate;
      task.importance = updatedTask.importance;
      task.completed = updatedTask.completed;
      localStorage.setItem('tasks', JSON.stringify(tasks));
  }
}
