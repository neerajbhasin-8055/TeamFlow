package com.teamflow.teamflow_backend.Controller;

import com.teamflow.teamflow_backend.DTO.Project.ProjectResponse;
import com.teamflow.teamflow_backend.DTO.Team.CreateTeamRequest;
import com.teamflow.teamflow_backend.DTO.Team.TeamResponse;
import com.teamflow.teamflow_backend.DTO.Team.UpdateTeamRequest;
import com.teamflow.teamflow_backend.DTO.User.UserResponse;
import com.teamflow.teamflow_backend.Service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    // CREATE
    @PostMapping("create")
    public ResponseEntity<TeamResponse> create(
            @Valid @RequestBody CreateTeamRequest request) {

        TeamResponse team =
                teamService.createTeam(request);

        return new ResponseEntity<>(
                team,
                HttpStatus.CREATED
        );
    }

    // GET ALL TEAMS
    @GetMapping("allteams")
    public ResponseEntity<List<TeamResponse>> getAllTeams() {

        List<TeamResponse> teams =
                teamService.getAllTeams();

        return new ResponseEntity<>(
                teams,
                HttpStatus.OK
        );
    }

    // GET TEAM BY ID
    @GetMapping("/{id}")
    public ResponseEntity<TeamResponse> getTeam(
            @PathVariable String id) {

        TeamResponse team =
                teamService.getTeamById(id);

        return new ResponseEntity<>(
                team,
                HttpStatus.OK
        );
    }

    // UPDATE TEAM
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(
            @Valid @RequestBody UpdateTeamRequest request,
            @PathVariable String id) {

        TeamResponse team =
                teamService.updateTeam(request, id);

        return new ResponseEntity<>(
                team,
                HttpStatus.OK
        );
    }

    // DELETE TEAM
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(
            @PathVariable String id) {

        teamService.deleteTeam(id);

        return new ResponseEntity<>(
                HttpStatus.NO_CONTENT
        );
    }

    // ADD MEMBER
    @PostMapping("/{teamId}/members/{userId}")
    public ResponseEntity<TeamResponse> addMember(
            @PathVariable String teamId,
            @PathVariable String userId) {

        TeamResponse team =
                teamService.addMember(teamId, userId);

        return new ResponseEntity<>(
                team,
                HttpStatus.OK
        );
    }

    // REMOVE MEMBER
    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String teamId,
            @PathVariable String userId) {

        teamService.removeMember(teamId, userId);

        return new ResponseEntity<>(
                HttpStatus.NO_CONTENT
        );
    }

    // GET ALL USERS OF TEAM
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @PathVariable String teamId) {

        List<UserResponse> users =
                teamService.getAllUsers(teamId);

        return new ResponseEntity<>(
                users,
                HttpStatus.OK
        );
    }

    // ADD PROJECT
    @PostMapping("/{teamId}/projects/{projectId}")
    public ResponseEntity<TeamResponse> addProject(
            @PathVariable String teamId,
            @PathVariable String projectId) {

        TeamResponse team =
                teamService.addProject(teamId, projectId);

        return new ResponseEntity<>(
                team,
                HttpStatus.OK
        );
    }

    // REMOVE PROJECT
    @DeleteMapping("/{teamId}/projects/{projectId}")
    public ResponseEntity<Void> removeProject(
            @PathVariable String teamId,
            @PathVariable String projectId) {

        teamService.removeProject(teamId, projectId);

        return new ResponseEntity<>(
                HttpStatus.NO_CONTENT
        );
    }

    // GET ALL PROJECTS OF TEAM
    @GetMapping("/{teamId}/projects")
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            @PathVariable String teamId) {

        List<ProjectResponse> projects =
                teamService.getAllProjects(teamId);

        return new ResponseEntity<>(
                projects,
                HttpStatus.OK
        );
    }

    // GET TEAMS FOR USER
    @GetMapping("user/{userId}")
    public ResponseEntity<List<TeamResponse>> getTeamsForUser(
            @PathVariable String userId) {

        List<TeamResponse> teams =
                teamService.getTeamsForUser(userId);

        return new ResponseEntity<>(
                teams,
                HttpStatus.OK
        );
    }

    // GET TEAMS CREATED BY USER
    @GetMapping("created-by/{userId}")
    public ResponseEntity<List<TeamResponse>> getTeamsCreatedByUser(
            @PathVariable String userId) {

        List<TeamResponse> teams =
                teamService.getTeamsCreatedBy(userId);

        return new ResponseEntity<>(
                teams,
                HttpStatus.OK
        );
    }
}