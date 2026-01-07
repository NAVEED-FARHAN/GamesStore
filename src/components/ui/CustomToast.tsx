import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaExclamationCircle } from "react-icons/fa";

interface CustomToastProps {
    title: string;
    description?: string;
    status: "success" | "error" | "warning" | "info";
    onClose: () => void;
}

const CustomToast = ({ title, description, status, onClose }: CustomToastProps) => {
    const getStatusConfig = () => {
        switch (status) {
            case "success": return { icon: FaCheckCircle, color: "rgb(8, 203, 0)" };
            case "error": return { icon: FaExclamationCircle, color: "red.400" };
            case "warning": return { icon: FaExclamationTriangle, color: "orange.400" };
            case "info": return { icon: FaInfoCircle, color: "blue.400" };
        }
    };

    const config = getStatusConfig();

    return (
        <Box
            onClick={onClose}
            cursor="pointer"
            p={4}
            mt={4}
            mr={4}
            minW="320px"
            maxW="450px"
            backdropFilter="blur(20px) saturate(180%)"
            bg="rgba(0, 0, 0, 0.75)"
            borderRadius="2xl"
            border="1px solid rgba(255, 255, 255, 0.15)"
            boxShadow="0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.05)"
            fontFamily="'Minecraftia', sans-serif"
            transition="all 0.2s"
            _hover={{ transform: "scale(1.02)", borderColor: "rgba(255,255,255,0.3)" }}
            position="relative"
            overflow="hidden"
        >
            {/* Glossy Overlay */}
            <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                height="50%"
                bg="linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)"
                pointerEvents="none"
            />

            <Flex align="start" gap={4}>
                <Box
                    p={2}
                    bg="rgba(0,0,0,0.3)"
                    borderRadius="xl"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    boxShadow={`0 0 15px ${config.color}33`}
                >
                    <Icon as={config.icon} color={config.color} fontSize="xl" />
                </Box>

                <Box flex={1}>
                    <Text
                        fontWeight="bold"
                        fontSize="sm"
                        color="white"
                        letterSpacing="wider"
                        textTransform="uppercase"
                        mb={description ? 1 : 0}
                    >
                        {title}
                    </Text>
                    {description && (
                        <Text
                            fontSize="xs"
                            color="whiteAlpha.700"
                            lineHeight="tall"
                        >
                            {description}
                        </Text>
                    )}
                </Box>
            </Flex>

            {/* Progress Accent Line */}
            <Box
                position="absolute"
                bottom="0"
                left="0"
                height="3px"
                width="100%"
                bg={config.color}
                opacity={0.6}
                boxShadow={`0 0 10px ${config.color}`}
            />
        </Box>
    );
};

export default CustomToast;
