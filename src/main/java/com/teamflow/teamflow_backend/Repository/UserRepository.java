package com.teamflow.teamflow_backend.Repository;

import com.teamflow.teamflow_backend.Entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User,String> {

}
