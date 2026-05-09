import "./PendingInvitations.scss";

import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  acceptInvitation,
  declineInvitation,
  getPendingInvitations,
} from "../components/utils/sharingApi";
import AppShell from "../components/AppShell";
import Loader from "../components/Loader";
import { useAccounts } from "../contexts/useAccounts";
import { useDocumentTitle } from "../components/hooks/useDocumentTitle";

const ROLE_LABELS = {
  reader: "Lecteur",
  editor: "Éditeur",
};

export default function PendingInvitations() {
  const navigate = useNavigate();
  const { refresh: refreshAccounts } = useAccounts();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [processing, setProcessing] = useState(null);

  useDocumentTitle("Invitations reçues");

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadInvitations = async () => {
    setLoading(true);
    try {
      const data = await getPendingInvitations();
      setInvitations(data.invitations ?? []);
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  const handleAccept = async (token) => {
    setProcessing(token);
    try {
      await acceptInvitation(token);
      showMessage("success", "Invitation acceptée !");
      refreshAccounts();
      await loadInvitations();
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (token) => {
    setProcessing(token);
    try {
      await declineInvitation(token);
      showMessage("success", "Invitation refusée.");
      await loadInvitations();
    } catch (err) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <AppShell>
      <div className="pending-invitations">
        <div className="pending-invitations__header">
          <button
            className="pending-invitations__back"
            onClick={() => navigate(-1)}
          >
            ← Retour
          </button>
          <h1 className="pending-invitations__title">Invitations reçues</h1>
        </div>

        {message && (
          <div
            className={`pending-invitations__message pending-invitations__message--${message.type}`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <Loader />
        ) : invitations.length === 0 ? (
          <div className="pending-invitations__empty">
            <p>Vous n'avez aucune invitation en attente.</p>
          </div>
        ) : (
          <ul className="pending-invitations__list">
            {invitations.map((inv) => (
              <li key={inv.token} className="pending-invitations__item">
                <div className="pending-invitations__info">
                  <p className="pending-invitations__account">
                    {inv.account ? inv.account.name : "Compte inconnu"}
                  </p>
                  <p className="pending-invitations__detail">
                    Invité par <strong>{inv.invitedBy?.name ?? "—"}</strong> ·{" "}
                    Rôle : <strong>{ROLE_LABELS[inv.role] ?? inv.role}</strong>
                  </p>
                  <p className="pending-invitations__expires">
                    Expire le{" "}
                    {new Date(inv.expiresAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="pending-invitations__actions">
                  <button
                    type="button"
                    className="pending-invitations__btn-accept"
                    disabled={processing === inv.token}
                    onClick={() => handleAccept(inv.token)}
                  >
                    Accepter
                  </button>
                  <button
                    type="button"
                    className="pending-invitations__btn-decline"
                    disabled={processing === inv.token}
                    onClick={() => handleDecline(inv.token)}
                  >
                    Refuser
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
