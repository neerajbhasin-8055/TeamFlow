package com.teamflow.teamflow_backend.Service;

import com.teamflow.teamflow_backend.DTO.Project.CreateProjectRequest;
import com.teamflow.teamflow_backend.DTO.Project.ProjectResponse;
import com.teamflow.teamflow_backend.DTO.Project.UpdateProjectRequest;
import com.teamflow.teamflow_backend.ENUM.Role;
import com.teamflow.teamflow_backend.Entity.Project;
import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Exception.BadRequestException;
import com.teamflow.teamflow_backend.Exception.ForbiddenException;
import com.teamflow.teamflow_backend.Exception.ResourceNotFoundException;
import com.teamflow.teamflow_backend.Repository.ProjectRepository;
import com.teamflow.teamflow_backend.Repository.UserRepository;
import com.teamflow.teamflow_backend.Security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;


    // CREATE
    public ProjectResponse createProject(CreateProjectRequest request) {

        // DTO -> Entity
        System.out.println("🔥 CREATE PROJECT SERVICE REACHED");
        String email = SecurityUtil.getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User not found"));

        System.out.println(user.getEmail());
        System.out.println(user.getRole());
        Project project = new Project();

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());
        if(user.getRole() == Role.MANAGER){
            project.setManagerId(user.getId());
        }else if(user.getRole() == Role.ADMIN){
            String id = request.getManagerId();
            User requestedUser = userRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("User not found"));
            if(requestedUser.getRole() == Role.MANAGER){
                project.setManagerId(requestedUser.getId());
            }else{
                throw new BadRequestException("Selected user is not a manager");
            }
        }

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
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        return convertToResponse(project);
    }


    // UPDATE
    public ProjectResponse updateProject(String id, UpdateProjectRequest request) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // ADMIN can update any project
        // MANAGER can update only their own project
        if (user.getRole() != Role.ADMIN) {

            if (!user.getId().equals(project.getManagerId())) {
                throw new ForbiddenException(
                        "You are not allowed to update this project");
            }
        }

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus());
        project.setStartDate(request.getStartDate());
        project.setDeadline(request.getDeadline());
        project.setTeamId(request.getTeamId());

        // Only ADMIN can change the project manager
        if (user.getRole() == Role.ADMIN) {
            String managerId = request.getManagerId();

            User manager = userRepository.findById(managerId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Manager not found"));

            if (manager.getRole() != Role.MANAGER) {
                throw new BadRequestException(
                        "Selected user is not a MANAGER");
            }

            project.setManagerId(manager.getId());
        }

        project.setUpdatedAt(new Date());

        Project updatedProject = projectRepository.save(project);

        return convertToResponse(updatedProject);
    }



    // DELETE

    public void deleteProject(String id) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        String email = SecurityUtil.getCurrentUserEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        // ADMIN can delete any project
        // MANAGER can delete only their own project
        if (user.getRole() != Role.ADMIN) {

            if (!user.getId().equals(project.getManagerId())) {
                throw new ForbiddenException(
                        "You are not allowed to delete this project");
            }
        }

        projectRepository.delete(project);
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