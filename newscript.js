// localStorage.clear();
document.addEventListener("DOMContentLoaded", function () {
  // Load tasks from local storage
  loadTasks();

  // Set the date
  setDate();

  // Event delegation for task interactions
  const taskContainer = document.querySelector(".taskcontainer .task-table");
  const completedTaskContainer = document.querySelector(
    ".cptaskcontainer .task-table"
  );
  const taskInput = document.getElementById("taskinput");
  const addBtn = document.getElementById("addButton");

  // Toggle importance, complete, and undo
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
    showTaskBtn();
    addBtnAllow(addBtn, taskInput);
  });

  taskInput.addEventListener("focus", function () {
    showTaskBtn();
  });

  taskInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      addTask();
      hideTaskBtn();
    }
  });

  addBtn.addEventListener("click", function () {
    addTask();
    hideTaskBtn();
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

function showTaskBtn() {
  var plusIcon = document.getElementById('plusIcon');
  var circleIcon = document.getElementById('circleIcon');
  plusIcon.style.display = 'none';
  circleIcon.style.display = 'inherit';
  var taskFeature = document.getElementById('taskFeature');
  taskFeature.style.display = 'inherit';
}

function hideTaskBtn() {
  var plusIcon = document.getElementById('plusIcon');
  var circleIcon = document.getElementById('circleIcon');
  plusIcon.style.display = 'inherit';
  circleIcon.style.display = 'none';
  var taskFeature = document.getElementById('taskFeature');
  taskFeature.style.display = 'none';
}

function addTask() {
  const taskInput = document.getElementById("taskinput");
  if (taskInput.value !== "") {
    const taskContainer = document.querySelector(
      ".taskcontainer .task-table tbody"
    );
    const newrow = document.createElement("tr");
    newrow.className = "taskrow";
    newrow.id = uuidv4(); // Generating uuid
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
    saveTask(newrow);

    //Adding edit features
    const taskTitle = newrow.querySelector(`p[task-id="${newrow.id}"]`);
    const taskArea = taskTitle.closest(".tasktitle");
    taskArea.addEventListener("dblclick", function () {
      editTask({ id: newrow.id, title: taskTitle.innerText });
    });
  }
}

function toggleImportance(star) {
  star.classList.toggle("fa-regular");
  star.classList.toggle("fa-solid");

  const updatedTaskRow = star.closest("tr");
  const taskId = updatedTaskRow.id;

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let task = tasks.find((t) => t.id === taskId);

  if (star.classList.contains("fa-solid")) {
    star.setAttribute("title", "Remove importance");
    task.importance = true;
  } else {
    star.setAttribute("title", "Mark task as importance");
    task.importance = false;
  }

  updateStorage(task);
  moveTaskToTop(updatedTaskRow);
}

function moveTaskToTop(taskRow) {
  const container = checkContainer(taskRow);
  if (container === 'taskcontainer') {
    taskRow.closest(`.taskcontainer .task-table tbody`).prepend(taskRow);
  } else {
    taskRow.closest(`.cptaskcontainer .task-table`).prepend(taskRow);
  }
}

function complete(taskRow) {
  addCellFocusListeners(
    taskRow.querySelectorAll('td:not([name="non-select"])')
  );
  const completedTaskContainer = document.querySelector(
    ".cptaskcontainer .task-table"
  );
  completedTaskContainer.prepend(taskRow);

  const cpbtContent = taskRow.querySelector(".cpbtcontent");
  cpbtContent.innerHTML = '<i class="fa-solid fa-circle-check undo"></i>';

  const tasktitle = taskRow.querySelector(".tasktitle .titlect p");
  tasktitle.className = "cptitle";

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let task = tasks.find((t) => t.id === taskRow.id);
  task.completed = true;
  updateStorage(task);
  updateCpTask("add");
}

function undo(taskRow) {
  const taskContainer = document.querySelector(
    ".taskcontainer .task-table tbody"
  );
  const cpbtContent = taskRow.querySelector(".cpbtcontent");
  cpbtContent.innerHTML = `
    <span class="material-symbols-outlined psCb">radio_button_unchecked</span>
    <span class="material-symbols-outlined cpBt">check_circle</span>`;

  const tasktitle = taskRow.querySelector(".tasktitle .titlect p");
  tasktitle.className = "";

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let task = tasks.find((t) => t.id === taskRow.id);
  task.completed = false;
  updateStorage(task);

  if(task.importance === true){
    taskContainer.prepend(taskRow);
  } else{
    taskContainer.append(taskRow);
  }
  updateCpTask("del");
}

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

function saveTask(taskRow) {
  let existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];

  let task = {
    id: taskRow.id,
    title: taskRow.querySelector(".tasktitle .titlect p").innerText,
    dueDate: taskRow.querySelector(".duedate p").innerText,
    importance: false,
    completed: false,
  };

  existingTasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(existingTasks));
}

