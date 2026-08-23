package com.teamflow.teamflow_backend.Service;

import com.teamflow.teamflow_backend.DTO.Team.CreateTeamRequest;
import com.teamflow.teamflow_backend.DTO.Team.TeamResponse;
import com.teamflow.teamflow_backend.DTO.Team.UpdateTeamRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;
import com.teamflow.teamflow_backend.Entity.Team;
import com.teamflow.teamflow_backend.Entity.User;
import com.teamflow.teamflow_backend.Exception.BadRequestException;
import com.teamflow.teamflow_backend.Exception.DuplicateResourceException;
import com.teamflow.teamflow_backend.Exception.ResourceNotFoundException;
import com.teamflow.teamflow_backend.Repository.TeamRepository;
import com.teamflow.teamflow_backend.Repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import com.teamflow.teamflow_backend.DTO.Project.ProjectResponse;

import com.teamflow.teamflow_backend.Entity.Project;

import com.teamflow.teamflow_backend.Repository.ProjectRepository;
@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    public TeamService(TeamRepository teamRepository, UserRepository userRepository, ProjectRepository projectRepository) {
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }

    public TeamResponse createTeam(CreateTeamRequest request) {
        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setCreatedAt(new Date());
        team.setUpdatedAt(new Date());
        team.setMemberIds(new ArrayList<>());
        team.setProjectIds(new ArrayList<>());

        Team savedResponse = teamRepository.save(team);
        return convertToResponse(savedResponse);
    }

    public TeamResponse updateTeam(UpdateTeamRequest request, String id) {
        Team team = teamRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setUpdatedAt(new Date());

        Team savedTeam = teamRepository.save(team);
        return convertToResponse(savedTeam);
    }

    public List<TeamResponse> getAllTeams() {
        return teamRepository.findAll().stream().map(this::convertToResponse).toList();
    }

    public TeamResponse getTeamById(String id) {
        Team team = teamRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("team not found"));
        return convertToResponse(team);
    }

    public void deleteTeam(String id) {
        Team team = teamRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        teamRepository.delete(team);
    }

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

    public TeamResponse addMember(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<String> memeberIds = team.getMemberIds();
        if (memeberIds.contains(userId)) {
            throw new DuplicateResourceException("User already belongs to the team");
        }
        memeberIds.add(userId);
        team.setMemberIds(memeberIds);
        team.setUpdatedAt(new Date());
        teamRepository.save(team);
        return convertToResponse(team);
    }

    public void removeMember(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        List<String> memberIds = team.getMemberIds();
        if (memberIds.contains(userId)) {
            memberIds.remove(userId);
            team.setMemberIds(memberIds);
            team.setUpdatedAt(new Date());
            teamRepository.save(team);
        } else {
            throw new BadRequestException("User is not a member");
        }
    }

    public List<UserResponse> getAllUsers(String teamId) {
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        List<String> memberIds = team.getMemberIds();
        List<User> allUsers = userRepository.findAllById(memberIds);
        return allUsers.stream().map(this::convertToUserResponse).toList();
    }

    public UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        return response;

    }

    public TeamResponse addProject(String teamId, String projectId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        List<String> projectIds = team.getProjectIds();

        if (projectIds.contains(projectId)) {
            throw new DuplicateResourceException("Project already belongs to the team");
        }

        projectIds.add(projectId);
        team.setProjectIds(projectIds);
        team.setUpdatedAt(new Date());

        teamRepository.save(team);

        return convertToResponse(team);
    }

    public void removeProject(String teamId, String projectId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        List<String> projectIds = team.getProjectIds();

        if (!projectIds.contains(projectId)) {
            throw new ResourceNotFoundException("Project is not associated with the team");
        }

        projectIds.remove(projectId);
        team.setProjectIds(projectIds);
        team.setUpdatedAt(new Date());

        teamRepository.save(team);
    }

    public List<ProjectResponse> getAllProjects(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

        List<String> projectIds = team.getProjectIds();

        List<Project> projects = projectRepository.findAllById(projectIds);

        return projects.stream()
                .map(this::convertToProjectResponse)
                .toList();
    }
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

    public List<TeamResponse> getTeamsForUser(String userId) {

        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Team> teams = teamRepository.findByMemberIdsContaining(userId);

        return teams.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public List<TeamResponse> getTeamsCreatedBy(String userId){
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Team> teams = teamRepository.findByCreatedBy(userId);

        return teams.stream().map(this::convertToResponse).toList();
    }

}




