// @mui
import { Box, Button, Card, Typography } from '@mui/material';
// components
import Image from '../../../../components/image';

// ----------------------------------------------------------------------

type Props = {
  file: string;
  setImage: VoidFunction;
};

export default function ImageCard({ file, setImage }: Props) {

  return (
    <Card sx={{ textAlign: 'center' }}>
      <Box sx={{ position: 'relative' }}>
        <Button onClick={setImage}>
          <Image
            src={`${process.env.REACT_APP_APIFILE}images/${file}`}
            sx={{
              width: '100%',
              height: '120px',
            }}
          />
        </Button>

      </Box>

      <Typography noWrap variant="caption" sx={{ mt: 6, mb: 0.5 }} >
        {file}
      </Typography>

    </Card>
  );
}
