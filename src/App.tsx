import { useState } from "react";
import { Box, useColorMode, useToast } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import GameGrid from "./components/game/GameGrid";
import AppBackground from "./components/layout/AppBackground";
import HomePage from "./pages/HomePage";
import EntryPage from "./pages/EntryPage";
import GameHeading from "./components/game/GameHeading";
import GameDetailsModal from "./components/game/GameDetailsModal";
import AdminAddGame from "./pages/AdminAddGame";
import { Game } from "./types";
import { useAudio } from "./context/AudioContext";
import { useEffect } from "react";

const MotionBox = motion(Box);

function App() {
  const { playSFX, startBGM, fadeBGM } = useAudio();
  const [searchText, setSearchText] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameToEdit, setGameToEdit] = useState<Game | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  type AdminMode = 'none' | 'add' | 'modify' | 'delete';
  const [adminMode, setAdminMode] = useState<AdminMode>('none');

  // Transition Stages
  type TransitionStage =
    | 'entry'
    | 'landing'
    | 'fading-out-landing'
    | 'morphing-to-main'
    | 'main'
    | 'fading-out-main'
    | 'morphing-to-landing';

  const [transitionStage, setTransitionStage] = useState<TransitionStage>('entry');


  // Handle Initial Entry
  const handleEntry = () => {
    startBGM('home-bg.mp3', 0.01);
    setTransitionStage('landing');
  };

  // Handle Enter click (Landing -> Main)
  const handleEnter = () => {
    setTransitionStage('fading-out-landing'); // 0.5s fade out
    fadeBGM('home-bg.mp3', 0, 1500);

    setTimeout(() => {
      setTransitionStage('morphing-to-main'); // Background starts morphing to DARK
      playSFX('transition.wav', 0.075);

      // 2.5s morph
      setTimeout(() => {
        setTransitionStage('main'); // Main UI Fade In
      }, 2500);

    }, 500);
  };

  // Handle Back click (Main -> Landing)
  const handleBack = () => {
    setTransitionStage('fading-out-main'); // 0.5s fade out
    fadeBGM('main-page.ogg', 0, 1500);

    setTimeout(() => {
      setTransitionStage('morphing-to-landing'); // Background starts morphing to LIGHT

      // 2.5s morph
      setTimeout(() => {
        setTransitionStage('landing'); // Landing UI Fade In
        startBGM('home-bg.mp3', 0.15);
      }, 2500);

    }, 500);
  };

  useEffect(() => {
    if (transitionStage === 'main') {
      startBGM('main-page.ogg', 0.015);
    }
  }, [transitionStage, startBGM]);

  const { colorMode } = useColorMode();

  // Determine Background Props based on stage
  // We want the background to be "Landing" (Light) when:
  // - We are AT landing
  // - We are LEAVING landing (fading out)
  // - We are MORPHING TO landing (so the target values are Light, and it lerps towards them)
  const isLandingTarget =
    transitionStage === 'landing' ||
    transitionStage === 'fading-out-landing' ||
    transitionStage === 'morphing-to-landing';

  // Override intensity if in Light Mode (User requested intensity 5)
  // The user asked for "LightPillar intencity from 2 to 5" in light mode.
  // We'll apply this when colorMode is light, or if the stage logic dictates light.
  // Assuming 'Light Mode' corresponds to the Landing visuals OR the actual theme switch.
  // Since the user is toggling themes, we should respect colorMode for the 'Main' app stage too.

  const bgConfig = isLandingTarget ? {
    intensity: colorMode === 'light' ? 4 : 0.8,
    pillarWidth: 3.3,
    rotationSpeed: 0.5,
    rotation: 36,
    topColor: "#ffffff",
    bottomColor: "#ffffff"
  } : {
    intensity: colorMode === 'light' ? 4 : 1.5,
    pillarWidth: 20.0,
    rotationSpeed: 0.05,
    rotation: 45,
    topColor: "#ffffff",
    bottomColor: "#ffffff"
  };

  const toast = useToast();

  return (
    <Box position="relative" minHeight="100vh">
      {/* Background */}
      <AppBackground
        intensity={bgConfig.intensity}
        pillarWidth={bgConfig.pillarWidth}
        rotationSpeed={bgConfig.rotationSpeed}
        rotation={bgConfig.rotation}
        topColor={bgConfig.topColor}
        bottomColor={bgConfig.bottomColor}
        blur={transitionStage === 'entry' ? 60 : 0}
      />

      {/* Entry Page Layer */}
      <AnimatePresence>
        {transitionStage === 'entry' && (
          <EntryPage onEnter={handleEntry} />
        )}
      </AnimatePresence>

      {/* Landing Page Layer */}
      <AnimatePresence>
        {(transitionStage === 'landing' || transitionStage === 'fading-out-landing') && (
          <HomePage onEnter={handleEnter} />
        )}
      </AnimatePresence>

      {/* Main Content Layer - only mounted when stage is main or fading-out-main to trigger entrance animations */}
      {(transitionStage === 'main' || transitionStage === 'fading-out-main') && (
        <MotionBox
          position="relative"
          zIndex="1"
          initial={{ opacity: 0 }}
          animate={{ opacity: transitionStage === 'main' ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeIn" }}
        >
          <Navbar onLogoClick={handleBack} />

          {(adminMode === 'add' || gameToEdit) ? (
            <AdminAddGame
              initialData={gameToEdit || undefined}
              onBack={() => {
                setAdminMode('none');
                setGameToEdit(null);
                setSearchText("");
              }}
            />
          ) : (
            <>
              <GameHeading
                onSearch={(val) => {
                  const normalizedVal = val.toLowerCase().trim();
                  if (normalizedVal === "cheats activate" || normalizedVal === "cheat activate") {
                    setAdminMode('add');
                    setSearchText("");
                    toast({
                      title: "Admin Mode Activated",
                      description: "Opening 'Add Game' form...",
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });
                  } else if (normalizedVal === "cheats modify" || normalizedVal === "cheat modify") {
                    setAdminMode('modify');
                    setSearchText("");
                    toast({
                      title: "Modify Mode Activated",
                      description: "Click any game to edit it.",
                      status: "info",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });
                  } else if (normalizedVal === "cheats deactivate" || normalizedVal === "cheat deactivate") {
                    setAdminMode('delete');
                    setSearchText("");
                    toast({
                      title: "Delete Mode Activated",
                      description: "Click 'X' on games to remove them.",
                      status: "warning",
                      duration: 3000,
                      isClosable: true,
                      position: "top",
                    });
                  } else if (normalizedVal === "cheats cancel" || normalizedVal === "cheat cancel") {
                    setAdminMode('none');
                    setSearchText("");
                    toast({
                      title: "Modes Canceled",
                      status: "info",
                      duration: 2000,
                      isClosable: true,
                      position: "top",
                    });
                  } else {
                    setSearchText(val);
                  }
                }}
                onToggleSidebar={() => setIsSidebarOpen(true)}
                selectedGenre={selectedGenre}
              />

              <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onSelectGenre={(genre) => {
                  setSelectedGenre(genre);
                  setIsSidebarOpen(false);
                }}
              />

              <Box p={5}>
                <GameGrid
                  searchText={searchText}
                  genre={selectedGenre}
                  onSelectGame={(game) => {
                    if (adminMode === 'modify') {
                      setGameToEdit(game);
                    } else if (adminMode === 'none') {
                      setSelectedGame(game);
                    }
                  }}
                  adminMode={adminMode}
                  refreshKey={refreshKey}
                  onRefresh={() => {
                    setRefreshKey(prev => prev + 1);
                  }}
                />
              </Box>
            </>
          )}
        </MotionBox>
      )}

      {/* Game Details Modal */}
      <GameDetailsModal
        game={selectedGame}
        isOpen={!!selectedGame}
        onClose={() => setSelectedGame(null)}
      />
    </Box>
  );
}


export default App;