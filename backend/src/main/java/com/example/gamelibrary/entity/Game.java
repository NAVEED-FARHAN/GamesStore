package com.example.gamelibrary.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDate releaseDate;

    private Double rating;

    @ElementCollection
    @CollectionTable(name = "game_genres", joinColumns = @JoinColumn(name = "game_id"))
    @Column(name = "genre")
    private List<String> genres;

    @ElementCollection
    @CollectionTable(name = "game_platforms", joinColumns = @JoinColumn(name = "game_id"))
    @Column(name = "platform")
    private List<String> platforms;

    @Column(columnDefinition = "TEXT")
    private String coverImageUrl;
    @Column(columnDefinition = "TEXT")
    private String bannerImageUrl;
    @Column(columnDefinition = "TEXT")
    private String trailerUrl;
    @Column(columnDefinition = "TEXT")
    private String moreInfoUrl;

    @ElementCollection
    @CollectionTable(name = "game_screenshots", joinColumns = @JoinColumn(name = "game_id"))
    @Column(name = "screenshot_url", columnDefinition = "TEXT")
    private List<String> screenshots;

    private Integer sortOrder;

    public Game() {
    }

    public Game(String title, String description, LocalDate releaseDate, Double rating, List<String> genres,
            List<String> platforms, String coverImageUrl, String bannerImageUrl, String trailerUrl, String moreInfoUrl,
            List<String> screenshots, Integer sortOrder) {
        this.title = title;
        this.description = description;
        this.releaseDate = releaseDate;
        this.rating = rating;
        this.genres = genres;
        this.platforms = platforms;
        this.coverImageUrl = coverImageUrl;
        this.bannerImageUrl = bannerImageUrl;
        this.trailerUrl = trailerUrl;
        this.moreInfoUrl = moreInfoUrl;
        this.screenshots = screenshots;
        this.sortOrder = sortOrder;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }

    public void setReleaseDate(LocalDate releaseDate) {
        this.releaseDate = releaseDate;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public List<String> getGenres() {
        return genres;
    }

    public void setGenres(List<String> genres) {
        this.genres = genres;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public String getCoverImageUrl() {
        return coverImageUrl;
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }

    public String getBannerImageUrl() {
        return bannerImageUrl;
    }

    public void setBannerImageUrl(String bannerImageUrl) {
        this.bannerImageUrl = bannerImageUrl;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public void setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
    }

    public String getMoreInfoUrl() {
        return moreInfoUrl;
    }

    public void setMoreInfoUrl(String moreInfoUrl) {
        this.moreInfoUrl = moreInfoUrl;
    }

    public List<String> getScreenshots() {
        return screenshots;
    }

    public void setScreenshots(List<String> screenshots) {
        this.screenshots = screenshots;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
