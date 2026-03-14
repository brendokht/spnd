import { Suspense } from "react";
import SettingsSkeleton from "./loading";
import SettingsPage from "./page";

export default function SettingsLayout() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsPage />
    </Suspense>
  );
}
