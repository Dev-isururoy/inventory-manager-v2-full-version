// src/categories.js
import { Monitor, Printer, Video, Server, HardDrive } from "lucide-react";

export const categories = [
  { value: "PC", label: "PC", icon: Monitor },
  { value: "Printer", label: "Printer", icon: Printer },
  { value: "CCTV", label: "CCTV", icon: Video },
  { value: "Access Controls", label: "Access Controls", icon: Server },
  { value: "Access Points", label: "Access Points", icon: Server },
  { value: "IP Phones", label: "IP Phones", icon: Server },
  { value: "Analog Phones", label: "Analog Phones", icon: Server },
  { value: "Portable Hard Disks", label: "Portable Hard Disks", icon: HardDrive },
  { value: "Pen Drives", label: "Pen Drives", icon: HardDrive },
  { value: "NVR", label: "NVR", icon: Video },
  { value: "PBX", label: "PBX", icon: Server },
  { value: "Servers", label: "Servers", icon: Server },
  { value: "NAS", label: "NAS", icon: HardDrive },
  { value: "Network Switches", label: "Network Switches", icon: Server },
  { value: "Other", label: "Other", icon: Server },
];
