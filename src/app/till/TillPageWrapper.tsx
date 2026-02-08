"use client";
import TillLayout from "./layout";
import TillPage from "./page";
import TillHeaderClient from "./TillHeaderClient";
import { useState } from "react";

export default function TillPageWrapper() {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <TillLayout>
      <div>
        <div className="flex justify-end mb-2">
          <TillHeaderClient onShowFilters={() => setShowAdvancedFilters(true)} />
        </div>
        <TillPage />
      </div>
    </TillLayout>
  );
} 