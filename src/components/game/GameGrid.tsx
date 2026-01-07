import { SimpleGrid, Text, Center, Spinner, Box, Button, useToast, Icon } from "@chakra-ui/react";
import { FaSave } from "react-icons/fa";
import { useEffect, useState } from "react";
import GameCard from "./GameCard";
import APIClient from "../../services/APIClient";
import { Game } from "../../types";
import { BlurFade } from "../ui/BlurFade";
import CustomToast from "../ui/CustomToast";

interface Props {
    searchText: string;
    genre: string;
    onSelectGame: (game: Game) => void;
    adminMode?: 'none' | 'add' | 'modify' | 'delete';
    refreshKey?: number;
    onRefresh?: () => void;
}

const GameGrid = ({ searchText, genre, onSelectGame, adminMode, refreshKey, onRefresh }: Props) => {
    const [games, setGames] = useState<Game[]>([]);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [draggedGameId, setDraggedGameId] = useState<number | null>(null);
    const [isOrderDirty, setIsOrderDirty] = useState(false);
    const toast = useToast();

    useEffect(() => {
        const fetchGames = async () => {
            setIsLoading(true);
            try {
                let data: Game[];
                if (searchText) {
                    data = await APIClient.searchGames(searchText);
                } else {
                    data = await APIClient.getAllGames();
                }

                if (genre && genre !== "All") {
                    data = data.filter(g => g.genres && g.genres.includes(genre));
                }

                setGames(data);
                setIsOrderDirty(false); // Reset dirty state on fresh load
                setError("");
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch games");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGames();
    }, [searchText, genre, refreshKey]);

    const handleDragStart = (e: React.DragEvent, id: number) => {
        setDraggedGameId(id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent, targetId: number) => {
        e.preventDefault();
        if (draggedGameId === null || draggedGameId === targetId) return;

        // Dynamic Reflow: Swap items in local state immediately
        const fromIndex = games.findIndex(g => g.id === draggedGameId);
        const toIndex = games.findIndex(g => g.id === targetId);

        if (fromIndex !== -1 && toIndex !== -1) {
            const newGames = [...games];
            const [movedGame] = newGames.splice(fromIndex, 1);
            newGames.splice(toIndex, 0, movedGame);
            setGames(newGames);
            setIsOrderDirty(true);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        // The swap already happened in handleDragOver
        setDraggedGameId(null);
    };

    const handleSaveOrder = async () => {
        setIsLoading(true);
        try {
            const gameIds = games.map(g => g.id);
            await APIClient.reorderGames(gameIds);
            setIsOrderDirty(false);
            toast({
                position: "top-right",
                duration: 4000,
                render: ({ onClose }) => (
                    <CustomToast
                        title="Arrangement Saved"
                        description="The library order has been updated successfully."
                        status="success"
                        onClose={onClose}
                    />
                ),
            });
            if (onRefresh) onRefresh();
        } catch (err) {
            toast({
                position: "top-right",
                duration: 5000,
                render: ({ onClose }) => (
                    <CustomToast
                        title="Save Failed"
                        description="Could not persist the new arrangement. Please try again."
                        status="error"
                        onClose={onClose}
                    />
                ),
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (error) return (
        <Center height="50vh">
            <Text color="red.500" fontSize="lg">Error: {error}</Text>
        </Center>
    );

    if (isLoading && games.length === 0) return (
        <Center height="50vh">
            <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.700" color="green.500" />
        </Center>
    );

    if (games.length === 0 && !isLoading) return (
        <Center height="50vh">
            <Text fontSize="xl" color="gray.500">No games found.</Text>
        </Center>
    );

    const isModify = adminMode === 'modify' && !searchText && (!genre || genre === "All");
    const isSearchOrFilter = searchText || (genre && genre !== "All");

    return (
        <Box position="relative">
            {adminMode === 'modify' && isSearchOrFilter && (
                <Text color="orange.400" fontSize="sm" mb={4} textAlign="center" fontWeight="bold">
                    ⚠️ REORDERING DISABLED DURING SEARCH/FILTERING. PLEASE CLEAR FILTERS TO ARRANGE GAMES.
                </Text>
            )}

            {isModify && isOrderDirty && (
                <Box
                    position="fixed"
                    bottom="40px"
                    left="50%"
                    transform="translateX(-50%)"
                    zIndex={1000}
                    animation="slideUp 0.3s ease-out"
                >
                    <Button
                        leftIcon={<Icon as={FaSave} />}
                        colorScheme="green"
                        size="lg"
                        boxShadow="0 0 20px rgba(72, 187, 120, 0.6)"
                        onClick={handleSaveOrder}
                        isLoading={isLoading}
                        loadingText="SAVING..."
                        borderRadius="full"
                        px={8}
                        fontFamily="'Minecraftia', sans-serif"
                    >
                        SAVE NEW ARRANGEMENT
                    </Button>
                </Box>
            )}
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 7, "2xl": 9 }} spacing={5} padding="10px">
                {games.map((game) => (
                    <React.Fragment key={game.id}>
                        <div
                            draggable={isModify}
                            onDragStart={(e: React.DragEvent) => isModify && handleDragStart(e, game.id)}
                            onDragOver={(e: React.DragEvent) => isModify && handleDragOver(e, game.id)}
                            onDrop={(e: React.DragEvent) => isModify && handleDrop(e)}
                            style={{
                                cursor: isModify ? 'grab' : 'default',
                                opacity: draggedGameId === game.id ? 0.3 : 1, // Visual feedback during drag
                                transition: "opacity 0.2s"
                            }}
                        >
                            <BlurFade
                                delay={isModify ? 0 : (Math.abs(Math.sin(game.id)) * 0.4)} // Snappy burst random reveal
                                inView
                                layout // This is CRITICAL for smooth reflow
                                layoutId={game.id.toString()}
                            >
                                <GameCard
                                    game={game}
                                    onClick={() => onSelectGame(game)}
                                    adminMode={adminMode === 'add' ? 'none' : adminMode}
                                    onRefresh={onRefresh}
                                />
                            </BlurFade>
                        </div>
                    </React.Fragment>
                ))}
            </SimpleGrid>
        </Box>
    );
};


// Need React for Fragment if not imported, or just use <>...</> but Fragment is safer with key
import React from 'react';

export default GameGrid;
