package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.DTO.Project.CreateProjectRequest;
import com.teamflow.teamflow_backend.DTO.Project.ProjectResponse;
import com.teamflow.teamflow_backend.DTO.Project.UpdateProjectRequest;
import com.teamflow.teamflow_backend.Service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // CREATE
    @PostMapping("create")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {

        ProjectResponse savedProject =
                projectService.createProject(request);

        return new ResponseEntity<>(
                savedProject,
                HttpStatus.CREATED
        );
    }

    // READ ALL
    @GetMapping("allprojects")
    public ResponseEntity<List<ProjectResponse>> getProjects() {

        List<ProjectResponse> projects =
                projectService.getAllProjects();

        return new ResponseEntity<>(
                projects,
                HttpStatus.OK
        );
    }

    // READ BY ID
    @GetMapping("id/{id}")
    public ResponseEntity<ProjectResponse> findById(
            @PathVariable String id) {

        ProjectResponse project =
                projectService.getProjectById(id);

        return new ResponseEntity<>(
                project,
                HttpStatus.OK
        );
    }

    // UPDATE
    @PutMapping("update/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectRequest request) {

        ProjectResponse updatedProject =
                projectService.updateProject(id, request);

        return new ResponseEntity<>(
                updatedProject,
                HttpStatus.OK
        );
    }

    // DELETE
    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String id) {

        projectService.deleteProject(id);

        return new ResponseEntity<>(
                HttpStatus.NO_CONTENT
        );
    }
}