package com.example.gamelibrary.controller;

import com.example.gamelibrary.dto.GameRequestDTO;
import com.example.gamelibrary.dto.GameResponseDTO;
import com.example.gamelibrary.service.GameService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")

public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("pong");
    }

    @PostMapping
    public ResponseEntity<GameResponseDTO> addGame(@RequestBody GameRequestDTO dto) {
        return new ResponseEntity<>(gameService.addGame(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GameResponseDTO> updateGame(@PathVariable Long id, @RequestBody GameRequestDTO dto) {
        return ResponseEntity.ok(gameService.updateGame(id, dto));
    }

    @GetMapping
    public ResponseEntity<List<GameResponseDTO>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameResponseDTO> getGameById(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getGameById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<GameResponseDTO>> searchGames(@RequestParam("q") String query) {
        return ResponseEntity.ok(gameService.searchGames(query));
    }

    // Changed to /save-order to avoid any potential internal conflicts
    @PostMapping(value = "/save-order")
    public ResponseEntity<Void> reorderGames(@RequestBody List<Long> gameIds) {
        gameService.reorderGames(gameIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGame(@PathVariable Long id) {
        gameService.deleteGame(id);
        return ResponseEntity.noContent().build();
    }
}
