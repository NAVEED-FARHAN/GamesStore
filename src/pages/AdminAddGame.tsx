import { useState } from "react";
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    HStack,
    IconButton,
    useToast,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    Textarea,
    Tag,
    TagLabel,
    TagCloseButton,
    Wrap,
    WrapItem
} from "@chakra-ui/react";
import { FaArrowLeft, FaPlus, FaSave } from "react-icons/fa";
import { motion } from "framer-motion";

import { Game } from "../types";
import APIClient from "../services/APIClient";

interface AdminAddGameProps {
    onBack: () => void;
    initialData?: Game;
}

const MotionBox = motion(Box);

const AdminAddGame = ({ onBack, initialData }: AdminAddGameProps) => {
    const toast = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        description: initialData?.description || "",
        releaseDate: initialData?.releaseDate || "",
        rating: initialData?.rating || 4.5,
        coverImageUrl: initialData?.coverImageUrl || "",
        bannerImageUrl: initialData?.bannerImageUrl || "",
        trailerUrl: initialData?.trailerUrl || "",
        moreInfoUrl: initialData?.moreInfoUrl || ""
    });

    const [genres, setGenres] = useState<string[]>(initialData?.genres || []);
    const [platforms, setPlatforms] = useState<string[]>(initialData?.platforms || []);
    const [screenshots, setScreenshots] = useState<string[]>(initialData?.screenshots || []);
    const [newScreenshot, setNewScreenshot] = useState("");

    const availableGenres = [
        "Action", "Adventure", "RPG", "Shooter", "Racing", "Sports", "Horror", "Open World", "Strategy", "Indie"
    ];

    const availablePlatforms = [
        "PC", "PS5", "Xbox Series X", "Switch", "PS4", "Xbox One", "Mobile", "MacOS", "Linux"
    ];

    const toggleGenre = (genre: string) => {
        if (genres.includes(genre)) {
            setGenres(genres.filter(g => g !== genre));
        } else {
            setGenres([...genres, genre]);
        }
    };

    const togglePlatform = (platform: string) => {
        if (platforms.includes(platform)) {
            setPlatforms(platforms.filter(p => p !== platform));
        } else {
            setPlatforms([...platforms, platform]);
        }
    };


    const handleAddScreenshot = () => {
        if (newScreenshot && !screenshots.includes(newScreenshot)) {
            setScreenshots([...screenshots, newScreenshot]);
            setNewScreenshot("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const sanitizedData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            releaseDate: formData.releaseDate === "" ? null : formData.releaseDate,
            rating: Number(formData.rating),
            coverImageUrl: formData.coverImageUrl.trim(),
            bannerImageUrl: formData.bannerImageUrl.trim(),
            trailerUrl: formData.trailerUrl.trim(),
            moreInfoUrl: formData.moreInfoUrl.trim()
        };

        const payload = {
            ...sanitizedData,
            genres: genres.filter(g => g.trim() !== ""),
            platforms: platforms.filter(p => p.trim() !== ""),
            screenshots: screenshots.filter(s => s.trim() !== "")
        };

        try {
            if (initialData) {
                // Ensure ID is passed as a number
                const updatedGame = await APIClient.updateGame({ ...payload, id: Number(initialData.id) } as any);

                // Persistence Fallback: Save extra fields to localStorage
                const extraData = {
                    trailerUrl: payload.trailerUrl,
                    moreInfoUrl: payload.moreInfoUrl
                };
                localStorage.setItem(`game_extra_${updatedGame.id}`, JSON.stringify(extraData));
                localStorage.setItem(`game_extra_${updatedGame.title}`, JSON.stringify(extraData));

                toast({
                    title: "Success",
                    description: "Game updated successfully! Syncing to local cache.",
                    status: "success",
                    duration: 3000,
                });
            } else {
                const newGame = await APIClient.addGame(payload as any);

                // Persistence Fallback
                const extraData = {
                    trailerUrl: payload.trailerUrl,
                    moreInfoUrl: payload.moreInfoUrl
                };
                localStorage.setItem(`game_extra_${newGame.id}`, JSON.stringify(extraData));
                localStorage.setItem(`game_extra_${newGame.title}`, JSON.stringify(extraData));

                toast({
                    title: "Success",
                    description: "Game added successfully!",
                    status: "success",
                    duration: 3000,
                });
            }
            onBack();
        } catch (error: any) {
            console.error("CRITICAL SAVE ERROR:", error);
            toast({
                title: "Error",
                description: `Failed to save: ${error.message || "Invalid Data"}. Please ensure title is unique.`,
                status: "error",
                duration: 5000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            p={8}
            minH="100vh"
            bg="transparent" // Allow AppBackground to show through
            color="white"
            fontFamily="'Minecraftia', sans-serif"
        >
            <Container maxW="container.md" pt={10}>
                <HStack mb={8} justify="space-between" backdropFilter="blur(20px)" bg="rgba(0, 0, 0, 0.3)" p={4} borderRadius="2xl" border="1px solid rgba(255,255,255,0.1)">
                    <HStack>
                        <IconButton
                            aria-label="Back"
                            icon={<FaArrowLeft />}
                            onClick={onBack}
                            variant="ghost"
                            colorScheme="whiteAlpha"
                            borderRadius="xl"
                            _hover={{ bg: "rgba(255,255,255,0.1)" }}
                        />
                        <Heading size="lg" color="white" fontWeight="normal" letterSpacing="wide">
                            {initialData ? `MOD MODIFYING` : "ADD NEW ENTRY"}
                        </Heading>
                    </HStack>
                </HStack>

                <form onSubmit={handleSubmit}>
                    <VStack
                        spacing={6}
                        align="stretch"
                        backdropFilter="blur(40px) saturate(180%)"
                        bg="rgba(0, 0, 0, 0.4)"
                        p={10}
                        borderRadius="3xl"
                        border="1px solid rgba(255, 255, 255, 0.15)"
                        boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.8)"
                    >
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">GAME TITLE</FormLabel>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="E.G. ELDEN RING"
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                borderRadius="xl"
                                height="50px"
                                _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                            />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">DESCRIPTION</FormLabel>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="DESCRIBE THE JOURNEY..."
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                borderRadius="xl"
                                rows={4}
                                _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                            />
                        </FormControl>

                        <HStack spacing={4}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" color="whiteAlpha.700">RELEASE DATE</FormLabel>
                                <Input
                                    type="date"
                                    value={formData.releaseDate}
                                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    bg="rgba(255, 255, 255, 0.05)"
                                    border="1px solid rgba(255, 255, 255, 0.1)"
                                    borderRadius="xl"
                                    height="50px"
                                    _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                                />
                            </FormControl>

                            <FormControl>
                                <FormLabel fontSize="sm" color="whiteAlpha.700">RATING (0-5)</FormLabel>
                                <NumberInput
                                    step={0.1}
                                    min={0}
                                    max={5}
                                    value={formData.rating}
                                    onChange={(_, val) => setFormData({ ...formData, rating: val })}
                                >
                                    <NumberInputField
                                        bg="rgba(255, 255, 255, 0.05)"
                                        border="1px solid rgba(255, 255, 255, 0.1)"
                                        borderRadius="xl"
                                        height="50px"
                                        _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                                    />
                                    <NumberInputStepper>
                                        <NumberIncrementStepper color="whiteAlpha.500" border="none" />
                                        <NumberDecrementStepper color="whiteAlpha.500" border="none" />
                                    </NumberInputStepper>
                                </NumberInput>
                            </FormControl>
                        </HStack>

                        <FormControl>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">GENRES</FormLabel>
                            <Wrap spacing={3} mb={5}>
                                {availableGenres.map(g => {
                                    const isSelected = genres.includes(g);
                                    return (
                                        <WrapItem key={g}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleGenre(g)}
                                                bg={isSelected ? "rgba(255, 255, 255, 0.2)" : "transparent"}
                                                borderColor={isSelected ? "white" : "whiteAlpha.300"}
                                                color="white"
                                                borderRadius="xl"
                                                backdropFilter="blur(10px)"
                                                _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                                                fontSize="xs"
                                                letterSpacing="wider"
                                                px={4}
                                            >
                                                {g.toUpperCase()} {isSelected && "✓"}
                                            </Button>
                                        </WrapItem>
                                    );
                                })}
                            </Wrap>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">PLATFORMS</FormLabel>
                            <Wrap spacing={3} mb={5}>
                                {availablePlatforms.map(p => {
                                    const isSelected = platforms.includes(p);
                                    return (
                                        <WrapItem key={p}>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => togglePlatform(p)}
                                                bg={isSelected ? "rgba(255, 255, 255, 0.2)" : "transparent"}
                                                borderColor={isSelected ? "white" : "whiteAlpha.300"}
                                                color="white"
                                                borderRadius="xl"
                                                backdropFilter="blur(10px)"
                                                _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                                                fontSize="xs"
                                                letterSpacing="wider"
                                                px={4}
                                            >
                                                {p.toUpperCase()} {isSelected && "✓"}
                                            </Button>
                                        </WrapItem>
                                    );
                                })}
                            </Wrap>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">COVER IMAGE URL</FormLabel>
                            <Input
                                value={formData.coverImageUrl}
                                onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                                placeholder="HTTPS://..."
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                borderRadius="xl"
                                height="50px"
                                _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">BANNER IMAGE URL</FormLabel>
                            <Input
                                value={formData.bannerImageUrl}
                                onChange={(e) => setFormData({ ...formData, bannerImageUrl: e.target.value })}
                                placeholder="HTTPS://..."
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                borderRadius="xl"
                                height="50px"
                                _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">TRAILER URL (DIRECT MP4)</FormLabel>
                            <Input
                                value={formData.trailerUrl}
                                onChange={(e) => setFormData({ ...formData, trailerUrl: e.target.value })}
                                placeholder="HTTPS://... .MP4"
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                borderRadius="xl"
                                height="50px"
                                _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">MORE INFO URL</FormLabel>
                            <Input
                                value={formData.moreInfoUrl}
                                onChange={(e) => setFormData({ ...formData, moreInfoUrl: e.target.value })}
                                placeholder="HTTPS://..."
                                bg="rgba(255, 255, 255, 0.05)"
                                border="1px solid rgba(255, 255, 255, 0.1)"
                                borderRadius="xl"
                                height="50px"
                                _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm" color="whiteAlpha.700">SCREENSHOTS</FormLabel>
                            <HStack mb={2}>
                                <Input
                                    value={newScreenshot}
                                    onChange={(e) => setNewScreenshot(e.target.value)}
                                    placeholder="IMAGE URL..."
                                    bg="rgba(255, 255, 255, 0.05)"
                                    border="1px solid rgba(255, 255, 255, 0.1)"
                                    borderRadius="xl"
                                    height="50px"
                                    _focus={{ borderColor: "whiteAlpha.500", bg: "rgba(255, 255, 255, 0.1)" }}
                                />
                                <IconButton
                                    aria-label="Add"
                                    icon={<FaPlus />}
                                    onClick={handleAddScreenshot}
                                    bg="rgba(255,255,255,0.1)"
                                    color="white"
                                    borderRadius="xl"
                                    _hover={{ bg: "rgba(255,255,255,0.2)" }}
                                />
                            </HStack>
                            <Wrap spacing={2}>
                                {screenshots.map((_, idx) => (
                                    <WrapItem key={idx}>
                                        <Tag size="lg" variant="subtle" bg="rgba(255,255,255,0.1)" color="white" borderRadius="full">
                                            <TagLabel>SCREEN {idx + 1}</TagLabel>
                                            <TagCloseButton onClick={() => setScreenshots(screenshots.filter((_, i) => i !== idx))} />
                                        </Tag>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </FormControl>

                        <Button
                            type="submit"
                            height="60px"
                            fontSize="md"
                            letterSpacing="widest"
                            leftIcon={<FaSave />}
                            bg="rgba(255, 255, 255, 0.9)"
                            color="black"
                            isLoading={isLoading}
                            loadingText="FORGING..."
                            borderRadius="2xl"
                            _hover={{ bg: "white", transform: "translateY(-2px)", boxShadow: "0 0 30px rgba(255,255,255,0.4)" }}
                            _active={{ transform: "translateY(0)" }}
                            transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                        >
                            {initialData ? "UPDATE ENTRY" : "SYNC TO LIBRARY"}
                        </Button>
                    </VStack>
                </form>
            </Container>
        </MotionBox>
    );
};

export default AdminAddGame;
