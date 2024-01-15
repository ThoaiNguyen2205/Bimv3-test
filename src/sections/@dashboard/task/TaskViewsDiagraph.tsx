import { ApexOptions } from 'apexcharts';
// @mui
import { Box, CardProps } from '@mui/material';
// components
import Chart, { useChart } from '../../../components/chart';
// ----------------------------------------------------------------------

interface Props extends CardProps {
  chart: {
    categories?: string[];
    colors?: string[];
    seriesData: {
      // year: string;
      data: {
        name: string;
        data: number[];
      }[];
    }[];
    options?: ApexOptions;
  };
}

export default function TaskViewsDiagraph({ chart, ...other }: Props) {
  const { colors, categories, seriesData, options } = chart;

  const chartOptions = useChart({
    colors,
    xaxis: {
      categories,
    },
    ...options,
  });

  return (
    <Box {...other}>
      {seriesData.map((item) => (
        <Box key='graph' sx={{ mt: 3, mx: 3 }} dir="ltr">
          <Chart type="line" series={item.data} options={chartOptions} height={365} />
        </Box>
      ))}
    </Box>
  );
}
