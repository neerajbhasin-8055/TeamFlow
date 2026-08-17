package com.teamflow.teamflow_backend.Repository;

import com.teamflow.teamflow_backend.Entity.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProjectRepository extends MongoRepository<Project,String> {
}
