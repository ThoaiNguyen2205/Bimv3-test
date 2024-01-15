// layouts
import DashboardLayout from '../../../layouts/dashboard';
// Type
import { TaskCategory } from 'src/shared/enums/taskCategory.enum';
// Container
import TasksContainer from 'src/containers/dashboard/tasks/tasks.container';

PointCloudsPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function PointCloudsPage() {
  return (
    <>
      {TasksContainer(TaskCategory.PointCloud)}
    </>
  );
}
