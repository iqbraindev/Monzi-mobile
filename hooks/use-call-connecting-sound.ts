import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useEffect, useRef } from "react";

const CALLING_BEEP = require("../assets/sounds/calling-beep.wav");

export function useCallConnectingSound(active: boolean) {
  const player = useAudioPlayer(CALLING_BEEP);
  const configuredRef = useRef(false);

  useEffect(() => {
    if (!active) {
      player.loop = false;
      player.pause();
      void player.seekTo(0);
      return;
    }

    void (async () => {
      if (!configuredRef.current) {
        configuredRef.current = true;
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: "mixWithOthers",
        });
      }

      player.loop = true;
      player.volume = 0.65;
      player.play();
    })();

    return () => {
      player.loop = false;
      player.pause();
      void player.seekTo(0);
    };
  }, [active, player]);
}
