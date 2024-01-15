// @mui
import { RadioGroup } from '@mui/material';
//
import SvgColor from '../../svg-color';
import { useSettingsContext } from '../SettingsContext';
import { StyledCard, StyledWrap, MaskControl } from '../styles';

// ----------------------------------------------------------------------

const OPTIONS = ['light', 'dark'] as const;

export default function ModeOptions() {
  const { themeMode, onChangeMode } = useSettingsContext();

  return (
    <RadioGroup name="themeMode" value={themeMode} onChange={onChangeMode}>
      <StyledWrap sx={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {OPTIONS.map((mode) => (
          <StyledCard key={mode} selected={themeMode === mode} sx={{ p: 0.75, height: 72 }}>
            <SvgColor
              src={`/assets/icons/setting/${mode === 'light' ? 'ic_sun' : 'ic_moon'}.svg`}
              sx={{ px: 4 }}
            />
            <MaskControl value={mode} />
          </StyledCard>
        ))}
      </StyledWrap>
    </RadioGroup>
  );
}
