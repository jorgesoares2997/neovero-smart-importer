package com.neovero.nsi.repository;

import com.neovero.nsi.domain.ImportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImportHistoryRepository extends JpaRepository<ImportHistory, Long> {
    
    @org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(h.totalRows), 0) FROM ImportHistory h")
    Long sumTotalRows();
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(h) FROM ImportHistory h WHERE h.status = 'COMPLETED'")
    Long countCompletedImports();
    
    @org.springframework.data.jpa.repository.Query("SELECT COUNT(h) FROM ImportHistory h WHERE h.status = 'PENDING'")
    Long countPendingImports();
}
