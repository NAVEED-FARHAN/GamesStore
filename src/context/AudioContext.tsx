import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

interface AudioContextType {
    isMuted: boolean;
    toggleMute: () => void;
    playSFX: (path: string, volume?: number) => void;
    startBGM: (path: string, volume?: number) => void;
    stopBGM: (path: string) => void;
    pauseBGM: (path: string) => void;
    resumeBGM: (path: string) => void;
    fadeBGM: (path: string, targetVolume: number, duration?: number) => void;
    setIsTrailerPlaying: (isPlaying: boolean) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMuted, setIsMuted] = useState(() => {
        const saved = localStorage.getItem('audio_muted');
        return saved === 'true';
    });

    const bgmRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
    const sfxRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

    useEffect(() => {
        localStorage.setItem('audio_muted', isMuted.toString());
        // Update all running BGMs
        Object.values(bgmRefs.current).forEach(audio => {
            audio.muted = isMuted;
        });
    }, [isMuted]);

    const playSFX = useCallback((path: string, volume: number = 0.5) => {
        if (isMuted) return;

        let audio = sfxRefs.current[path];
        if (!audio) {
            audio = new Audio(`/sounds/${path}`);
            sfxRefs.current[path] = audio;
        }
        audio.currentTime = 0;
        audio.volume = volume;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                if (e.name !== 'AbortError') console.warn('SFX Playback failed:', e);
            });
        }
    }, [isMuted]);

    const startBGM = useCallback((path: string, volume: number = 0.3) => {
        let audio = bgmRefs.current[path];
        if (!audio) {
            audio = new Audio(`/sounds/${path}`);
            audio.loop = true;
            bgmRefs.current[path] = audio;
        }
        audio.volume = volume;
        audio.muted = isMuted;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                if (e.name !== 'AbortError') console.warn('BGM Start failed:', e);
            });
        }
    }, [isMuted]);

    const stopBGM = useCallback((path: string) => {
        const audio = bgmRefs.current[path];
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }, []);

    const pauseBGM = useCallback((path: string) => {
        const audio = bgmRefs.current[path];
        if (audio) {
            audio.pause();
        }
    }, []);

    const resumeBGM = useCallback((path: string) => {
        if (isMuted) return;
        const audio = bgmRefs.current[path];
        if (audio) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    if (e.name !== 'AbortError') console.warn('BGM Resume failed:', e);
                });
            }
        }
    }, [isMuted]);

    const fadeBGM = useCallback((path: string, targetVolume: number, duration: number = 1000) => {
        const audio = bgmRefs.current[path];
        if (!audio) return;

        const startVolume = audio.volume;
        const startTime = performance.now();

        const animateFade = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            audio.volume = startVolume + (targetVolume - startVolume) * progress;

            if (progress < 1) {
                requestAnimationFrame(animateFade);
            } else if (targetVolume === 0) {
                audio.pause();
            }
        };

        if (targetVolume > 0 && audio.paused && !isMuted) {
            audio.play().catch(e => console.warn('BGM Fade-In Play failed:', e));
        }

        requestAnimationFrame(animateFade);
    }, [isMuted]);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const setIsTrailerPlaying = useCallback((isPlaying: boolean) => {
        if (isPlaying) {
            pauseBGM('main-page.ogg');
        } else {
            resumeBGM('main-page.ogg');
        }
    }, [pauseBGM, resumeBGM]);

    return (
        <AudioContext.Provider value={{ isMuted, toggleMute, playSFX, startBGM, stopBGM, pauseBGM, resumeBGM, fadeBGM, setIsTrailerPlaying }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};
