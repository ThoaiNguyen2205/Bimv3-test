// next
import Head from 'next/head';
// layouts
import DashboardLayout from '../../../layouts/dashboard';
// locales
import { useLocales } from 'src/locales';
// Type
import { TaskCategory } from 'src/shared/enums/taskCategory.enum';
// Container
import TasksContainer from 'src/containers/dashboard/tasks/tasks.container';

SchedulesPlanningPage.getLayout = (page: React.ReactElement) => <DashboardLayout>{page}</DashboardLayout>;

export default function SchedulesPlanningPage() {
 
  const { translate } = useLocales();

  return (
    <>
      {TasksContainer(TaskCategory.ScheduleReport)}
    </>
  );
}
