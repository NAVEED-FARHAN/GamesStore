import { Box, Button, VStack, Heading, Text } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import APIClient from "../services/APIClient";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface EntryPageProps {
    onEnter: () => void;
}

const EntryPage = ({ onEnter }: EntryPageProps) => {
    const [progress, setProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const assets = {
            images: ['/xyba.png', '/logo.png', '/logo-light.png'],
            audio: ['/sounds/typing.wav', '/sounds/main-page.ogg', '/sounds/button-hover.wav', '/sounds/card-hover-new.wav'],
            fonts: ['Minecraftia', 'Nestborn', 'DotWalkthru', 'Pcagitha']
        };

        let loadedCount = 0;
        const totalAssets = assets.images.length + assets.audio.length + assets.fonts.length + 1; // +1 for API data

        const updateProgress = () => {
            loadedCount++;
            const newProgress = Math.round((loadedCount / totalAssets) * 100);
            setProgress(newProgress);
            if (loadedCount >= totalAssets) {
                setTimeout(() => setIsLoaded(true), 800);
            }
        };

        // 1. Fetch Backend Data (Warm up)
        APIClient.getAllGames()
            .then(() => updateProgress())
            .catch(() => updateProgress());

        // 2. Preload Images
        assets.images.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = () => updateProgress();
            img.onerror = () => updateProgress();
        });

        // 3. Preload Audio
        assets.audio.forEach(src => {
            const audio = new Audio();
            audio.src = src;
            audio.oncanplaythrough = () => updateProgress();
            audio.onerror = () => updateProgress();
        });

        // 4. Check Fonts
        if ('fonts' in document) {
            Promise.all(assets.fonts.map(font => (document as any).fonts.load(`1em ${font}`)))
                .then(() => {
                    assets.fonts.forEach(() => updateProgress());
                })
                .catch(() => {
                    assets.fonts.forEach(() => updateProgress());
                });
        } else {
            // Fallback for browsers without FontFaceSet API
            assets.fonts.forEach(() => updateProgress());
        }

    }, []);

    const handleEnter = () => {
        onEnter();
    };

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            zIndex={20}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="transparent"
            backdropFilter="blur(60px) saturate(150%)"
        >
            <VStack spacing={10} textAlign="center" width="100%" maxW="500px">
                <MotionBox
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <Heading
                        fontSize="6xl"
                        color="white"
                        textShadow="0 0 30px rgba(255,255,255,0.3)"
                        display="flex"
                        alignItems="baseline"
                        justifyContent="center"
                    >
                        <span style={{ fontFamily: 'Nestborn', letterSpacing: '0.05em' }}>XYBA</span>
                        <span style={{ fontFamily: 'DotWalkthru' }}>.</span>
                        <span style={{ fontFamily: 'Pcagitha' }}>gg</span>
                    </Heading>
                    <Text color="whiteAlpha.600" mt={2} letterSpacing="0.5em">
                        THE GAMES LIBRARY
                    </Text>
                </MotionBox>

                <Box width="300px" position="relative" minH="100px" display="flex" alignItems="center" justifyContent="center">
                    <AnimatePresence mode="wait">
                        {!isLoaded ? (
                            <MotionBox
                                key="loader"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                transition={{ duration: 0.5 }}
                                width="100%"
                            >
                                <VStack spacing={4}>
                                    <Box
                                        width="100%"
                                        height="4px"
                                        bg="rgba(255, 255, 255, 0.05)"
                                        borderRadius="full"
                                        overflow="hidden"
                                        border="1px solid rgba(255, 255, 255, 0.1)"
                                        backdropFilter="blur(10px)"
                                        position="relative"
                                    >
                                        <MotionBox
                                            height="100%"
                                            bg="white"
                                            boxShadow="0 0 15px white, 0 0 30px white"
                                            animate={{ width: `${progress}%` }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                        />
                                    </Box>
                                </VStack>
                            </MotionBox>
                        ) : (
                            <MotionButton
                                key="button"
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                whileHover={{
                                    scale: 1.1,
                                    boxShadow: "0 0 50px rgba(255, 255, 255, 0.4)",
                                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                                }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleEnter}
                                variant="unstyled"
                                px={12}
                                py={6}
                                height="auto"
                                borderRadius="4px"
                                border="1px solid rgba(255,255,255,0.2)"
                                backdropFilter="blur(20px)"
                                bg="rgba(255, 255, 255, 0.05)"
                                color="white"
                                fontSize="xl"
                                letterSpacing="0.3em"
                                fontWeight="light"
                            >
                                ENTER
                            </MotionButton>
                        )}
                    </AnimatePresence>
                </Box>
            </VStack>
        </MotionBox>
    );
};

export default EntryPage;
