"use client";
/**
 * Re-export lucide-react icons behind a proper "use client" boundary.
 * lucide-react v1.8.0 has "use strict" before "use client" in its ESM
 * source, which prevents Next.js 16 from recognising the client boundary.
 * This shim fixes it.
 */
export {
  // Layout
  LayoutDashboard,
  Calendar,
  Dumbbell,
  BriefcaseBusiness,
  Cpu,
  // Status
  CheckCircle2,
  XCircle,
  AlertTriangle,
  CheckCircle,
  // Tasks
  ClipboardList,
  Clock,
  Loader2,
  // Biometrics / Calendar
  Sun,
  Sunset,
  Moon,
  Heart,
  Zap,
  Target,
  Droplets,
  Brain,
  Inbox,
  // Streaks
  Flame,
  Trophy,
  CalendarX,
  // Inventory
  ShoppingCart,
  Package,
  // Workout / physical
  TrendingUp,
  TrendingDown,
  Minus,
  // Timer / work
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  // General
  Plus,
  X,
  ChevronRight,
  MoreHorizontal,
  Star,
  Trash2,
  Edit3,
  ArrowUpRight,
  BarChart3,
  ListTodo,
  // Review
  FileText,
  RefreshCw,
  // Focus / clipboard
  Maximize2,
  Minimize2,
  Copy,
  Check,
  // Navigation
  ChevronLeft,
  // Study
  GraduationCap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  RotateCcw as FlipIcon,
  ExternalLink,
  PlayCircle,
  Link as LinkIcon,
  FileText as FileTextIcon,
  // fralife v2 additions
  SmartphoneOff,
  Home,
  FolderKanban,
  ClipboardCheck,
} from "lucide-react";
