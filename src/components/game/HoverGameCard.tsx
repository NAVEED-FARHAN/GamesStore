import { Box, HStack, Image, Text, Badge, Flex, VStack, useColorModeValue } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface HoverGameCardProps {
    title: string;
    releaseDate: string;
    image: string;
    rating: number;
    reviewCount: number;
    genres: string[];
    platforms: string[];
    description?: string;
    screenshots?: string[];
}

const MotionBox = motion(Box);
const MotionImage = motion(Image);

const containerVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
            mass: 0.8,
            staggerChildren: 0.05
        }
    } as const,
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 10,
        transition: { duration: 0.2 }
    }
} as const;

const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
};

import { useAudio } from "../../context/AudioContext";

const HoverGameCard = ({ title, releaseDate, image, rating, reviewCount, genres, platforms, description, screenshots = [] }: HoverGameCardProps) => {
    const { playSFX } = useAudio();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        playSFX('hover-popup.wav', 0.1);
    }, []);

    // Dynamic Gameplay Images - Exclude cover image if screenshots exist
    const gameplayImages = screenshots.length > 0
        ? screenshots
        : [image, "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % gameplayImages.length);
        }, 1500); // 1.5s shuffle

        return () => clearInterval(interval);
    }, [gameplayImages.length]);

    const bg = useColorModeValue("rgba(255, 255, 255, 0.85)", "rgba(15, 15, 15, 0.65)");
    const borderColor = useColorModeValue("rgba(0, 0, 0, 0.1)", "rgba(255, 255, 255, 0.15)");
    const titleColor = useColorModeValue("gray.800", "white");
    const metaColor = useColorModeValue("gray.600", "gray.400");
    const descColor = useColorModeValue("gray.700", "gray.300");
    const badgeBorder = useColorModeValue("rgba(0, 100, 200, 0.4)", "rgba(0, 255, 255, 0.4)");
    const badgeColor = useColorModeValue("blue.600", "cyan.200");
    const shadow = useColorModeValue("0 10px 40px rgba(0,0,0,0.2)", "0 0 40px rgba(0, 0, 0, 0.6)");

    return (
        <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            width="340px"
            bg={bg}
            backdropFilter="blur(25px) brightness(1.1)"
            border={`1px solid ${borderColor}`}
            boxShadow={shadow}
            borderRadius="0"
            overflow="hidden"
            p={3}
            display="flex"
            flexDirection="column"
            gap={4}
            _before={{
                content: '""',
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                bg: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 60%)",
                transform: "rotate(45deg)",
                pointerEvents: "none"
            }}
        >
            {/* Image Frame */}
            <Box
                as={motion.div}
                variants={itemVariants}
                position="relative"
                width="100%"
                paddingBottom="65%"
                borderRadius="0"
                overflow="hidden"
                boxShadow="inner"
                bg="black"
            >
                <AnimatePresence mode="wait">
                    <MotionImage
                        key={currentImageIndex}
                        src={gameplayImages[currentImageIndex]}
                        alt={title}
                        position="absolute"
                        top="0"
                        left="0"
                        width="100%"
                        height="100%"
                        objectFit="cover"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                </AnimatePresence>

                <HStack position="absolute" bottom="2" right="2" spacing={1}>
                    {platforms.map(p => (
                        <Badge key={p} variant="solid" colorScheme="blackAlpha" fontSize="xx-small" backdropFilter="blur(4px)">
                            {p}
                        </Badge>
                    ))}
                </HStack>
            </Box>

            {/* Content Section */}
            <VStack align="start" spacing={2} px={1} as={motion.div} variants={itemVariants}>
                <Flex justify="space-between" width="100%" align="center">
                    <Text
                        fontSize="xl"
                        fontWeight="bold"
                        color={titleColor}
                        letterSpacing="wide"
                        textShadow="0 2px 10px rgba(0,0,0,0.5)"
                        noOfLines={1}
                    >
                        {title}
                    </Text>
                    <HStack spacing={1}>
                        <Text color="yellow.300" fontSize="sm">★</Text>
                        <Text color={titleColor} fontWeight="bold" fontSize="sm">{rating}</Text>
                    </HStack>
                </Flex>

                <Text fontSize="xs" color={metaColor} fontStyle="italic">
                    Released: {releaseDate} • {reviewCount.toLocaleString()} Reviews
                </Text>

                {/* Description */}
                {description && (
                    <Text fontSize="sm" color={descColor} lineHeight="1.4" noOfLines={4}>
                        {description}
                    </Text>
                )}

                <Flex gap={2} mt={1} wrap="wrap">
                    {genres.slice(0, 3).map((genre) => (
                        <Badge
                            key={genre}
                            px={2}
                            py={0.5}
                            borderRadius="0"
                            variant="outline"
                            colorScheme="cyan"
                            fontSize="9px"
                            textTransform="uppercase"
                            letterSpacing="wider"
                            border={`1px solid ${badgeBorder}`}
                            color={badgeColor}
                        >
                            {genre}
                        </Badge>
                    ))}
                </Flex>
            </VStack>
        </MotionBox>
    );
};

export default HoverGameCard;
