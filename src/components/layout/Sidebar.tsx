import { Box, Text, VStack, useColorModeValue } from "@chakra-ui/react";
import { BlurFade } from "../ui/BlurFade";
import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "../../context/AudioContext";

interface Props {
  onSelectGenre: (genre: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MotionBox = motion(Box);

function Sidebar({ onSelectGenre, isOpen, onClose }: Props) {
  const { playSFX } = useAudio();
  const bg = useColorModeValue("white", "rgba(20, 20, 20, 0.95)");
  const borderColor = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.1)");
  const titleColor = "rgb(8, 203, 0)";
  const hoverColor = "rgb(8, 203, 0)";
  const textColor = useColorModeValue("gray.600", "whiteAlpha.800");

  const genres = [
    "All",
    "Action",
    "Adventure",
    "RPG",
    "Shooter",
    "Racing",
    "Sports",
    "Horror",
    "Open World",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            position="fixed"
            top="0"
            left="0"
            width="100vw"
            height="100vh"
            bg="rgba(0, 0, 0, 0.6)"
            zIndex="999"
            onClick={onClose}
            backdropFilter="blur(5px)"
          />

          {/* Sidebar Drawer */}
          <MotionBox
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            position="fixed"
            top="0"
            left="0"
            height="100vh"
            width="250px"
            bg={bg}
            zIndex="1000"
            p={6}
            borderRight={`1px solid ${borderColor}`}
            boxShadow="0 0 20px rgba(0,0,0,0.5)"
          >
            <Text
              fontSize="2xl"
              mb={8}
              fontWeight="bold"
              color={titleColor}
            >
              Genres
            </Text>

            <VStack align="start" spacing={4}>
              {genres.map((genre, idx) => (
                <BlurFade key={genre} delay={0.1 + (0.05 * idx)}>
                  <Text
                    fontSize="lg"
                    color={textColor}
                    transition="0.2s"
                    _hover={{
                      color: hoverColor,
                      cursor: "pointer",
                      transform: "translateX(8px)",
                    }}
                    onMouseEnter={() => playSFX('card-hover.mp3', 0.2)}
                    onClick={() => {
                      playSFX('button-click.mp3', 0.3);
                      onSelectGenre(genre);
                    }}
                  >
                    {genre}
                  </Text>
                </BlurFade>
              ))}
            </VStack>
          </MotionBox>
        </>
      )}
    </AnimatePresence>
  );
}

export default Sidebar;