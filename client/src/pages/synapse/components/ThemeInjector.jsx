import { useSynapseTheme } from '../hooks/useSynapseTheme';

/**
 * Composant qui injecte les variables CSS de thème Synapse
 * Doit être placé au haut niveau de Synapse (dans SynapseDashboard)
 * Retourne null car il n'a pas de visuel, juste des effets de bord
 */
export default function ThemeInjector() {
  useSynapseTheme();
  return null;
}
