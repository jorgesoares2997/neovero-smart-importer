package com.neovero.nsi.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Sector {
    private String code;
    private String description;
    private String groupSector;
    private String costCenterCode; // FK to CostCenter
}
