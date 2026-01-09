import { Box, Button, VStack, Heading, Text, HStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import APIClient from "../services/APIClient";
import { useAudio } from "../context/AudioContext";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface EntryPageProps {
    onEnter: () => void;
}

const EntryPage = ({ onEnter }: EntryPageProps) => {
    const [progress, setProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const { unlockAudio } = useAudio();

    useEffect(() => {
        const assets = {
            images: ['/xyba.png', '/logo.png', '/logo-light.png'],
            audio: ['/sounds/typing.wav', '/sounds/main-page.ogg', '/sounds/button-hover.wav', '/sounds/card-hover-new.wav'],
            fonts: ['Minecraftia', 'Nestborn', 'DotWalkthru', 'Pcagitha']
        };

        const totalToLoad = assets.images.length + assets.audio.length + assets.fonts.length + 1; // +1 for API
        let loaded = 0;

        const increment = () => {
            loaded++;
            const p = Math.floor((loaded / totalToLoad) * 100);
            setProgress(p);
            if (loaded >= totalToLoad) {
                setTimeout(() => setIsLoaded(true), 600);
            }
        };

        // 1. Data
        APIClient.getAllGames().finally(increment);

        // 2. Images
        assets.images.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = increment;
            img.onerror = increment;
        });

        // 3. Audio (Warm up)
        assets.audio.forEach(src => {
            const a = new Audio();
            a.src = src;
            a.oncanplaythrough = increment;
            a.onerror = increment;
        });

        // 4. Fonts
        if ('fonts' in document) {
            Promise.all(assets.fonts.map(f => (document as any).fonts.load(`1em ${f}`)))
                .finally(() => {
                    assets.fonts.forEach(increment);
                });
        } else {
            assets.fonts.forEach(increment);
        }

    }, []);

    const handleEnter = () => {
        unlockAudio(); // Initialize audio context on first user gesture
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
            <VStack spacing={10} textAlign="center" width="100%" maxW="600px" px={4}>
                <MotionBox
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <Heading
                        fontSize={{ base: "4xl", md: "6xl" }}
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
                    <Text color="whiteAlpha.600" mt={2} letterSpacing="0.5em" fontSize={{ base: "xs", md: "sm" }}>
                        THE GAMES LIBRARY
                    </Text>
                </MotionBox>

                <Box width="350px" position="relative" minH="120px" display="flex" alignItems="center" justifyContent="center">
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
                                <VStack spacing={3}>
                                    <HStack width="100%" spacing={4}>
                                        <Box
                                            flex={1}
                                            height="2px"
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
                                                transition={{ duration: 0.3, ease: "easeOut" }}
                                            />
                                        </Box>
                                        <Text
                                            fontFamily="'Minecraftia', sans-serif"
                                            fontSize="10px"
                                            color="whiteAlpha.700"
                                            width="40px"
                                            textAlign="right"
                                        >
                                            {progress}%
                                        </Text>
                                    </HStack>
                                    <Text
                                        fontSize="9px"
                                        color="whiteAlpha.400"
                                        letterSpacing="0.3em"
                                        textTransform="uppercase"
                                    >
                                        Initializing Core Systems
                                    </Text>
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
