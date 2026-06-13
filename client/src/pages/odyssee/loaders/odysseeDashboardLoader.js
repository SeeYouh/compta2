import { fetchAndProcessEngine } from "../hooks/useCatalogEngine";
import FolderService from "../services/folderService";
import OdysseeCategoryService from "../../../services/odysseeCategoryService";
import {
  odysseeCategoryService,
  odysseeSidebarService,
} from "../services/odysseeServices";
import {
  passengersCategoryService,
  passengersSidebarService,
} from "../services/passengersServices";

export async function odysseeDashboardLoader() {
  if (!localStorage.getItem("token")) return null;

  try {
    await Promise.all([
      fetchAndProcessEngine(
        passengersCategoryService,
        passengersSidebarService,
      ),
      fetchAndProcessEngine(odysseeCategoryService, odysseeSidebarService),
      fetchAndProcessEngine(OdysseeCategoryService, FolderService),
    ]);
  } catch (error) {
    console.error("[odysseeDashboardLoader] Prefetch échoué :", error);
  }

  return { prefetchComplete: true };
}
