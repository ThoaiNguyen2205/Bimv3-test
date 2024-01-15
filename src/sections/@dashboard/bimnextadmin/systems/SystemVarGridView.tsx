import { useRef } from 'react';
// @mui
import { Box } from '@mui/material';
//
import SystemVarCard from './SystemVarCard';
// type
import { ISystem } from 'src/shared/types/system';
// ----------------------------------------------------------------------

type Props = {
  dataFiltered: ISystem[];
  updateSystemVar: (id: string) => void;
  setImage: (id: string) => void;
  setText: (id: string) => void;
  onDeleteItem: (id: string) => void;
};

export default function SystemVarGridView({
  dataFiltered,
  updateSystemVar,
  setImage,
  setText,
  onDeleteItem,
}: Props) {

  const containerRef = useRef(null);

  return (
    <>
      <Box ref={containerRef}>
        
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          }}
          gap={3}
        >
          {dataFiltered
            .map((sysvar) => (
              <SystemVarCard
                key={sysvar._id}
                systemVar={sysvar}
                updateSystemVar={() => updateSystemVar(sysvar._id)}
                setImage={() => setImage(sysvar._id)}
                setText={() => setText(sysvar._id)}
                onDeleteItem={() => onDeleteItem(sysvar._id)}
                sx={{ maxWidth: 'auto' }}
              />
            ))}
        </Box>

      </Box>

    </>
  );
}
