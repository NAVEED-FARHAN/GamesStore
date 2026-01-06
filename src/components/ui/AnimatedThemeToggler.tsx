import { useCallback, useRef } from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { flushSync } from "react-dom";
import { useColorMode, IconButton, IconButtonProps } from "@chakra-ui/react";
import { cn } from "../../lib/utils";

interface AnimatedThemeTogglerProps extends Omit<IconButtonProps, 'aria-label'> {
    duration?: number;
    "aria-label"?: string;
}

export const AnimatedThemeToggler = ({
    className,
    duration = 400,
    ...props
}: AnimatedThemeTogglerProps) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const isDark = colorMode === 'dark';
    const buttonRef = useRef<HTMLButtonElement>(null);

    const toggleTheme = useCallback(async () => {
        // Fallback for browsers that don't support View Transitions
        if (!document.startViewTransition || !buttonRef.current) {
            toggleColorMode();
            return;
        }

        await document.startViewTransition(() => {
            flushSync(() => {
                toggleColorMode();
            });
        }).ready;

        const { top, left, width, height } =
            buttonRef.current.getBoundingClientRect();
        const x = left + width / 2;
        const y = top + height / 2;
        const maxRadius = Math.hypot(
            Math.max(left, window.innerWidth - left),
            Math.max(top, window.innerHeight - top)
        );

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration,
                easing: "ease-in-out",
                pseudoElement: "::view-transition-new(root)",
            }
        );
    }, [toggleColorMode, duration]);

    return (
        <IconButton
            ref={buttonRef}
            aria-label="Toggle theme"
            icon={isDark ? <FiSun /> : <FiMoon />}
            onClick={toggleTheme}
            variant="ghost"
            isRound
            size="lg"
            fontSize="20px"
            color="currentcolor"
            _hover={{ bg: "whiteAlpha.200" }}
            className={cn(className)}
            {...props}
        />
    );
};
