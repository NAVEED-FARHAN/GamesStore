package com.example.gamelibrary.service;

import com.example.gamelibrary.dto.GameRequestDTO;
import com.example.gamelibrary.dto.GameResponseDTO;
import com.example.gamelibrary.entity.Game;
import com.example.gamelibrary.repository.GameRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    public GameResponseDTO addGame(GameRequestDTO dto) {
        // If sortOrder not provided, put at the end
        Integer sortOrder = dto.getSortOrder();
        if (sortOrder == null) {
            sortOrder = (int) gameRepository.count();
        }

        Game game = new Game(
                dto.getTitle(),
                dto.getDescription(),
                dto.getReleaseDate(),
                dto.getRating(),
                dto.getGenres(),
                dto.getPlatforms(),
                dto.getCoverImageUrl(),
                dto.getBannerImageUrl(),
                dto.getTrailerUrl(),
                dto.getMoreInfoUrl(),
                dto.getScreenshots(),
                sortOrder); // Use calculated sortOrder

        Game savedGame = gameRepository.save(game);
        return mapToResponseDTO(savedGame);
    }

    public GameResponseDTO updateGame(Long id, GameRequestDTO dto) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));

        game.setTitle(dto.getTitle());
        game.setDescription(dto.getDescription());
        game.setReleaseDate(dto.getReleaseDate());
        game.setRating(dto.getRating());
        game.setGenres(dto.getGenres());
        game.setPlatforms(dto.getPlatforms());
        game.setCoverImageUrl(dto.getCoverImageUrl());
        game.setBannerImageUrl(dto.getBannerImageUrl());
        game.setTrailerUrl(dto.getTrailerUrl());
        game.setMoreInfoUrl(dto.getMoreInfoUrl());
        game.setScreenshots(dto.getScreenshots());
        game.setSortOrder(dto.getSortOrder());

        Game updatedGame = gameRepository.save(game);
        return mapToResponseDTO(updatedGame);
    }

    public List<GameResponseDTO> getAllGames() {
        List<Game> games = gameRepository.findAllByOrderBySortOrderAscIdAsc();
        boolean changed = false;
        for (int i = 0; i < games.size(); i++) {
            Game g = games.get(i);
            if (g.getSortOrder() == null) {
                g.setSortOrder(i);
                gameRepository.save(g);
                changed = true;
            }
        }
        if (changed) {
            games = gameRepository.findAllByOrderBySortOrderAscIdAsc();
        }
        return games.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public GameResponseDTO getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Game not found with id: " + id));
        return mapToResponseDTO(game);
    }

    public List<GameResponseDTO> searchGames(String query) {
        return gameRepository.findByTitleContainingIgnoreCaseOrderBySortOrderAscIdAsc(query).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    public void reorderGames(List<Long> gameIds) {
        for (int i = 0; i < gameIds.size(); i++) {
            Long id = gameIds.get(i);
            Game game = gameRepository.findById(id).orElse(null);
            if (game != null) {
                game.setSortOrder(i);
                gameRepository.save(game);
            }
        }
    }

    public void deleteGame(Long id) {
        if (!gameRepository.existsById(id)) {
            throw new RuntimeException("Game not found with id: " + id);
        }
        gameRepository.deleteById(id);
    }

    private GameResponseDTO mapToResponseDTO(Game game) {
        GameResponseDTO dto = new GameResponseDTO();
        dto.setId(game.getId());
        dto.setTitle(game.getTitle());
        dto.setDescription(game.getDescription());
        dto.setReleaseDate(game.getReleaseDate());
        dto.setRating(game.getRating());
        dto.setGenres(game.getGenres());
        dto.setPlatforms(game.getPlatforms());
        dto.setCoverImageUrl(game.getCoverImageUrl());
        dto.setBannerImageUrl(game.getBannerImageUrl());
        dto.setTrailerUrl(game.getTrailerUrl());
        dto.setMoreInfoUrl(game.getMoreInfoUrl());
        dto.setScreenshots(game.getScreenshots());
        dto.setSortOrder(game.getSortOrder());
        return dto;
    }
}
