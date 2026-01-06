import { Flex, Image, useColorModeValue, IconButton, HStack } from "@chakra-ui/react";
import Shuffle from '../ui/Shuffle';
import { AnimatedThemeToggler } from "../ui/AnimatedThemeToggler";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { useAudio } from "../../context/AudioContext";

interface NavbarProps {
  onLogoClick?: () => void;
}

function Navbar({ onLogoClick }: NavbarProps) {
  const { isMuted, toggleMute } = useAudio();
  const bg = useColorModeValue("rgba(255, 255, 255, 0.05)", "rgba(0, 0, 0, 0.75)");
  const backdropFilter = useColorModeValue("blur(20px)", "blur(10px)");
  const textColor = "rgb(8, 203, 0)";
  const logoSrc = useColorModeValue("/logo-light.png", "/logo.png");

  return (
    <Flex
      bg={bg}
      backdropFilter={backdropFilter}
      color={textColor}
      p={2}
      px={4}
      align="center"
      justify="start"
      gap={3}
      position="relative"
      zIndex={100}
    >
      <Image
        src={logoSrc}
        h="60px"
        objectFit="contain"
        onClick={onLogoClick}
        cursor="pointer"
        _hover={{ opacity: 0.8 }}
        transition="opacity 0.2s"
        zIndex={2}
      />

      <HStack
        position="absolute"
        left="50%"
        transform="translateX(-50%)"
        width="100%"
        justifyContent="center"
        pointerEvents="none"
        spacing={0}
        fontSize="3xl"
        fontWeight="bold"
      >
        <Shuffle
          text="XYBA"
          style={{ fontFamily: 'Nestborn' }}
          shuffleDirection="right"
          duration={1.5}
          animationMode="evenodd"
          shuffleTimes={2}
          ease="power3.out"
          stagger={0.3}
          triggerOnHover={true}
          loop={true}
          loopDelay={4}
        />
        <Shuffle
          text="."
          style={{ fontFamily: 'DotWalkthru' }}
          shuffleDirection="right"
          duration={1.5}
          animationMode="evenodd"
          shuffleTimes={2}
          ease="power3.out"
          stagger={0.3}
          triggerOnHover={true}
          loop={true}
          loopDelay={4}
        />
        <Shuffle
          text="gg"
          style={{ fontFamily: 'Pcagitha' }}
          shuffleDirection="right"
          duration={1.5}
          animationMode="evenodd"
          shuffleTimes={2}
          ease="power3.out"
          stagger={0.3}
          triggerOnHover={true}
          loop={true}
          loopDelay={4}
        />
      </HStack>

      <HStack spacing={4} ml="auto">
        <IconButton
          icon={isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          onClick={toggleMute}
          variant="ghost"
          color="white"
          _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
          size="md"
          aria-label="Toggle Mute"
        />
        <AnimatedThemeToggler color="white" />
      </HStack>
    </Flex>
  );
}

export default Navbar;