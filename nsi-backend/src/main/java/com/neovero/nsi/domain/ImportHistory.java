package com.neovero.nsi.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "import_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalFilename;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime importDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ImportStatus status;

    private Integer totalRows;

    @Lob
    @Basic(fetch = FetchType.LAZY)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private byte[] processedFileData;
}
