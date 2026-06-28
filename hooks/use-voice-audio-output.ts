import { useCallback, useEffect, useState } from "react";

import {
  getLiveKitAudioOutputs,
  selectLiveKitAudioOutput,
} from "@/lib/livekit-audio-session";
import {
  fromLiveKitOutputId,
  labelForLiveKitOutput,
  toLiveKitOutputId,
  VOICE_AUDIO_ROUTE_LABELS,
  type VoiceAudioRouteId,
} from "@/lib/voice-audio-output";

export type VoiceAudioOption = {
  deviceId: string;
  label: string;
  route: VoiceAudioRouteId | "other";
};

const AUDIO_READY_RETRIES = 8;
const AUDIO_READY_DELAY_MS = 500;
const AUDIO_SESSION_SETTLE_MS = 300;

export function useVoiceAudioOutput(active: boolean) {
  const [route, setRoute] = useState<VoiceAudioRouteId>("speaker");
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [options, setOptions] = useState<VoiceAudioOption[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshOptions = useCallback(async () => {
    const outputs = await getLiveKitAudioOutputs();
    const mapped = outputs.map((deviceId) => ({
      deviceId,
      label: labelForLiveKitOutput(deviceId),
      route: fromLiveKitOutputId(deviceId) ?? ("other" as const),
    }));
    setOptions(mapped);
    return mapped;
  }, []);

  const selectDevice = useCallback(async (deviceId: string) => {
    setLoading(true);
    try {
      const selected = await selectLiveKitAudioOutput(deviceId);
      if (!selected) return;

      setActiveDeviceId(deviceId);
      const normalized = fromLiveKitOutputId(deviceId);
      if (normalized) {
        setRoute(normalized);
      }
    } catch {
      // Session may not be ready yet.
    } finally {
      setLoading(false);
    }
  }, []);

  const selectRoute = useCallback(
    async (next: VoiceAudioRouteId) => {
      await selectDevice(toLiveKitOutputId(next));
    },
    [selectDevice]
  );

  useEffect(() => {
    if (!active) {
      setRoute("speaker");
      setActiveDeviceId(null);
      setOptions([]);
      return;
    }

    let cancelled = false;

    void (async () => {
      await new Promise((resolve) => setTimeout(resolve, AUDIO_SESSION_SETTLE_MS));

      for (let attempt = 0; attempt < AUDIO_READY_RETRIES; attempt += 1) {
        if (cancelled) return;

        try {
          const mapped = await refreshOptions();
          if (mapped.length === 0) {
            throw new Error("No audio outputs yet");
          }

          const speakerId = toLiveKitOutputId("speaker");
          if (mapped.some((option) => option.deviceId === speakerId)) {
            const selected = await selectLiveKitAudioOutput(speakerId);
            if (!selected || cancelled) return;
            setRoute("speaker");
            setActiveDeviceId(speakerId);
          }
          return;
        } catch {
          await new Promise((resolve) => setTimeout(resolve, AUDIO_READY_DELAY_MS));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [active, refreshOptions]);

  return {
    route,
    routeLabel: VOICE_AUDIO_ROUTE_LABELS[route],
    activeDeviceId,
    options,
    loading,
    selectRoute,
    selectDevice,
    refreshOptions,
  };
}
