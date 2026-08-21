package com.teamflow.teamflow_backend.Repository;

import com.teamflow.teamflow_backend.Entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TaskRepository extends MongoRepository<Task,String> {
}
