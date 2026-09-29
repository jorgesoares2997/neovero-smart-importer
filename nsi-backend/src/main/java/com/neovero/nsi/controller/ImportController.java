package com.neovero.nsi.controller;

import com.neovero.nsi.dto.MappingResponse;
import com.neovero.nsi.service.ExcelImportService;
import com.neovero.nsi.service.GeminiMatcherService;
import com.neovero.nsi.domain.ImportHistory;
import com.neovero.nsi.domain.ImportStatus;
import com.neovero.nsi.repository.ImportHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/import")
@CrossOrigin(origins = "*") // For Next.js local dev
public class ImportController {

    private final ExcelImportService excelImportService;
    private final GeminiMatcherService geminiMatcherService;
    private final ImportHistoryRepository importHistoryRepository;

    public ImportController(ExcelImportService excelImportService, GeminiMatcherService geminiMatcherService, ImportHistoryRepository importHistoryRepository) {
        this.excelImportService = excelImportService;
        this.geminiMatcherService = geminiMatcherService;
        this.importHistoryRepository = importHistoryRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<MappingResponse> analyzeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "instructions", required = false) String instructions) {
        try {
            List<List<String>> sample = excelImportService.extractSampleRows(file, 20);
            MappingResponse mapping = geminiMatcherService.analyzeSample(sample, instructions);
            
            // Extract available headers
            if (mapping != null && mapping.getHeaderRowIndex() != null && mapping.getHeaderRowIndex() < sample.size()) {
                mapping.setAvailableColumns(sample.get(mapping.getHeaderRowIndex()).stream()
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList());
            }
            
            return ResponseEntity.ok(mapping);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/preview")
    public ResponseEntity<?> previewFile(@RequestParam("file") MultipartFile file, 
                                         @RequestPart("mapping") MappingResponse mapping) {
        return ResponseEntity.ok(Map.of("message", "Preview generated successfully (Stub)", "data", List.of()));
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportFile(@RequestParam("file") MultipartFile file,
                                             @RequestPart("mapping") MappingResponse mapping) {
        byte[] excelBytes = excelImportService.generateFinalExcel(file, mapping);
        
        // Salva histórico no banco de dados Postgres
        ImportHistory history = ImportHistory.builder()
                .originalFilename(file.getOriginalFilename())
                .status(ImportStatus.COMPLETED)
                .processedFileData(excelBytes)
                .totalRows(0) // Could be parsed from service
                .build();
        importHistoryRepository.save(history);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=neovero_import.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excelBytes);
    }

    @GetMapping("/history")
    public ResponseEntity<List<ImportHistory>> getHistory() {
        return ResponseEntity.ok(importHistoryRepository.findAll(Sort.by(Sort.Direction.DESC, "importDate")));
    }

    @GetMapping("/history/{id}/download")
    public ResponseEntity<byte[]> downloadHistoryFile(@PathVariable Long id) {
        ImportHistory history = importHistoryRepository.findById(id).orElseThrow();
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=" + history.getOriginalFilename().replaceAll("\\.[^.]+$", "") + " NSI.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(history.getProcessedFileData());
    }
}
