package com.teamflow.teamflow_backend.Service;

import com.teamflow.teamflow_backend.DTO.Task.CreateTaskRequest;
import com.teamflow.teamflow_backend.DTO.Task.TaskResponse;
import com.teamflow.teamflow_backend.DTO.Task.UpdateTaskRequest;
import com.teamflow.teamflow_backend.Entity.Task;
import com.teamflow.teamflow_backend.Exception.BadRequestException;
import com.teamflow.teamflow_backend.Exception.ResourceNotFoundException;
import com.teamflow.teamflow_backend.Repository.ProjectRepository;
import com.teamflow.teamflow_backend.Repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    public TaskService(TaskRepository taskRepository, ProjectRepository projectRepository){
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public TaskResponse createTask(CreateTaskRequest request){
        String projId = request.getProjectId();
        if (projId == null || projId.isBlank()) {
            throw new BadRequestException("Project ID is required");
        }
        if (!projectRepository.existsById(projId)) {
            throw new ResourceNotFoundException("Project not found");
        }

        Task task = new Task();
        task.setStatus("TODO");
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setPriority(request.getPriority());
        task.setAssignedTo(request.getAssignedTo());
        task.setProjectId(request.getProjectId());
        task.setCreatedAt(new Date());
        task.setUpdatedAt(new Date());
        Task savedTask = taskRepository.save(task);
        return convertToResponse(savedTask);
    }

    public TaskResponse updateTask(UpdateTaskRequest request, String id){

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        String projId = request.getProjectId();
        if (projId == null || projId.isBlank()) {
            throw new BadRequestException("Project ID is required");
        }
        if (!projectRepository.existsById(projId)) {
            throw new ResourceNotFoundException("Project not found");
        }
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setDeadline(request.getDeadline());
        task.setPriority(request.getPriority());
        task.setAssignedTo(request.getAssignedTo());
        task.setProjectId(request.getProjectId());
        task.setStatus(request.getStatus());

        task.setUpdatedAt(new Date());
        Task savedTask = taskRepository.save(task);
        return convertToResponse(savedTask);
    }

    public List<TaskResponse> getAllTasks(){
    return taskRepository.findAll().stream().map(this::convertToResponse).toList();

    }

    public TaskResponse getTaskById(String id){
        Task task = taskRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Task not found"));
        return convertToResponse(task);
    }


    public void deleteTask(String id){
        if(!taskRepository.existsById(id)){
            throw new ResourceNotFoundException("Task not found");
        }
        taskRepository.deleteById(id);
    }
    public TaskResponse convertToResponse(Task task){
        TaskResponse response = new TaskResponse();

        response.setId(task.getId());
        response.setCreatedAt(task.getCreatedAt());
        response.setUpdatedAt(task.getUpdatedAt());
        response.setTitle(task.getTitle());
        response.setDeadline(task.getDeadline());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setProjectId(task.getProjectId());
        response.setAssignedTo(task.getAssignedTo());
        response.setPriority(task.getPriority());

        return response;
    }
}
