
        package com.teamflow.teamflow_backend.Service;

import com.teamflow.teamflow_backend.DTO.Project.ProjectResponse;
import com.teamflow.teamflow_backend.DTO.Team.CreateTeamRequest;
import com.teamflow.teamflow_backend.DTO.Team.TeamResponse;
import com.teamflow.teamflow_backend.DTO.Team.UpdateTeamRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;
import com.teamflow.teamflow_backend.Entity.Project;
import com.teamflow.teamflow_backend.Entity.Team;
import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Exception.BadRequestException;
import com.teamflow.teamflow_backend.Exception.DuplicateResourceException;
import com.teamflow.teamflow_backend.Exception.ForbiddenException;
import com.teamflow.teamflow_backend.Exception.ResourceNotFoundException;
import com.teamflow.teamflow_backend.Repository.ProjectRepository;
import com.teamflow.teamflow_backend.Repository.TeamRepository;
import com.teamflow.teamflow_backend.Repository.UserRepository;
import com.teamflow.teamflow_backend.Security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;


    // =========================================================
    // CREATE TEAM
    // =========================================================

    public TeamResponse createTeam(CreateTeamRequest request) {

        String email = SecurityUtil.getCurrentUserEmail();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Team team = new Team();

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setCreatedAt(new Date());
        team.setUpdatedAt(new Date());
        team.setMemberIds(new ArrayList<>());
        team.setProjectIds(new ArrayList<>());

        // The logged-in user automatically becomes the creator
        team.setCreatedBy(currentUser.getId());

        Team savedTeam = teamRepository.save(team);

        return convertToResponse(savedTeam);
    }


    // =========================================================
    // UPDATE TEAM
    // =========================================================

    public TeamResponse updateTeam(UpdateTeamRequest request, String id) {

        Team team = teamRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        User currentUser = getCurrentUser();

        String teamCreatorId = team.getCreatedBy();
        String currentUserId = currentUser.getId();

        // Only the team creator can update the team
        if (!teamCreatorId.equals(currentUserId)) {
            throw new ForbiddenException(
                    "You are not allowed to update this team");
        }

        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setUpdatedAt(new Date());

        Team savedTeam = teamRepository.save(team);

        return convertToResponse(savedTeam);
    }


    // =========================================================
    // GET ALL TEAMS
    // =========================================================

    public List<TeamResponse> getAllTeams() {

        return teamRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET TEAM BY ID
    // =========================================================

    public TeamResponse getTeamById(String id) {

        Team team = teamRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        return convertToResponse(team);
    }


    // =========================================================
    // DELETE TEAM
    // =========================================================

    public void deleteTeam(String id) {

        Team team = teamRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        User currentUser = getCurrentUser();

        String teamCreatorId = team.getCreatedBy();
        String currentUserId = currentUser.getId();

        // Only the team creator can delete the team
        if (!teamCreatorId.equals(currentUserId)) {
            throw new ForbiddenException(
                    "You are not allowed to delete this team");
        }

        teamRepository.delete(team);
    }


    // =========================================================
    // ADD MEMBER
    // =========================================================

    public TeamResponse addMember(String teamId, String userId) {

        // Only MANAGER and ADMIN can manage team members
        checkManagerOrAdmin();

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<String> memberIds = team.getMemberIds();

        if (memberIds.contains(userId)) {
            throw new DuplicateResourceException(
                    "User already belongs to the team");
        }

        memberIds.add(userId);

        team.setMemberIds(memberIds);
        team.setUpdatedAt(new Date());

        teamRepository.save(team);

        return convertToResponse(team);
    }


    // =========================================================
    // REMOVE MEMBER
    // =========================================================

    public void removeMember(String teamId, String userId) {

        // Only MANAGER and ADMIN can manage team members
        checkManagerOrAdmin();

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        List<String> memberIds = team.getMemberIds();

        if (!memberIds.contains(userId)) {
            throw new BadRequestException(
                    "User is not a member");
        }

        memberIds.remove(userId);

        team.setMemberIds(memberIds);
        team.setUpdatedAt(new Date());

        teamRepository.save(team);
    }


    // =========================================================
    // GET ALL USERS IN TEAM
    // =========================================================

    public List<UserResponse> getAllUsers(String teamId) {

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        List<String> memberIds = team.getMemberIds();

        List<User> allUsers =
                userRepository.findAllById(memberIds);

        return allUsers.stream()
                .map(this::convertToUserResponse)
                .toList();
    }


    // =========================================================
    // ADD PROJECT
    // =========================================================

    public TeamResponse addProject(String teamId, String projectId) {

        // Only MANAGER and ADMIN can manage team projects
        checkManagerOrAdmin();

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Project not found"));

        List<String> projectIds = team.getProjectIds();

        if (projectIds.contains(projectId)) {
            throw new DuplicateResourceException(
                    "Project already belongs to the team");
        }

        projectIds.add(projectId);

        team.setProjectIds(projectIds);
        team.setUpdatedAt(new Date());

        teamRepository.save(team);

        return convertToResponse(team);
    }


    // =========================================================
    // REMOVE PROJECT
    // =========================================================

    public void removeProject(String teamId, String projectId) {

        // Only MANAGER and ADMIN can manage team projects
        checkManagerOrAdmin();

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        List<String> projectIds = team.getProjectIds();

        if (!projectIds.contains(projectId)) {
            throw new ResourceNotFoundException(
                    "Project is not associated with the team");
        }

        projectIds.remove(projectId);

        team.setProjectIds(projectIds);
        team.setUpdatedAt(new Date());

        teamRepository.save(team);
    }


    // =========================================================
    // GET ALL PROJECTS
    // =========================================================

    public List<ProjectResponse> getAllProjects(String teamId) {

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Team not found"));

        List<String> projectIds = team.getProjectIds();

        List<Project> projects =
                projectRepository.findAllById(projectIds);

        return projects.stream()
                .map(this::convertToProjectResponse)
                .toList();
    }


    // =========================================================
    // GET TEAMS FOR USER
    // =========================================================

    public List<TeamResponse> getTeamsForUser(String userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<Team> teams =
                teamRepository.findByMemberIdsContaining(userId);

        return teams.stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET TEAMS CREATED BY USER
    // =========================================================

    public List<TeamResponse> getTeamsCreatedBy(String userId) {

        userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        List<Team> teams =
                teamRepository.findByCreatedBy(userId);

        return teams.stream()
                .map(this::convertToResponse)
                .toList();
    }


    // =========================================================
    // GET CURRENT USER
    // =========================================================

    private User getCurrentUser() {

        String email = SecurityUtil.getCurrentUserEmail();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }


    // =========================================================
    // CHECK MANAGER OR ADMIN
    // =========================================================

    private void checkManagerOrAdmin() {

        User currentUser = getCurrentUser();

        switch (currentUser.getRole()) {

            case MANAGER, ADMIN -> {
                // Allowed
            }

            default -> throw new ForbiddenException(
                    "Only MANAGER or ADMIN can perform this action");
        }
    }


    // =========================================================
    // CONVERT TEAM → RESPONSE
    // =========================================================

    public TeamResponse convertToResponse(Team team) {

        TeamResponse response = new TeamResponse();

        response.setId(team.getId());
        response.setName(team.getName());
        response.setDescription(team.getDescription());
        response.setCreatedBy(team.getCreatedBy());
        response.setMemberIds(team.getMemberIds());
        response.setProjectIds(team.getProjectIds());
        response.setCreatedAt(team.getCreatedAt());
        response.setUpdatedAt(team.getUpdatedAt());

        return response;
    }


    // =========================================================
    // CONVERT USER → RESPONSE
    // =========================================================

    public UserResponse convertToUserResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());

        return response;
    }


    // =========================================================
    // CONVERT PROJECT → RESPONSE
    // =========================================================

    public ProjectResponse convertToProjectResponse(Project project) {

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

