import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
    initialColorMode: 'dark',
    useSystemColorMode: false,
};

const styles = {
    global: (props: any) => ({
        body: {
            bg: mode('gray.50', 'black')(props),
            color: mode('gray.900', 'white')(props),
        },
    }),
};

const theme = extendTheme({
    config,
    styles,
    fonts: {
        heading: `'Minecraftia', sans-serif`,
        body: `'Inter', sans-serif`,
    },
});

export default theme;
