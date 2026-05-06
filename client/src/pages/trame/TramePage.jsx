import { lazy, Suspense } from "react";

import { ReactFlowProvider } from "@xyflow/react";

const OrgChart = lazy(() => import("./components/OrgChart.jsx"));

export default function OrganigrammePage() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0f1117" }}>
      <ReactFlowProvider>
        <Suspense
          fallback={
            <div
              style={{ width: "100%", height: "100%", background: "#0f1117" }}
            />
          }
        >
          <OrgChart />
        </Suspense>
      </ReactFlowProvider>
    </div>
  );
}
