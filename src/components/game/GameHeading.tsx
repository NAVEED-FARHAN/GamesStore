import { Flex, Input, IconButton, Text, HStack, Box, useColorModeValue } from "@chakra-ui/react";
import { BlurFade } from "../ui/BlurFade";
import { useState, useEffect } from "react";

interface Props {
    onToggleSidebar: () => void;
    onSearch: (searchText: string) => void;
    selectedGenre: string;
}

const HamburgerIcon = (props: any) => (
    <svg
        width="24"
        height="23"
        viewBox="0 0 22 22"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
);

const GameHeading = ({ onToggleSidebar, onSearch, selectedGenre }: Props) => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const hamburgerColor = "rgb(8, 203, 0)";
    const genreColor = useColorModeValue("black", "white");

    // Search bar specific colors
    const searchBg = useColorModeValue("rgba(0, 0, 0, 0.2)", "rgba(255, 255, 255, 0.1)");
    const searchBorder = useColorModeValue("rgba(0, 0, 0, 0.3)", "rgba(255, 255, 255, 0.2)");
    const searchPlaceholder = useColorModeValue("blackAlpha.800", "whiteAlpha.600");
    const searchFocusBorder = "rgb(8, 203, 0)";
    const searchFocusShadow = "0 0 0 1px rgb(8, 203, 0)";
    const searchTextColor = useColorModeValue("black", "white");

    // Container Background when sticky/scrolled
    const headerBgScrolled = useColorModeValue("rgba(255, 255, 255, 0.05)", "rgba(0, 0, 0, 0.6)");

    return (
        <Flex
            justify="space-between"
            align="center"
            w="100%"
            px={8}
            py={4}
            position="sticky"
            top={0}
            zIndex={90} // Slightly lower than Navbar if they overlapped, but Navbar is scrolling away now. 
            // Warning: If Navbar scrolls away, GameHeading sticky top=0 will hit the TOP of the viewport.
            bg={isScrolled ? headerBgScrolled : "transparent"}
            backdropFilter={isScrolled ? "blur(24px)" : "none"}
            transition="all 0.3s ease-in-out"
        >
            {/* Left: Hamburger + Genre Label */}
            <HStack spacing={4} w="300px"> {/* Fixed width to balance center */}
                <BlurFade delay={0.1} inView>
                    <IconButton
                        aria-label="Open Menu"
                        icon={<HamburgerIcon />}
                        variant="ghost"
                        color={hamburgerColor}
                        _hover={{ bg: "whiteAlpha.200" }}
                        onClick={onToggleSidebar}
                        fontSize="24px"
                    />
                </BlurFade>

                <BlurFade delay={0.2} inView>
                    <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        color={genreColor}
                        textTransform="capitalize"
                    >
                        {selectedGenre || "Games"}
                    </Text>
                </BlurFade>
            </HStack>

            {/* Center: Search Bar */}
            <Box flex={1} display="flex" justifyContent="center">
                <BlurFade delay={0.3} inView>
                    <Input
                        placeholder="Search games..."
                        maxW="500px" // Wider search bar
                        w="400px"
                        bg={searchBg}
                        border={`1px solid ${searchBorder}`}
                        backdropFilter="blur(5px)"
                        color={searchTextColor}
                        _placeholder={{ color: searchPlaceholder }}
                        _focus={{
                            bg: "rgba(255, 255, 255, 0.15)",
                            borderColor: searchFocusBorder,
                            boxShadow: searchFocusShadow,
                        }}
                        onChange={(event) => {
                            const val = event.target.value;
                            if (val === "cheats activate") {
                                onSearch(val); // This will bubble up and we can handle it in App.tsx
                            } else {
                                onSearch(val);
                            }
                        }}
                        borderRadius="full"
                        px={6}
                    />
                </BlurFade>
            </Box>

            {/* Right: Balance spacer or potentially Sort options later */}
            <Box w="300px" />
        </Flex>
    );
};

export default GameHeading;
