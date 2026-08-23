package com.teamflow.teamflow_backend.Repository;

import com.teamflow.teamflow_backend.Entity.Team;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TeamRepository extends MongoRepository<Team,String> {
    List<Team> findByMemberIdsContaining(String userId);
    List<Team> findByCreatedBy(String userId);
}
