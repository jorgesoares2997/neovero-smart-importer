package com.neovero.nsi.controller;

import com.neovero.nsi.dto.MappingResponse;
import com.neovero.nsi.service.ExcelImportService;
import com.neovero.nsi.service.GeminiMatcherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/import")
@CrossOrigin(origins = "*") // For Next.js local dev
public class ImportController {

    private final ExcelImportService excelImportService;
    private final GeminiMatcherService geminiMatcherService;

    public ImportController(ExcelImportService excelImportService, GeminiMatcherService geminiMatcherService) {
        this.excelImportService = excelImportService;
        this.geminiMatcherService = geminiMatcherService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<MappingResponse> analyzeFile(@RequestParam("file") MultipartFile file) {
        try {
            List<List<String>> sample = excelImportService.extractSampleRows(file, 20);
            MappingResponse mapping = geminiMatcherService.analyzeSample(sample);
            return ResponseEntity.ok(mapping);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/preview")
    public ResponseEntity<?> previewFile(@RequestParam("file") MultipartFile file, 
                                         @RequestPart("mapping") MappingResponse mapping) {
        // Here we would process the file fully into memory, apply rules, find duplicates, and return a JSON list of EquipmentAsset
        // For brevity and scope, we will return a stub or actual basic processing
        return ResponseEntity.ok(Map.of("message", "Preview generated successfully (Stub)", "data", List.of()));
    }

    @PostMapping("/export")
    public ResponseEntity<byte[]> exportFile(@RequestParam("file") MultipartFile file,
                                             @RequestPart("mapping") MappingResponse mapping) {
        // Generate the final Excel
        byte[] excelBytes = excelImportService.generateFinalExcel(file, mapping);
        
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=neovero_import.xlsx")
                .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                .body(excelBytes);
    }
}
