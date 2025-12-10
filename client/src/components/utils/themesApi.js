/**
 * API pour sauvegarder les thèmes
 * Sauvegarde dans themes.json via un endpoint du serveur
 */

const THEMES_FILE_PATH = "/themes.json";

/**
 * Sauvegarde les thèmes
 * Pour l'instant, télécharge un nouveau fichier themes.json
 * À terme, il faudra un endpoint API pour écrire directement
 */
export async function saveThemes(themes) {
  const data = { themes };
  const json = JSON.stringify(data, null, 2);

  // Créer un blob et le télécharger
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "themes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  alert(
    "⚠️ Fichier themes.json téléchargé !\n\nRemplacez le fichier :\n- client/themes.json\n- client/public/themes.json\n\npuis rechargez la page."
  );

  return true;
}
