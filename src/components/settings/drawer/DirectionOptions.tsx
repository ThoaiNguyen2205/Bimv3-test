// @mui
import { RadioGroup } from '@mui/material';
//
import SvgColor from '../../svg-color';
import { useSettingsContext } from '../SettingsContext';
import { StyledCard, StyledWrap, MaskControl } from '../styles';

// ----------------------------------------------------------------------

const OPTIONS = ['ltr', 'rtl'] as const;

export default function DirectionOptions() {
  const { themeDirection, onChangeDirection } = useSettingsContext();

  return (
    <RadioGroup name="themeDirection" value={themeDirection} onChange={onChangeDirection}>
      <StyledWrap sx={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {OPTIONS.map((direction) => (
          <StyledCard key={direction} selected={themeDirection === direction} sx={{ p: 0.75, height: 72 }}>
            <SvgColor
              src={`/assets/icons/setting/${
                direction === 'rtl' ? 'ic_align_right' : 'ic_align_left'
              }.svg`}
              sx={{ px: 4 }}
            />
            <MaskControl value={direction} />
          </StyledCard>
        ))}
      </StyledWrap>
    </RadioGroup>
  );
}
