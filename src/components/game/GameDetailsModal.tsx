import { useState, useRef, useEffect } from "react";
import { Box, Heading, Text, Button, VStack, HStack, IconButton, Image, useColorModeValue } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { Game } from "../../types";
import { FaPlay, FaPause, FaInfoCircle, FaTimes, FaStar, FaExpand, FaForward, FaBackward, FaVolumeUp, FaVolumeMute, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAudio } from "../../context/AudioContext";

const MotionBox = motion(Box);

interface GameDetailsModalProps {
    game: Game | null;
    isOpen: boolean;
    onClose: () => void;
}


const GameDetailsModal = ({ game, isOpen, onClose }: GameDetailsModalProps) => {
    const { playSFX, setIsTrailerPlaying } = useAudio();
    const bg = useColorModeValue("white", "rgba(10, 10, 10, 0.75)");
    const textColor = useColorModeValue("gray.800", "gray.100");
    const sectionBg = useColorModeValue("gray.50", "rgba(255,255,255,0.02)");
    const borderColor = useColorModeValue("gray.200", "rgba(255, 255, 255, 0.15)");
    const headingColor = useColorModeValue("black", "white");

    const [isPlaying, setIsPlaying] = useState(false);
    const [extraData, setExtraData] = useState<{ trailerUrl?: string, moreInfoUrl?: string } | null>(null);
    const [enlargedImageIdx, setEnlargedImageIdx] = useState<number | null>(null);
    const [showBanner, setShowBanner] = useState(true); // Start with banner visible
    const [isFullScreen, setIsFullScreen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const detailsRef = useRef<HTMLDivElement>(null);
    const heroRef = useRef<HTMLDivElement>(null);

    // Keep track of the game to display even during closing animation
    const [displayGame, setDisplayGame] = useState<Game | null>(game);

    useEffect(() => {
        if (game) setDisplayGame(game);
    }, [game]);

    const activeGame = game || displayGame;

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            heroRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        if (activeGame) {
            const stored = localStorage.getItem(`game_extra_${activeGame.id}`) || localStorage.getItem(`game_extra_${activeGame.title}`);
            if (stored) {
                try {
                    setExtraData(JSON.parse(stored));
                } catch (e) {
                    console.error("Error parsing extra data", e);
                }
            } else {
                setExtraData(null);
            }
        }
    }, [activeGame]);

    useEffect(() => {
        if (!isOpen) {
            setIsPlaying(false);
            setEnlargedImageIdx(null);
            setShowBanner(true); // Reset banner when modal closes
            if (videoRef.current) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isOpen]);

    // Keyboard navigation for screenshots
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (enlargedImageIdx === null) return;

            if (e.key === "ArrowRight") handleNextImg();
            if (e.key === "ArrowLeft") handlePrevImg();
            if (e.key === "Escape") setEnlargedImageIdx(null);
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [enlargedImageIdx]);

    const handleNextImg = () => {
        if (enlargedImageIdx === null) return;
        setEnlargedImageIdx((prev) => (prev! + 1) % screenshots.length);
    };

    const handlePrevImg = () => {
        if (enlargedImageIdx === null) return;
        setEnlargedImageIdx((prev) => (prev! - 1 + screenshots.length) % screenshots.length);
    };

    // Banner fade-out timer (3 seconds after modal opens)
    useEffect(() => {
        if (isOpen) {
            setShowBanner(true); // Reset when opening
            if (hasTrailer) {
                const timer = setTimeout(() => {
                    setShowBanner(false);
                }, 3000); // 3 seconds
                return () => clearTimeout(timer);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (isPlaying && videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.play().catch(err => {
                console.error("Video playback failed:", err);
            });
        }

        if (isPlaying) {
            setIsTrailerPlaying(true);
        } else {
            setIsTrailerPlaying(false);
        }

        return () => setIsTrailerPlaying(false);
    }, [isPlaying]);

    // Don't return null if we have a displayGame, even if isOpen is false (for exit anim)
    if (!displayGame && !game) return null;

    // If we're closing (game is null/isOpen false), activeGame holds the last game data
    if (!activeGame) return null;

    const videoUrl = activeGame.trailerUrl || extraData?.trailerUrl || "";
    const hasTrailer = !!videoUrl;
    const moreInfoToUse = activeGame.moreInfoUrl || extraData?.moreInfoUrl;
    const rating = activeGame.rating || 0;
    const releaseYear = activeGame.releaseDate;
    const genres = activeGame.genres || [];
    const screenshots = activeGame.screenshots || [];
    const bannerUrl = activeGame.bannerImageUrl;
    const title = activeGame.title;
    const description = activeGame.description;
    const platforms = activeGame.platforms || [];

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const isYoutube = getYoutubeId(videoUrl);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <MotionBox
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        position="fixed"
                        top="0"
                        left="0"
                        width="100vw"
                        height="100vh"
                        bg="rgba(0, 0, 0, 0.95)"
                        zIndex={9000}
                        onClick={onClose}
                        backdropFilter="blur(5px)"
                    />

                    {/* Modal Panel */}
                    <MotionBox
                        initial={{ scale: 0.9, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 50 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        position="fixed"
                        top="2vh"
                        left="50%"
                        style={{ x: "-50%" }}
                        width="98vw"
                        maxW="98vw"
                        height="98vh"
                        bg={bg}
                        backdropFilter="blur(25px) saturate(120%)"
                        border={`1px solid ${borderColor}`}
                        zIndex={9001}
                        borderRadius="0"
                        overflow="hidden"
                        boxShadow="0 0 80px rgba(0,0,0,0.8)"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        {/* Scroll Container */}
                        <Box
                            height="100%"
                            overflowY="auto"
                        >
                            {/* Hero Section */}
                            <Box ref={heroRef} position="relative" height={{ base: "500px", md: "75vh" }} width="100%" zIndex={1} bg="black"
                                sx={{
                                    "&::backdrop": {
                                        background: "black"
                                    }
                                }}
                            >
                                {/* Background Video/Image */}
                                <Box position="absolute" top="0" left="0" width="100%" height="100%" overflow="hidden" zIndex={0}>
                                    {isYoutube ? (
                                        <iframe
                                            key={`${videoUrl}-${isPlaying}`}
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${isYoutube}?autoplay=1&mute=${isPlaying ? 0 : 1}&controls=0&loop=1&playlist=${isYoutube}&showinfo=0&rel=0&modestbranding=1`}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            style={{ objectFit: 'cover', pointerEvents: isFullScreen ? 'auto' : 'none', transform: 'scale(1.3)', width: '100%', height: '100%' }}
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video
                                            ref={videoRef}
                                            key={videoUrl}
                                            src={videoUrl}
                                            poster={bannerUrl}
                                            autoPlay
                                            loop
                                            muted={!isPlaying}
                                            playsInline
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}

                                    {/* Banner Overlay - Shows for 3 seconds then fades to video */}
                                    <AnimatePresence>
                                        {showBanner && (
                                            <MotionBox
                                                position="absolute"
                                                top="0"
                                                left="0"
                                                width="100%"
                                                height="100%"
                                                zIndex={3}
                                                initial={{ opacity: 1 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                                            >
                                                <Image
                                                    src={bannerUrl}
                                                    alt={title}
                                                    width="100%"
                                                    height="100%"
                                                    objectFit="cover"
                                                />
                                            </MotionBox>
                                        )}
                                    </AnimatePresence>

                                    {/* Gradients - Hide in Fullscreen */}
                                    {!isFullScreen && (
                                        <>
                                            <Box
                                                position="absolute"
                                                top="0"
                                                left="0"
                                                width="100%"
                                                height="100%"
                                                bgGradient="linear(to-t, #141414 5%, transparent 40%, rgba(0,0,0,0.5) 100%)"
                                                zIndex={4}
                                                pointerEvents="none"
                                            />
                                            <Box
                                                position="absolute"
                                                top="0"
                                                left="0"
                                                width="50%"
                                                height="100%"
                                                bgGradient="linear(to-r, #141414 0%, transparent 100%)"
                                                zIndex={4}
                                                pointerEvents="none"
                                            />
                                        </>
                                    )}
                                </Box>

                                {/* Hero Content Overlay */}
                                <Box
                                    position="absolute"
                                    top="0"
                                    left="0"
                                    width="100%"
                                    height="100%"
                                    zIndex={10}
                                    pointerEvents="none"
                                >
                                    <VStack
                                        position="absolute"
                                        bottom="8%"
                                        left="4%"
                                        align="start"
                                        spacing={4}
                                        maxW="85%"
                                        opacity={isPlaying && !isFullScreen ? 0 : 1}
                                        transform={isPlaying && !isFullScreen ? "translateY(20px)" : "translateY(0)"}
                                        transition="all 0.6s ease"
                                        pointerEvents={isFullScreen ? "none" : "auto"} // Disable main text interaction in FS
                                        display={isFullScreen ? "none" : "flex"} // Hide fully in FS so it doesn't block controls if opacity fails
                                    >
                                        <Heading
                                            size="xl"
                                            color="white"
                                            fontWeight="black"
                                            textShadow="0 4px 15px rgba(0,0,0,0.8)"
                                            lineHeight="1.1"
                                        >
                                            {title}
                                        </Heading>

                                        <Text
                                            color="white"
                                            fontSize="sm"
                                            textShadow="0 2px 8px rgba(0,0,0,0.8)"
                                            lineHeight="1.5"
                                            maxW="100%"
                                            noOfLines={3}
                                        >
                                            {description}
                                        </Text>

                                        <HStack spacing={3} pt={2}>
                                            {hasTrailer && (
                                                <Button
                                                    leftIcon={<FaPlay style={{ fontSize: '18px' }} />}
                                                    bg="white"
                                                    color="black"
                                                    size="md"
                                                    fontWeight="bold"
                                                    h="45px"
                                                    px={8}
                                                    borderRadius="4px"
                                                    _hover={{ bg: "rgba(255,255,255,0.8)", transform: "scale(1.05)" }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsPlaying(true);
                                                    }}
                                                    transition="all 0.2s"
                                                >
                                                    Watch
                                                </Button>
                                            )}
                                            <Button
                                                leftIcon={<FaInfoCircle style={{ fontSize: '18px' }} />}
                                                bg="rgba(109, 109, 110, 0.7)"
                                                color="white"
                                                size="md"
                                                fontWeight="bold"
                                                h="45px"
                                                px={8}
                                                borderRadius="4px"
                                                _hover={{ bg: "rgba(109, 109, 110, 0.4)", transform: "scale(1.05)" }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                                transition="all 0.2s"
                                            >
                                                More Info
                                            </Button>
                                        </HStack>
                                    </VStack>
                                </Box>

                                {/* Play Mode Controls (Windowed) */}
                                {isPlaying && !isFullScreen && (
                                    <HStack
                                        position="absolute"
                                        bottom={10}
                                        right={10}
                                        zIndex={30}
                                        spacing={4}
                                    >
                                        <Button
                                            leftIcon={<FaExpand />}
                                            variant="outline"
                                            colorScheme="whiteAlpha"
                                            bg="rgba(0,0,0,0.5)"
                                            onClick={toggleFullScreen}
                                            _hover={{ bg: "rgba(0,0,0,0.7)" }}
                                        >
                                            Full Screen
                                        </Button>
                                        <Button
                                            variant="outline"
                                            colorScheme="whiteAlpha"
                                            bg="rgba(0,0,0,0.5)"
                                            onClick={() => {
                                                if (document.fullscreenElement) document.exitFullscreen();
                                                setIsPlaying(false);
                                            }}
                                            _hover={{ bg: "rgba(0,0,0,0.7)" }}
                                        >
                                            Exit Trailer
                                        </Button>
                                    </HStack>
                                )}

                                {/* Fullscreen Custom Controls */}
                                {isFullScreen && (
                                    <Box
                                        position="absolute"
                                        bottom="0"
                                        left="0"
                                        width="100%"
                                        bgGradient="linear(to-t, rgba(0,0,0,0.9), transparent)"
                                        p={8}
                                        zIndex={100}
                                        opacity={1}
                                        transition="opacity 0.3s"
                                        _hover={{ opacity: 1 }}
                                    >
                                        <VStack spacing={4} width="100%">
                                            {/* Progress Bar (Optional - simple placeholder for now or skip) */}

                                            <HStack spacing={6} justify="center" width="100%">
                                                {!isYoutube && (
                                                    <>
                                                        <IconButton
                                                            aria-label="Backward 10s"
                                                            icon={<FaBackward />}
                                                            onClick={() => {
                                                                if (videoRef.current) videoRef.current.currentTime -= 10;
                                                            }}
                                                            variant="ghost"
                                                            color="white"
                                                            fontSize="20px"
                                                            _hover={{ bg: "whiteAlpha.200" }}
                                                        />

                                                        <IconButton
                                                            aria-label={isPlaying ? "Pause" : "Play"}
                                                            icon={isPlaying ? <FaPause /> : <FaPlay />}
                                                            onClick={() => {
                                                                if (videoRef.current) {
                                                                    if (videoRef.current.paused) {
                                                                        videoRef.current.play();
                                                                        setIsPlaying(true);
                                                                    } else {
                                                                        videoRef.current.pause();
                                                                        setIsPlaying(false);
                                                                    }
                                                                }
                                                            }}
                                                            variant="solid"
                                                            colorScheme="green"
                                                            size="lg"
                                                            isRound
                                                            fontSize="24px"
                                                            boxShadow="0 0 20px rgba(72, 187, 120, 0.5)"
                                                        />

                                                        <IconButton
                                                            aria-label="Forward 10s"
                                                            icon={<FaForward />}
                                                            onClick={() => {
                                                                if (videoRef.current) videoRef.current.currentTime += 10;
                                                            }}
                                                            variant="ghost"
                                                            color="white"
                                                            fontSize="20px"
                                                            _hover={{ bg: "whiteAlpha.200" }}
                                                        />

                                                        <HStack spacing={2} ml={10}>
                                                            <IconButton
                                                                aria-label="Mute"
                                                                icon={videoRef.current?.muted ? <FaVolumeMute /> : <FaVolumeUp />}
                                                                onClick={() => {
                                                                    if (videoRef.current) {
                                                                        videoRef.current.muted = !videoRef.current.muted;
                                                                    }
                                                                }}
                                                                variant="ghost"
                                                                color="white"
                                                                size="sm"
                                                            />
                                                        </HStack>
                                                    </>
                                                )}

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    colorScheme="red"
                                                    onClick={toggleFullScreen}
                                                    ml="auto"
                                                >
                                                    Exit Fullscreen
                                                </Button>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                )}

                                {/* Close Button */}
                                <IconButton
                                    aria-label="Close"
                                    icon={<FaTimes />}
                                    position="absolute"
                                    top={6}
                                    right={6}
                                    isRound
                                    bg="rgba(0,0,0,0.5)"
                                    color="white"
                                    fontSize="24px"
                                    onClick={() => {
                                        playSFX('modal-close.wav');
                                        onClose();
                                    }}
                                    _hover={{ bg: "rgba(0,0,0,0.8)", transform: "scale(1.1)" }}
                                    zIndex={50}
                                />
                            </Box>

                            {/* Gallery Section */}
                            <Box ref={detailsRef} px={{ base: 4, md: 10 }} pb={20} bg="transparent" position="relative" zIndex={5} pt={10}>
                                <Heading size="md" color={headingColor} mb={6} fontWeight="bold" letterSpacing="wide">
                                    SCREENS & DETAILS
                                </Heading>
                                <Box overflowX="auto" pb={8} css={{
                                    '&::-webkit-scrollbar': { height: '4px' },
                                    '&::-webkit-scrollbar-thumb': { background: '#444', borderRadius: '2px' }
                                }}>
                                    <HStack spacing={4} align="stretch" display="flex">
                                        {screenshots.length > 0 ? (
                                            screenshots.map((s, idx) => (
                                                <Box
                                                    key={idx}
                                                    flex="0 0 300px"
                                                    height="170px"
                                                    borderRadius="6px"
                                                    overflow="hidden"
                                                    bg="gray.800"
                                                    transition="0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                                                    _hover={{ transform: "scale(1.08)", zIndex: 2, cursor: "pointer", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                                                    position="relative"
                                                    onClick={() => setEnlargedImageIdx(idx)}
                                                >
                                                    <Image
                                                        src={s}
                                                        alt={`Screen ${idx}`}
                                                        width="100%"
                                                        height="100%"
                                                        objectFit="cover"
                                                    />
                                                </Box>
                                            ))
                                        ) : (
                                            <Box
                                                flex="0 0 300px"
                                                height="170px"
                                                borderRadius="4px"
                                                bg="gray.800"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Text color="gray.500">No screenshots uploaded</Text>
                                            </Box>
                                        )}
                                    </HStack>
                                </Box>

                                {/* Metadata Details */}
                                <HStack mt={8} spacing={10} align="start" p={8} bg={sectionBg} borderRadius="xl" border={`1px solid ${borderColor}`}>
                                    <VStack align="start" flex={2} spacing={6}>
                                        <HStack spacing={4} color="gray.400" fontWeight="bold">
                                            <Text color="#46d369" fontSize="xl">{rating * 20}% Match</Text>
                                            <Text fontSize="xl">{releaseYear}</Text>
                                            <HStack spacing={2}>
                                                <Box border="1px solid gray" px={2} py={0.5} borderRadius="xs" fontSize="xs">4K ULTRA HD</Box>
                                                <Box border="1px solid gray" px={2} py={0.5} borderRadius="xs" fontSize="xs">HDR10+</Box>
                                            </HStack>
                                        </HStack>

                                        <VStack align="start" spacing={3}>
                                            <Heading size="sm" color={headingColor} letterSpacing="widest" textTransform="uppercase">Overview</Heading>
                                            <Text color={textColor} fontSize="lg" lineHeight="1.8" textAlign="justify">
                                                {description}
                                            </Text>
                                        </VStack>
                                    </VStack>

                                    <VStack align="start" flex={1} spacing={6} pt={2} bg={sectionBg} p={6} borderRadius="lg">
                                        <Box>
                                            <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={2}>GENRES</Text>
                                            <Text color={headingColor} fontSize="md" fontWeight="medium">{genres.join(", ")}</Text>
                                        </Box>
                                        <Box>
                                            <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={2}>PLATFORMS</Text>
                                            <Text color={headingColor} fontSize="md" fontWeight="medium">{platforms.join(", ")}</Text>
                                        </Box>
                                        <Box>
                                            <Text color="gray.500" fontSize="xs" fontWeight="bold" mb={2}>RATING</Text>
                                            <HStack>
                                                <Text color={headingColor} fontSize="md" fontWeight="medium">{rating}</Text>
                                                <FaStar color="gold" />
                                            </HStack>
                                        </Box>

                                        {moreInfoToUse && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                colorScheme="whiteAlpha"
                                                width="full"
                                                mt={2}
                                                leftIcon={<FaInfoCircle />}
                                                onClick={() => {
                                                    const url = moreInfoToUse.startsWith("http") ? moreInfoToUse : `https://${moreInfoToUse}`;
                                                    window.open(url, "_blank");
                                                }}
                                            >
                                                Official Site
                                            </Button>
                                        )}
                                    </VStack>
                                </HStack>
                            </Box>
                        </Box>
                    </MotionBox>

                    {/* Image Zoom Overlay */}
                    <AnimatePresence>
                        {enlargedImageIdx !== null && (
                            <Box
                                position="fixed"
                                top="0"
                                left="0"
                                width="100vw"
                                height="100vh"
                                bg="rgba(0,0,0,0.9)"
                                zIndex={10000}
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                backdropFilter="blur(15px)"
                                onClick={() => setEnlargedImageIdx(null)}
                            >
                                {/* Left Arrow */}
                                {screenshots.length > 1 && (
                                    <IconButton
                                        aria-label="Previous image"
                                        icon={<FaChevronLeft />}
                                        position="absolute"
                                        left={{ base: 2, md: 10 }}
                                        color="white"
                                        bg="whiteAlpha.100"
                                        variant="ghost"
                                        fontSize="40px"
                                        h="100px"
                                        _hover={{ bg: "whiteAlpha.300", transform: "scale(1.1)" }}
                                        onClick={(e) => { e.stopPropagation(); handlePrevImg(); }}
                                        zIndex={10002}
                                    />
                                )}

                                <MotionBox
                                    key={enlargedImageIdx} // Important for exit/enter animation
                                    initial={{ scale: 0.8, opacity: 0, x: 100 }}
                                    animate={{ scale: 1, opacity: 1, x: 0 }}
                                    exit={{ scale: 0.8, opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    maxW="90vw"
                                    maxH="90vh"
                                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                >
                                    <Image
                                        src={screenshots[enlargedImageIdx]}
                                        borderRadius="lg"
                                        boxShadow="0 0 100px rgba(0,0,0,1)"
                                        border="1px solid rgba(255,255,255,0.1)"
                                    />
                                    {/* Small Index Indicator */}
                                    <Text color="whiteAlpha.600" fontSize="sm" textAlign="center" mt={4} letterSpacing="wider">
                                        {enlargedImageIdx + 1} / {screenshots.length}
                                    </Text>
                                </MotionBox>

                                {/* Right Arrow */}
                                {screenshots.length > 1 && (
                                    <IconButton
                                        aria-label="Next image"
                                        icon={<FaChevronRight />}
                                        position="absolute"
                                        right={{ base: 2, md: 10 }}
                                        color="white"
                                        bg="whiteAlpha.100"
                                        variant="ghost"
                                        fontSize="40px"
                                        h="100px"
                                        _hover={{ bg: "whiteAlpha.300", transform: "scale(1.1)" }}
                                        onClick={(e) => { e.stopPropagation(); handleNextImg(); }}
                                        zIndex={10002}
                                    />
                                )}

                                <IconButton
                                    aria-label="Close"
                                    icon={<FaTimes />}
                                    position="absolute"
                                    top={10}
                                    right={10}
                                    color="white"
                                    bg="whiteAlpha.200"
                                    onClick={() => {
                                        playSFX('modal-close.wav');
                                        setEnlargedImageIdx(null);
                                    }}
                                    _hover={{ bg: "whiteAlpha.400" }}
                                />
                            </Box>
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
};

export default GameDetailsModal;
