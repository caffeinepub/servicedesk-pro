import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit2,
  Eye,
  Italic,
  Megaphone,
  Palette,
  Pause,
  Play,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Type,
  Zap,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../store";
import type { AdminNotice } from "../types";

const COLOR_OPTIONS = [
  {
    value: "amber",
    label: "Amber",
    cls: "bg-amber-500",
    preview: "bg-gradient-to-r from-amber-500 to-orange-500",
  },
  {
    value: "blue",
    label: "Blue",
    cls: "bg-blue-500",
    preview: "bg-gradient-to-r from-blue-600 to-blue-500",
  },
  {
    value: "rose",
    label: "Rose",
    cls: "bg-rose-500",
    preview: "bg-gradient-to-r from-rose-600 to-pink-600",
  },
  {
    value: "emerald",
    label: "Emerald",
    cls: "bg-emerald-500",
    preview: "bg-gradient-to-r from-emerald-600 to-teal-600",
  },
  {
    value: "purple",
    label: "Purple",
    cls: "bg-violet-500",
    preview: "bg-gradient-to-r from-violet-600 to-purple-600",
  },
  {
    value: "orange",
    label: "Orange",
    cls: "bg-orange-500",
    preview: "bg-gradient-to-r from-orange-500 to-amber-600",
  },
  {
    value: "teal",
    label: "Teal",
    cls: "bg-teal-500",
    preview: "bg-gradient-to-r from-teal-500 to-cyan-600",
  },
  {
    value: "dark",
    label: "Dark",
    cls: "bg-slate-800",
    preview: "bg-gradient-to-r from-slate-800 to-slate-900",
  },
  {
    value: "rainbow",
    label: "Rainbow",
    cls: "notice-rainbow-swatch",
    preview: "notice-rainbow-bg",
  },
];

const TEXT_ANIMATION_OPTIONS = [
  { value: "none", label: "None", icon: "—" },
  { value: "typewriter", label: "Typewriter", icon: "⌨" },
  { value: "glow_pulse", label: "Glow Pulse", icon: "✨" },
  { value: "text_bounce", label: "Bounce", icon: "⬆" },
  { value: "text_fadein", label: "Fade In", icon: "💨" },
  { value: "text_shimmer", label: "Shimmer", icon: "🌟" },
  { value: "text_rainbow", label: "Rainbow Text", icon: "🌈" },
];

const SPEED_OPTIONS = [
  { value: "slow", label: "Slow", desc: "30s" },
  { value: "normal", label: "Normal", desc: "18s" },
  { value: "fast", label: "Fast", desc: "10s" },
];

const FONT_SIZE_OPTIONS = [
  { value: "sm", label: "Small" },
  { value: "base", label: "Medium" },
  { value: "lg", label: "Large" },
];

const ANIMATION_OPTIONS = [
  { value: "none", label: "None", icon: "—" },
  { value: "fadein", label: "Fade In", icon: "✨" },
  { value: "slidein", label: "Slide In", icon: "↓" },
  { value: "bounce", label: "Bounce", icon: "⬆" },
  { value: "pulse", label: "Pulse/Glow", icon: "💫" },
  { value: "shimmer", label: "Shimmer", icon: "🌟" },
  { value: "blink", label: "Blink", icon: "⚡" },
];

function getStatus(notice: AdminNotice) {
  if (!notice.isActive)
    return { label: "Inactive", cls: "bg-slate-100 text-slate-500" };
  if (notice.expiryDate && new Date(notice.expiryDate) < new Date()) {
    return { label: "Expired", cls: "bg-red-100 text-red-600" };
  }
  return { label: "Active", cls: "bg-emerald-100 text-emerald-700" };
}

function formatDate(s?: string) {
  if (!s) return "No expiry";
  try {
    return new Date(s).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return s;
  }
}

type FormState = {
  title: string;
  message: string;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  direction: "ltr" | "rtl" | "center" | "left" | "right";
  color: string;
  speed: "slow" | "normal" | "fast";
  fontSize: "sm" | "base" | "lg";
  bold: boolean;
  italic: boolean;
  paused: boolean;
  animation: string;
  textAnimation: string;
  textColor: string;
  customBannerColor: string;
  visibleTo: "all" | "supervisor" | "backend_user";
  visibleToNames: string[];
};

