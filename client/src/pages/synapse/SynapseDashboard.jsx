import "./sass/index.scss";

import { Route, Routes } from "react-router-dom";

import { AccountsProvider } from "./contexts/AccountsContext";
import AccountSharingSettings from "./pages/AccountSharingSettings";
import App from "./pages/App";
import ContactsPage from "./pages/ContactsPage";
import ImportCSVPage from "./pages/ImportCSVPage";
import { LabelsProvider } from "./contexts/LabelsContext";
import LabelsSettings from "./pages/LabelsSettings";
import PendingInvitations from "./pages/PendingInvitations";
import ProjectionsSettings from "./pages/ProjectionsSettings";
import SettingsPage from "./pages/SettingsPage";
import { SynapseColorProvider } from "./contexts/SynapseColorContext";
import { ThemesProvider } from "./contexts/ThemesContext";

export default function SynapseDashboard() {
  return (
    <SynapseColorProvider>
      <LabelsProvider>
        <AccountsProvider>
          <ThemesProvider>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/import" element={<ImportCSVPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/labels-settings" element={<LabelsSettings />} />
              <Route
                path="/projections-settings"
                element={<ProjectionsSettings />}
              />
              <Route
                path="/account-sharing/:accountId"
                element={<AccountSharingSettings />}
              />
              <Route path="/pending-invitations" element={<PendingInvitations />} />
            </Routes>
          </ThemesProvider>
        </AccountsProvider>
      </LabelsProvider>
    </SynapseColorProvider>
  );
}
