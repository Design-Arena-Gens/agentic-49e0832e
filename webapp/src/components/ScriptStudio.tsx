"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  ImageIcon,
  LayoutDashboard,
  Loader2,
  Mic,
  Music,
  Pause,
  Play,
  Plus,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { ChangeEvent, useMemo, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Tooltip } from "@/components/ui/Tooltip";

type Scene = {
  id: string;
  title: string;
  summary: string;
  duration: number;
  transition: string;
  notes: string;
  assetIds: string[];
};

type AssetType = "image" | "video" | "audio";

type Asset = {
  id: string;
  name: string;
  type: AssetType;
  size: string;
  source: "upload" | "library";
};

type ExportSettings = {
  resolution: "720p" | "1080p" | "4k";
  format: "mp4" | "mov";
  includeWatermark: boolean;
  brandingText: string;
  includeCaptions: boolean;
};

type VoiceoverState = "idle" | "recording" | "processing" | "recorded";

const sceneTemplates: Scene[] = [
  {
    id: "scene-1",
    title: "Opening Hook",
    summary:
      "Introduce the topic with a compelling question and establish the tone.",
    duration: 12,
    transition: "fade",
    notes: "Use quick motion graphics and upbeat music.",
    assetIds: [],
  },
  {
    id: "scene-2",
    title: "Problem Statement",
    summary:
      "Highlight the main problem the audience faces with relatable visuals.",
    duration: 18,
    transition: "slide",
    notes: "Show data visualizations and supporting footage.",
    assetIds: [],
  },
  {
    id: "scene-3",
    title: "Solution Breakdown",
    summary:
      "Demonstrate the product in action with callouts for key features.",
    duration: 22,
    transition: "zoom",
    notes: "Focus on clarity and pacing; sync with voiceover cues.",
    assetIds: [],
  },
];

const libraryAssets: Asset[] = [
  {
    id: "asset-1",
    name: "City Skyline B-Roll.mp4",
    type: "video",
    size: "18 MB",
    source: "library",
  },
  {
    id: "asset-2",
    name: "Team Collaboration.jpg",
    type: "image",
    size: "2.4 MB",
    source: "library",
  },
  {
    id: "asset-3",
    name: "Confident Voiceover.wav",
    type: "audio",
    size: "4.1 MB",
    source: "library",
  },
];

const defaultScript = `Scene 1 – Opening Hook:
- Introduce the challenge of producing studio-quality videos quickly.
- Tease the AI-driven workflow that removes creative bottlenecks.

Scene 2 – Problem Statement:
- Showcase real-world footage of marketing teams juggling multiple tools.
- Highlight pain points with on-screen text overlays.

Scene 3 – Solution Breakdown:
- Demonstrate the storyboard interface and AI script suggestions.
- Emphasize collaboration, drag-and-drop editing, and branded exports.`;

const resolutions: ExportSettings["resolution"][] = ["720p", "1080p", "4k"];
const formats: ExportSettings["format"][] = ["mp4", "mov"];

const formatLabels: Record<ExportSettings["format"], string> = {
  mp4: "MP4 (H.264)",
  mov: "MOV (Apple ProRes)",
};