function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const taskContainer = document.querySelector(
    ".taskcontainer .task-table tbody"
  );
  const cpTaskContainer = document.querySelector(
    ".cptaskcontainer .task-table"
  );

  tasks.forEach((task) => {
    const newrow = document.createElement("tr");
    newrow.className = "taskrow";
    newrow.id = task.id; // Set the row id to the task id
    newrow.innerHTML = `
      <td class="cpbtarea">
        <div class="cpbtcontent">
          ${
            task.completed
              ? '<i class="fa-solid fa-circle-check undo"></i>'
              : '<span class="material-symbols-outlined psCb">radio_button_unchecked</span><span class="material-symbols-outlined cpBt">check_circle</span>'
          }
        </div>
      </td>
      <td class="tasktitle">
        <div class="titlect">
          <p task-id="${task.id}">${task.title}</p>
          <input type="text" task-id="${task.id}" value="${
      task.title
    }" class="editInput" style="display: none" />
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
          <i class="fa-${
            task.importance ? "solid" : "regular"
          } fa-star imp1" title="${
      task.importance ? "Remove importance" : "Mark task as importance"
    }"></i>
        </div>
      </td>
      <td name="non-select"></td>
    `;

    addCellFocusListeners(
      newrow.querySelectorAll('td:not([name="non-select"])')
    );

    if (task.completed) {
      cpTaskContainer.append(newrow);
      newrow.querySelector('p').className = 'cptitle';
    } else {
      taskContainer.append(newrow);
    }

    if(task.importance){
      moveTaskToTop(newrow);
    }
    updateCpTask();

    const taskTitle = newrow.querySelector(`p[task-id="${task.id}"]`);
    const taskArea = taskTitle.closest(".tasktitle");
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

  taskTitleInput.selectionStart = taskTitleInput.value.length;
  taskTitleInput.selectionEnd = taskTitleInput.value.length;

  function saveEdit() {
    taskTitle.textContent = taskTitleInput.value.trim() || taskTitleInput.value;
    taskTitle.style.display = "inherit";
    taskTitleInput.style.display = "none";
    task.title = taskTitle.innerText;
    updateStorage(task);
  }

  taskTitleInput.addEventListener("blur", saveEdit);

  taskTitleInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      saveEdit();
    }
  });
}

function updateStorage(updatedTask) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let taskIndex = tasks.findIndex((t) => t.id === updatedTask.id);

  if (taskIndex !== -1) {
    tasks[taskIndex] = updatedTask;
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
}

function updateCpTask(addOrDel){
  let cptask = parseInt(JSON.parse(localStorage.getItem("cptask")))|| 0;
  if(addOrDel === "add"){
    cptask++;
  } else if(addOrDel === 'del'){
    cptask--;
  } 
  const htmlCpTask = document.getElementById('cpTaskcount');
  htmlCpTask.innerText = cptask;
  localStorage.setItem("cptask", JSON.stringify(cptask));
}
  

function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