const defaultForm: FormState = {
  title: "",
  message: "",
  startDate: "",
  expiryDate: "",
  isActive: true,
  direction: "rtl",
  color: "amber",
  speed: "normal",
  fontSize: "base",
  bold: false,
  italic: false,
  paused: false,
  animation: "none",
  textAnimation: "none",
  textColor: "",
  customBannerColor: "",
  visibleTo: "all",
  visibleToNames: [],
};

export default function AdminNoticesPage() {
  const {
    currentUser,
    adminNotices,
    addAdminNotice,
    deleteAdminNotice,
    updateAdminNotice,
    users,
  } = useStore();

  const [open, setOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<AdminNotice | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [form, setForm] = useState<FormState>(defaultForm);

  if (currentUser?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Megaphone className="h-16 w-16 mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-bold text-slate-600">
            Access Restricted
          </h2>
          <p className="text-slate-400 mt-2">
            Notices management is only accessible to administrators.
          </p>
        </div>
      </div>
    );
  }

  const openNew = () => {
    setForm(defaultForm);
    setEditNotice(null);
    setOpen(true);
  };

  const openEdit = (n: AdminNotice) => {
    setForm({
      title: n.title,
      message: n.message,
      startDate: (n as any).startDate
        ? String((n as any).startDate).slice(0, 10)
        : "",
      expiryDate: n.expiryDate ? n.expiryDate.slice(0, 10) : "",
      isActive: n.isActive,
      direction: (n.direction as "ltr" | "rtl") ?? "rtl",
      color: n.color ?? "amber",
      speed: (n.speed as "slow" | "normal" | "fast") ?? "normal",
      fontSize: ((n as any).fontSize as "sm" | "base" | "lg") ?? "base",
      bold: (n as any).bold ?? false,
      italic: (n as any).italic ?? false,
      paused: (n as any).paused ?? false,
      animation: (n as any).animation ?? "none",
      textAnimation: (n as any).textAnimation ?? "none",
      textColor: (n as any).textColor ?? "",
      customBannerColor: (n as any).customBannerColor ?? "",
      visibleTo: (n as any).visibleTo ?? "all",
      visibleToNames: (n as any).visibleToNames ?? [],
    });
    setEditNotice(n);
    setOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.message.trim()) return;
    const payload = {
      title: form.title,
      message: form.message,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      expiryDate: form.expiryDate
        ? new Date(form.expiryDate).toISOString()
        : undefined,
      isActive: form.isActive,
      createdBy: currentUser?.name ?? "Admin",
      direction: form.direction,
      color: form.color,
      speed: form.speed,
      fontSize: form.fontSize,
      bold: form.bold,
      italic: form.italic,
      paused: form.paused,
      animation: form.animation,
      textAnimation: form.textAnimation,
      textColor: form.textColor,
      customBannerColor: form.customBannerColor,
      visibleTo: form.visibleTo,
      visibleToNames: form.visibleToNames,
    };
    if (editNotice) {
      updateAdminNotice(editNotice.id, payload);
    } else {
      addAdminNotice(payload);
    }
    setOpen(false);
  };

  const colorOption =
    COLOR_OPTIONS.find((c) => c.value === form.color) ?? COLOR_OPTIONS[0];
  const activeCount = adminNotices.filter(
    (n) => n.isActive && (!n.expiryDate || new Date(n.expiryDate) > new Date()),
  ).length;

  return (
    <div className="space-y-6">
      <style>{`
        @keyframes rainbowBg {
          0% { background-position: 0% 50%; filter: brightness(1) saturate(1.2); }
          25% { background-position: 100% 50%; filter: brightness(1.2) saturate(1.5); }
          50% { background-position: 200% 50%; filter: brightness(1.3) saturate(1.8); }
          75% { background-position: 300% 50%; filter: brightness(1.2) saturate(1.5); }
          100% { background-position: 400% 50%; filter: brightness(1) saturate(1.2); }
        }
        .notice-text-rainbow {
          animation: textHueRotate2 2s linear infinite !important;
          color: #ff4444 !important;
          -webkit-text-fill-color: initial !important;
          background: none !important;
          text-shadow: 0 0 8px rgba(255,100,68,0.6) !important;
          font-weight: bold !important;
        }
        @keyframes textHueRotate2 {
          0% { filter: hue-rotate(0deg) brightness(1.1); color: #ff4444; }
          33% { filter: hue-rotate(120deg) brightness(1.2); color: #44ff44; }
          66% { filter: hue-rotate(240deg) brightness(1.1); color: #4444ff; }
          100% { filter: hue-rotate(360deg) brightness(1.1); color: #ff4444; }
        }
        @keyframes textShimmerGlow2 {
          0%, 100% { text-shadow: 0 0 4px rgba(255,255,255,0.6); opacity: 0.9; }
          50% { text-shadow: 0 0 12px rgba(255,255,255,1), 0 0 24px rgba(255,220,100,0.7); opacity: 1; }
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Megaphone className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notices</h1>
              <p className="text-rose-200 text-sm">
                Broadcast announcements to all users
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-3 py-2">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-bold">{activeCount}</span>
              <span className="text-white/80 text-xs">Active</span>
            </div>
            <Button
              onClick={openNew}
              variant="secondary"
              className="bg-white text-rose-600 hover:bg-rose-50"
              data-ocid="notices.open_modal_button"
            >
              <Plus className="h-4 w-4 mr-2" /> New Notice
            </Button>
          </div>
        </div>
      </div>

      {adminNotices.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Megaphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No notices yet</p>
          <p className="text-sm mt-1">
            Click "New Notice" to publish your first announcement.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {adminNotices.map((notice) => {
          const status = getStatus(notice);
          const colorOpt =
            COLOR_OPTIONS.find((c) => c.value === (notice.color ?? "amber")) ??
            COLOR_OPTIONS[0];
          const isPaused = (notice as any).paused ?? false;
          return (
            <Card
              key={notice.id}
              className="shadow-sm border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className={`h-1 ${colorOpt.preview}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl ${colorOpt.preview} flex items-center justify-center flex-shrink-0`}
                    >
                      <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-800">
                          {notice.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}
                        >
                          {status.label}
                        </span>
                        {isPaused && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                            <Pause className="h-2.5 w-2.5" /> Paused
                          </span>
                        )}
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          {notice.direction === "ltr" ||
                          notice.direction === "rtl"
                            ? notice.direction === "ltr"
                              ? "L→R"
                              : "R←L"
                            : notice.direction === "center"
                              ? "• Center"
                              : notice.direction === "left"
                                ? "≡ Left"
                                : "≡ Right"}{" "}
                          · {notice.speed ?? "normal"}
                        </span>
                        {(notice as any).animation &&
                          (notice as any).animation !== "none" && (
                            <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Zap className="h-2.5 w-2.5" />
                              {(notice as any).animation}
                            </span>
                          )}
                        {(notice as any).visibleTo &&
                          (notice as any).visibleTo !== "all" && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                              {(notice as any).visibleTo === "supervisor"
                                ? "Supervisors"
                                : "Backend Users"}
                              {(notice as any).visibleToNames?.length > 0
                                ? `: ${(notice as any).visibleToNames.join(", ")}`
                                : " only"}
                            </span>
                          )}
                      </div>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed line-clamp-2">
                        {notice.message}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {formatDate(notice.expiryDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          By {notice.createdBy}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Pause/Resume */}
                    <Button
                      size="sm"
                      variant="ghost"
                      title={isPaused ? "Resume" : "Pause"}
                      className={
                        isPaused
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-slate-500 hover:bg-slate-50"
                      }
                      onClick={() =>
                        updateAdminNotice(notice.id, {
                          paused: !isPaused,
                        } as any)
                      }
                      data-ocid="notices.toggle"
                    >
                      {isPaused ? (
                        <Play className="h-4 w-4" />
                      ) : (
                        <Pause className="h-4 w-4" />
                      )}
                    </Button>
                    {/* Active toggle */}
                    <Button
                      size="sm"
                      variant="ghost"
                      title={notice.isActive ? "Deactivate" : "Activate"}
                      className={
                        notice.isActive
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-slate-400 hover:bg-slate-50"
                      }
                      onClick={() =>
                        updateAdminNotice(notice.id, {
                          isActive: !notice.isActive,
                        })
                      }
                      data-ocid="notices.toggle"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={() => openEdit(notice)}
                      data-ocid="notices.edit_button"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(notice.id)}
                      data-ocid="notices.delete_button"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="notices.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-rose-500" />
              {editNotice ? "Edit Notice" : "New Notice"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Basic Info */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Type className="h-4 w-4 text-slate-500" /> Content
              </h3>
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Title *
                </Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Notice title"
                  className="mt-1 h-9"
                  data-ocid="notices.input"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Message *
                </Label>
                <Textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Notice message..."
                  className="mt-1"
                  style={{
                    resize: "none",
                    height: "80px",
                    minHeight: "80px",
                    maxHeight: "80px",
                    overflow: "auto",
                    wordWrap: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                  data-ocid="notices.textarea"
                />
              </div>
              {/* Text Style */}
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Text Style
                </Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, bold: !form.bold })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-bold transition-all ${
                      form.bold
                        ? "border-slate-800 bg-slate-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Bold className="h-3.5 w-3.5" /> Bold
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, italic: !form.italic })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm italic transition-all ${
                      form.italic
                        ? "border-slate-800 bg-slate-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <Italic className="h-3.5 w-3.5" /> Italic
                  </button>
                </div>
              </div>
              {/* Font Size */}
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Font Size
                </Label>
                <div className="flex gap-2 mt-1.5">
                  {FONT_SIZE_OPTIONS.map((f) => (
                    <button
                      type="button"
                      key={f.value}
                      onClick={() =>
                        setForm({
                          ...form,
                          fontSize: f.value as "sm" | "base" | "lg",
                        })
                      }
                      className={`flex-1 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.fontSize === f.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-500" /> Appearance &
                Behavior
              </h3>

              {/* Color Theme */}
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Color Theme
                </Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setForm({ ...form, color: c.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.color === c.value
                          ? "border-slate-800 shadow-sm"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${c.cls}`} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Banner Color */}
              <div>
                <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Palette className="h-3.5 w-3.5 text-rose-500" />
                  Custom Banner Color (overrides theme)
                </Label>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      {
                        color: "",
                        label: "Theme",
                        cls: "bg-gradient-to-r from-slate-400 to-slate-600",
                      },
                      { color: "#ef4444", label: "Red", cls: "bg-red-500" },
                      {
                        color: "#f97316",
                        label: "Orange",
                        cls: "bg-orange-500",
                      },
                      {
                        color: "#eab308",
                        label: "Yellow",
                        cls: "bg-yellow-500",
                      },
                      { color: "#22c55e", label: "Green", cls: "bg-green-500" },
                      { color: "#3b82f6", label: "Blue", cls: "bg-blue-500" },
                      {
                        color: "#8b5cf6",
                        label: "Violet",
                        cls: "bg-violet-500",
                      },
                      { color: "#000000", label: "Black", cls: "bg-black" },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.label}
                        title={opt.label}
                        onClick={() =>
                          setForm({ ...form, customBannerColor: opt.color })
                        }
                        className={`w-7 h-7 rounded-full ${opt.cls} transition-all hover:scale-110 ${form.customBannerColor === opt.color ? "ring-2 ring-offset-2 ring-slate-600 scale-110" : ""}`}
                      />
                    ))}
                    <div className="flex flex-col items-center gap-1 ml-1">
                      <div className="relative">
                        <input
                          type="color"
                          value={form.customBannerColor || "#ef4444"}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              customBannerColor: e.target.value,
                            })
                          }
                          className="w-8 h-8 cursor-pointer opacity-0 absolute inset-0"
                          title="Pick custom banner color"
                          style={{ borderRadius: "50%" }}
                        />
                        <div
                          className="w-8 h-8 rounded-full border-2 border-slate-300 shadow-sm cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                          style={{
                            backgroundColor:
                              form.customBannerColor || "#9c9c9c",
                          }}
                        >
                          {!form.customBannerColor && (
                            <span className="text-[8px] text-white font-bold">
                              +
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500">Custom</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direction */}
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Display Mode
                </Label>
                <div className="space-y-2 mt-1.5">
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                      Scrolling
                    </p>
                    <div className="flex gap-2">
                      {(
                        [
                          { value: "rtl", label: "← Right to Left" },
                          { value: "ltr", label: "Left to Right →" },
                        ] as const
                      ).map((d) => (
                        <button
                          type="button"
                          key={d.value}
                          onClick={() =>
                            setForm({ ...form, direction: d.value })
                          }
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            form.direction === d.value
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">
                      Static
                    </p>
                    <div className="flex gap-2">
                      {(
                        [
                          {
                            value: "center",
                            label: "• Centered",
                            Icon: AlignCenter,
                          },
                          { value: "left", label: "≡ Left", Icon: AlignLeft },
                          {
                            value: "right",
                            label: "≡ Right",
                            Icon: AlignRight,
                          },
                        ] as const
                      ).map((d) => (
                        <button
                          type="button"
                          key={d.value}
                          onClick={() =>
                            setForm({ ...form, direction: d.value })
                          }
                          className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                            form.direction === d.value
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Speed */}
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Scroll Speed
                </Label>
                <div className="flex gap-2 mt-1.5">
                  {SPEED_OPTIONS.map((s) => (
                    <button
                      type="button"
                      key={s.value}
                      onClick={() =>
                        setForm({
                          ...form,
                          speed: s.value as "slow" | "normal" | "fast",
                        })
                      }
                      className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.speed === s.value
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span className="block">{s.label}</span>
                      <span className="text-xs opacity-60">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation */}
              <div>
                <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-violet-500" />
                  Banner Animation
                </Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {ANIMATION_OPTIONS.map((a) => (
                    <button
                      type="button"
                      key={a.value}
                      onClick={() => setForm({ ...form, animation: a.value })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.animation === a.value
                          ? "border-violet-500 bg-violet-50 text-violet-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span>{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Animation */}
              <div>
                <Label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                  <Type className="h-3.5 w-3.5 text-blue-500" />
                  Text Animation
                </Label>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {TEXT_ANIMATION_OPTIONS.map((a) => (
                    <button
                      type="button"
                      key={a.value}
                      onClick={() =>
                        setForm({ ...form, textAnimation: a.value })
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                        form.textAnimation === a.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      <span>{a.icon}</span>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Text Color */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Palette className="h-4 w-4 text-pink-500" /> Text Color
              </h3>
              <div>
                <Label className="text-xs font-medium text-slate-600 mb-2 block">
                  Preset Colors
                </Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    {
                      color: "",
                      label: "Auto",
                      cls: "bg-gradient-to-r from-slate-400 to-slate-600",
                    },
                    {
                      color: "#ffffff",
                      label: "White",
                      cls: "bg-white border-2 border-slate-200",
                    },
                    { color: "#000000", label: "Black", cls: "bg-black" },
                    { color: "#fbbf24", label: "Yellow", cls: "bg-yellow-400" },
                    { color: "#22d3ee", label: "Cyan", cls: "bg-cyan-400" },
                    { color: "#f472b6", label: "Pink", cls: "bg-pink-400" },
                    { color: "#fb923c", label: "Orange", cls: "bg-orange-400" },
                    { color: "#f87171", label: "Red", cls: "bg-red-400" },
                    { color: "#4ade80", label: "Green", cls: "bg-green-400" },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.label}
                      title={opt.label}
                      onClick={() => setForm({ ...form, textColor: opt.color })}
                      className={`w-7 h-7 rounded-full ${opt.cls} transition-all hover:scale-110 ${
                        form.textColor === opt.color
                          ? "ring-2 ring-offset-2 ring-slate-600 scale-110"
                          : ""
                      }`}
                    />
                  ))}
                  <div className="flex flex-col items-center gap-1 ml-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={form.textColor || "#ffffff"}
                        onChange={(e) =>
                          setForm({ ...form, textColor: e.target.value })
                        }
                        className="w-8 h-8 cursor-pointer opacity-0 absolute inset-0"
                        title="Pick custom color"
                        style={{ borderRadius: "50%" }}
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-slate-300 shadow-sm cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                        style={{ backgroundColor: form.textColor || "#9c9c9c" }}
                      >
                        {!form.textColor && (
                          <span className="text-[8px] text-white font-bold">
                            +
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500">Custom</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-500" /> Scheduling
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-slate-600">
                    Start Date (optional)
                  </Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-slate-600">
                    Expiry Date (optional)
                  </Label>
                  <Input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) =>
                      setForm({ ...form, expiryDate: e.target.value })
                    }
                    className="mt-1 h-9"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-slate-400" />
                  <Label className="text-sm font-medium text-slate-700">
                    Active (visible to users)
                  </Label>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                  <Pause className="h-4 w-4 text-slate-400" />
                  <Label className="text-sm font-medium text-slate-700">
                    Start Paused (scroll stopped)
                  </Label>
                </div>
                <Switch
                  checked={form.paused}
                  onCheckedChange={(v) => setForm({ ...form, paused: v })}
                />
              </div>
            </div>

            {/* Visibility */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                <Eye className="h-4 w-4 text-slate-500" /> Visibility
              </h3>
              <div>
                <Label className="text-xs font-medium text-slate-600">
                  Who can see this notice?
                </Label>
                <div className="flex gap-2 mt-1.5">
                  {(
                    [
                      { value: "all", label: "All Users" },
                      { value: "supervisor", label: "Supervisors Only" },
                      { value: "backend_user", label: "Backend Users Only" },
                    ] as const
                  ).map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() =>
                        setForm({
                          ...form,
                          visibleTo: opt.value,
                          visibleToNames: [],
                        })
                      }
                      className={`flex-1 py-2 rounded-lg border-2 text-xs font-medium transition-all ${
                        form.visibleTo === opt.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {form.visibleTo !== "all" && (
                <div>
                  <Label className="text-xs font-medium text-slate-600">
                    {form.visibleTo === "supervisor"
                      ? "Select specific supervisors (leave empty for all)"
                      : "Select specific backend users (leave empty for all)"}
                  </Label>
                  <div className="mt-1.5 space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-white">
                    {users
                      .filter(
                        (u) =>
                          u.role === form.visibleTo && u.status === "approved",
                      )
                      .map((u) => (
                        <label
                          key={u.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 rounded p-1"
                        >
                          <input
                            type="checkbox"
                            checked={form.visibleToNames.includes(u.name)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({
                                  ...form,
                                  visibleToNames: [
                                    ...form.visibleToNames,
                                    u.name,
                                  ],
                                });
                              } else {
                                setForm({
                                  ...form,
                                  visibleToNames: form.visibleToNames.filter(
                                    (n) => n !== u.name,
                                  ),
                                });
                              }
                            }}
                            className="rounded border-slate-300"
                          />
                          <span className="text-sm text-slate-700">
                            {u.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            {u.email}
                          </span>
                        </label>
                      ))}
                    {users.filter(
                      (u) =>
                        u.role === form.visibleTo && u.status === "approved",
                    ).length === 0 && (
                      <p className="text-xs text-slate-400 py-2 text-center">
                        No{" "}
                        {form.visibleTo === "supervisor"
                          ? "supervisors"
                          : "backend users"}{" "}
                        found
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Live Preview */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
              >
                <Eye className="h-4 w-4" />
                Live Preview
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    showPreview ? "rotate-180" : ""
                  }`}
                />
              </button>
              {showPreview && (
                <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <div
                    className={`px-3 py-2 flex items-center gap-2 text-white overflow-hidden ${form.color === "rainbow" ? "" : colorOption.preview}`}
                    style={
                      form.color === "rainbow"
                        ? {
                            background:
                              "linear-gradient(90deg, #ff0000, #ff5500, #ffaa00, #ffff00, #00ff88, #00ccff, #0044ff, #8800ff, #ff00cc, #ff0000)",
                            backgroundSize: "400% 100%",
                            animation: "rainbowBg 1.2s linear infinite",
                          }
                        : undefined
                    }
                  >
                    <Megaphone className="h-4 w-4 flex-shrink-0" />
                    <span className="font-semibold flex-shrink-0 text-sm">
                      {form.title || "Notice Title"}:
                    </span>
                    <span
                      className={`truncate text-${form.fontSize} ${
                        form.bold ? "font-bold" : "font-normal"
                      } ${form.italic ? "italic" : ""} ${form.textAnimation === "text_rainbow" ? "notice-text-rainbow" : ""}`}
                      style={{
                        color:
                          form.textAnimation !== "text_rainbow"
                            ? form.textColor || undefined
                            : undefined,
                        ...(form.textAnimation === "text_shimmer"
                          ? {
                              animation:
                                "textShimmerGlow2 2s ease-in-out infinite",
                              textShadow: "0 0 8px rgba(255,255,255,1)",
                            }
                          : {}),
                      }}
                    >
                      {form.message ||
                        "Your notice message will appear here..."}
                    </span>
                  </div>
                  <div className="bg-slate-50 px-3 py-1 text-xs text-slate-400 flex items-center gap-3 flex-wrap">
                    <span>
                      Mode:{" "}
                      {form.direction === "rtl"
                        ? "Right → Left"
                        : form.direction === "ltr"
                          ? "Left → Right"
                          : form.direction}
                    </span>
                    <span>Speed: {form.speed}</span>
                    <span>Font: {form.fontSize}</span>
                    {form.bold && <span className="font-bold">Bold</span>}
                    {form.italic && <span className="italic">Italic</span>}
                    {form.animation !== "none" && (
                      <span className="text-violet-500">
                        ✨ {form.animation}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              data-ocid="notices.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.message.trim()}
              className="bg-rose-600 hover:bg-rose-700"
              data-ocid="notices.submit_button"
            >
              <Megaphone className="h-4 w-4 mr-2" />
              {editNotice ? "Save Changes" : "Publish Notice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notice?</AlertDialogTitle>
            <AlertDialogDescription>
              This notice will be permanently removed and users will no longer
              see it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="notices.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteId) deleteAdminNotice(deleteId);
                setDeleteId(null);
              }}
              data-ocid="notices.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
