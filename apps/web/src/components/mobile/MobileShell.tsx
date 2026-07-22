"use client";

import React, { useState } from "react";
import { BottomNavigation } from "./BottomNavigation";
import { FloatingActionButton } from "./FloatingActionButton";
import { MobileDrawer } from "./MobileDrawer";
import { OfflineBanner } from "./OfflineBanner";
import { PWAInstaller } from "@/pwa/pwa-installer";

interface MobileShellProps {
  children: React.ReactNode;
  onOpenScanner?: () => void;
  onOpenVoice?: () => void;
}

export function MobileShell({ children, onOpenScanner, onOpenVoice }: MobileShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Offline Connectivity Status Banner */}
      <OfflineBanner />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton onOpenScanner={onOpenScanner} onOpenVoice={onOpenVoice} />

      {/* Native-like Bottom Navigation Bar */}
      <BottomNavigation onOpenDrawer={() => setDrawerOpen(true)} />

      {/* Slide-over Mobile Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Add to Home Screen Prompt Installer */}
      <PWAInstaller />
    </div>
  );
}
