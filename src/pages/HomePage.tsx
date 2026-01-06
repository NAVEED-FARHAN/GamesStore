import { Box, Button, VStack, Image, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import TextType from "../components/ui/TextType";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface HomePageProps {
    onEnter: () => void;
}

const quotes = [
    "Rise. The world will not wait for the weak, and neither will I.",
    "I have bled across centuries pick up the blade and earn your place beside me.",
    "Kings are not born in peace… they are forged where games become war.",
    "Heaven cast me down, yet I still rule every battlefield I enter.",
    "Press forward every defeat is merely a lesson written in blood.",
    "Your courage is untested. Enter, and let fate judge your worth.",
    "Empires fall, legends remain. Decide which you will be.",
    "I do not promise victory… only glory for those who endure.",
    "The throne is empty. Take it if your hands do not tremble.",
    "Step into the arena. Tonight, you are not a player… you are a conqueror."
];

import { useAudio } from "../context/AudioContext";

const HomePage = ({ onEnter }: HomePageProps) => {
    const { startBGM, stopBGM, playSFX, pauseBGM } = useAudio();

    useEffect(() => {
        return () => {
            stopBGM('typing.wav');
        };
    }, [stopBGM]);

    const handleEnter = useCallback(() => {
        playSFX('button-click.mp3', 0.075);
        onEnter();
    }, [playSFX, onEnter]);

    const handleTypingStart = useCallback(() => startBGM('typing.wav', 0.1), [startBGM]);
    const handleTypingStop = useCallback(() => pauseBGM('typing.wav'), [pauseBGM]);

    return (
        <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            zIndex={10}
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg="transparent"
        >
            <VStack spacing={10} mt="-10vh">
                <Text
                    as="div"
                    fontSize={{ base: "lg", md: "3xl" }}
                    fontWeight="normal"
                    fontFamily="'Minecraftia', sans-serif"
                    color="white"
                    textAlign="center"
                    maxW="1100px"
                    minH="5em"
                    px={4}
                    textShadow="0 0 15px rgba(255,255,255,0.4)"
                    lineHeight="1.3"
                >
                    <TextType
                        text={quotes}
                        typingSpeed={40}
                        deletingSpeed={30}
                        pauseDuration={4500}
                        loop={true}
                        showCursor={true}
                        onTypingStart={handleTypingStart}
                        onTypingStop={handleTypingStop}
                    />
                </Text>

                <MotionButton
                    whileHover={{ scale: 1.05, boxShadow: "0 0 60px rgba(255, 255, 255, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onMouseEnter={() => playSFX('button-hover.wav', 0.12)}
                    onClick={handleEnter}
                    variant="unstyled"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    width="175px"
                    height="175px"
                    borderRadius="none"
                    border="1px solid rgba(255,255,255,0.15)"
                    backdropFilter="blur(30px)"
                    bg="rgba(0, 0, 0, 0.2)"
                    _hover={{ bg: "rgba(255, 255, 255, 0.05)", borderColor: "rgba(255, 255, 255, 0.3)" }}
                    transition={{ duration: 0.4 }}
                >
                    <Image
                        src="/xyba.png"
                        alt="Enter"
                        maxW="92%"
                        maxH="92%"
                        objectFit="contain"
                        filter="drop-shadow(0 0 15px rgba(255,255,255,0.4))"
                    />
                </MotionButton>
            </VStack>
        </MotionBox>
    );
};

export default HomePage;
