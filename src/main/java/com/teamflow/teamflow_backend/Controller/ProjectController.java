
        package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.Entity.Project;
import com.teamflow.teamflow_backend.Service.ProjectService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    // 1. CREATE: Returns 201 Created along with the saved Project object
    @PostMapping("create")
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        Project savedProject = projectService.createProject(project);
        return new ResponseEntity<>(savedProject, HttpStatus.CREATED);
    }

    // 2. READ ALL: Returns 200 OK along with the list of projects
    @GetMapping("allprojects")
    public ResponseEntity<List<Project>> getProjects() {
        List<Project> projects = projectService.getAllProjects();
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }

    // 3. READ BY ID: Returns 200 OK if found, or 404 NOT FOUND
    @GetMapping("id/{id}")
    public ResponseEntity<Project> findById(@PathVariable Integer id) {
        Optional<Project> project =
                Optional.ofNullable(projectService.getProjectById(id));

        if (project.isPresent()) {
            return new ResponseEntity<>(project.get(), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // 4. UPDATE: Returns 200 OK with updated data, or 404 NOT FOUND
    @PutMapping("update/{id}")
    public ResponseEntity<Project> updateProject(
            @PathVariable Integer id,
            @RequestBody Project projectDetails) {

        Optional<Project> updatedProject =
                Optional.ofNullable(
                        projectService.updateProject(id, projectDetails)
                );

        if (updatedProject.isPresent()) {
            return new ResponseEntity<>(updatedProject.get(), HttpStatus.OK);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    // 5. DELETE: Returns 204 NO CONTENT on successful deletion
    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Integer id) {

        Optional<Project> existingProject =
                Optional.ofNullable(projectService.getProjectById(id));

        if (existingProject.isPresent()) {
            projectService.deleteProject(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