const typeLabels: Record<AssetType, string> = {
  image: "Image",
  video: "Video",
  audio: "Audio",
};

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ScriptStudio() {
  const [script, setScript] = useState(defaultScript);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState(
    "Draft refined scene beats with AI for consistent tone and pacing."
  );
  const [scenes, setScenes] = useState<Scene[]>(sceneTemplates);
  const [assets, setAssets] = useState<Asset[]>(libraryAssets);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(
    sceneTemplates[0]?.id ?? null
  );
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    resolution: "1080p",
    format: "mp4",
    includeWatermark: false,
    brandingText: "Storyboard Studio",
    includeCaptions: true,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [voiceoverState, setVoiceoverState] = useState<VoiceoverState>("idle");
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null);
  const [voiceoverError, setVoiceoverError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const handleAiAssist = async () => {
    setAiLoading(true);
    setStatusMessage("Generating AI-assisted rewrite...");
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setScript(
      `Scene 1 – Spark the Curiosity:
- Pose a bold question about scaling video teams.
- Cut to dynamic footage with overlay text teasing automation.

Scene 2 – Visualize the Challenge:
- Present quick cuts of hectic production timelines and approvals.
- Layer in statistic callouts that reinforce the pain point.

Scene 3 – Guided Solution Tour:
- Navigate through the drag-and-drop storyboard builder.
- Show AI copy suggestions updating the script in real time.

Scene 4 – Finishing Touches:
- Drop in branded transitions, watermark, and multi-format export.
- End with a confident CTA reinforced by the narrator.`
    );
    setAiSummary(
      "AI rewrote the script to reinforce narrative arc and added a new closing scene."
    );
    setScenes((prev) => [
      ...prev,
      {
        id: generateId("scene"),
        title: "Finishing Touches",
        summary:
          "Apply transitions, brand overlays, and prep export deliverables.",
        duration: 14,
        transition: "morph",
        notes: "Show watermark controls and caption toggles.",
        assetIds: [],
      },
    ]);
    setAiLoading(false);
    setStatusMessage("AI suggestions ready.");
  };

  const handleSceneSelect = (sceneId: string) => {
    setSelectedSceneId(sceneId);
  };

  const handleSceneUpdate = <Key extends keyof Scene>(
    sceneId: string,
    key: Key,
    value: Scene[Key]
  ) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, [key]: value } : scene
      )
    );
  };

  const handleSceneAdd = () => {
    const newScene: Scene = {
      id: generateId("scene"),
      title: "New Scene",
      summary: "Describe the action or dialogue for this scene.",
      duration: 10,
      transition: "cut",
      notes: "",
      assetIds: [],
    };
    setScenes((prev) => [...prev, newScene]);
    setSelectedSceneId(newScene.id);
    setStatusMessage("Scene added to storyboard.");
  };

  const handleSceneDelete = (sceneId: string) => {
    setScenes((prev) => {
      const filtered = prev.filter((scene) => scene.id !== sceneId);
      if (selectedSceneId === sceneId) {
        setSelectedSceneId(filtered[0]?.id ?? null);
      }
      return filtered;
    });
    setStatusMessage("Scene removed.");
  };

  const handleDragStart = (sceneId: string) => {
    setDraggedSceneId(sceneId);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedSceneId || draggedSceneId === targetId) {
      setDraggedSceneId(null);
      return;
    }
    setScenes((prev) => {
      const items = [...prev];
      const fromIndex = items.findIndex((item) => item.id === draggedSceneId);
      const toIndex = items.findIndex((item) => item.id === targetId);
      if (fromIndex === -1 || toIndex === -1) {
        return prev;
      }
      const [removed] = items.splice(fromIndex, 1);
      items.splice(toIndex, 0, removed);
      return items;
    });
    setDraggedSceneId(null);
    setStatusMessage("Scene order updated.");
  };

  const handleAssetUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const newAssets: Asset[] = Array.from(files).map((file) => {
      const fileType = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : "audio";
      return {
        id: generateId("asset"),
        name: file.name,
        type: fileType,
        size: `${Math.max(file.size / (1024 * 1024), 0.1).toFixed(1)} MB`,
        source: "upload",
      };
    });

    setAssets((prev) => [...newAssets, ...prev]);
    setStatusMessage(`${newAssets.length} asset(s) added.`);
    event.target.value = "";
  };

  const handleAssetAttach = (sceneId: string, assetId: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId && !scene.assetIds.includes(assetId)
          ? { ...scene, assetIds: [...scene.assetIds, assetId] }
          : scene
      )
    );
    setStatusMessage("Asset linked to scene.");
  };

  const handleAssetDetach = (sceneId: string, assetId: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId
          ? {
              ...scene,
              assetIds: scene.assetIds.filter((id) => id !== assetId),
            }
          : scene
      )
    );
    setStatusMessage("Asset removed from scene.");
  };

  const handleExport = () => {
    setModalOpen(true);
  };

  const confirmExport = () => {
    setModalOpen(false);
    setStatusMessage(
      `Rendering ${exportSettings.format.toUpperCase()} in ${exportSettings.resolution}...`
    );
  };

  const attachedAssets = (scene: Scene) =>
    scene.assetIds.map((id) => assets.find((asset) => asset.id === id));

  const progressValue = useMemo(() => {
    const totalSteps = 5;
    let completed = 0;
    if (script.trim().length > 120) completed += 1;
    if (scenes.length >= 3) completed += 1;
    if (assets.length >= scenes.length) completed += 1;
    if (voiceoverState === "recorded" || voiceoverUrl) completed += 1;
    if (exportSettings.brandingText.trim().length) completed += 1;
    return Math.round((completed / totalSteps) * 100);
  }, [script, scenes.length, assets.length, voiceoverState, voiceoverUrl, exportSettings.brandingText]);

  const selectedScene = scenes.find((scene) => scene.id === selectedSceneId);

  const togglePreview = () => {
    setPreviewPlaying((prev) => !prev);
  };

  const startVoiceoverRecording = async () => {
    setVoiceoverError(null);
    if (voiceoverState === "recording") return;
    try {
      setVoiceoverState("processing");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      voiceChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        voiceChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setVoiceoverUrl(url);
        setVoiceoverState("recorded");
        setStatusMessage("Voiceover captured.");
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setVoiceoverState("recording");
    } catch (error) {
      console.error(error);
      setVoiceoverError(
        "Microphone access unavailable. You can upload a voiceover file instead."
      );
      setVoiceoverState("idle");
    }
  };

  const stopVoiceoverRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  };

  const handleVoiceUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setVoiceoverUrl(url);
    setVoiceoverState("recorded");
    setStatusMessage(`Voiceover "${file.name}" uploaded.`);
    event.target.value = "";
  };

  const removeVoiceover = () => {
    if (voiceoverUrl) {
      URL.revokeObjectURL(voiceoverUrl);
    }
    setVoiceoverUrl(null);
    setVoiceoverState("idle");
    setStatusMessage("Voiceover removed.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-8 py-5">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="size-8 rounded-lg bg-accent-500/20 p-2 text-accent-600" aria-hidden />
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Storyboard Studio
              </p>
              <h1 className="text-xl font-semibold text-slate-900">
                Scripted Video Generator
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 md:flex" aria-live="polite">
              <div className="flex h-10 w-36 items-center rounded-full bg-slate-100 px-3">
                <div
                  className="h-2 rounded-full bg-accent-500"
                  style={{ width: `${progressValue}%` }}
                  role="progressbar"
                  aria-valuenow={progressValue}
                  aria-valuemin={0}
                  aria-valuemax={100}
                />
              </div>
              <span className="text-sm font-medium text-slate-600">
                {progressValue}% Ready
              </span>
            </div>
            <Tooltip label="Configure export details and finalize renders">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
              >
                <Download className="size-4" aria-hidden />
                Export Video
              </button>
            </Tooltip>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-6 pb-16 pt-8 lg:flex-row">
        <section
          className="flex flex-1 flex-col gap-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-panel"
          aria-labelledby="script-panel-title"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="script-panel-title" className="text-lg font-semibold text-slate-900">
                Script Workspace
              </h2>
              <p className="text-sm text-slate-500">
                Draft, edit, and collaborate with AI-powered suggestions.
              </p>
            </div>
            <Tooltip label="Boost your draft with AI-assisted rewrites">
              <button
                type="button"
                onClick={handleAiAssist}
                className="inline-flex items-center gap-2 rounded-full border border-accent-500 px-4 py-2 text-sm font-semibold text-accent-600 transition hover:bg-accent-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                {aiLoading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="size-4" aria-hidden />
                )}
                AI Suggest
              </button>
            </Tooltip>
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <label htmlFor="script-textarea" className="text-sm font-medium text-slate-700">
              Script Outline
            </label>
            <textarea
              id="script-textarea"
              value={script}
              onChange={(event) => setScript(event.target.value)}
              className="min-h-[260px] flex-1 resize-none rounded-2xl border border-slate-200 bg-base-50 p-5 text-sm leading-relaxed text-slate-700 shadow-inner focus-visible:border-accent-500 focus-visible:outline-none"
              aria-describedby="script-helper"
            />
            <p id="script-helper" className="text-xs text-slate-500">
              Use scene markers like “Scene 1 – Title” to keep your storyboard synced.
            </p>
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-600"
              role="status"
              aria-live="polite"
            >
              <span className="inline-flex items-center gap-2 text-slate-600">
                <Sparkles className="size-3.5 text-accent-500" aria-hidden />
                {aiLoading ? "Working on suggestions..." : aiSummary}
              </span>
              <span className="font-semibold text-slate-500">
                {script.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
          </div>
        </section>

        <aside className="flex w-full max-w-xl flex-col gap-6">
          <section
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel"
            aria-labelledby="storyboard-title"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="storyboard-title" className="text-lg font-semibold text-slate-900">
                  Storyboard Timeline
                </h2>
                <p className="text-sm text-slate-500">
                  Arrange scenes with drag-and-drop or keyboard controls.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSceneAdd}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-accent-500 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <Plus className="size-4" aria-hidden />
                New Scene
              </button>
            </div>

            <ul className="mt-5 space-y-3" aria-label="Storyboard scenes">
              {scenes.map((scene, index) => {
                const isSelected = scene.id === selectedSceneId;
                return (
                  <li
                    key={scene.id}
                    draggable
                    onDragStart={() => handleDragStart(scene.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleDrop(scene.id)}
                    className={`group rounded-2xl border border-slate-200 bg-base-50 p-4 transition ${
                      isSelected ? "border-accent-500 bg-white shadow-panel" : "hover:border-accent-500/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSceneSelect(scene.id)}
                      className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      aria-pressed={isSelected}
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          Scene {index + 1}
                        </p>
                        <p className="text-sm font-semibold text-slate-800">
                          {scene.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                          {scene.summary}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-slate-500 shadow">
                          {scene.duration} sec
                        </span>
                        <span className="text-[11px] uppercase text-slate-400">
                          {scene.transition}
                        </span>
                      </div>
                    </button>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2 text-slate-500">
                        <span>{scene.assetIds.length} asset(s)</span>
                        <span aria-hidden>•</span>
                        <span>{scene.notes ? "Has notes" : "No notes"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleDrop(scene.id)}
                          className="rounded-full p-1 text-slate-400 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500"
                          aria-label="Drop here"
                        >
                          <ArrowRight className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setScenes((prev) => {
                              if (index === 0) return prev;
                              const items = [...prev];
                              const [removed] = items.splice(index, 1);
                              items.splice(index - 1, 0, removed);
                              return items;
                            })
                          }
                          className="rounded-full p-1 text-slate-400 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500"
                          aria-label="Move scene up"
                        >
                          <ChevronUp className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setScenes((prev) => {
                              if (index === prev.length - 1) return prev;
                              const items = [...prev];
                              const [removed] = items.splice(index, 1);
                              items.splice(index + 1, 0, removed);
                              return items;
                            })
                          }
                          className="rounded-full p-1 text-slate-400 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500"
                          aria-label="Move scene down"
                        >
                          <ChevronDown className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSceneDelete(scene.id)}
                          className="rounded-full p-1 text-slate-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                          aria-label="Delete scene"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel"
            aria-labelledby="voiceover-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="voiceover-title" className="text-lg font-semibold text-slate-900">
                  Voiceover Booth
                </h2>
                <p className="text-sm text-slate-500">
                  Record narration or upload an existing track.
                </p>
              </div>
              <Settings2 className="size-5 text-slate-300" aria-hidden />
            </div>
            <div className="mt-5 space-y-4">
              <div className="flex items-center gap-3">
                {voiceoverState === "recording" ? (
                  <button
                    type="button"
                    onClick={stopVoiceoverRecording}
                    className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500"
                  >
                    <Square className="size-4" aria-hidden />
                    Stop Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startVoiceoverRecording}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
                  >
                    <Mic className="size-4" aria-hidden />
                    {voiceoverState === "processing" ? "Starting..." : "Record Voiceover"}
                  </button>
                )}
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-accent-500 hover:text-accent-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-500">
                  <UploadCloud className="size-4" aria-hidden />
                  Upload
                  <input
                    type="file"
                    accept="audio/*"
                    className="sr-only"
                    onChange={handleVoiceUpload}
                  />
                </label>
                {voiceoverUrl ? (
                  <button
                    type="button"
                    onClick={removeVoiceover}
                    className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <div
                className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs text-slate-600"
                role="status"
                aria-live="polite"
              >
                <span>
                  {voiceoverState === "recording"
                    ? "Recording in progress..."
                    : voiceoverState === "recorded"
                    ? "Voiceover ready for preview."
                    : "Record a new narration or import one from your device."}
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500">
                  <Music className="size-3.5" aria-hidden />
                  WAV, MP3, AAC
                </span>
              </div>
              {voiceoverError ? (
                <p className="rounded-xl bg-red-50 px-4 py-2 text-xs text-red-600">
                  {voiceoverError}
                </p>
              ) : null}
              {voiceoverUrl ? (
                <audio
                  controls
                  src={voiceoverUrl}
                  className="w-full rounded-xl"
                  aria-label="Voiceover playback"
                />
              ) : null}
            </div>
          </section>
        </aside>
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pb-14">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel"
            aria-labelledby="scene-detail-title"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="scene-detail-title" className="text-lg font-semibold text-slate-900">
                  Scene Details
                </h2>
                <p className="text-sm text-slate-500">
                  Fine-tune selected scene, add notes, and manage transitions.
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                <Settings2 className="size-3.5" aria-hidden />
                {selectedScene ? selectedScene.transition : "Select a scene"}
              </span>
            </div>

            {selectedScene ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Scene Title
                    <input
                      type="text"
                      value={selectedScene.title}
                      onChange={(event) =>
                        handleSceneUpdate(selectedScene.id, "title", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-base-50 px-3 py-2 text-sm text-slate-700 focus-visible:border-accent-500 focus-visible:outline-none"
                    />
                  </label>

                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Duration (seconds)
                    <input
                      type="number"
                      min={3}
                      value={selectedScene.duration}
                      onChange={(event) =>
                        handleSceneUpdate(
                          selectedScene.id,
                          "duration",
                          Number(event.target.value)
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-base-50 px-3 py-2 text-sm text-slate-700 focus-visible:border-accent-500 focus-visible:outline-none"
                    />
                  </label>

                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Transition
                    <select
                      value={selectedScene.transition}
                      onChange={(event) =>
                        handleSceneUpdate(selectedScene.id, "transition", event.target.value)
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-base-50 px-3 py-2 text-sm text-slate-700 focus-visible:border-accent-500 focus-visible:outline-none"
                    >
                      {["cut", "fade", "slide", "zoom", "morph"].map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Scene Summary
                    <textarea
                      value={selectedScene.summary}
                      onChange={(event) =>
                        handleSceneUpdate(selectedScene.id, "summary", event.target.value)
                      }
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-base-50 px-3 py-2 text-sm text-slate-700 focus-visible:border-accent-500 focus-visible:outline-none"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Director Notes
                    <textarea
                      value={selectedScene.notes}
                      onChange={(event) =>
                        handleSceneUpdate(selectedScene.id, "notes", event.target.value)
                      }
                      rows={4}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-base-50 px-3 py-2 text-sm text-slate-700 focus-visible:border-accent-500 focus-visible:outline-none"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">
                Select a scene to view and edit details.
              </p>
            )}
          </section>

          <section
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel/40"
            aria-labelledby="preview-title"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="preview-title" className="text-lg font-semibold text-slate-900">
                  Preview & Playback
                </h2>
                <p className="text-sm text-slate-500">
                  Review how scenes flow with transitions and voiceover.
                </p>
              </div>
              <button
                type="button"
                onClick={togglePreview}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-accent-500 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                {previewPlaying ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
                {previewPlaying ? "Pause" : "Play"}
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
                  <Video className="size-10" aria-hidden />
                  <p className="text-sm font-semibold">
                    {previewPlaying ? "Previewing storyboard sequence..." : "Preview paused"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedScene
                      ? `Currently on ${selectedScene.title}`
                      : "Select a scene to highlight."}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Timeline Progress</span>
                  <span>{progressValue}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-accent-500 transition-all"
                    style={{ width: `${progressValue}%` }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section
          className="mt-6 grid gap-6 lg:grid-cols-[2fr,1fr]"
          aria-labelledby="media-panel-title"
        >
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 id="media-panel-title" className="text-lg font-semibold text-slate-900">
                  Media Library
                </h2>
                <p className="text-sm text-slate-500">
                  Drag assets into scenes or attach from the quick actions below.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-accent-500 hover:text-accent-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-500">
                <UploadCloud className="size-4" aria-hidden />
                Import Media
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  className="sr-only"
                  onChange={handleAssetUpload}
                />
              </label>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {assets.map((asset) => (
                <article
                  key={asset.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-base-50 p-4 transition hover:border-accent-500/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-2xl bg-white text-slate-500 shadow">
                        {asset.type === "image" ? (
                          <ImageIcon className="size-5" aria-hidden />
                        ) : asset.type === "video" ? (
                          <Video className="size-5" aria-hidden />
                        ) : (
                          <Music className="size-5" aria-hidden />
                        )}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {asset.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {typeLabels[asset.type]} • {asset.size}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] uppercase text-slate-400">
                      {asset.source === "upload" ? "Uploaded" : "Library"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs text-slate-500">
                      Attach to Scene
                    </span>
                    {scenes.map((scene) => (
                      <button
                        key={scene.id}
                        type="button"
                        onClick={() => handleAssetAttach(scene.id, asset.id)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-accent-500 hover:text-accent-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-500"
                      >
                        {scene.title}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-panel">
            <h2 className="text-lg font-semibold text-slate-900">
              Scene Assets
            </h2>
            <p className="text-sm text-slate-500">
              Manage assets assigned to the selected scene.
            </p>
            {selectedScene ? (
              <ul className="mt-4 space-y-3">
                {attachedAssets(selectedScene).map((asset) =>
                  asset ? (
                    <li
                      key={asset.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-base-50 px-3 py-2 text-sm text-slate-600"
                    >
                      <span className="flex items-center gap-2">
                        {asset.type === "image" ? (
                          <ImageIcon className="size-4" aria-hidden />
                        ) : asset.type === "video" ? (
                          <Video className="size-4" aria-hidden />
                        ) : (
                          <Music className="size-4" aria-hidden />
                        )}
                        {asset.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAssetDetach(selectedScene.id, asset.id)}
                        className="rounded-full border border-slate-200 px-2 py-1 text-xs text-slate-500 transition hover:border-red-300 hover:text-red-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                      >
                        Remove
                      </button>
                    </li>
                  ) : null
                )}
                {!selectedScene.assetIds.length ? (
                  <li className="rounded-2xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400">
                    No assets linked yet. Attach files from the media library.
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-400">
                Select a scene to view its asset list.
              </p>
            )}
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 text-xs text-slate-500">
          <div className="inline-flex items-center gap-2" aria-live="polite">
            <Check className="size-3.5 text-accent-500" aria-hidden />
            {statusMessage ?? "All changes saved locally."}
          </div>
          <div className="flex items-center gap-2">
            <span>Export Format:</span>
            <strong className="text-slate-700">
              {formatLabels[exportSettings.format]}
            </strong>
            <span aria-hidden>•</span>
            <span>Resolution:</span>
            <strong className="text-slate-700">{exportSettings.resolution}</strong>
          </div>
        </div>
      </footer>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Finalize Export"
        description="Select quality, format, and branding preferences before rendering."
        actions={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmExport}
              className="inline-flex items-center gap-2 rounded-full bg-accent-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-500"
            >
              <Download className="size-4" aria-hidden />
              Start Export
            </button>
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                Resolution
              </h3>
              <div className="mt-3 grid gap-2">
                {resolutions.map((value) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-2 text-sm ${
                      exportSettings.resolution === value
                        ? "border-accent-500 bg-accent-500/10 text-accent-600"
                        : "border-slate-200 text-slate-600 hover:border-accent-200"
                    }`}
                  >
                    <span>{value.toUpperCase()}</span>
                    <input
                      type="radio"
                      name="resolution"
                      value={value}
                      checked={exportSettings.resolution === value}
                      onChange={() =>
                        setExportSettings((prev) => ({ ...prev, resolution: value }))
                      }
                      className="size-4 accent-accent-600"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700">Format</h3>
              <div className="mt-3 grid gap-2">
                {formats.map((format) => (
                  <label
                    key={format}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-3 py-2 text-sm ${
                      exportSettings.format === format
                        ? "border-accent-500 bg-accent-500/10 text-accent-600"
                        : "border-slate-200 text-slate-600 hover:border-accent-200"
                    }`}
                  >
                    <span>{formatLabels[format]}</span>
                    <input
                      type="radio"
                      name="format"
                      value={format}
                      checked={exportSettings.format === format}
                      onChange={() =>
                        setExportSettings((prev) => ({ ...prev, format }))
                      }
                      className="size-4 accent-accent-600"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Branding Text
                <input
                  type="text"
                  value={exportSettings.brandingText}
                  onChange={(event) =>
                    setExportSettings((prev) => ({
                      ...prev,
                      brandingText: event.target.value,
                    }))
                  }
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-base-50 px-3 py-2 text-sm text-slate-700 focus-visible:border-accent-500 focus-visible:outline-none"
                />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={exportSettings.includeWatermark}
                onChange={(event) =>
                  setExportSettings((prev) => ({
                    ...prev,
                    includeWatermark: event.target.checked,
                  }))
                }
                className="size-4 accent-accent-600"
              />
              Include watermark with branding
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={exportSettings.includeCaptions}
                onChange={(event) =>
                  setExportSettings((prev) => ({
                    ...prev,
                    includeCaptions: event.target.checked,
                  }))
                }
                className="size-4 accent-accent-600"
              />
              Embed captions for accessibility
            </label>
            <div className="rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600">
              Export includes {scenes.length} scene(s),{" "}
              {assets.length} asset(s), and voiceover{" "}
              {voiceoverUrl ? "attached." : "pending upload."}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
