package com.neovero.nsi.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "global_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GlobalRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String sourceColumnName;
    private String targetMappingField;
    private String description;
}
