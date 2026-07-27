"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { spreeksnelheid } from "./tempo";
import { useStore } from "./store";

/* ── uitspraak laten horen ──────────────────────────────── */

/** "trager" is de knop langzamer: een stap onder wat jouw niveau normaal krijgt. */
export type Tempo = "normaal" | "trager";

/**
 * De snelheid komt uit het niveau van de leerling (zie `tempo.ts`) en wordt
 * hier opgehaald in plaats van meegegeven. Dat is bewust: er wordt op elf
 * plekken voorgelezen, en één vergeten aanroep zou betekenen dat een beginner
 * op dat ene scherm alsnog een woordenbrij hoort.
 */
export function useVoice(lang: string) {
  const { progress } = useStore();
  const niveau = progress.level;
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    const base = lang.split("-")[0].toLowerCase();
    const pick = () => {
      const voices = synth.getVoices();
      const exact = voices.find(
        (v) => v.lang.replace("_", "-").toLowerCase() === lang.toLowerCase()
      );
      const loose = voices.find((v) => v.lang.toLowerCase().startsWith(base));
      const chosen = exact ?? loose ?? null;
      if (chosen) setVoice(chosen);
    };
    pick();
    synth.addEventListener("voiceschanged", pick);
    return () => synth.removeEventListener("voiceschanged", pick);
  }, [lang]);

  return useCallback(
    (text: string, tempo: Tempo = "normaal") => {
      const synth = window.speechSynthesis;
      if (!synth || !text) return;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      if (voice) utterance.voice = voice;
      utterance.rate = spreeksnelheid(niveau, tempo === "trager");
      synth.speak(utterance);
    },
    [lang, voice, niveau]
  );
}

/* ── hardop praten ──────────────────────────────────────── */

type RecognitionResult = { transcript: string };

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<RecognitionResult>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionCtor = new () => RecognitionLike;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Browserondersteuning is een eigenschap van de omgeving, geen React-state. */
const noopSubscribe = () => () => {};
const isSupported = () => recognitionCtor() !== null;
const notOnServer = () => false;

export type ListenState = "idle" | "listening" | "denied";

/**
 * Spraakherkenning voor spreekoefeningen. Werkt in Chrome, Edge en Safari;
 * elders is `supported` false en valt de oefening terug op typen.
 *
 * Het resultaat komt binnen via `onResult` — een callback, geen state die je
 * daarna weer moet overhevelen.
 */
export function useListening(lang: string, onResult?: (transcript: string) => void) {
  const supported = useSyncExternalStore(noopSubscribe, isSupported, notOnServer);
  const [state, setState] = useState<ListenState>("idle");
  const [transcript, setTranscript] = useState("");
  const recognition = useRef<RecognitionLike | null>(null);
  const handler = useRef(onResult);
  useEffect(() => {
    handler.current = onResult;
  });

  useEffect(() => () => recognition.current?.abort(), []);

  const start = useCallback(() => {
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const instance = new Ctor();
    recognition.current = instance;
    instance.lang = lang;
    instance.continuous = false;
    instance.interimResults = false;
    instance.maxAlternatives = 3;
    instance.onresult = (event) => {
      const best = event.results[0]?.[0]?.transcript ?? "";
      setTranscript(best);
      handler.current?.(best);
    };
    instance.onerror = (event) => {
      setState(event.error === "not-allowed" ? "denied" : "idle");
    };
    instance.onend = () => setState((current) => (current === "listening" ? "idle" : current));
    setTranscript("");
    setState("listening");
    instance.start();
  }, [lang]);

  const stop = useCallback(() => {
    recognition.current?.stop();
    setState("idle");
  }, []);

  const clear = useCallback(() => setTranscript(""), []);

  return { state, transcript, start, stop, clear, supported };
}
