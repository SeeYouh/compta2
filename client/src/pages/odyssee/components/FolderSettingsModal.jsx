import { DEFAULT_FOLDER_COLOR } from "../config/folderColors";
import NameColorModal from "./NameColorModal";

const FolderSettingsModal = ({ folder, onSave, onCancel }) => (
  <NameColorModal
    title="Paramètres du dossier"
    nameLabel="Nom du dossier"
    namePlaceholder="Nom du dossier (optionnel)"
    initialName={folder.name || ""}
    initialColor={folder.color || DEFAULT_FOLDER_COLOR}
    onSave={onSave}
    onCancel={onCancel}
  />
);

export default FolderSettingsModal;
