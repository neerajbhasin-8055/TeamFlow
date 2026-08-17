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

    // 1. CREATE
    @PostMapping("create")
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody CreateProjectRequest request) {

        ProjectResponse savedProject =
                projectService.createProject(request);

        return new ResponseEntity<>(savedProject, HttpStatus.CREATED);
    }


    // 2. READ ALL
    @GetMapping("allprojects")
    public ResponseEntity<?> getProjects() {

        List<ProjectResponse> projects = projectService.getAllProjects();

        if (projects.isEmpty()) {
            return new ResponseEntity<>(
                    "No projects found",
                    HttpStatus.NOT_FOUND
            );
        }

        return new ResponseEntity<>(projects, HttpStatus.OK);
    }


    // 3. READ BY ID
    @GetMapping("id/{id}")
    public ResponseEntity<ProjectResponse> findById(
            @PathVariable String id) {

        ProjectResponse project =
                projectService.getProjectById(id);

        if (project != null) {
            return new ResponseEntity<>(project, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


    // 4. UPDATE
    @PutMapping("update/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable String id,
            @Valid @RequestBody UpdateProjectRequest request) {

        ProjectResponse updatedProject =
                projectService.updateProject(id, request);

        if (updatedProject != null) {
            return new ResponseEntity<>(updatedProject, HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }


    // 5. DELETE
    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable String id) {

        projectService.deleteProject(id);

        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}