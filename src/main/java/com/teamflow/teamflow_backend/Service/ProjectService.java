package com.teamflow.teamflow_backend.Service;

import com.teamflow.teamflow_backend.DTO.Project.CreateProjectRequest;
import com.teamflow.teamflow_backend.DTO.Project.ProjectResponse;
import com.teamflow.teamflow_backend.DTO.Project.UpdateProjectRequest;
import com.teamflow.teamflow_backend.Entity.Project;
import com.teamflow.teamflow_backend.Repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    // CREATE
    public ProjectResponse createProject(CreateProjectRequest request) {

        // DTO -> Entity
        Project project = new Project();

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());
        project.setManagerId(request.getManagerId());
        project.setTeamId(request.getTeamId());

        project.setCreatedAt(new Date());
        project.setUpdatedAt(new Date());

        // Save Entity
        Project savedProject = projectRepository.save(project);

        // Entity -> DTO
        return convertToResponse(savedProject);
    }


    // GET ALL
    public List<ProjectResponse> getAllProjects() {

        return projectRepository.findAll()
                .stream()
                .map(this::convertToResponse)     // shorter way of writing .map(project->convertToResponse
                .toList();
    }


    // GET BY ID
    public ProjectResponse getProjectById(String id) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        return convertToResponse(project);
    }


    // UPDATE
    public ProjectResponse updateProject(String id, UpdateProjectRequest request) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // DTO -> Existing Entity
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());
        project.setManagerId(request.getManagerId());
        project.setTeamId(request.getTeamId());

        project.setUpdatedAt(new Date());

        Project updatedProject = projectRepository.save(project);

        // Entity -> DTO
        return convertToResponse(updatedProject);
    }


    // DELETE
    public void deleteProject(String id) {

        if (!projectRepository.existsById(id)) {
            throw new RuntimeException("Project not found");
        }

        projectRepository.deleteById(id);
    }


    // ENTITY -> RESPONSE DTO
    private ProjectResponse convertToResponse(Project project) {

        ProjectResponse response = new ProjectResponse();

        response.setId(project.getId());
        response.setName(project.getName());
        response.setDescription(project.getDescription());
        response.setStatus(project.getStatus());
        response.setStartDate(project.getStartDate());
        response.setDeadline(project.getDeadline());
        response.setCreatedAt(project.getCreatedAt());
        response.setUpdatedAt(project.getUpdatedAt());
        response.setManagerId(project.getManagerId());
        response.setTeamId(project.getTeamId());

        return response;
    }
}