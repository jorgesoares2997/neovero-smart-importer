package com.neovero.nsi.controller;

import com.neovero.nsi.domain.GlobalRule;
import com.neovero.nsi.repository.GlobalRuleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rules")
@CrossOrigin(origins = "*")
public class GlobalRuleController {

    private final GlobalRuleRepository repository;

    public GlobalRuleController(GlobalRuleRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<GlobalRule>> getAllRules() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<GlobalRule> createRule(@RequestBody GlobalRule rule) {
        return ResponseEntity.ok(repository.save(rule));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
