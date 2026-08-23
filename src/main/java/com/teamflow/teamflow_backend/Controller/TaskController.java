package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.DTO.Task.CreateTaskRequest;
import com.teamflow.teamflow_backend.DTO.Task.TaskResponse;
import com.teamflow.teamflow_backend.DTO.Task.UpdateTaskRequest;
import com.teamflow.teamflow_backend.Service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    // CREATE TASK
    @PostMapping("create")
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody CreateTaskRequest request) {

        TaskResponse savedTask =
                taskService.createTask(request);

        return new ResponseEntity<>(
                savedTask,
                HttpStatus.CREATED
        );
    }

    // GET ALL TASKS
    @GetMapping("alltasks")
    public ResponseEntity<List<TaskResponse>> getTasks() {

        List<TaskResponse> tasks =
                taskService.getAllTasks();

        return new ResponseEntity<>(
                tasks,
                HttpStatus.OK
        );
    }

    // GET TASK BY ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTaskById(
            @PathVariable String id) {

        TaskResponse task =
                taskService.getTaskById(id);

        return new ResponseEntity<>(
                task,
                HttpStatus.OK
        );
    }

    // UPDATE TASK
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable String id,
            @Valid @RequestBody UpdateTaskRequest request) {

        TaskResponse updatedTask =
                taskService.updateTask(request, id);

        return new ResponseEntity<>(
                updatedTask,
                HttpStatus.OK
        );
    }

    // DELETE TASK
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable String id) {

        taskService.deleteTask(id);

        return new ResponseEntity<>(
                HttpStatus.NO_CONTENT
        );
    }
}