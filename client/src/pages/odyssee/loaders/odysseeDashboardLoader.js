import { fetchAndProcessEngine } from "../hooks/useCatalogEngine";
import FolderService from "../services/folderService";
import OdysseeCategoryService from "../../../services/odysseeCategoryService";
import {
  odysseyCategoryService,
  odysseySidebarService,
} from "../services/odysseyServices";
import {
  passengersCategoryService,
  passengersSidebarService,
} from "../services/passengersServices";

export async function odysseeDashboardLoader() {
  if (!localStorage.getItem("token")) return null;

  await Promise.all([
    fetchAndProcessEngine(passengersCategoryService, passengersSidebarService),
    fetchAndProcessEngine(odysseyCategoryService, odysseySidebarService),
    fetchAndProcessEngine(OdysseeCategoryService, FolderService),
  ]);

  return null;
}
