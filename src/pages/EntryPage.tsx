import { Box, Button, VStack, Heading, Text, HStack } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
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
    const loadedCountRef = useRef(0);

    useEffect(() => {
        const assets = {
            images: ['/xyba.png', '/logo.png', '/logo-light.png'],
            audio: ['/sounds/typing.wav', '/sounds/main-page.ogg', '/sounds/button-hover.wav', '/sounds/card-hover-new.wav'],
            fonts: ['Minecraftia', 'Nestborn', 'DotWalkthru', 'Pcagitha']
        };

        const totalToLoad = assets.images.length + assets.audio.length + assets.fonts.length + 1; // +1 for API
        loadedCountRef.current = 0;

        const increment = () => {
            loadedCountRef.current++;
            const p = Math.floor((loadedCountRef.current / totalToLoad) * 100);
            setProgress(Math.min(p, 100));
            if (loadedCountRef.current >= totalToLoad) {
                setTimeout(() => setIsLoaded(true), 800);
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
            a.preload = "auto";
            a.oncanplaythrough = increment;
            a.onerror = increment;
        });

        // 4. Fonts
        if ('fonts' in document) {
            Promise.all(assets.fonts.map(f => (document as any).fonts.load(`1em ${f}`)))
                .finally(() => {
                    // Fonts load together, but we count them individually for progress accuracy
                    for (let i = 0; i < assets.fonts.length; i++) {
                        increment();
                    }
                });
        } else {
            for (let i = 0; i < assets.fonts.length; i++) {
                increment();
            }
        }

    }, []);

    const handleEnter = () => {
        unlockAudio();
        // Small delay to ensure browser acknowledges the audio gesture before page switch
        setTimeout(() => {
            onEnter();
        }, 150);
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
            bg="black" // Dark fallback
            backdropFilter="blur(60px) saturate(150%)"
        >
            <VStack spacing={12} textAlign="center" width="100%" maxW="600px" px={6}>
                <MotionBox
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <Heading
                        fontSize={{ base: "4xl", md: "7xl" }}
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
                    <Text color="whiteAlpha.600" mt={4} letterSpacing="0.6em" fontSize={{ base: "xs", md: "sm" }} textTransform="uppercase">
                        The Games Library
                    </Text>
                </MotionBox>

                <Box width="380px" position="relative" minH="120px" display="flex" alignItems="center" justifyContent="center">
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
                                    <HStack width="100%" spacing={6}>
                                        <Box
                                            flex={1}
                                            height="4px" // Thicker bar
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
                                                boxShadow="0 0 20px white, 0 0 40px white"
                                                initial={{ width: "0%" }} // Explicit start
                                                animate={{ width: `${progress}%` }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                            />
                                        </Box>
                                        <Text
                                            fontFamily="'Minecraftia', sans-serif"
                                            fontSize="12px"
                                            color="whiteAlpha.800"
                                            width="50px"
                                            textAlign="right"
                                            fontWeight="bold"
                                        >
                                            {progress}%
                                        </Text>
                                    </HStack>
                                    <Text
                                        fontSize="9px"
                                        color="whiteAlpha.400"
                                        letterSpacing="0.4em"
                                        textTransform="uppercase"
                                    >
                                        Establishing Core Linkage
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
                                letterSpacing="0.4em"
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
