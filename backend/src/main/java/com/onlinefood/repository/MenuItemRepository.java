package com.onlinefood.repository;

import com.onlinefood.entity.MenuItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    @Query("SELECT m FROM MenuItem m WHERE " +
           "(:category IS NULL OR :category = '' OR m.category = :category) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(m.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<MenuItem> searchMenuItems(@Param("category") String category, @Param("search") String search, Pageable pageable);
}
