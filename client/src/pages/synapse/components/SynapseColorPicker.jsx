import ColorPicker from '../../../components/ColorPicker';
import { useSynapseColorContext } from '../contexts/SynapseColorContext';

export default function SynapseColorPicker() {
  const { userColor, updateColor } = useSynapseColorContext();

  return (
    <ColorPicker
      value={userColor}
      onChange={updateColor}
    />
  );
}
