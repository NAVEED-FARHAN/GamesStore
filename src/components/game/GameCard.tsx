import { Box, Image, Portal, IconButton, useColorModeValue } from "@chakra-ui/react";
import GlareHover from "../ui/GlareHover";
import HoverGameCard from "./HoverGameCard";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash } from "react-icons/fa";

import { Game } from "../../types";
import { useAudio } from "../../context/AudioContext";

interface GameCardProps {
    game: Game;
    onClick?: () => void;
    adminMode?: 'none' | 'modify' | 'delete';
    onRefresh?: () => void;
}

function GameCard({ game, onClick, adminMode = 'none', onRefresh }: GameCardProps) {
    const { playSFX } = useAudio();
    const [showHoverCard, setShowHoverCard] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const bg = useColorModeValue("white", "gray.800");

    const calculatePosition = () => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const cardWidth = 320; // Width of HoverGameCard
        const gap = 16;
        const widthWithGap = cardWidth + gap;

        // Default to right side
        let left = rect.right + gap;

        // If not enough space on right, check left
        if (left + cardWidth > viewportWidth) {
            left = rect.left - widthWithGap;
        }

        if (left < 0) {
            // Flip logic
        }

        // Vertical Alignment
        let top = rect.top;
        if (top + 400 > window.innerHeight) {
            top = window.innerHeight - 420;
        }

        setPosition({ top, left });
    };

    const handleMouseEnter = () => {
        hoverTimeout.current = setTimeout(() => {
            calculatePosition();
            setShowHoverCard(true);
        }, 1000); // Snappier delay (1s) as requested
        playSFX('card-hover-new.wav', 0.2);
    };

    const handleMouseLeave = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
        setShowHoverCard(false);
    };

    // Recalculate or hide on scroll
    useEffect(() => {
        if (showHoverCard) {
            const handleScroll = () => setShowHoverCard(false);
            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => window.removeEventListener("scroll", handleScroll);
        }
    }, [showHoverCard]);

    return (
        <>
            <Box
                ref={cardRef}
                position="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                    playSFX('card-click.wav');
                    onClick?.();
                }}
                cursor="pointer"
                transition="all 0.5s"
                _hover={{ transform: "scale(1.05)", zIndex: 1000 }}
                borderRadius="xl"
            >
                <Box overflow="hidden" borderRadius="xl">
                    <GlareHover
                        width="100%"
                        height="100%"
                        background="transparent"
                        borderRadius="inherit"
                        borderColor="transparent"
                        glareOpacity={0.3}
                        glareColor="#ffffff"
                    >
                        <Box bg={bg} h="100%" w="100%" position="relative">
                            <Image
                                src={game.coverImageUrl}
                                alt={game.title}
                                aspectRatio={2 / 3}
                                width="100%"
                                objectFit="cover"
                                fallbackSrc="https://via.placeholder.com/600x900?text=No+Cover"
                            />

                            {adminMode !== 'none' && (
                                <Box
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    w="100%"
                                    h="100%"
                                    bg={adminMode === 'delete' ? "rgba(100, 0, 0, 0.4)" : "rgba(0, 50, 100, 0.4)"}
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    zIndex={5}
                                    transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                    border="1px solid rgba(255, 255, 255, 0.2)"
                                    borderRadius="xl"
                                    _hover={{ bg: adminMode === 'delete' ? "rgba(150, 0, 0, 0.5)" : "rgba(0, 80, 150, 0.5)" }}
                                >
                                    {adminMode === 'modify' && (
                                        <IconButton
                                            aria-label="Edit"
                                            icon={<FaEdit />}
                                            colorScheme="cyan"
                                            size="lg"
                                            isRound
                                            variant="ghost"
                                            bg="rgba(255,255,255,0.1)"
                                            backdropFilter="blur(5px)"
                                            border="1px solid rgba(255,255,255,0.3)"
                                            _hover={{ bg: "rgba(255,255,255,0.2)", transform: "scale(1.1)" }}
                                        />
                                    )}
                                    {adminMode === 'delete' && (
                                        <IconButton
                                            aria-label="Delete"
                                            icon={<FaTrash />}
                                            colorScheme="red"
                                            size="lg"
                                            isRound
                                            variant="ghost"
                                            bg="rgba(255,0,0,0.2)"
                                            backdropFilter="blur(5px)"
                                            border="1px solid rgba(255,0,0,0.4)"
                                            _hover={{ bg: "rgba(255,0,0,0.3)", transform: "scale(1.1)" }}
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (window.confirm(`Are you sure you want to delete ${game.title}?`)) {
                                                    try {
                                                        const APIClient = (await import("../../services/APIClient")).default;
                                                        await APIClient.deleteGame(game.id);
                                                        onRefresh?.();
                                                    } catch (err) {
                                                        alert("Failed to delete game. If you recently updated the code, please restart your backend server (Spring Boot) and try again.");
                                                    }
                                                }
                                            }}
                                        />
                                    )}
                                </Box>
                            )}
                        </Box>
                    </GlareHover>
                </Box>
            </Box>

            <Portal>
                <AnimatePresence>
                    {showHoverCard && (
                        <Box
                            position="fixed"
                            top={position.top}
                            left={position.left}
                            zIndex={9999}
                        >
                            <HoverGameCard
                                title={game.title}
                                image={game.coverImageUrl}
                                genres={game.genres}
                                rating={game.rating}
                                reviewCount={12500}
                                releaseDate={game.releaseDate}
                                platforms={game.platforms}
                                description={game.description}
                                screenshots={game.screenshots}
                            />
                        </Box>
                    )}
                </AnimatePresence>
            </Portal>
        </>
    );
}

export default GameCard;
