import { Box, Button, VStack, Heading, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface EntryPageProps {
    onEnter: () => void;
}


const EntryPage = ({ onEnter }: EntryPageProps) => {
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
            <VStack spacing={8} textAlign="center">
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

                <MotionButton
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
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    ENTER
                </MotionButton>
            </VStack>
        </MotionBox>
    );
};

export default EntryPage;
