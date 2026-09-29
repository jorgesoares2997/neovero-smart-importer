package com.neovero.nsi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Long totalRowsProcessed;
    private Long totalImports;
    private Long completedImports;
    private Long pendingImports;
}
