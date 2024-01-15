import { TaskCategory } from "src/shared/enums";
import { PATH_DASHBOARD } from "src/routes/paths";

export function getLinkFromCategory(category: TaskCategory, id: string) {
  let link = '';
  switch (category) {
    case TaskCategory.GeneralDiscussion:
      link = PATH_DASHBOARD.information.discussions + '?task=' + id;
      break;
    case TaskCategory.FileRequestCloud:
      link = PATH_DASHBOARD.cloud.requestDetails + '?task=' + id;
      break;
    case TaskCategory.Collaboration:
      link = PATH_DASHBOARD.coordinator.collaborationDetails + '?task=' + id;
      break;
    case TaskCategory.ImageCollaboration:
      link = PATH_DASHBOARD.coordinator.collaborationDetails + '?task=' + id;
      break; 
    case TaskCategory.OfficeCollaboration:
      link = PATH_DASHBOARD.coordinator.collaborationDetails + '?task=' + id;
      break; 
    case TaskCategory.CadCollaboration:
      link = PATH_DASHBOARD.coordinator.collaborationDetails + '?task=' + id;
      break; 
    case TaskCategory.ModelCollaboration:
      link = PATH_DASHBOARD.coordinator.collaborationDetails + '?task=' + id;
      break;
    case TaskCategory.ScheduleReport:
      link = PATH_DASHBOARD.schedules.planningDetails + '?task=' + id;
      break;
  }
  return link;
}